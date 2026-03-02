const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  const applyTheme = () => {
    const bg = tg.themeParams?.bg_color || "#080c12";
    document.documentElement.style.setProperty("--bg-0", bg);
  };
  applyTheme();
  tg.onEvent("themeChanged", applyTheme);
}

const drops = [
  { tier: "Covert", name: "AWP | Fade", color: "#f0b042" },
  { tier: "Restricted", name: "AK-47 | Ice", color: "#4fd9ff" },
  { tier: "Classified", name: "M4A1 | Nitro", color: "#ff6175" },
  { tier: "Rare", name: "Knife | Urban", color: "#9be08d" },
  { tier: "Exotic", name: "Gloves | Flux", color: "#e29cff" },
  { tier: "Classified", name: "USP | Burn", color: "#ff7a66" },
];

const rouletteTrack = document.getElementById("roulette-track");
const openBtn = document.getElementById("open-case");

function renderDrops(repeat = 6) {
  const html = [];
  for (let i = 0; i < repeat; i += 1) {
    for (const drop of drops) {
      html.push(`
      <article class="drop-item" style="box-shadow: inset 0 0 0 1px ${drop.color}22">
        <p class="drop-tier">${drop.tier}</p>
        <p class="drop-name" style="color:${drop.color}">${drop.name}</p>
      </article>
    `);
    }
  }
  rouletteTrack.innerHTML = html.join("");
}

renderDrops();

let spinning = false;
openBtn.addEventListener("click", () => {
  if (spinning) return;
  spinning = true;
  const targetIndex = Math.floor(Math.random() * drops.length) + drops.length * 3;
  spinRoulette(targetIndex, 2600, () => {
    spinning = false;
    if (tg) tg.HapticFeedback.impactOccurred("light");
  });
});

function spinRoulette(targetIndex, duration, done) {
  const cardWidth = 130;
  const centerOffset = window.innerWidth * 0.5 - cardWidth * 0.5;
  const start = performance.now();
  const from = Number(rouletteTrack.dataset.x || 0);
  const to = -(targetIndex * cardWidth) + centerOffset;

  const easeOutQuint = (t) => 1 - (1 - t) ** 5;

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = easeOutQuint(t);
    const x = from + (to - from) * eased;
    rouletteTrack.style.transform = `translate3d(${x}px, 0, 0)`;
    rouletteTrack.dataset.x = String(x);
    if (t < 1) {
      requestAnimationFrame(frame);
      return;
    }
    done();
  }

  requestAnimationFrame(frame);
}

const canvas = document.getElementById("fx-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
const maxDpr = 1.6;
const particles = [];
let width = 0;
let height = 0;

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.max(20, Math.min(52, Math.floor(width / 20)));
  particles.length = 0;
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.9 + 0.4,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      a: Math.random() * 0.5 + 0.15,
    });
  }
}

let last = performance.now();
function tick(now) {
  const dt = Math.min(40, now - last) / 16.67;
  last = now;

  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x < -10) p.x = width + 10;
    if (p.x > width + 10) p.x = -10;
    if (p.y < -10) p.y = height + 10;
    if (p.y > height + 10) p.y = -10;

    ctx.beginPath();
    ctx.fillStyle = `rgba(155, 201, 255, ${p.a})`;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(tick);
}

window.addEventListener("resize", resize, { passive: true });
resize();
requestAnimationFrame(tick);
