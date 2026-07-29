document.documentElement.classList.add("js");

(() => {
  "use strict";

  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = Boolean(navigator.connection?.saveData);

  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");
  let menuReturnTarget = null;

  const focusableMenuItems = () =>
    navigation
      ? [...navigation.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
      : [];

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !navigation || !navigation.classList.contains("is-open")) return;
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
    if (restoreFocus && menuReturnTarget instanceof HTMLElement) menuReturnTarget.focus();
  };

  const openMenu = () => {
    if (!menuButton || !navigation) return;
    menuReturnTarget = document.activeElement;
    navigation.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
    requestAnimationFrame(() => focusableMenuItems()[0]?.focus());
  };

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      if (navigation.classList.contains("is-open")) {
        closeMenu({ restoreFocus: true });
      } else {
        openMenu();
      }
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (!navigation.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key !== "Tab") return;
      const items = focusableMenuItems();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 920) closeMenu();
    });
  }

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const articleHeader = document.querySelector(".article-header");
  if (articleHeader && navigation) {
    const hubLink = navigation.querySelector('a[href="yazilar.html"][aria-current="page"]');
    if (hubLink) {
      hubLink.removeAttribute("aria-current");
      hubLink.dataset.sectionCurrent = "true";
    }
  }

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  const showAllRevealItems = () => revealItems.forEach((item) => item.classList.add("is-visible"));

  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
    document.documentElement.classList.add("reveal-ready");
  } else {
    showAllRevealItems();
  }

  window.addEventListener(
    "pageshow",
    () => {
      document.querySelectorAll("[data-reveal]").forEach((item) => {
        if (item.getBoundingClientRect().top < window.innerHeight * 0.94) {
          item.classList.add("is-visible");
        }
      });
    },
    { once: true },
  );

  const motionFrames = [...document.querySelectorAll("[data-motion-frame]")];

  const findToggle = (frame) =>
    frame.querySelector(".motion-toggle") ||
    frame.parentElement?.querySelector(":scope > .cinematic-meta .motion-toggle") ||
    frame.parentElement?.querySelector(":scope > .hero-motion-meta .motion-toggle") ||
    frame.closest("[data-focus-scene]")?.querySelector(".motion-toggle") ||
    frame.closest(".video-section")?.querySelector(".motion-toggle");

  const setToggleState = (button, isPlaying) => {
    if (!button) return;
    button.textContent = isPlaying ? "Hareketi durdur" : "Hareketi oynat";
    button.setAttribute("aria-pressed", String(!isPlaying));
  };

  const loadVideo = (video) => {
    if (video.dataset.loaded === "true") return;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });
    video.dataset.loaded = "true";
    video.load();
  };

  const playFrame = async (frame, { manual = false } = {}) => {
    const video = frame.querySelector("video");
    const toggle = findToggle(frame);
    if (!video) return;
    if (reduceMotion.matches && !manual) return;
    if (saveData && !manual) return;
    if (frame.dataset.userPaused === "true" && !manual) return;

    loadVideo(video);
    try {
      await video.play();
      frame.classList.remove("is-paused");
      setToggleState(toggle, true);
    } catch {
      frame.classList.add("is-paused");
      setToggleState(toggle, false);
    }
  };

  const pauseFrame = (frame, { user = false } = {}) => {
    const video = frame.querySelector("video");
    if (!video) return;
    video.pause();
    if (user) frame.dataset.userPaused = "true";
    frame.classList.add("is-paused");
    setToggleState(findToggle(frame), false);
  };

  motionFrames.forEach((frame) => {
    const video = frame.querySelector("video");
    const toggle = findToggle(frame);
    if (!video) return;

    const poster = video.getAttribute("poster");
    if (poster) {
      frame.style.backgroundImage = `url("${poster}")`;
      frame.style.backgroundPosition = "center";
      frame.style.backgroundSize = "cover";
    }

    setToggleState(toggle, false);
    toggle?.addEventListener("click", () => {
      if (video.paused) {
        frame.dataset.userPaused = "false";
        playFrame(frame, { manual: true });
      } else {
        pauseFrame(frame, { user: true });
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const preloadObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const video = entry.target.querySelector("video");
          if (video && !reduceMotion.matches && !saveData) loadVideo(video);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "320px 0px", threshold: 0 },
    );

    const playbackObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
            playFrame(entry.target);
          } else {
            pauseFrame(entry.target);
          }
        });
      },
      { threshold: [0, 0.18, 0.55] },
    );

    motionFrames.forEach((frame) => {
      preloadObserver.observe(frame);
      playbackObserver.observe(frame);
    });
  } else if (!reduceMotion.matches && !saveData) {
    motionFrames.slice(0, 1).forEach((frame) => playFrame(frame));
  }

  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches) {
      motionFrames.forEach((frame) => pauseFrame(frame));
      showAllRevealItems();
    }
  });

  let frameRequested = false;
  const renderScrollState = () => {
    frameRequested = false;
    header?.classList.toggle("is-scrolled", window.scrollY > 18);
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    document.documentElement.style.setProperty("--page-progress", progress.toFixed(4));
  };

  const requestScrollState = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(renderScrollState);
  };

  renderScrollState();
  window.addEventListener("scroll", requestScrollState, { passive: true });
  window.addEventListener("resize", requestScrollState, { passive: true });

  const immersiveHero = document.querySelector(".hero-v3");
  if (immersiveHero && !reduceMotion.matches && matchMedia("(pointer: fine)").matches) {
    let pointerFrame = null;
    let pointerX = 0;
    let pointerY = 0;

    immersiveHero.addEventListener(
      "pointermove",
      (event) => {
        const bounds = immersiveHero.getBoundingClientRect();
        pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
        pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
        if (pointerFrame) return;
        pointerFrame = requestAnimationFrame(() => {
          immersiveHero.style.setProperty("--hero-x", `${pointerX * -8}px`);
          immersiveHero.style.setProperty("--hero-y", `${pointerY * -6}px`);
          immersiveHero.style.setProperty("--hero-scale", `${Math.abs(pointerX) * 0.006}`);
          pointerFrame = null;
        });
      },
      { passive: true },
    );

    immersiveHero.addEventListener("pointerleave", () => {
      immersiveHero.style.setProperty("--hero-x", "0px");
      immersiveHero.style.setProperty("--hero-y", "0px");
      immersiveHero.style.setProperty("--hero-scale", "0");
    });
  }
})();
