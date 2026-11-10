/* CrossCurrent Games site: menu, header, reveals, hero video, and the
   playable demo scene from Trapped in Time. No dependencies. */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var smallScreen = window.matchMedia("(max-width: 700px)").matches;

  // ---------- Year ----------
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Header ----------
  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Mobile menu ----------
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      });
    });
  }

  // ---------- Hero video ----------
  // The poster is the same frame, so visitors who prefer less motion or who
  // are saving data see the still and download nothing more.
  var video = document.getElementById("hero-video");
  if (video && (reduceMotion || saveData)) {
    video.removeAttribute("autoplay");
    video.pause();
    video.preload = "none";
    var source = video.querySelector("source");
    if (source) source.remove();
    video.load();
  }

  // ---------- Scroll reveals ----------
  var revealed = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealed.forEach(function (el) { el.classList.add("in"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealed.forEach(function (el) { observer.observe(el); });
  }

  // ---------- Demo scene ----------
  // The first scene of the game, with its real tap areas and cards. Areas
  // are fractions of the scene, as in the game's level data. The smartphone
  // moves with the footage, so like the game its area is keyed to the
  // video's progress (current time over duration) and interpolated between
  // keyframes.
  var ANOMALIES = [
    {
      label: "Smartphone",
      clue: "A pocket-sized invention from Cupertino, 2007",
      short: "Smartphones are modern electronics and did not exist in 40 AD Rome.",
      detail: "The first iPhone launched in 2007. This small device has millions of times more computing power than the guidance system used to land humans on the moon in 1969. In the era of Caligula communication moved at the speed of a horse. The Emperor used a system called the Cursus Publicus, where mounted couriers changed horses at relay stations to carry wax tablets across the empire.",
      hit: { x: 0.1738, y: 0.6748, w: 0.0788, h: 0.1475 },
      frames: [
        { p: 0, r: { x: 0.1738, y: 0.6748, w: 0.0788, h: 0.1475 } },
        { p: 0.25, r: { x: 0.1766, y: 0.5969, w: 0.0834, h: 0.1441 } },
        { p: 0.5, r: { x: 0.1747, y: 0.5903, w: 0.0834, h: 0.1524 } },
        { p: 0.75, r: { x: 0.1775, y: 0.5903, w: 0.0843, h: 0.1508 } },
        { p: 1, r: { x: 0.1803, y: 0.5853, w: 0.0797, h: 0.1607 } }
      ],
      hint: { x: 0.0538, y: 0.5548, w: 0.3188, h: 0.3875 }
    },
    {
      label: "Tomatoes",
      clue: "This fruit crossed the Atlantic after 1492",
      short: "Tomatoes are a New World crop and were only introduced to Europe in the 16th century.",
      detail: "These bright red fruits are impossible guests at an ancient Roman feast. Tomatoes are native to the Americas and did not reach Europe until Spanish explorers brought them back in the 16th century. For a citizen in 40 AD a tomato would be as alien as a plant from another planet. Romans enjoyed grapes and figs but they never tasted a pizza or a pasta sauce.",
      hit: { x: 0.7507, y: 0.7013, w: 0.1617, h: 0.1508 },
      hint: { x: 0.6307, y: 0.5813, w: 0.3693, h: 0.3908 }
    },
    {
      label: "Eyeglasses",
      clue: "First crafted by a Pisan monk, 1290 AD",
      short: "Eyeglasses were invented in the 13th century.",
      detail: "Lenses used for reading did not appear until the late 13th century in Italy. Before this invention the Romans had to find creative ways to deal with failing vision. The philosopher Seneca noted that small, faint letters look larger and clearer through a glass globe filled with water. History also records that Emperor Nero watched gladiator matches through a polished emerald to help his eyes focus and reduce the glare of the sun.",
      hit: { x: 0.4758, y: 0.3981, w: 0.0592, h: 0.0911 },
      hint: { x: 0.3558, y: 0.2781, w: 0.2992, h: 0.3311 }
    }
  ];

  var stage = document.getElementById("demo-stage");
  if (!stage) return;
  var sceneVideo = document.getElementById("demo-video");
  var marks = document.getElementById("demo-marks");
  var clues = document.getElementById("demo-clues");
  var count = document.getElementById("demo-count");
  var card = document.getElementById("demo-card");
  var cardLabel = document.getElementById("demo-card-label");
  var cardShort = document.getElementById("demo-card-short");
  var cardDetail = document.getElementById("demo-card-detail");
  var cardClose = document.getElementById("demo-card-close");
  var done = document.getElementById("demo-done");
  var hintButton = document.getElementById("demo-hint");
  var revealButton = document.getElementById("demo-reveal");
  var found = [false, false, false];
  var foundMarks = [];

  ANOMALIES.forEach(function (a, i) {
    var li = document.createElement("li");
    li.innerHTML = '<span class="clue-num">' + (i + 1) + '</span><span><span class="clue-label"></span><em></em></span>';
    li.querySelector("em").textContent = a.clue;
    clues.appendChild(li);
  });

  // ----- Scene video: loaded only when the demo is near, never for
  // visitors who prefer less motion or are saving data. Until it plays,
  // the still is frame one, where every area sits at progress 0.
  var videoOn = false;
  function progress() {
    if (!videoOn || !sceneVideo.duration) return 0;
    return Math.min(1, Math.max(0, sceneVideo.currentTime / sceneVideo.duration));
  }

  if (sceneVideo && !reduceMotion && !saveData && "IntersectionObserver" in window) {
    var started = false;
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (!started) {
            started = true;
            sceneVideo.src = smallScreen ? sceneVideo.dataset.srcSmall : sceneVideo.dataset.src;
            sceneVideo.preload = "auto";
          }
          var play = sceneVideo.play();
          if (play && play.catch) play.catch(function () {});
        } else if (started) {
          sceneVideo.pause();
        }
      });
    }, { rootMargin: "300px 0px" }).observe(stage);

    sceneVideo.addEventListener("playing", function () {
      videoOn = true;
      sceneVideo.classList.add("playing");
      requestAnimationFrame(follow);
    });
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  function rectAt(a, p) {
    var f = a.frames;
    if (!f) return a.hit;
    if (p <= f[0].p) return f[0].r;
    for (var k = 0; k < f.length - 1; k++) {
      if (p <= f[k + 1].p) {
        var t = (p - f[k].p) / (f[k + 1].p - f[k].p);
        var r0 = f[k].r, r1 = f[k + 1].r;
        return { x: lerp(r0.x, r1.x, t), y: lerp(r0.y, r1.y, t), w: lerp(r0.w, r1.w, t), h: lerp(r0.h, r1.h, t) };
      }
    }
    return f[f.length - 1].r;
  }

  function pct(v) { return (v * 100).toFixed(3) + "%"; }

  function place(el, r) {
    el.style.left = pct(r.x);
    el.style.top = pct(r.y);
    el.style.width = pct(r.w);
    el.style.height = pct(r.h);
  }

  // Found markers stay on their object as it moves.
  function follow() {
    if (!videoOn) return;
    var p = progress();
    foundMarks.forEach(function (m) {
      if (m && ANOMALIES[m.i].frames) place(m.el, rectAt(ANOMALIES[m.i], p));
    });
    if (!sceneVideo.paused) requestAnimationFrame(follow);
  }
  if (sceneVideo) sceneVideo.addEventListener("play", function () { if (videoOn) requestAnimationFrame(follow); });

  function markFound(i) {
    found[i] = true;
    var box = document.createElement("div");
    box.className = "mark-found";
    place(box, rectAt(ANOMALIES[i], progress()));
    marks.appendChild(box);
    foundMarks.push({ i: i, el: box });
    var li = clues.children[i];
    li.classList.add("found");
    li.querySelector(".clue-label").textContent = ANOMALIES[i].label;
    count.textContent = found.filter(Boolean).length;
  }

  function openCard(i) {
    var a = ANOMALIES[i];
    cardLabel.textContent = a.label + " found";
    cardShort.textContent = a.short;
    cardDetail.textContent = a.detail;
    card.hidden = false;
    cardClose.focus();
  }

  function closeCard() {
    if (card.hidden) return;
    card.hidden = true;
    if (found.every(Boolean)) {
      finish();
    } else {
      stage.focus({ preventScroll: true });
    }
  }

  function finish() {
    if (!done.hidden) return;
    done.hidden = false;
    hintButton.hidden = true;
    revealButton.hidden = true;
  }

  // A small target on a phone is hard to hit, so each tap area is at least
  // 44 by 44 pixels around its center, as on iOS.
  function hitTest(px, py, rect) {
    var min = 44;
    var p = progress();
    return ANOMALIES.findIndex(function (a, i) {
      if (found[i]) return false;
      var r = rectAt(a, p);
      var w = Math.max(r.w * rect.width, min);
      var h = Math.max(r.h * rect.height, min);
      var cx = (r.x + r.w / 2) * rect.width;
      var cy = (r.y + r.h / 2) * rect.height;
      return Math.abs(px - cx) <= w / 2 && Math.abs(py - cy) <= h / 2;
    });
  }

  stage.setAttribute("tabindex", "-1");
  stage.addEventListener("click", function (event) {
    if (!card.hidden) return;
    var rect = stage.getBoundingClientRect();
    var px = event.clientX - rect.left;
    var py = event.clientY - rect.top;
    var i = hitTest(px, py, rect);
    if (i >= 0) {
      markFound(i);
      openCard(i);
      return;
    }
    var miss = document.createElement("div");
    miss.className = "mark-miss";
    miss.style.left = px + "px";
    miss.style.top = py + "px";
    marks.appendChild(miss);
    setTimeout(function () { miss.remove(); }, 700);
  });

  hintButton.addEventListener("click", function () {
    var i = found.indexOf(false);
    if (i < 0) return;
    var old = marks.querySelector(".mark-hint");
    if (old) old.remove();
    var glow = document.createElement("div");
    glow.className = "mark-hint";
    place(glow, ANOMALIES[i].hint);
    marks.appendChild(glow);
    setTimeout(function () { glow.remove(); }, 4300);
  });

  revealButton.addEventListener("click", function () {
    var first = -1;
    found.forEach(function (isFound, i) {
      if (!isFound) {
        markFound(i);
        if (first < 0) first = i;
      }
    });
    if (first >= 0) openCard(first); else finish();
  });

  cardClose.addEventListener("click", closeCard);
  card.addEventListener("click", function (event) { if (event.target === card) closeCard(); });
  document.addEventListener("keydown", function (event) { if (event.key === "Escape") closeCard(); });
})();
