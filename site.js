/* ARF İleri Teknoloji — site.js (2026-10 redesign) */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Yıl */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Başlık çizgisi */
  var header = document.querySelector("[data-header]");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Mobil menü */
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.getElementById("site-nav");
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
    };
    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* Osiloskop izleri (kavramsal) */
  var W = 1200;

  function powerTrace() {
    // Yarım köprü anahtarlama düğümü: kare dalga + kenarlarda sönümlü salınım
    var high = 62, low = 128, period = 150, duty = 0.46, pts = [];
    for (var x = 0; x <= W; x += 1.5) {
      var t = x % period;
      var on = t < period * duty;
      var y = on ? high : low;
      var since = on ? t : t - period * duty;          // son kenardan beri geçen süre
      var amp = (on ? -1 : 1) * 15;                    // aşma yönü
      y += amp * Math.exp(-since / 9) * Math.cos(since / 2.6);
      pts.push([x, y]);
    }
    return pts;
  }

  function senseTrace() {
    // Uçta izlenen sağlık göstergesi: düşük gürültülü, yavaş sürüklenen sinyal
    var pts = [], seed = 7;
    var rand = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280 - 0.5; };
    var n = 0;
    for (var x = 0; x <= W; x += 6) {
      n = n * 0.82 + rand() * 3.2;
      var drift = x > 820 ? Math.pow((x - 820) / 380, 2) * 34 : 0;
      var y = 232 + Math.sin(x / 140) * 6 + n - drift;
      pts.push([x, y]);
    }
    return pts;
  }

  function toPath(pts) {
    return pts.map(function (p, i) {
      return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1);
    }).join("");
  }

  var tracePower = document.querySelector('[data-trace="power"]');
  var traceSense = document.querySelector('[data-trace="sense"]');
  if (tracePower && traceSense) {
    tracePower.setAttribute("d", toPath(powerTrace()));
    traceSense.setAttribute("d", toPath(senseTrace()));

    if (!reduceMotion) {
      // Sayfanın tek orkestre hareketi: izlerin soldan sağa taranması
      var svg = tracePower.ownerSVGElement;
      var clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clip.setAttribute("id", "scope-sweep");
      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "0"); rect.setAttribute("y", "0");
      rect.setAttribute("width", "0"); rect.setAttribute("height", "300");
      clip.appendChild(rect);
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.appendChild(clip);
      svg.insertBefore(defs, svg.firstChild);
      tracePower.setAttribute("clip-path", "url(#scope-sweep)");
      traceSense.setAttribute("clip-path", "url(#scope-sweep)");

      var start = null, duration = 2200;
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min(1, (ts - start) / duration);
        rect.setAttribute("width", String(W * ease(p)));
        if (p < 1) requestAnimationFrame(step);
      };
      setTimeout(function () { requestAnimationFrame(step); }, 250);
    }
  }

  /* Videolar: yalnızca görünürken oynat */
  var videos = Array.prototype.slice.call(document.querySelectorAll("[data-lazy-video], [data-motion-frame] video"));
  var saveData = navigator.connection && navigator.connection.saveData;
  if (videos.length && !reduceMotion && !saveData && "IntersectionObserver" in window) {
    var load = function (v) {
      if (v.dataset.loaded) return;
      v.querySelectorAll("source[data-src]").forEach(function (s) { s.src = s.dataset.src; });
      v.load();
      v.dataset.loaded = "1";
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          load(v);
          if (v.dataset.userPaused) return;
          var playing = v.play();
          if (playing && playing.catch) playing.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px", threshold: 0.15 });
    videos.forEach(function (v) { io.observe(v); });
  }

  /* Hareketi durdur / başlat düğmeleri */
  document.querySelectorAll("[data-motion-frame]").forEach(function (frame) {
    var btn = frame.querySelector(".motion-toggle");
    var v = frame.querySelector("video");
    if (!btn || !v) return;
    if (reduceMotion || saveData) { btn.hidden = true; return; }
    btn.addEventListener("click", function () {
      var stop = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(stop));
      btn.textContent = stop ? "Hareketi başlat" : "Hareketi durdur";
      if (stop) { v.dataset.userPaused = "1"; v.pause(); }
      else {
        delete v.dataset.userPaused;
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    });
  });
})();
