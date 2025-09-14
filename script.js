const CONFIG = {
  PARTNER_NAME: "my man",
  MAIN_MESSAGE: `i’m proud of all you’re doing! each step you take brings you closer to what you want 
remember to rest and take care of yourself too naka...i’m always here for you ka 🫶🏼`,
  PS: "p.s. we didn’t get to see each other this weekend, but we’ll make up for it soon ka!",
};
// -----------------------------------------------

const SCORE_GOAL = 20;
const RESULT_IMAGES = {
  happy: "happyFace.jpeg",
  sad: "sadFace.jpeg"
};

document.addEventListener("DOMContentLoaded", () => {

  // insert today’s date in the chip (if element exists)
  const timeChip = document.querySelector("#dateChip time");
  if (timeChip) {
    timeChip.textContent = new Date().toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric"
    });
  }

  // update greeting with partner’s name
  const partnerName = document.getElementById("partnerName");
  if (partnerName) partnerName.textContent = CONFIG.PARTNER_NAME;

  // modal + typewriter effect
  const dlg = document.getElementById("dlg");
  const letter = document.getElementById("letter");
  const ps = document.getElementById("ps");

  function showResult(score) {
    dlg.showModal();
    const title = document.getElementById("letterTitle");
    title.textContent = `${CONFIG.PARTNER_NAME}, you caught ${score} hearts!`;

    const isHappy = score >= SCORE_GOAL;
    const imgSrc  = isHappy ? RESULT_IMAGES.happy : RESULT_IMAGES.sad;
    const altTxt  = isHappy ? "happy face" : "sad face";

    letter.innerHTML = `
  <img src="${imgSrc}" alt="${altTxt}" class="popup-photo">
  <div style="text-align:center;opacity:.9;">
    ${isHappy ? "great job! 🎉" : "we’ll beat it next time 💪🏻"}
  </div>
`;
    ps.textContent = "";
    if (isHappy) burstHearts(60); // confetti only on happy
  }

  document.getElementById("openLetter").addEventListener("click", () => {
    letter.textContent = "";
    ps.textContent = "";
    dlg.showModal();
    typeText(CONFIG.MAIN_MESSAGE, letter, 12).then(() => {
      ps.textContent = CONFIG.PS;
      burstHearts(40);
    });
  });

  document.getElementById("close").addEventListener("click", () => dlg.close());

  // floating hearts background
  const bg = document.getElementById("bg");
  function spawnHeart() {
    const h = document.createElement("div");
    h.className = "heart";
    h.textContent = Math.random() < 0.5 ? "❤" : "💗";
    h.style.fontSize = 14 + Math.random() * 28 + "px";
    h.style.left = Math.random() * 100 + "%";
    const dur = 6 + Math.random() * 6;
    h.style.animationDuration = dur + "s";
    bg.appendChild(h);
    setTimeout(() => h.remove(), dur * 1000);
  }
  setInterval(spawnHeart, 250);

  function burstHearts(n) {
    for (let i = 0; i < n; i++) setTimeout(spawnHeart, Math.random() * 400);
  }

  function typeText(text, el, speed) {
    return new Promise((resolve) => {
      let i = 0;
      const id = setInterval(() => {
        el.textContent += text[i++] || "";
        if (i >= text.length) {
          clearInterval(id);
          resolve();
        }
      }, speed);
    });
  }

  // ---------------- GAME ----------------
  const canvas  = document.getElementById("game");
  const startBtn = document.getElementById("start");
  const playBtn  = document.getElementById("playBtn");
  const scoreEl  = document.getElementById("score");
  const timeEl   = document.getElementById("time");
  if (!canvas || !startBtn || !scoreEl || !timeEl) return;

  const ctx = canvas.getContext("2d");
  let hearts = [], score = 0, time = 15, running = false, last = 0;
  const player = { x: canvas.width/2, y: canvas.height-26, r: 14 };

  function resetGame() {
    hearts = []; score = 0; time = 15; running = false;
    scoreEl.textContent = score; timeEl.textContent = time; draw();
  }

  function spawnFallingHeart() {
    const x = 20 + Math.random()*(canvas.width-40);
    const speed = 60 + Math.random()*90;
    hearts.push({ x, y: -10, r: 12+Math.random()*6, vy: speed,
                  emoji: Math.random()<.12 ? "🐶" : "❤" });
  }

  function update(dt) {
    if (!running) return;
    if (Math.random() < 0.04) spawnFallingHeart();
    hearts.forEach(h => h.y += h.vy * dt / 1000);
    hearts = hearts.filter(h => h.y < canvas.height + 20);
    hearts.forEach((h, i) => {
      const d = Math.hypot(h.x - player.x, h.y - player.y);
      if (d < h.r + player.r) {
        score += (h.emoji === "🐶" ? 3 : 1);
        scoreEl.textContent = score;
        hearts.splice(i, 1);
      }
    });
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
    ctx.fillStyle = "#ff6b6b"; ctx.fill();
    ctx.font = "18px system-ui, sans-serif";
    ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    ctx.fillText("❤", player.x, player.y+6);
    hearts.forEach(h => {
      ctx.save();
      ctx.translate(h.x, h.y);
      ctx.font = (h.r*2)+"px serif";
      ctx.fillText(h.emoji,0,0);
      ctx.restore();
    });
  }

  function loop(ts){
    const dt = ts - last; last = ts;
    if (running){ update(dt); draw(); }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(ts => { last = ts; loop(ts); });

  function countdown(){
    const id = setInterval(() => {
      if (!running) { clearInterval(id); return; }
      time--; timeEl.textContent = time;
      if (time <= 0) {
        running = false;
        clearInterval(id);
        setTimeout(() => showResult(score), 200);
      }
    }, 1000);
  }

  function startGame(){ if (running) return; resetGame(); running = true; countdown(); }

  // ---- Mobile + Desktop input (pointer events) ----
  canvas.style.touchAction = "none"; // prevent page scroll
  let isPointerDown = false;

  function movePlayer(clientX) {
    const r = canvas.getBoundingClientRect();
    const mx = ((clientX - r.left) / r.width) * canvas.width;
    player.x = Math.max(14, Math.min(canvas.width - 14, mx));
  }

  canvas.addEventListener("pointerdown", e => {
    isPointerDown = true;
    canvas.setPointerCapture?.(e.pointerId);
    movePlayer(e.clientX);
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener("pointermove", e => {
    if (isPointerDown || e.pointerType === "mouse") movePlayer(e.clientX);
  });

  canvas.addEventListener("pointerup",   () => { isPointerDown = false; });
  canvas.addEventListener("pointercancel",() => { isPointerDown = false; });

  startBtn.addEventListener("click", startGame);
  if (playBtn) playBtn.addEventListener("click", startGame);

  resetGame();
});