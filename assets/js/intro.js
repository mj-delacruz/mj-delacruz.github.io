/* ===================================================================
   Intro sequence — Mary Jane Dela Cruz

   A loading beat that becomes the page. A dot swells into a sphere
   while the tool marks orbit it; the spin eases to zero, the marks
   snap into a centred row, the name resolves — and then the whole
   arrangement flies into the hero it was standing in front of:

     · the marks travel left into the #toolstrip slots
     · the sphere travels right, morphing into the #heroshot frame
       as her portrait cross-fades in
     · the hero copy rises in behind them

   The flying pieces are CLONES of the real hero elements, so there is
   one source of truth for the marks: the markup in index.html. Nothing
   here is required for the page to work — with scripts off you simply
   get the hero.

   Plays on every visit. Skippable with the button, Esc, Space, Enter
   or a click on the backdrop. Never runs under prefers-reduced-motion.
   =================================================================== */
(function () {
  "use strict";

  var SEQ = {
    grow:   1500,   /* dot → sphere, marks spiral out            */
    align:   700,   /* spin eases to zero, marks snap to a row   */
    text:    550,   /* name, rule, subtitle resolve              */
    hold:    500,   /* the beat you actually read it on          */
    settle: 1150    /* everything flies into the hero            */
  };
  var T1 = SEQ.grow;
  var T2 = T1 + SEQ.align;
  var T3 = T2 + SEQ.text;
  var T4 = T3 + SEQ.hold;
  var T5 = T4 + SEQ.settle;

  var reduced = window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- easing ---------------------------------------------------------- */
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function outCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function outQuint(t) { return 1 - Math.pow(1 - t, 5); }
  function inOutCubic(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function outBack(t) { var c = 1.22; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }

  var running = false;

  function play() {
    var strip = document.getElementById("toolstrip");
    var shotBox = document.getElementById("heroshot");
    var tools = strip ? strip.querySelectorAll(".tool") : [];
    if (running || !strip || !shotBox || !tools.length) { return; }
    running = true;

    var N = tools.length;
    var mid = (N - 1) / 2;
    var shotImg = shotBox.querySelector("img");

    document.documentElement.classList.add("intro-run", "intro-landing");
    document.documentElement.classList.remove("intro-settle");
    window.scrollTo(0, 0);

    /* ---- overlay -------------------------------------------------------- */
    var el = document.createElement("div");
    el.id = "intro";
    el.setAttribute("role", "presentation");
    el.innerHTML =
      '<div class="bg"></div>' +
      '<div class="grid"></div>' +
      '<div class="world">' +
        '<div class="ring"></div>' +
        '<div class="orb"><div class="sheen"></div></div>' +
      '</div>' +
      '<div class="copy">' +
        '<h2>Mary Jane Dela Cruz</h2>' +
        '<div class="rule"></div>' +
        '<span class="sub">Graphic Artist</span>' +
      '</div>' +
      '<button class="skipbtn" type="button">Skip</button>';

    document.body.appendChild(el);

    var bg    = el.querySelector(".bg");
    var world = el.querySelector(".world");
    var orb   = el.querySelector(".orb");
    var sheen = el.querySelector(".sheen");
    var ring  = el.querySelector(".ring");
    var copy  = el.querySelector(".copy");
    var head  = el.querySelector(".copy h2");
    var rule  = el.querySelector(".copy .rule");
    var sub   = el.querySelector(".copy .sub");
    var skip  = el.querySelector(".skipbtn");

    /* the portrait rides inside the sphere and fades up as it morphs */
    var photo = null;
    if (shotImg) {
      photo = document.createElement("img");
      photo.src = shotImg.currentSrc || shotImg.src;
      photo.alt = "";
      orb.appendChild(photo);
    }

    /* flying copies of the real marks */
    var icons = Array.prototype.map.call(tools, function (t) {
      var m = document.createElement("div");
      m.className = "mark";
      m.appendChild(t.cloneNode(true));
      world.appendChild(m);
      return m;
    });

    /* ---- geometry ------------------------------------------------------- */
    var vw, vh, cx, cy, R, D, S, GAP, FRONT;
    var TILT = 16 * Math.PI / 180;

    function measure() {
      vw = window.innerWidth;
      vh = window.innerHeight;
      cx = vw / 2;
      cy = vh * 0.44;
      R  = Math.min(vw * 0.27, vh * 0.30);
      D  = Math.min(vw * 0.30, vh * 0.34);
      S  = Math.max(40, Math.min(vw * 0.115, 76));
      GAP = N > 1 ? Math.min((vw - S - 48) / (N - 1), 150) : 0;
      FRONT = R * 0.95;

      ring.style.width = ring.style.height = (R * 2) + "px";
    }

    /* where each piece is going: the live position of the real elements */
    var dest = null;
    function captureDest() {
      dest = {
        marks: Array.prototype.map.call(tools, function (t) {
          var r = t.getBoundingClientRect();
          return { x: r.left, y: r.top, w: r.width, h: r.height };
        }),
        shot: (function () {
          var r = shotBox.getBoundingClientRect();
          return { x: r.left, y: r.top, w: r.width, h: r.height };
        })()
      };
    }

    var tmp = [0, 0, 0];
    function orbit(a, r, out) {
      var c = Math.cos(a), s = Math.sin(a);
      out[0] = r * c;
      out[1] = r * s * Math.sin(TILT);
      out[2] = r * s * Math.cos(TILT);
    }

    /* ---- render one moment ---------------------------------------------- */
    var theta = -Math.PI / 2;
    var settled = false;

    function render(e) {
      var pGrow   = clamp01(e / T1);
      var pAlign  = clamp01((e - T1) / SEQ.align);
      var pText   = clamp01((e - T2) / SEQ.text);
      var pSettle = clamp01((e - T4) / SEQ.settle);
      var gE = outQuint(pGrow), aE = inOutCubic(pAlign);

      if (pSettle > 0 && !dest) { captureDest(); }

      /* hand the page back as the backdrop clears */
      if (pSettle >= 0.12 && !settled) {
        settled = true;
        document.documentElement.classList.remove("intro-run");
        document.documentElement.classList.add("intro-settle");
      }
      bg.style.opacity = (1 - clamp01((pSettle - 0.15) / 0.55)).toFixed(3);
      el.querySelector(".grid").style.opacity = (1 - clamp01(pSettle / 0.4)).toFixed(3);
      copy.style.opacity = (1 - clamp01(pSettle / 0.35)).toFixed(3);
      skip.style.opacity = (1 - clamp01(pSettle / 0.25)).toFixed(3);

      /* ---- the sphere, and its morph into the portrait ---- */
      var grow = lerp(0.02, 1, pGrow < 1 ? outBack(pGrow) : 1) * lerp(1, 0.88, aE);
      var ow = D * grow, oh = D * grow;
      var ox = cx - ow / 2, oy = cy - oh / 2;
      var orad = 50, oop = clamp01(pGrow * 2.2) * lerp(1, 0.78, aE);

      if (pSettle > 0 && dest) {
        var mE = inOutCubic(pSettle);
        ow = lerp(D * 0.88, dest.shot.w, mE);
        oh = lerp(D * 0.88, dest.shot.h, mE);
        ox = lerp(cx, dest.shot.x + dest.shot.w / 2, mE) - ow / 2;
        oy = lerp(cy, dest.shot.y + dest.shot.h / 2, mE) - oh / 2;
        orad = lerp(50, 0.6, outCubic(pSettle));
        oop = 1;
        if (photo) { photo.style.opacity = clamp01((pSettle - 0.18) / 0.5).toFixed(3); }
        sheen.style.opacity = (1 - clamp01((pSettle - 0.12) / 0.45)).toFixed(3);
      }

      orb.style.width = ow.toFixed(1) + "px";
      orb.style.height = oh.toFixed(1) + "px";
      orb.style.borderRadius = orad.toFixed(2) + "%";
      orb.style.transform = "translate3d(" + ox.toFixed(1) + "px," + oy.toFixed(1) + "px,0)";
      orb.style.opacity = oop.toFixed(3);

      /* ---- orbit path ---- */
      ring.style.transform =
        "translate3d(" + (cx - R).toFixed(1) + "px," + (cy - R).toFixed(1) + "px,0)" +
        " rotateX(74deg) scale(" + lerp(0.12, 1, gE).toFixed(4) + ")";
      ring.style.opacity = (clamp01(pGrow * 1.6) * (1 - aE) * 0.8).toFixed(3);

      /* ---- the marks ---- */
      var r = lerp(R * 0.10, R, gE);
      var iscale = lerp(0.12, 1, outCubic(pGrow));

      for (var i = 0; i < icons.length; i++) {
        orbit(theta + i * (Math.PI * 2 / N), r, tmp);

        /* orbit → centred row */
        var size = S * iscale;
        var px = lerp(cx + tmp[0], cx + (i - mid) * GAP, aE) - size / 2;
        var py = lerp(cy + tmp[1], cy - S * 0.12, aE) - size / 2;
        var pz = lerp(tmp[2], FRONT, aE);

        /* centred row → its slot in the hero, cascading left to right */
        if (pSettle > 0 && dest) {
          var stagger = clamp01((pSettle - i * 0.055) / (1 - 0.055 * (N - 1)));
          var fE = inOutCubic(stagger);
          var d = dest.marks[i];
          size = lerp(S, d.w, fE);
          px = lerp(cx + (i - mid) * GAP, d.x + d.w / 2, fE) - size / 2;
          py = lerp(cy - S * 0.12,        d.y + d.h / 2, fE) - size / 2;
          pz = lerp(FRONT, 0, fE);
        }

        icons[i].style.width = size.toFixed(1) + "px";
        icons[i].style.height = size.toFixed(1) + "px";
        icons[i].style.transform =
          "translate3d(" + px.toFixed(1) + "px," + py.toFixed(1) + "px," + pz.toFixed(1) + "px)";
        icons[i].style.opacity = clamp01(pGrow * 3).toFixed(3);
      }

      /* ---- the name ---- */
      var h = outCubic(clamp01(pText * 1.25));
      head.style.opacity = h.toFixed(3);
      head.style.transform = "translateY(" + ((1 - h) * 20).toFixed(1) + "px)";
      head.style.letterSpacing = lerp(0.12, -0.035, h).toFixed(4) + "em";

      var rl = outCubic(clamp01((pText - 0.12) / 0.55));
      rule.style.transform = "scaleX(" + rl.toFixed(3) + ")";
      rule.style.opacity = rl.toFixed(3);

      var s2 = outCubic(clamp01((pText - 0.35) / 0.65));
      sub.style.opacity = s2.toFixed(3);
      sub.style.transform = "translateY(" + ((1 - s2) * 12).toFixed(1) + "px)";
    }

    /* ---- run -------------------------------------------------------------- */
    var start = 0, last = 0, raf = 0, done = false;

    function tick(now) {
      if (!start) { start = now; last = now; }
      var e = now - start;
      var dt = Math.min(64, now - last) / 1000;
      last = now;

      var pGrow = clamp01(e / T1);
      var pAlign = clamp01((e - T1) / SEQ.align);
      theta += lerp(5.4, 1.5, outCubic(pGrow)) * (1 - inOutCubic(pAlign)) * dt;

      render(e);

      if (e >= T5) { finish(); return; }
      raf = requestAnimationFrame(tick);
    }

    function finish() {
      if (done) { return; }
      done = true;
      running = false;
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("intro-run", "intro-landing");
      document.documentElement.classList.add("intro-settle");
      window.removeEventListener("resize", onResize);
      document.removeEventListener("keydown", onKey);
      if (el.parentNode) { el.parentNode.removeChild(el); }
    }

    function onKey(ev) {
      if (ev.key === "Escape" || ev.key === " " || ev.key === "Enter") { finish(); }
    }
    function onResize() { if (!dest) { measure(); } }

    skip.addEventListener("click", finish);
    el.addEventListener("click", function (ev) {
      if (ev.target === el || ev.target === bg || ev.target.classList.contains("grid")) { finish(); }
    });
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);

    measure();
    render(0);
    raf = requestAnimationFrame(tick);
  }

  window.MJIntro = { play: play };

  /* ---- on load ---------------------------------------------------------- */
  if (reduced) { return; }   /* the head script already set intro-settle */

  /* the head script set intro-run before first paint; start once layout is stable */
  requestAnimationFrame(function () { requestAnimationFrame(play); });
})();
