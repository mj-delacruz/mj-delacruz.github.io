/* ===================================================================
   Site behaviour — Mary Jane Dela Cruz
   Nothing here is load-bearing: with scripts off the page still reads.
   =================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---- portfolio tiles ------------------------------------------------
     Add an `img` key once the photo exists in assets/img/work/ and the
     placeholder hatch is replaced automatically.                        */
  var WORK = [
    { tag: "Motorcycle",    cap: "Custom body skin, full wrap" },
    { tag: "Tankpad",       cap: "Protective decal, contour cut" },
    { tag: "Vehicle",       cap: "Van livery, durable vinyl" },
    { tag: "Die-cut",       cap: "Intricate shape, kiss cut" },
    { tag: "Logo",          cap: "Vectorized and printed" },
    { tag: "Pattern",       cap: "Fitment template, 1:1" },
    { tag: "Printed vinyl", cap: "Full-colour promotional set" },
    { tag: "Nesting",       cap: "Sheet layout, minimal waste" }
  ];

  var grid = document.getElementById("workgrid");
  if (grid) {
    WORK.forEach(function (w, i) {
      var a = document.createElement("div");
      a.className = "tile reveal";
      var n = (i + 1) < 10 ? "0" + (i + 1) : String(i + 1);
      a.innerHTML =
        (w.img
          ? '<img src="assets/img/work/' + w.img + '" alt="' + w.cap + '" loading="lazy">'
          : '<div class="hatch"></div>') +
        '<span class="slot">' + n + '</span>' +
        '<span class="tag">' + w.tag + '</span>' +
        '<span class="cap">' + w.cap + '</span>';
      grid.appendChild(a);
    });
  }

  /* ---- ticker ---------------------------------------------------------- */
  var ticker = document.getElementById("ticker");
  if (ticker) {
    var WORDS = [
      "Custom decals", "Vehicle graphics", "Pattern making", "Die-cut stickers",
      "Printed vinyl", "Logo production", "Graphtec plotting", "Material nesting"
    ];
    var run = WORDS.map(function (w) { return "<span>" + w + "</span>"; }).join("");
    ticker.innerHTML = run + run;   /* doubled so the -50% loop is seamless */
  }

  /* ---- mobile nav ------------------------------------------------------ */
  var toggle = document.querySelector(".navtoggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- theme ----------------------------------------------------------- */
  var themer = document.getElementById("themer");
  if (themer) {
    themer.addEventListener("click", function () {
      var now = root.getAttribute("data-theme");
      var sysDark = window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches;
      var next = now ? (now === "dark" ? "light" : "dark") : (sysDark ? "light" : "dark");
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("mjdc.theme", next); } catch (e) {}
    });
  }

  /* ---- scroll reveal --------------------------------------------------- */
  var targets = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        en.target.style.transitionDelay = (en.target.dataset.d || 0) + "ms";
        en.target.classList.add("in");
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (t, i) {
      t.dataset.d = String((i % 4) * 70);
      io.observe(t);
    });
  } else {
    Array.prototype.forEach.call(targets, function (t) { t.classList.add("in"); });
  }

  /* ---- nav scrollspy --------------------------------------------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('nav.site a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if (sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        links.forEach(function (a) {
          a.setAttribute("aria-current",
            String(a.getAttribute("href") === "#" + en.target.id));
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---- e-mail: copy rather than open a mail client -----------------------
     The markup ships as a plain mailto link, so it still works with scripts
     off. Here it is upgraded in place to a real button that copies — the
     "Send an email" CTA already covers opening a client.                   */
  var mail = document.querySelector('.deets a[href^="mailto:"]');
  if (mail) {
    var address = mail.getAttribute("href").replace(/^mailto:/, "");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = mail.className;
    btn.innerHTML = mail.innerHTML;
    btn.setAttribute("aria-label", "Copy e-mail address " + address);

    var key = btn.querySelector("span");
    var hint = document.createElement("em");
    hint.className = "deet-hint";
    hint.textContent = "Click to copy";
    if (key) { key.appendChild(hint); }

    mail.parentNode.replaceChild(btn, mail);

    var revert;
    function flash(msg, ok) {
      hint.textContent = msg;
      hint.classList.toggle("ok", !!ok);
      clearTimeout(revert);
      revert = setTimeout(function () {
        hint.textContent = "Click to copy";
        hint.classList.remove("ok");
      }, 2000);
    }

    function copy(text) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }
      /* file:// and plain http have no async clipboard — fall back */
      return new Promise(function (resolve, reject) {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;top:-1000px;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, text.length);
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      });
    }

    btn.addEventListener("click", function () {
      copy(address).then(
        function () { flash("Copied", true); },
        function () { flash("Press " + (/Mac/i.test(navigator.platform) ? "\u2318" : "Ctrl") + "+C", false); }
      );
    });
  }

  /* ---- replay the intro ------------------------------------------------- */
  var replay = document.getElementById("replay");
  if (replay) {
    if (window.MJIntro) {
      replay.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "auto" });
        window.MJIntro.play();
      });
    } else {
      replay.remove();          /* intro.js blocked or absent: no dead control */
    }
  }

  /* ---- year ------------------------------------------------------------ */
  var yr = document.getElementById("yr");
  if (yr) { yr.textContent = String(new Date().getFullYear()); }
})();
