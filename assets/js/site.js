/* ===================================================================
   Site chrome — Mary Jane Dela Cruz
   Content, drawer, lightbox and intro. Works on its own: if the 3D room
   (room.js) fails to load, the dock still opens every panel.
   Talks to the room through window.MJ and three events:
     mj:reveal  intro is out of the way, build the room
     mj:open    a panel opened   (detail.key)
     mj:close   the panel closed
   =================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  var $ = function (id) { return document.getElementById(id); };
  var MJ = window.MJ = window.MJ || {};
  var EMAIL = "delacruzmaryjane2424@gmail.com";

  /* ---- portfolio --------------------------------------------------------
     file  → assets/img/works/<file>.jpg (full) and assets/img/thumbs/ (640px)
     w, h  → thumb size, used for frame shapes in the room                  */
  var CATS = [
    ["all",      "All"],
    ["decals",   "Decals"],
    ["logos",    "Logos & badges"],
    ["stickers", "Stickers"],
    ["print",    "Menus & print"],
    ["events",   "Events"],
    ["campaign", "Campaign"]
  ];
  var WORK = [
    { file: "moto-fasthouse-red",       cat: "decals",   title: "Fasthouse 131 body kit",          w: 640, h: 277 },
    { file: "moto-hello-kitty",         cat: "decals",   title: "Hello Kitty body skin",           w: 640, h: 189 },
    { file: "moto-mono-kit",            cat: "decals",   title: "Monochrome race kit",             w: 640, h: 336 },
    { file: "moto-green-camo",          cat: "decals",   title: "Green camo decal kit",            w: 640, h: 361 },
    { file: "banner-shawn-skyler",      cat: "decals",   title: "Windshield banner",               w: 640, h: 149 },
    { file: "logo-hangos",              cat: "logos",    title: "Hangos Bikers & Mountaineers",    w: 640, h: 640 },
    { file: "logo-puscc",               cat: "logos",    title: "PUSCC club seal",                 w: 640, h: 594 },
    { file: "logo-tigbaw",              cat: "logos",    title: "Tigbaw, Santa Fe",                w: 617, h: 640 },
    { file: "logo-mayong-bago",         cat: "logos",    title: "Mayong Bago, Santa Fe",           w: 640, h: 346 },
    { file: "logo-racho-architectural", cat: "logos",    title: "Racho Architectural Corporation", w: 640, h: 234 },
    { file: "diecut-santa-fe-set",      cat: "stickers", title: "Santa Fe die-cut set",            w: 612, h: 640 },
    { file: "stickers-ate-tin",         cat: "stickers", title: "Sticker sheet, Ate Tin",          w: 640, h: 426 },
    { file: "stickers-yvonne-cania",    cat: "stickers", title: "Sticker sheet, Yvonne Cania",     w: 426, h: 640 },
    { file: "label-bisaya-brew",        cat: "print",    title: "Bisaya Brew craft beer",          w: 468, h: 640 },
    { file: "menu-coldstart",           cat: "print",    title: "ColdStart drinks menu",           w: 640, h: 354 },
    { file: "promo-coldstart",          cat: "print",    title: "ColdStart Buy 2 Get 1",           w: 373, h: 640 },
    { file: "menu-sabaw",               cat: "print",    title: "Sabaw menu board",                w: 640, h: 486 },
    { file: "menu-pork-chicken",        cat: "print",    title: "Pork & chicken price board",      w: 480, h: 640 },
    { file: "brochure-racho",           cat: "print",    title: "Racho product catalogue",         w: 452, h: 640 },
    { file: "tarp-congrats-castro",     cat: "events",   title: "Board passer tarpaulin",          w: 640, h: 487 },
    { file: "tarp-birthday-ezekiel",    cat: "events",   title: "1st birthday tarpaulin",          w: 640, h: 479 },
    { file: "tarp-christening-hailey",  cat: "events",   title: "Christening tarpaulin",           w: 640, h: 428 },
    { file: "campaign-one-mandaue",     cat: "campaign", title: "One Mandaue poster",              w: 590, h: 640 },
    { file: "campaign-amping-sa-byahe", cat: "campaign", title: "Amping sa Byahe poster",          w: 426, h: 640 }
  ];
  MJ.WORK = WORK;
  var catName = {};
  CATS.forEach(function (c) { catName[c[0]] = c[1]; });

  /* ---- panels ---------------------------------------------------------- */
  function tool(bg, fg, txt, name) {
    return '<span class="tool"><i style="background:' + bg + ';color:' + fg + '">' + txt + '</i>' + name + '</span>';
  }

  var PANELS = {
    about: {
      kicker: "About me",
      title: "Hi, I’m Mary Jane.",
      html: function () {
        return '' +
          '<div class="about-top">' +
            '<img class="portrait" src="assets/img/mary-jane.png" alt="Mary Jane Dela Cruz" width="864" height="1080">' +
            '<p class="lead">A Graphic Artist based in Mandaue City, Cebu, with 5 years in the advertising and print industry.</p>' +
          '</div>' +
          '<p>I specialize in a technical workflow that combines creative design in Adobe Illustrator and ' +
          'Photoshop with high-precision Graphtec machine operation. My goal is to deliver perfect ' +
          'execution, from the initial layout to the final cut.</p>' +
          '<div class="stats">' +
            '<div class="stat"><b>5</b><span>Years in advertising &amp; print</span></div>' +
            '<div class="stat"><b>2</b><span>Specialist service lines</span></div>' +
            '<div class="stat"><b>100%</b><span>Accurate fitment templates</span></div>' +
          '</div>' +
          '<h3 class="sub">Tools of the trade</h3>' +
          '<div class="tools">' +
            tool("#300000", "#ff9a00", "Ai", "Illustrator") +
            tool("#001e36", "#31a8ff", "Ps", "Photoshop") +
            tool("#001e36", "#57cdff", "Lr", "Lightroom") +
            tool("linear-gradient(135deg,#00c4cc,#7d2ae8)", "#fff", "C", "Canva") +
            tool("#000", "#fd8f96", "✂", "Graphtec plotters") +
          '</div>';
      }
    },
    services: {
      kicker: "What I do",
      title: "Design → Cut → Fit",
      html: function () {
        return '' +
          '<div class="steps">' +
            '<div class="step"><b>Design</b><span>Layout in Illustrator &amp; Photoshop</span></div>' +
            '<div class="step"><b>Cut</b><span>High-precision Graphtec contour cutting</span></div>' +
            '<div class="step"><b>Fit</b><span>Templates for perfect fitment</span></div>' +
          '</div>' +
          '<h3 class="sub">Service lines</h3>' +
          '<article class="svc"><span class="n">SVC / 01</span>' +
            '<h3>Motorcycle &amp; Vehicle Specialist</h3><ul>' +
            '<li><b>Custom decals.</b> Precision-fit body skins and protective tankpads.</li>' +
            '<li><b>Vehicle graphics.</b> Durable stickers for cars, vans and pickups.</li>' +
            '<li><b>Pattern making.</b> 100% accurate templates for perfect fitment.</li>' +
          '</ul></article>' +
          '<article class="svc"><span class="n">SVC / 02</span>' +
            '<h3>Printed Logos &amp; Die-Cuts</h3><ul>' +
            '<li><b>Logo production.</b> High-resolution prints of enhanced and vectorized logos.</li>' +
            '<li><b>Die-cut stickers.</b> Precision contour cutting of intricate shapes and designs.</li>' +
            '<li><b>Printed vinyl.</b> Durable, full-colour stickers for branding and promotions.</li>' +
            '<li><b>Material efficiency.</b> Expert nesting on Graphtec plotters to minimise vinyl waste.</li>' +
          '</ul></article>' +
          '<button class="btn btn-solid" type="button" data-go="work">See the work →</button>' +
          '<button class="btn btn-line" type="button" data-go="contact">Get a quote</button>';
      }
    },
    work: {
      kicker: "Portfolio",
      title: "Selected work",
      html: function () {
        var counts = { all: WORK.length };
        WORK.forEach(function (w) { counts[w.cat] = (counts[w.cat] || 0) + 1; });
        var chips = CATS.map(function (c) {
          return '<button type="button" class="chip' + (c[0] === "all" ? " on" : "") + '" data-cat="' + c[0] + '">' +
                 c[1] + '<small>' + counts[c[0]] + '</small></button>';
        }).join("");
        var tiles = WORK.map(function (w, i) {
          return '<button type="button" class="tile" data-i="' + i + '" data-cat="' + w.cat + '">' +
                 '<img src="assets/img/thumbs/' + w.file + '.jpg" alt="' + w.title + '" width="' + w.w + '" height="' + w.h + '" loading="lazy">' +
                 '<span><small>' + catName[w.cat] + '</small><b>' + w.title + '</b></span></button>';
        }).join("");
        return '<div class="chips" role="toolbar" aria-label="Filter">' + chips + '</div><div class="grid">' + tiles + '</div>';
      }
    },
    contact: {
      kicker: "Contact",
      title: "Open for work",
      html: function () {
        return '' +
          '<p class="big">Work <em>with me</em></p>' +
          '<p>Send the shape, the bike or the logo you need cut. I will come back with the layout, ' +
          'the material and the fitment plan.</p>' +
          '<a class="btn btn-solid" href="mailto:' + EMAIL + '">✉ Send an email</a>' +
          '<button class="btn btn-line" type="button" id="copymail">Copy address</button>' +
          '<div class="deets">' +
            '<a class="deet" href="mailto:' + EMAIL + '"><span>E-mail</span><b>' + EMAIL + '</b></a>' +
            '<div class="deet"><span>Address</span><b>Mandaue, Cebu City, Philippines</b></div>' +
            '<div class="deet"><span>Discipline</span><b>Graphic art, vinyl cutting &amp; large-format print</b></div>' +
          '</div>';
      }
    }
  };

  /* ---- drawer ---------------------------------------------------------- */
  var drawer = $("drawer");
  var dKick = $("d-kicker"), dTitle = $("d-title"), dBody = $("d-body");
  var dock = document.querySelectorAll(".dock button");
  var current = null, lastFocus = null;

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function open(key, opts) {
    var p = PANELS[key];
    if (!p) return;
    opts = opts || {};
    if (current !== key) {
      dKick.textContent = p.kicker;
      dTitle.textContent = p.title;
      dBody.innerHTML = p.html();
      dBody.scrollTop = 0;
    }
    if (!current) lastFocus = document.activeElement;
    current = key;
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    root.classList.add("panel-open");
    dock.forEach(function (b) { b.classList.toggle("active", b.dataset.panel === key); });
    if (location.hash !== "#" + key) history.replaceState(null, "", "#" + key);
    emit("mj:open", { key: key });
    if (opts.work != null) showWork(opts.work);
    else setTimeout(function () { $("d-close").focus({ preventScroll: true }); }, 60);
  }

  function close() {
    if (!current) return;
    current = null;
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    root.classList.remove("panel-open");
    dock.forEach(function (b) { b.classList.remove("active"); });
    history.replaceState(null, "", location.pathname + location.search);
    emit("mj:close");
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  MJ.open = open;
  MJ.close = close;
  MJ.current = function () { return current; };

  dock.forEach(function (b) {
    b.addEventListener("click", function () {
      if (current === b.dataset.panel) close(); else open(b.dataset.panel);
    });
  });
  $("d-close").addEventListener("click", close);

  dBody.addEventListener("click", function (e) {
    var go = e.target.closest("[data-go]");
    if (go) { open(go.dataset.go); return; }

    var chip = e.target.closest(".chip");
    if (chip) {
      var cat = chip.dataset.cat;
      dBody.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c === chip); });
      dBody.querySelectorAll(".tile").forEach(function (t) {
        t.hidden = !(cat === "all" || t.dataset.cat === cat);
      });
      return;
    }

    var tile = e.target.closest(".tile");
    if (tile) { showWork(+tile.dataset.i); return; }

    if (e.target.id === "copymail" && navigator.clipboard) {
      navigator.clipboard.writeText(EMAIL).then(function () {
        e.target.textContent = "Copied ✓";
        setTimeout(function () { e.target.textContent = "Copy address"; }, 1800);
      });
    }
  });

  /* ---- lightbox -------------------------------------------------------- */
  var lb = $("lightbox"), lbImg = $("lb-img"), lbList = WORK.map(function (_, i) { return i; }), lbAt = 0;

  function visibleList() {
    var tiles = dBody.querySelectorAll(".tile");
    if (!tiles.length) return WORK.map(function (_, i) { return i; });
    var out = [];
    tiles.forEach(function (t) { if (!t.hidden) out.push(+t.dataset.i); });
    return out;
  }

  function showWork(i) {
    if (typeof i === "string") {
      i = WORK.findIndex(function (w) { return w.file === i; });
      if (i < 0) return;
    }
    lbList = visibleList();
    if (lbList.indexOf(i) < 0) lbList = WORK.map(function (_, n) { return n; });
    lbAt = lbList.indexOf(i);
    paint();
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    $("lb-close").focus({ preventScroll: true });
  }
  function paint() {
    var w = WORK[lbList[lbAt]];
    lbImg.src = "assets/img/works/" + w.file + ".jpg";
    lbImg.alt = w.title;
    $("lb-tag").textContent = catName[w.cat];
    $("lb-title").textContent = w.title;
    $("lb-count").textContent = (lbAt + 1) + " / " + lbList.length;
  }
  function step(d) { lbAt = (lbAt + d + lbList.length) % lbList.length; paint(); }
  function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    var t = dBody.querySelector('.tile[data-i="' + lbList[lbAt] + '"]');
    if (t) t.focus({ preventScroll: true });
  }
  MJ.showWork = showWork;

  $("lb-close").addEventListener("click", closeLb);
  $("lb-prev").addEventListener("click", function () { step(-1); });
  $("lb-next").addEventListener("click", function () { step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.tagName === "FIGURE") closeLb(); });

  var touchX = null;
  lb.addEventListener("touchstart", function (e) { touchX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX == null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
    touchX = null;
  });

  window.addEventListener("keydown", function (e) {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeLb();
      else if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      return;
    }
    if (e.key === "Escape") close();
  });

  /* ---- intro ------------------------------------------------------------
     cut (blade traces the contour) → filled (sticker + name) → peel.
     The room starts building as the sticker lifts.                      */
  var intro = $("intro");
  var timers = [];

  function reveal() {
    if (MJ.revealed) return;
    MJ.revealed = true;
    emit("mj:reveal");
    var key = location.hash.slice(1);
    if (PANELS[key]) setTimeout(function () { open(key); }, root.classList.contains("intro-skip") ? 400 : 1400);
  }

  function finish(skipped) {
    timers.forEach(clearTimeout);
    try { sessionStorage.setItem("mjdc.intro", "1"); } catch (e) {}
    intro.classList.add("filled", "peel");
    root.classList.remove("intro-run");
    root.classList.add("intro-settle");
    reveal();
    setTimeout(function () { intro.classList.add("done"); }, skipped ? 700 : 1100);
  }

  if (root.classList.contains("intro-run") && intro) {
    requestAnimationFrame(function () {
      intro.classList.add("cut");
      var blade = $("bladeRun");
      if (blade && blade.beginElement) blade.beginElement();
    });
    timers.push(setTimeout(function () { intro.classList.add("filled"); }, 1400));
    timers.push(setTimeout(function () { finish(false); }, 2900));
    var skip = function () { finish(true); };
    $("skip").addEventListener("click", skip);
    intro.addEventListener("click", skip);
    window.addEventListener("keydown", function k(e) {
      if (!root.classList.contains("intro-run")) { window.removeEventListener("keydown", k); return; }
      if (e.key === "Escape" || e.key === " " || e.key === "Enter") { e.preventDefault(); skip(); }
    });
  } else {
    if (intro) intro.classList.add("done");
    reveal();
  }

  /* ---- failsafe: no room after a while → show the portrait instead ------ */
  setTimeout(function () {
    if (!root.classList.contains("room-ready")) root.classList.add("no-webgl");
  }, 8000);
})();
