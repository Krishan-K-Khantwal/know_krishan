// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initCustomCursor();
  initScrollAnimations();
  initCompatibilityQuiz();
  initDriftWall();
});

/**
 * 1. Custom Pointer / Micro-interactions
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
    "button, a, .quirk-pill, .spec-card, .drift-cell",
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

  // Master Timeline for Outfit/Stage Progression
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
        if (dot1 && dot1.classList.contains("active")) {
          updateHUD(2);
        } else if (dot2 && dot2.classList.contains("active")) {
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
        if (dot3 && dot3.classList.contains("active")) {
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
 * 3. 4-Question Compatibility Calculator (Pass >= 60%, Fail < 60%)
 */
function initCompatibilityQuiz() {
  const buttons = document.querySelectorAll(".quiz-btn");
  const scoreNum = document.getElementById("scoreNumber");
  const verdict = document.getElementById("scoreVerdict");
  const subtext = document.getElementById("scoreSubtext");
  const matchBtn = document.getElementById("matchBtn");

  const totalQuestions = 4;
  const userAnswers = {};

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const qIndex = btn.dataset.q;
      const score = parseInt(btn.dataset.score, 10);

      // Deselect sibling buttons in this specific question group
      const siblingButtons = document.querySelectorAll(
        `.quiz-btn[data-q="${qIndex}"]`,
      );
      siblingButtons.forEach((b) => b.classList.remove("selected"));

      // Mark current button active
      btn.classList.add("selected");
      userAnswers[qIndex] = score;

      const answeredCount = Object.keys(userAnswers).length;
      const currentTotal = Object.values(userAnswers).reduce(
        (a, b) => a + b,
        0,
      );
      const calculatedScore = Math.round(currentTotal / answeredCount);

      animateCounter(scoreNum, calculatedScore);

      if (answeredCount < totalQuestions) {
        const remaining = totalQuestions - answeredCount;
        if (subtext)
          subtext.innerText = `${remaining} question${remaining > 1 ? "s" : ""} remaining`;
        if (verdict)
          verdict.innerText =
            "Answer all questions to compute our probability!";
        if (matchBtn) {
          matchBtn.disabled = true;
          matchBtn.className = "btn-match";
          matchBtn.innerText = `🔒 Answer All Questions (${answeredCount}/${totalQuestions})`;
          matchBtn.onclick = null; // Ensure it doesn't redirect prematurely
        }
      } else {
        // All 4 questions answered
        matchBtn.disabled = false;

        if (calculatedScore >= 60) {
          if (subtext) {
            subtext.innerText = "✅ Compatibility Threshold Surpassed!";
          }
          if (verdict) {
            verdict.innerHTML =
              "<strong>Soulmate Energy!</strong> We have high synergy and chaotic masti.";
            matchBtn.className = "btn-match pass";
            matchBtn.innerText = "🚀 Swipe Right / Lock In Date!";

            matchBtn.onclick = () => {
              setTimeout(() => {
                window.location.href =
                  "https://wa.me/917505380696?text=HEY!!%20Cutie!";
              }, 2000);
            };
          }
        } else {
          if (subtext) subtext.innerText = "❌ Compatibility Threshold Failed!";
          if (verdict)
            verdict.innerHTML =
              "<strong>Zero Synergy.</strong> We would disagree on snacks, dogs, and morning hours.";
          matchBtn.className = "btn-match fail";
          matchBtn.innerText = "💀 Better luck next life!";

          // Clear any leftover click events if they failed
          matchBtn.onclick = null;
        }
      }
    });
  });

  // Action Button Click Handling
  if (matchBtn) {
    matchBtn.addEventListener("click", () => {
      if (matchBtn.disabled) return;

      const answeredCount = Object.keys(userAnswers).length;
      if (answeredCount < totalQuestions) return;

      const currentTotal = Object.values(userAnswers).reduce(
        (a, b) => a + b,
        0,
      );
      const calculatedScore = Math.round(currentTotal / answeredCount);

      if (calculatedScore >= 60) {
        fireConfetti();
        matchBtn.innerText = "✨ Date Confirmed! Ping Me On WhatsApp!";
      } else {
        // Rejection wobble effect
        gsap.fromTo(
          matchBtn,
          { x: -10 },
          {
            x: 10,
            duration: 0.08,
            repeat: 5,
            yoyo: true,
            onComplete: () => gsap.set(matchBtn, { x: 0 }),
          },
        );
      }
    });
  }
}

// Number tick-up animation helper
function animateCounter(element, target) {
  if (!element) return;
  let current = 0;
  const step = Math.ceil(target / 20) || 1;
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

/**
 * 4. Drift Wall Mechanics (Desktop Mouse + Mobile Touch)
 */
function initDriftWall() {
  const stage = document.querySelector(".drift-stage");
  const board = document.getElementById("driftBoard");

  if (!stage || !board) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function updateCoordinates(clientX, clientY) {
    const rect = stage.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width - 0.5;
    const y = (clientY - rect.top) / rect.height - 0.5;

    const isMobile = window.innerWidth <= 900;
    targetX = x * (isMobile ? -100 : -260);
    targetY = y * (isMobile ? -60 : -140);
  }

  // Desktop Mouse
  stage.addEventListener("mousemove", (e) => {
    updateCoordinates(e.clientX, e.clientY);
  });

  // Mobile Touch
  stage.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length > 0) {
        updateCoordinates(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true },
  );

  stage.addEventListener("mouseleave", () => {
    targetX = 0;
    targetY = 0;
  });

  // Smooth lerp rendering loop
  function animateDrift() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    const isMobile = window.innerWidth <= 900;
    const baseRotation = isMobile ? -6 : -10;
    const baseScale = isMobile ? 0.95 : 1.2;

    board.style.transform = `rotate(${baseRotation}deg) scale(${baseScale}) translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(animateDrift);
  }

  animateDrift();
}
