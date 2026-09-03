// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initCustomCursor();
  initScrollAnimations();
  initCompatibilityQuiz();
});

/**
 * 1. Custom Pointer / Micro-interactions
 * Fix: Uses gsap.set({ xPercent: -50, yPercent: -50 }) so GSAP never strips
 * the centering offset, locking both the dot and ring directly to the pointer tip.
 */
function initCustomCursor() {
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");

  if (!dot || !ring) return;

  // Center both elements relative to coordinates
  gsap.set([dot, ring], {
    xPercent: -50,
    yPercent: -50,
  });

  window.addEventListener("mousemove", (e) => {
    // Instant snap for the inner dot
    gsap.to(dot, {
      x: e.clientX,
      y: e.clientY,
      duration: 0,
    });

    // Smooth physics tracking for the outer ring
    gsap.to(ring, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.12,
      ease: "power2.out",
    });
  });

  // Scale cursor smoothly on hoverable elements
  const hoverables = document.querySelectorAll(
    "button, a, .quirk-pill, .spec-card",
  );
  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      gsap.to(ring, {
        scale: 1.5,
        backgroundColor: "rgba(0, 229, 255, 0.2)",
        duration: 0.2,
      });
    });
    el.addEventListener("mouseleave", () => {
      gsap.to(ring, {
        scale: 1,
        backgroundColor: "transparent",
        duration: 0.2,
      });
    });
  });
}

/**
 * 2. Visual Layer Transitions Driven by Scroll
 */
function initScrollAnimations() {
  const layerFormal = document.getElementById("layerFormal");
  const layerCasual = document.getElementById("layerCasual");
  const layerBeach = document.getElementById("layerBeach");

  const dot1 = document.getElementById("dot1");
  const dot2 = document.getElementById("dot2");
  const dot3 = document.getElementById("dot3");

  // Create Master Timeline for Outfit/Stage Progression
  const stageTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
    },
  });

  // Phase 1 -> Phase 2: Fade Formal into Casual (Mid Scroll)

  stageTimeline
    .to(layerFormal, { opacity: 0, duration: 1, ease: "power1.inOut" }, 0.5)
    .to(layerCasual, { opacity: 1, duration: 1, ease: "power1.inOut" }, 0.5)
    .call(
      () => {
        if (dot1.classList.contains("active")) {
          updateHUD(2);
        } else if (dot2.classList.contains("active")) {
          updateHUD(1);
        }
      },
      null,
      0.5,
    );

  // Phase 2 -> Phase 3: Fade Casual into Censored Beach Mode (Deep Scroll)
  stageTimeline
    .to(layerCasual, { opacity: 0, duration: 1, ease: "power1.inOut" }, 1.8)
    .to(layerBeach, { opacity: 1, duration: 1, ease: "power1.inOut" }, 1.8)
    .call(
      () => {
        if (dot3.classList.contains("active")) {
          updateHUD(2);
        } else {
          updateHUD(3);
        }
      },
      null,
      1.8,
    );

  // Helper function to keep track of steps in the visual card HUD
  function updateHUD(step) {
    [dot1, dot2, dot3].forEach((d) => {
      if (d) d.classList.remove("active");
    });
    if (step === 1 && dot1) dot1.classList.add("active");
    if (step === 2 && dot2) dot2.classList.add("active");
    if (step === 3 && dot3) dot3.classList.add("active");
  }

  // Floating Micro-Animations for Text and Cards
  gsap.utils.toArray(".panel").forEach((panel) => {
    gsap.from(panel.children, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.15,
      scrollTrigger: {
        trigger: panel,
        start: "top 75%",
        toggleActions: "play none none reverse",
      },
    });
  });
}

/**
 * 3. Interactive Quiz & Fireworks Confetti
 */
function initCompatibilityQuiz() {
  const buttons = document.querySelectorAll(".quiz-btn");
  const scoreNum = document.getElementById("scoreNumber");
  const verdict = document.getElementById("scoreVerdict");
  const matchBtn = document.getElementById("matchBtn");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");

      const score = parseInt(btn.dataset.score, 10);
      animateCounter(scoreNum, score);

      if (score >= 90) {
        verdict.innerHTML =
          "<strong>Soulmate Territory.</strong> Our shared eccentricities line up flawlessly.";
      } else if (score >= 70) {
        verdict.innerHTML =
          "<strong>Extremely Promising.</strong> Strong synergy with safe room for banter.";
      } else {
        verdict.innerHTML =
          "<strong>Run Away.</strong> This looks like early morning cardio, which violates my religion.";
      }
    });
  });

  // Confetti Blast on Final CTA
  if (matchBtn) {
    matchBtn.addEventListener("click", () => {
      fireConfetti();
      matchBtn.innerText = "✨ It's a Match! Message Sent!";
      matchBtn.style.backgroundColor = "#10b981";
    });
  }
}

// Number tick-up animation helper
function animateCounter(element, target) {
  if (!element) return;
  let current = 0;
  const step = Math.ceil(target / 20);
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.innerText = current;
  }, 25);
}

// Confetti burst logic using canvas-confetti
function fireConfetti() {
  if (typeof confetti !== "function") return;

  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#ff4071", "#00e5ff", "#ffe600", "#7000ff"],
  });
}
