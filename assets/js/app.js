/* ==========================================================================
   start.ng whimsical concept — interactions
   ========================================================================== */

(function () {
  "use strict";

  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Safe storage
     --------------------------------------------------------------------- */
  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch (err) {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        /* private mode — no worries */
      }
    },
  };

  /* ---------------------------------------------------------------------
     Sound (tiny synthesised blips, no audio files)
     --------------------------------------------------------------------- */
  let soundOn = store.get("startng-sound", "on") !== "off";
  let audioCtx = null;

  function ensureAudio() {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    if (!audioCtx) audioCtx = new Ctx();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function tone(freq = 520, duration = 0.07, type = "triangle", volume = 0.03, delay = 0) {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);
  }

  const soundToggle = $("#sound-toggle");
  function paintSoundToggle() {
    if (!soundToggle) return;
    soundToggle.setAttribute("aria-pressed", String(soundOn));
    soundToggle.setAttribute("aria-label", soundOn ? "Mute sound" : "Unmute sound");
  }
  paintSoundToggle();

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      soundOn = !soundOn;
      store.set("startng-sound", soundOn ? "on" : "off");
      paintSoundToggle();
      if (soundOn) {
        tone(523, 0.08);
        tone(784, 0.1, "triangle", 0.03, 0.07);
      }
      showToast(soundOn ? "Sound on. Tiny blips only, promise 🔊" : "Muted. Peace and quiet 🤫");
    });
  }

  /* ---------------------------------------------------------------------
     Toast
     --------------------------------------------------------------------- */
  const toast = $("#toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toast || !message) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 3800);
  }

  document.addEventListener("click", (event) => {
    const el = event.target.closest("[data-toast]");
    if (!el) return;
    if (el.tagName === "A") event.preventDefault();
    showToast(el.getAttribute("data-toast"));
  });

  /* ---------------------------------------------------------------------
     Button blips
     --------------------------------------------------------------------- */
  document.addEventListener("click", (event) => {
    const el = event.target.closest(
      ".btn, .game-card, .chip-filter, .faq-q, .chip, .lb-you, .socials a"
    );
    if (!el) return;
    if (el.classList.contains("chip-filter")) tone(680, 0.05, "triangle", 0.022);
    else if (el.classList.contains("game-card")) {
      tone(700, 0.06, "sine", 0.028);
      tone(940, 0.08, "sine", 0.022, 0.05);
    } else if (el.classList.contains("faq-q")) tone(560, 0.045, "sine", 0.02);
    else tone(500, 0.05, "triangle", 0.022);
  });

  /* ---------------------------------------------------------------------
     Header, mobile nav
     --------------------------------------------------------------------- */
  const header = $("#site-header");
  const navToggle = $("#nav-toggle");
  const siteNav = $("#site-nav");

  const onScroll = () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  function closeNav() {
    if (!header || !navToggle) return;
    header.classList.remove("nav-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && header) {
    navToggle.addEventListener("click", () => {
      const open = header.classList.toggle("nav-open");
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      tone(open ? 640 : 440, 0.05, "triangle", 0.02);
    });

    siteNav?.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });

    document.addEventListener("click", (event) => {
      if (!header.classList.contains("nav-open")) return;
      if (!header.contains(event.target)) closeNav();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 880) closeNav();
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  $$(".game-card").forEach((el, i) => el.style.setProperty("--d", i % 4));
  $$(".creator-card").forEach((el, i) => el.style.setProperty("--d", i));
  $$(".step").forEach((el, i) => el.style.setProperty("--d", i % 2));

  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reducedMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
    // Safety net: never leave content invisible.
    window.setTimeout(() => revealEls.forEach((el) => el.classList.add("in")), 2600);
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------------------------------------------------------------------
     Tournament countdown (local midnight)
     --------------------------------------------------------------------- */
  const cdHours = $("#cd-hours");
  const cdMins = $("#cd-mins");
  const cdSecs = $("#cd-secs");
  const pad = (n) => String(n).padStart(2, "0");

  function updateCountdown() {
    if (!cdHours) return;
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    let diff = Math.max(0, midnight - now);
    const hours = Math.floor(diff / 3600000);
    diff -= hours * 3600000;
    const mins = Math.floor(diff / 60000);
    diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);
    cdHours.textContent = pad(hours);
    cdMins.textContent = pad(mins);
    cdSecs.textContent = pad(secs);
  }
  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  /* ---------------------------------------------------------------------
     FAQ accordion
     --------------------------------------------------------------------- */
  $$(".faq-item").forEach((item) => {
    const button = $(".faq-q", item);
    if (!button) return;
    button.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      $$(".faq-item").forEach((other) => {
        other.classList.remove("is-open");
        const otherBtn = $(".faq-q", other);
        if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
      });
      if (willOpen) {
        item.classList.add("is-open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------------------------------------------------------------------
     Game filters
     --------------------------------------------------------------------- */
  const filterButtons = $$(".chip-filter");
  const gameCards = $$(".game-card");
  const gameGrid = $("#game-grid");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter || "all";
      filterButtons.forEach((other) => {
        const active = other === button;
        other.classList.toggle("is-active", active);
        other.setAttribute("aria-pressed", String(active));
      });
      let visible = 0;
      gameCards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (gameGrid) gameGrid.setAttribute("data-visible", String(visible));
      if (visible === 0) showToast("No games in that category yet — new drops every week 👀");
    });
  });

  $$(".see-all").forEach((link) => {
    link.addEventListener("click", () => {
      showToast("All 188 games live at start.ng/games. This concept shows eight favourites 🎮");
    });
  });

  /* ---------------------------------------------------------------------
     Confetti
     --------------------------------------------------------------------- */
  const confettiLayer = $("#confetti-layer");
  const confettiColors = ["#c9f45b", "#2bc25a", "#ffc93c", "#ff6b5e", "#4cb8f6", "#b79cf8", "#ff9ec4"];

  function confetti(count = 54) {
    if (!confettiLayer || reducedMotion) return;
    for (let i = 0; i < count; i += 1) {
      const piece = document.createElement("span");
      piece.className = "confetti";
      piece.style.left = `${8 + Math.random() * 84}vw`;
      piece.style.top = "-18px";
      piece.style.background = confettiColors[i % confettiColors.length];
      piece.style.setProperty("--dx", `${Math.round(Math.random() * 240 - 120)}px`);
      piece.style.setProperty("--rot", `${Math.round(360 + Math.random() * 700)}deg`);
      piece.style.animationDelay = `${Math.random() * 0.22}s`;
      if (i % 3 === 0) piece.style.borderRadius = "50%";
      confettiLayer.appendChild(piece);
      window.setTimeout(() => piece.remove(), 1900);
    }
  }

  /* ---------------------------------------------------------------------
     Jollof Catch — mini game
     --------------------------------------------------------------------- */
  const gameModal = $("#game-modal");
  const openGame = () => {
    if (!gameModal) return;
    resetGameIdle();
    document.body.classList.add("modal-open");
    if (typeof gameModal.showModal === "function") {
      if (!gameModal.open) gameModal.showModal();
    } else {
      gameModal.setAttribute("open", "");
    }
    tone(660, 0.08);
    tone(880, 0.1, "sine", 0.03, 0.08);
  };

  const closeGame = () => {
    if (!gameModal) return;
    stopRound();
    document.body.classList.remove("modal-open");
    if (typeof gameModal.close === "function") gameModal.close();
    else gameModal.removeAttribute("open");
  };

  $$("[data-open-game]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openGame();
    });
  });

  gameCards.forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      if (card.dataset.game === "jollof") {
        openGame();
        return;
      }
      const title = card.dataset.title || "That game";
      showToast(`${title} lives on start.ng — this concept has one playable demo: Jollof Catch 🍚`);
    });
  });

  if (gameModal) {
    $("#modal-close")?.addEventListener("click", closeGame);
    gameModal.addEventListener("click", (event) => {
      if (event.target === gameModal) closeGame();
    });
    gameModal.addEventListener("cancel", () => {
      stopRound();
      document.body.classList.remove("modal-open");
    });
    gameModal.addEventListener("close", () => {
      stopRound();
      document.body.classList.remove("modal-open");
    });
  }

  const stage = $("#game-stage");
  const itemsLayer = $("#game-items");
  const bowl = $("#bowl");
  const scoreEl = $("#game-score");
  const timeEl = $("#game-time");
  const bestEl = $("#game-best");
  const overlay = $("#game-overlay");
  const overlayTitle = $("#overlay-title");
  const overlayText = $("#overlay-text");
  const overlayFine = $("#overlay-fine");
  const startBtn = $("#game-start");

  const ROUND_SECONDS = 30;
  const CATCH_ZONE = 0.13;
  const ITEM_TYPES = {
    jollof: { emoji: "🍚", points: 1 },
    chicken: { emoji: "🍗", points: 3 },
    pepper: { emoji: "🌶️", points: -2 },
    drink: { emoji: "🥤", points: 1 },
  };

  let running = false;
  let score = 0;
  let timeLeft = ROUND_SECONDS;
  let bowlX = 0.5;
  let items = [];
  let spawnTimer = 0;
  let lastFrame = 0;
  let rafId = 0;
  let best = Number(store.get("startng-jollof-best", "0")) || 0;

  function paintHud() {
    if (scoreEl) scoreEl.textContent = String(score);
    if (timeEl) timeEl.textContent = String(Math.ceil(timeLeft));
    if (bestEl) bestEl.textContent = String(best);
  }

  function setBowl(x) {
    bowlX = Math.min(0.94, Math.max(0.06, x));
    if (bowl) bowl.style.left = `${bowlX * 100}%`;
  }

  function clearItems() {
    items = [];
    if (itemsLayer) itemsLayer.replaceChildren();
  }

  function stopRound() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    clearItems();
  }

  function resetGameIdle() {
    stopRound();
    score = 0;
    timeLeft = ROUND_SECONDS;
    setBowl(0.5);
    paintHud();
    if (overlay) overlay.hidden = false;
    if (overlayTitle) overlayTitle.textContent = "Catch the jollof!";
    if (overlayText) {
      overlayText.innerHTML =
        "Move the bowl with your mouse, finger, or arrow keys. Catch 🍚 +1 and 🍗 +3. Dodge the 🌶️ — they cost you 2 points.";
    }
    if (overlayFine) overlayFine.textContent = "No downloads. No wahala.";
    if (startBtn) startBtn.textContent = "Start 30s run";
  }

  function spawnItem(progress) {
    if (!itemsLayer) return;
    const roll = Math.random() * 100;
    let type = "jollof";
    if (roll >= 50 && roll < 66) type = "chicken";
    else if (roll >= 66 && roll < 90) type = "pepper";
    else if (roll >= 90) type = "drink";

    const data = ITEM_TYPES[type];
    const node = document.createElement("span");
    node.className = "falling";
    node.textContent = data.emoji;
    node.dataset.type = type;

    const item = {
      node,
      type,
      points: data.points,
      x: 0.1 + Math.random() * 0.8,
      y: -0.08,
      speed: 0.32 + progress * 0.24 + Math.random() * 0.08,
    };
    node.style.left = `${item.x * 100}%`;
    node.style.top = `${item.y * 100}%`;
    itemsLayer.appendChild(node);
    items.push(item);
  }

  function removeItem(item, caught) {
    const index = items.indexOf(item);
    if (index >= 0) items.splice(index, 1);
    if (caught) {
      item.node.classList.add("is-caught");
      window.setTimeout(() => item.node.remove(), 240);
    } else {
      item.node.remove();
    }
  }

  function collect(item) {
    if (item.type === "pepper") {
      score = Math.max(0, score + item.points);
      tone(150, 0.16, "sawtooth", 0.05);
      stage?.animate(
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-6px)" },
          { transform: "translateX(6px)" },
          { transform: "translateX(0)" },
        ],
        { duration: 180, easing: "ease-in-out" }
      );
    } else {
      score += item.points;
      if (item.points >= 3) {
        tone(880, 0.07, "sine", 0.04);
        tone(1175, 0.09, "sine", 0.035, 0.06);
      } else {
        tone(660 + Math.random() * 90, 0.06, "sine", 0.03);
      }
    }
    paintHud();
    scoreEl?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(1.3)" },
        { transform: "scale(1)" },
      ],
      { duration: 220, easing: "ease-out" }
    );
    removeItem(item, true);
  }

  function endRound() {
    running = false;
    if (rafId) window.cancelAnimationFrame(rafId);
    rafId = 0;
    clearItems();
    paintHud();

    const isBest = score > best;
    if (isBest) {
      best = score;
      store.set("startng-jollof-best", String(best));
      paintHud();
    }

    if (overlay) overlay.hidden = false;
    if (overlayTitle) {
      overlayTitle.textContent =
        score >= 26 ? "Jollof royalty! 👑" : score >= 14 ? "Well caught! 🍚" : "Warm-up done!";
    }
    if (overlayText) {
      overlayText.innerHTML = `You scored <strong>${score} point${score === 1 ? "" : "s"}</strong>. ${
        isBest
          ? "That's a new personal best — confetti incoming! 🎉"
          : `Your best is ${best}. One more run?`
      }`;
    }
    if (overlayFine) {
      overlayFine.textContent = `Best: ${best} · 30 second run · no wahala`;
    }
    if (startBtn) startBtn.textContent = "Play again";

    if (isBest) {
      confetti(70);
      tone(523, 0.1, "triangle", 0.04);
      tone(659, 0.1, "triangle", 0.04, 0.1);
      tone(784, 0.14, "triangle", 0.04, 0.2);
      tone(1046, 0.2, "triangle", 0.04, 0.32);
    } else if (score >= 14) {
      tone(523, 0.09);
      tone(784, 0.12, "triangle", 0.03, 0.09);
    } else {
      tone(392, 0.12, "sine", 0.03);
      tone(330, 0.16, "sine", 0.03, 0.1);
    }
  }

  function loop(timestamp) {
    if (!running) return;
    if (!lastFrame) lastFrame = timestamp;
    const dt = Math.min((timestamp - lastFrame) / 1000, 0.05);
    lastFrame = timestamp;

    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      paintHud();
      endRound();
      return;
    }

    const progress = 1 - timeLeft / ROUND_SECONDS;
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnItem(progress);
      spawnTimer = (0.72 - progress * 0.3) * (0.72 + Math.random() * 0.55);
    }

    for (let i = items.length - 1; i >= 0; i -= 1) {
      const item = items[i];
      item.y += item.speed * dt;
      item.node.style.top = `${item.y * 100}%`;
      item.node.style.left = `${item.x * 100}%`;

      if (item.y > 0.8 && item.y < 1.0 && Math.abs(item.x - bowlX) < CATCH_ZONE) {
        collect(item);
      } else if (item.y > 1.12) {
        removeItem(item, false);
      }
    }

    if (timeEl) timeEl.textContent = String(Math.ceil(timeLeft));
    rafId = window.requestAnimationFrame(loop);
  }

  function startRound() {
    stopRound();
    score = 0;
    timeLeft = ROUND_SECONDS;
    spawnTimer = 0.25;
    lastFrame = 0;
    setBowl(0.5);
    paintHud();
    if (overlay) overlay.hidden = true;
    running = true;
    tone(587, 0.08, "triangle", 0.03);
    tone(880, 0.1, "triangle", 0.03, 0.08);
    rafId = window.requestAnimationFrame(loop);
  }

  if (startBtn) startBtn.addEventListener("click", startRound);

  // Point & touch control
  if (stage) {
    stage.addEventListener("pointermove", (event) => {
      if (!running) return;
      const rect = stage.getBoundingClientRect();
      setBowl((event.clientX - rect.left) / rect.width);
    });
    stage.addEventListener("pointerdown", (event) => {
      if (!running) return;
      const rect = stage.getBoundingClientRect();
      setBowl((event.clientX - rect.left) / rect.width);
    });
  }

  // Keyboard control
  document.addEventListener("keydown", (event) => {
    if (!gameModal || !gameModal.open || !running) return;
    if (event.key === "ArrowLeft" || event.key === "a" || event.key === "A") {
      event.preventDefault();
      setBowl(bowlX - 0.07);
    } else if (event.key === "ArrowRight" || event.key === "d" || event.key === "D") {
      event.preventDefault();
      setBowl(bowlX + 0.07);
    }
  });

  paintHud();

  /* ---------------------------------------------------------------------
     Newsletter
     --------------------------------------------------------------------- */
  const newsletter = $("#newsletter");
  const newsEmail = $("#news-email");
  const newsMsg = $("#news-msg");

  if (newsletter && newsEmail && newsMsg) {
    newsletter.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = newsEmail.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        newsMsg.textContent = "Hmm, that email looks off. One more try?";
        newsMsg.style.color = "#ffb3a8";
        newsEmail.focus();
        tone(260, 0.12, "sine", 0.03);
        return;
      }
      newsMsg.textContent = "You're in! First drop lands Friday 💚";
      newsMsg.style.color = "";
      newsEmail.value = "";
      confetti(40);
      tone(523, 0.08);
      tone(784, 0.1, "triangle", 0.035, 0.08);
      tone(1046, 0.12, "triangle", 0.035, 0.16);
    });
  }

  /* ---------------------------------------------------------------------
     Tiny easter egg: click Tara for a random Naija phrase
     --------------------------------------------------------------------- */
  const mascot = $(".tara");
  const phrases = [
    "Oya, let's play! 🎮",
    "Small game, big vibes ✨",
    "No wahala, just games 💚",
    "Your leaderboard spot is waiting 👀",
    "One more run? You know you want to 🔥",
  ];
  if (mascot) {
    mascot.style.cursor = "pointer";
    mascot.addEventListener("click", () => {
      showToast(phrases[Math.floor(Math.random() * phrases.length)]);
      mascot.animate(
        [
          { transform: "rotate(0deg) scale(1)" },
          { transform: "rotate(-6deg) scale(1.05)" },
          { transform: "rotate(6deg) scale(1.05)" },
          { transform: "rotate(0deg) scale(1)" },
        ],
        { duration: 420, easing: "ease-in-out" }
      );
    });
  }
})();
