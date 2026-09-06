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

  gsap.set([dot, ring], {
    xPercent: -50,
    yPercent: -50,
  });

  window.addEventListener("mousemove", (e) => {
    gsap.to(dot, {
      x: e.clientX,
      y: e.clientY,
      duration: 0,
    });

    gsap.to(ring, {
      x: e.clientX,
      y: e.clientY,
      duration: 0.12,
      ease: "power2.out",
    });
  });

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
 * 2. Visual Layer Transitions Driven by Scroll (4 Outfits)
 */
function initScrollAnimations() {
  const layerFormal = document.getElementById("layerFormal");
  const layerCasual = document.getElementById("layerCasual");
  const layerBeach = document.getElementById("layerBeach");
  const layerQuiz = document.getElementById("layerQuiz");

  const dot1 = document.getElementById("dot1");
  const dot2 = document.getElementById("dot2");
  const dot3 = document.getElementById("dot3");
  const dot4 = document.getElementById("dot4");

  const stageTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".scroll-container",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        const p = self.progress;
        if (p < 0.25) updateHUD(1);
        else if (p >= 0.25 && p < 0.58) updateHUD(2);
        else if (p >= 0.58 && p < 0.9) updateHUD(3);
        else updateHUD(4);
      },
    },
  });

  stageTimeline
    .fromTo(
      layerFormal,
      { opacity: 1 },
      { opacity: 0, duration: 1, ease: "power1.inOut" },
      0,
    )
    .fromTo(
      layerCasual,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power1.inOut" },
      0,
    )
    .fromTo(
      layerCasual,
      { opacity: 1 },
      { opacity: 0, duration: 1, ease: "power1.inOut" },
      1,
    )
    .fromTo(
      layerBeach,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power1.inOut" },
      1,
    )
    .fromTo(
      layerBeach,
      { opacity: 1 },
      { opacity: 0, duration: 1, ease: "power1.inOut" },
      2,
    )
    .fromTo(
      layerQuiz,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power1.inOut" },
      2,
    );

  function updateHUD(step) {
    [dot1, dot2, dot3, dot4].forEach((d) => {
      if (d) d.classList.remove("active");
    });
    if (step === 1 && dot1) dot1.classList.add("active");
    if (step === 2 && dot2) dot2.classList.add("active");
    if (step === 3 && dot3) dot3.classList.add("active");
    if (step === 4 && dot4) dot4.classList.add("active");
  }

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
 * 3. Card-by-Card Swipe Deck Quiz Engine (8 Questions + Restored Match Button)
 */
function initCompatibilityQuiz() {
  const cards = document.querySelectorAll(".quiz-card");
  const startBtn = document.getElementById("startQuizBtn");
  const prevBtn = document.getElementById("prevCardBtn");
  const nextBtn = document.getElementById("nextCardBtn");
  const navControls = document.getElementById("deckNavControls");
  const progressLabel = document.getElementById("stepProgressLabel");
  const retakeBtn = document.getElementById("retakeBtn");

  const scoreNum = document.getElementById("scoreNumber");
  const verdict = document.getElementById("scoreVerdict");
  const subtext = document.getElementById("scoreSubtext");
  const matchBtn = document.getElementById("matchBtn");

  let currentStep = 0;
  const totalQuestions = 8;
  const userAnswers = {};

  function showStep(step) {
    currentStep = step;
    cards.forEach((card) => {
      const cardStep = parseInt(card.dataset.step, 10);
      card.classList.toggle("active", cardStep === currentStep);
    });

    if (currentStep === 0) {
      if (navControls) navControls.style.display = "none";
      if (progressLabel) progressLabel.innerText = "Ready to begin";
    } else if (currentStep >= 1 && currentStep <= totalQuestions) {
      if (navControls) navControls.style.display = "flex";
      if (progressLabel)
        progressLabel.innerText = `Step ${currentStep} of ${totalQuestions}`;
      if (prevBtn) prevBtn.style.display = currentStep === 1 ? "none" : "block";

      if (nextBtn) {
        nextBtn.disabled = !userAnswers[currentStep];
        nextBtn.innerText =
          currentStep === totalQuestions ? "Finish & Compute 🎯" : "Next →";
      }
    } else if (currentStep === 9) {
      if (navControls) navControls.style.display = "none";
      if (progressLabel) progressLabel.innerText = "Completed ✨";
      computeFinalScore();
    }
  }

  const questionCards = document.querySelectorAll(
    ".quiz-card[data-step='1'], .quiz-card[data-step='2'], .quiz-card[data-step='3'], .quiz-card[data-step='4'], .quiz-card[data-step='5'], .quiz-card[data-step='6'], .quiz-card[data-step='7'], .quiz-card[data-step='8']",
  );

  questionCards.forEach((card) => {
    const qButtons = card.querySelectorAll(".quiz-btn");
    const qIndex = parseInt(card.dataset.step, 10);

    qButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        qButtons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");

        const score = parseInt(btn.dataset.score, 10);
        userAnswers[qIndex] = score;

        if (nextBtn) nextBtn.disabled = false;
      });
    });
  });

  if (startBtn) startBtn.addEventListener("click", () => showStep(1));
  if (prevBtn)
    prevBtn.addEventListener("click", () => showStep(currentStep - 1));

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentStep < totalQuestions) {
        showStep(currentStep + 1);
      } else {
        showStep(9);
      }
    });
  }

  if (retakeBtn) {
    retakeBtn.addEventListener("click", () => {
      document
        .querySelectorAll(".quiz-btn")
        .forEach((b) => b.classList.remove("selected"));
      for (let key in userAnswers) delete userAnswers[key];
      showStep(0);
    });
  }

  function computeFinalScore() {
    const scores = Object.values(userAnswers);
    const average = Math.round(
      scores.reduce((a, b) => a + b, 0) / (scores.length || 1),
    );

    animateCounter(scoreNum, average);

    if (average >= 60) {
      if (subtext) subtext.innerText = "✅ Compatibility Threshold Surpassed!";
      if (verdict)
        verdict.innerHTML =
          "<strong>Soulmate Energy!</strong> We have high synergy and chaotic masti.";
      if (matchBtn) {
        matchBtn.className = "btn-match pass";
        matchBtn.innerText = "🚀 Swipe Right / Lock In Date!";
      }
    } else {
      if (subtext) subtext.innerText = "❌ Compatibility Threshold Failed!";
      if (verdict)
        verdict.innerHTML =
          "<strong>Zero Synergy.</strong> We would disagree on snacks, dogs, and sleep schedules.";
      if (matchBtn) {
        matchBtn.className = "btn-match fail";
        matchBtn.innerText = "💀 Better luck next life!";
      }
    }
  }

  if (matchBtn) {
    matchBtn.addEventListener("click", () => {
      const scores = Object.values(userAnswers);
      const average = Math.round(
        scores.reduce((a, b) => a + b, 0) / (scores.length || 1),
      );

      if (average >= 60) {
        fireConfetti();
        matchBtn.innerText = "✨ Opening WhatsApp...";
        setTimeout(() => {
          window.location.href =
            "https://wa.me/917505380696?text=HEY!!%20Cutie!";
        }, 2000);
      } else {
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
 * 4. Drift Wall Mechanics
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

  stage.addEventListener("mousemove", (e) => {
    updateCoordinates(e.clientX, e.clientY);
  });

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
