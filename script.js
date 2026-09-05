document.documentElement.classList.add("js");

const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const closeMenu = () => {
  if (!menuButton || !navigation) return;
  navigation.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const willOpen = !navigation.classList.contains("is-open");
    navigation.classList.toggle("is-open", willOpen);
    menuButton.setAttribute("aria-expanded", String(willOpen));
    document.body.classList.toggle("menu-open", willOpen);
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      menuButton.focus();
    }
  });
}

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

const revealItems = [...document.querySelectorAll("[data-reveal]")];
if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const motionFrames = [...document.querySelectorAll("[data-motion-frame]")];

const setToggleLabel = (button, isPlaying) => {
  button.textContent = isPlaying ? "Hareketi durdur" : "Hareketi oynat";
  button.setAttribute("aria-pressed", String(!isPlaying));
};

motionFrames.forEach((frame) => {
  const video = frame.querySelector("video");
  const toggle =
    frame.querySelector(".motion-toggle") ||
    frame.closest("[data-focus-scene]")?.querySelector(".motion-toggle");
  if (!video || !toggle) return;

  if (reduceMotion.matches) {
    video.pause();
    video.removeAttribute("autoplay");
    setToggleLabel(toggle, false);
  } else {
    video.play().catch(() => setToggleLabel(toggle, false));
  }

  toggle.addEventListener("click", () => {
    if (video.paused) {
      video.play().then(() => setToggleLabel(toggle, true)).catch(() => {});
    } else {
      video.pause();
      setToggleLabel(toggle, false);
    }
  });
});

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const motionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target.querySelector("video");
        const toggle =
          entry.target.querySelector(".motion-toggle") ||
          entry.target.closest("[data-focus-scene]")?.querySelector(".motion-toggle");
        if (!video || !toggle) return;
        if (entry.isIntersecting) {
          video.play().then(() => setToggleLabel(toggle, true)).catch(() => {});
        } else {
          video.pause();
          setToggleLabel(toggle, false);
        }
      });
    },
    { threshold: 0.28 },
  );
  motionFrames.forEach((frame) => motionObserver.observe(frame));
}

const immersiveHero = document.querySelector(".hero-v3");
if (immersiveHero && !reduceMotion.matches) {
  immersiveHero.addEventListener(
    "pointermove",
    (event) => {
      const bounds = immersiveHero.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      immersiveHero.style.setProperty("--hero-x", `${x * -10}px`);
      immersiveHero.style.setProperty("--hero-y", `${y * -7}px`);
      immersiveHero.style.setProperty("--hero-scale", `${Math.abs(x) * 0.006}`);
    },
    { passive: true },
  );

  immersiveHero.addEventListener("pointerleave", () => {
    immersiveHero.style.setProperty("--hero-x", "0px");
    immersiveHero.style.setProperty("--hero-y", "0px");
    immersiveHero.style.setProperty("--hero-scale", "0");
  });
}

const updatePageProgress = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
  document.documentElement.style.setProperty("--page-progress", progress.toFixed(4));
};

updatePageProgress();
window.addEventListener("scroll", updatePageProgress, { passive: true });
