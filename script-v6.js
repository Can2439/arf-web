document.documentElement.classList.add("js");

(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector("[data-story-header]");
  const menuButton = document.querySelector(".story-menu-toggle");
  const navigation = document.querySelector(".story-nav");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileMotion = window.matchMedia("(max-width: 820px), (pointer: coarse)");
  const saveData = Boolean(navigator.connection?.saveData);
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeInOut = (value) => {
    const progress = clamp(value);
    return progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
  };
  const easeOut = (value) => 1 - Math.pow(1 - clamp(value), 3);
  const twoDigits = (value) => String(value).padStart(2, "0");
  const videos = [...document.querySelectorAll("video")];
  const storyVideos = videos.filter((video) =>
    video.matches(
      "[data-scrub-video], [data-split-video], [data-architecture-video], [data-final-video]",
    ),
  );
  const lightSections = [...document.querySelectorAll('[data-nav-tone="light"]')];
  let menuReturnTarget = null;
  let renderQueued = false;
  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const loadVideo = (video) => {
    if (!video || video.dataset.loaded === "true") return;
    let changed = false;
    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      changed = true;
    });
    video.dataset.loaded = "true";
    if (changed) video.load();
  };

  const playVideo = async (video) => {
    if (!video || reduceMotion.matches || saveData) return;
    loadVideo(video);
    try {
      await video.play();
    } catch {
      // Autoplay may be disabled. Posters preserve the complete visual meaning.
    }
  };

  const pauseVideo = (video) => {
    if (!video) return;
    video.pause();
  };

  const applyScrubTarget = (video) => {
    if (!video || video.readyState < 1 || !Number.isFinite(video.duration)) return;
    const duration = Math.max(0, video.duration - 0.06);
    const target = clamp(Number(video.dataset.scrubProgress || 0)) * duration;
    if (Math.abs(video.currentTime - target) < 0.035) return;
    try {
      video.currentTime = target;
    } catch {
      // Metadata may have arrived before the seekable range; the next frame retries.
    }
  };

  const scrubVideo = (video, progress) => {
    if (!video || reduceMotion.matches || mobileMotion.matches || saveData) return;
    loadVideo(video);
    pauseVideo(video);
    video.dataset.scrubProgress = String(clamp(progress));
    if (video.dataset.scrubBound !== "true") {
      video.dataset.scrubBound = "true";
      video.addEventListener("loadedmetadata", () => applyScrubTarget(video));
    }
    applyScrubTarget(video);
  };

  const visibleProgress = (section) => {
    if (!section) return 0;
    const bounds = section.getBoundingClientRect();
    const distance = Math.max(1, section.offsetHeight - viewportHeight);
    return clamp(-bounds.top / distance);
  };

  const isNearViewport = (section, margin = 160) => {
    if (!section) return false;
    const bounds = section.getBoundingClientRect();
    return bounds.bottom > -margin && bounds.top < viewportHeight + margin;
  };

  const setSceneProgress = (section, progress) => {
    section?.style.setProperty("--scene-progress-size", `${(progress * 100).toFixed(2)}%`);
  };

  const heroSection = document.querySelector('[data-scroll-scene="core"]');
  const heroVideo = heroSection?.querySelector("[data-scrub-video]");

  const updateHero = () => {
    if (!heroSection) return;
    const progress = visibleProgress(heroSection);
    const depth = easeOut(progress);
    const fade = clamp((progress - 0.58) / 0.27);

    heroSection.style.setProperty("--hero-scale", (0.84 + depth * 0.44).toFixed(4));
    heroSection.style.setProperty("--hero-shift-x", `${(8 - depth * 8).toFixed(3)}vw`);
    heroSection.style.setProperty("--hero-shift-y", `${(-depth * 1.8).toFixed(2)}vh`);
    heroSection.style.setProperty("--hero-copy-opacity", (1 - fade).toFixed(4));
    heroSection.style.setProperty("--hero-copy-shift", `${(-fade * 26).toFixed(2)}px`);
    heroSection.style.setProperty("--hero-field-opacity", (0.26 + depth * 0.46).toFixed(4));
    setSceneProgress(heroSection, progress);

    if (isNearViewport(heroSection)) scrubVideo(heroVideo, progress);
  };

  const splitSection = document.querySelector('[data-scroll-scene="split"]');
  const splitCoreMedia = splitSection?.querySelector(".split-core-media");
  const splitBackboneMedia = splitSection?.querySelector(".split-backbone-media");
  const splitCoreVideo = splitSection?.querySelector('[data-split-video="core"]');
  const splitBackboneVideo = splitSection?.querySelector('[data-split-video="backbone"]');

  const updateSplit = () => {
    if (!splitSection || !splitCoreMedia || !splitBackboneMedia) return;
    const progress = visibleProgress(splitSection);
    const separation = easeInOut(clamp((progress - 0.08) / 0.68));
    const introFade = clamp((progress - 0.12) / 0.2);
    const coreCopy = clamp((progress - 0.26) / 0.16);
    const backboneCopy = clamp((progress - 0.53) / 0.17);
    const coreTop = 100 - separation * 45;
    const coreBottom = 100 - separation * 58;
    const backboneTop = 100 - separation * 52;
    const backboneBottom = 100 - separation * 64;

    splitCoreMedia.style.clipPath =
      `polygon(0 0, ${coreTop.toFixed(2)}% 0, ${coreBottom.toFixed(2)}% 100%, 0 100%)`;
    splitBackboneMedia.style.clipPath =
      `polygon(${backboneTop.toFixed(2)}% 0, 100% 0, 100% 100%, ${backboneBottom.toFixed(2)}% 100%)`;
    splitBackboneMedia.style.opacity = clamp((progress - 0.1) / 0.34).toFixed(4);

    splitSection.style.setProperty("--split-intro-opacity", (1 - introFade).toFixed(4));
    splitSection.style.setProperty("--split-intro-shift", `${(-introFade * 28).toFixed(2)}px`);
    splitSection.style.setProperty("--pillar-core-opacity", coreCopy.toFixed(4));
    splitSection.style.setProperty("--pillar-core-shift", `${((1 - coreCopy) * 34).toFixed(2)}px`);
    splitSection.style.setProperty("--pillar-backbone-opacity", backboneCopy.toFixed(4));
    splitSection.style.setProperty(
      "--pillar-backbone-shift",
      `${((1 - backboneCopy) * 34).toFixed(2)}px`,
    );
    splitSection.style.setProperty("--seam-x", `${(100 - separation * 44).toFixed(2)}%`);
    splitSection.style.setProperty("--seam-angle", `${(-1 - separation * 4).toFixed(2)}deg`);
    splitSection.style.setProperty("--seam-scale", (0.26 + separation * 0.74).toFixed(4));
    splitSection.style.setProperty("--seam-opacity", clamp((progress - 0.12) / 0.2).toFixed(4));
    splitSection.style.setProperty("--seam-node-y", `${(30 + separation * 42).toFixed(2)}%`);
    setSceneProgress(splitSection, progress);

    if (isNearViewport(splitSection, viewportHeight)) {
      loadVideo(splitBackboneVideo);
      scrubVideo(splitCoreVideo, progress);
      scrubVideo(splitBackboneVideo, clamp((progress - 0.08) / 0.92));
    }
  };

  const architectureSection = document.querySelector('[data-scroll-scene="architecture"]');
  const architectureVideo = architectureSection?.querySelector("[data-architecture-video]");
  const architectureLayers = [
    ...(architectureSection?.querySelectorAll("[data-layer-index]") || []),
  ];
  const layerCounter = architectureSection?.querySelector("[data-layer-count]");
  const layerTargets = [
    { x: -46, y: -222, rotate: -1.2 },
    { x: 58, y: -74, rotate: 0.8 },
    { x: -28, y: 74, rotate: -0.7 },
    { x: 44, y: 222, rotate: 1.1 },
  ];

  const updateArchitecture = () => {
    if (!architectureSection) return;
    const progress = visibleProgress(architectureSection);
    setSceneProgress(architectureSection, progress);

    if (mobileMotion.matches || viewportWidth <= 820 || reduceMotion.matches) {
      architectureLayers.forEach((layer) => {
        layer.style.removeProperty("transform");
        layer.style.removeProperty("opacity");
        layer.classList.remove("is-active");
      });
      return;
    }

    const separation = easeInOut(clamp((progress - 0.07) / 0.48));
    const activeProgress = clamp((progress - 0.2) / 0.66);
    const activeIndex = Math.min(3, Math.floor(activeProgress * 4));
    const responsiveScale = clamp(viewportHeight / 900, 0.72, 1);

    architectureLayers.forEach((layer, index) => {
      const target = layerTargets[index];
      const x = target.x * separation;
      const y = target.y * separation * responsiveScale;
      const rotation = target.rotate * separation;
      const scale = 0.88 + separation * 0.12;
      const isActive = index === activeIndex;
      const opacity = 0.18 + separation * (isActive ? 0.82 : 0.38);

      layer.style.transform =
        `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) ` +
        `rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      layer.style.opacity = opacity.toFixed(4);
      layer.classList.toggle("is-active", isActive);
    });

    if (layerCounter) layerCounter.textContent = twoDigits(activeIndex + 1);
    if (isNearViewport(architectureSection, viewportHeight)) {
      loadVideo(architectureVideo);
      scrubVideo(architectureVideo, progress);
    }
  };

  const finalSection = document.querySelector('[data-scroll-scene="final"]');
  const finalVideos = [...(finalSection?.querySelectorAll("[data-final-video]") || [])];

  const updateFinal = () => {
    if (!finalSection) return;
    const progress = visibleProgress(finalSection);
    const convergence = easeInOut(progress);
    const content = clamp((progress - 0.34) / 0.34);
    const fadeVideo = clamp((progress - 0.54) / 0.35);

    finalSection.style.setProperty("--final-core-edge", `${(58 - convergence * 7).toFixed(2)}%`);
    finalSection.style.setProperty(
      "--final-core-edge-bottom",
      `${(45 + convergence * 5).toFixed(2)}%`,
    );
    finalSection.style.setProperty(
      "--final-backbone-edge",
      `${(42 + convergence * 7).toFixed(2)}%`,
    );
    finalSection.style.setProperty(
      "--final-backbone-edge-bottom",
      `${(55 - convergence * 5).toFixed(2)}%`,
    );
    finalSection.style.setProperty("--final-video-opacity", (0.5 - fadeVideo * 0.34).toFixed(4));
    finalSection.style.setProperty("--final-ring-scale", (1.36 - convergence * 0.58).toFixed(4));
    finalSection.style.setProperty("--final-ring-opacity", (0.18 + content * 0.62).toFixed(4));
    finalSection.style.setProperty("--final-content-opacity", content.toFixed(4));
    finalSection.style.setProperty("--final-content-shift", `${((1 - content) * 34).toFixed(2)}px`);
    setSceneProgress(finalSection, progress);

    if (isNearViewport(finalSection, viewportHeight)) {
      finalVideos.forEach((video, index) => {
        loadVideo(video);
        scrubVideo(video, index === 0 ? progress : clamp(progress * 0.94 + 0.04));
      });
    }
  };

  const updateHeader = () => {
    if (!header) return;
    const probeY = Math.min(viewportHeight * 0.2, 140);
    const lightSceneActive = lightSections.some((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= probeY && bounds.bottom > probeY;
    });
    const menuOpen = navigation?.classList.contains("is-open");
    header.classList.toggle("is-glass", window.scrollY > 20 || lightSceneActive);
    header.classList.toggle("menu-visible", Boolean(menuOpen));
  };

  const render = () => {
    renderQueued = false;
    const scrollable = Math.max(1, root.scrollHeight - viewportHeight);
    root.style.setProperty("--page-progress", (window.scrollY / scrollable).toFixed(5));
    updateHeader();
    updateHero();
    updateSplit();
    updateArchitecture();
    updateFinal();
  };

  const requestRender = () => {
    if (renderQueued) return;
    renderQueued = true;
    requestAnimationFrame(render);
  };

  const menuItems = () =>
    navigation
      ? [
          ...navigation.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        ]
      : [];

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuButton || !navigation || !navigation.classList.contains("is-open")) return;
    navigation.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
    if (restoreFocus && menuReturnTarget instanceof HTMLElement) menuReturnTarget.focus();
    requestRender();
  };

  const openMenu = () => {
    if (!menuButton || !navigation) return;
    menuReturnTarget = document.activeElement;
    navigation.classList.add("is-open");
    menuButton.setAttribute("aria-expanded", "true");
    body.classList.add("menu-open");
    requestRender();
    requestAnimationFrame(() => menuItems()[0]?.focus());
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
      const items = menuItems();
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
  }

  const enterItems = [...document.querySelectorAll("[data-enter]")];
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const enterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-entered");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    enterItems.forEach((item) => enterObserver.observe(item));
  } else {
    enterItems.forEach((item) => item.classList.add("is-entered"));
  }

  const deferredVideos = videos.filter((video) => video.querySelector("source[data-src]"));
  if ("IntersectionObserver" in window) {
    const preloadObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!reduceMotion.matches && !saveData) loadVideo(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "110% 0px", threshold: 0 },
    );
    deferredVideos.forEach((video) => preloadObserver.observe(video));
  }

  const ambientVideos = videos.filter((video) => video.matches("[data-lazy-video]"));
  const refreshAmbientPlayback = (entry) => {
    if (entry.isIntersecting && entry.intersectionRatio >= 0.18) {
      playVideo(entry.target);
    } else {
      pauseVideo(entry.target);
    }
  };

  if ("IntersectionObserver" in window) {
    const ambientObserver = new IntersectionObserver(
      (entries) => entries.forEach(refreshAmbientPlayback),
      { threshold: [0, 0.18, 0.6] },
    );
    ambientVideos.forEach((video) => ambientObserver.observe(video));

    const storyPlaybackObserver = new IntersectionObserver(
      (entries) => {
        if (!mobileMotion.matches) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.12) {
            playVideo(entry.target);
          } else {
            pauseVideo(entry.target);
          }
        });
      },
      { threshold: [0, 0.12, 0.5] },
    );
    storyVideos.forEach((video) => storyPlaybackObserver.observe(video));
  }

  document.querySelectorAll("[data-focus-module]").forEach((module) => {
    const video = module.querySelector("video");
    if (!video) return;
    module.addEventListener("mouseenter", () => {
      if (!reduceMotion.matches) video.playbackRate = 1.28;
    });
    module.addEventListener("mouseleave", () => {
      video.playbackRate = 1;
    });
    module.addEventListener("focusin", () => {
      if (!reduceMotion.matches) video.playbackRate = 1.18;
    });
    module.addEventListener("focusout", () => {
      video.playbackRate = 1;
    });
  });

  const updateMotionMode = () => {
    if (reduceMotion.matches || saveData) {
      videos.forEach(pauseVideo);
      enterItems.forEach((item) => item.classList.add("is-entered"));
    } else if (mobileMotion.matches) {
      storyVideos.forEach((video) => {
        const bounds = video.getBoundingClientRect();
        if (bounds.bottom > 0 && bounds.top < viewportHeight) playVideo(video);
      });
    } else {
      storyVideos.forEach(pauseVideo);
    }
    requestRender();
  };

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      if (viewportWidth > 820) closeMenu();
      requestRender();
    },
    { passive: true },
  );
  window.addEventListener("pageshow", requestRender);
  window.addEventListener("pagehide", () => videos.forEach(pauseVideo));
  reduceMotion.addEventListener?.("change", updateMotionMode);
  mobileMotion.addEventListener?.("change", updateMotionMode);

  videos.forEach((video) => {
    video.addEventListener("error", () => {
      video.closest("[data-focus-module], .scroll-scene")?.classList.add("video-fallback");
    });
  });

  updateMotionMode();
  render();
})();
