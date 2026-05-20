const colorCombos = {
  "Color Combo 1": [
    { color: "#f6c21f", text: "#231f20" },
    { color: "#08a846", text: "#112318" },
    { color: "#2f6ee8", text: "#ffffff" },
    { color: "#e41f34", text: "#ffffff" },
  ],
  "Color Combo 2": [
    { color: "#6f0b2b", text: "#ffffff" },
    { color: "#c2a262", text: "#231f20" },
    { color: "#ffffff", text: "#6f0b2b" },
    { color: "#ff1515", text: "#ffffff" },
  ],
};

const activeColorCombo = "Color Combo 2";
const wheelColors = colorCombos[activeColorCombo];

const prizeSequence = [
  { short: "Unicorn Tumbler", long: "Unicorn Tumbler" },
  { short: "Unicorn Tote Bag", long: "Unicorn Tote Bag" },
  { short: "BZL TCM Voucher", long: "Bao Zi Lin TCM Voucher" },
  { short: "Complimentary Consultation", long: "Complimentary Family Wealth Consultation" },
  { short: "Unicorn Tote Bag", long: "Unicorn Tote Bag" },
  { short: "BZL TCM Voucher", long: "Bao Zi Lin TCM Voucher" },
  { short: "Complimentary Consultation", long: "Complimentary Family Wealth Consultation" },
  { short: "Unicorn Tumbler", long: "Unicorn Tumbler" },
  { short: "Unicorn Tote Bag", long: "Unicorn Tote Bag" },
  { short: "BZL TCM Voucher", long: "Bao Zi Lin TCM Voucher" },
  { short: "Complimentary Consultation", long: "Complimentary Family Wealth Consultation" },
  { short: "Unicorn Tote Bag", long: "Unicorn Tote Bag" },
  { short: "BZL TCM Voucher", long: "Bao Zi Lin TCM Voucher" },
  { short: "Complimentary Consultation", long: "Complimentary Family Wealth Consultation" },
];

const prizes = prizeSequence.map((prize, index) => ({
  ...prize,
  ...wheelColors[index % wheelColors.length],
}));

const canvas = document.querySelector("#wheel");
const ctx = canvas.getContext("2d");
const spinButton = document.querySelector("#spinButton");
const centerSpin = document.querySelector("#centerSpin");
const winnerModal = document.querySelector("#winnerModal");
const winnerPrize = document.querySelector("#winnerPrize");
const closeWinner = document.querySelector("#closeWinner");
const spinAgain = document.querySelector("#spinAgain");

const segmentAngle = (Math.PI * 2) / prizes.length;
let rotation = -Math.PI / 2 - segmentAngle / 2;
let spinning = false;
let lastWinner = null;

function drawWheel() {
  const size = canvas.width;
  const center = size / 2;
  const radius = size * 0.47;
  const innerRadius = size * 0.11;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(rotation);

  prizes.forEach((prize, index) => {
    const start = index * segmentAngle;
    const end = start + segmentAngle;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, end);
    ctx.closePath();
    ctx.fillStyle = prize.color;
    ctx.fill();

    ctx.save();
    ctx.rotate(start + segmentAngle / 2);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = prize.text;
    ctx.font = "800 34px Arial, Helvetica, sans-serif";
    ctx.shadowColor = prize.text === "#ffffff" ? "rgba(0, 0, 0, 0.22)" : "rgba(255, 255, 255, 0.26)";
    ctx.shadowBlur = 3;
    fitWheelText(prize.short, radius - 34, 0, radius * 0.56);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(35, 31, 32, 0.28)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, innerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();
}

function fitWheelText(text, x, y, maxWidth) {
  let fontSize = 32;
  ctx.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;

  while (ctx.measureText(text).width > maxWidth && fontSize > 18) {
    fontSize -= 1;
    ctx.font = `800 ${fontSize}px Arial, Helvetica, sans-serif`;
  }

  ctx.fillText(text, x, y);
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function pickPrizeIndex() {
  return Math.floor(Math.random() * prizes.length);
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function spinWheel() {
  if (spinning) return;

  spinning = true;
  winnerModal.hidden = true;
  spinButton.disabled = true;
  centerSpin.disabled = true;

  const winnerIndex = pickPrizeIndex();
  const segmentCenter = winnerIndex * segmentAngle + segmentAngle / 2;
  const pointerAngle = 0;
  const current = normalizeAngle(rotation);
  const targetNormalized = normalizeAngle(pointerAngle - segmentCenter);
  const delta = normalizeAngle(targetNormalized - current);
  const fullTurns = 6 + Math.floor(Math.random() * 3);
  const startRotation = rotation;
  const endRotation = rotation + fullTurns * Math.PI * 2 + delta;
  const duration = 5200;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    rotation = startRotation + (endRotation - startRotation) * easeOutCubic(progress);
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(frame);
      return;
    }

    rotation = endRotation;
    lastWinner = prizes[winnerIndex];
    spinning = false;
    spinButton.disabled = false;
    centerSpin.disabled = false;
    announceWinner(lastWinner);
  }

  requestAnimationFrame(frame);
}

function announceWinner(prize) {
  winnerPrize.textContent = prize.long;
  winnerModal.hidden = false;
  spinAgain.focus();
}

function closeWinnerModal() {
  winnerModal.hidden = true;
  spinButton.focus();
}

spinButton.addEventListener("click", spinWheel);
centerSpin.addEventListener("click", spinWheel);
spinAgain.addEventListener("click", closeWinnerModal);
closeWinner.addEventListener("click", closeWinnerModal);

winnerModal.addEventListener("click", (event) => {
  if (event.target === winnerModal) closeWinnerModal();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !winnerModal.hidden) closeWinnerModal();
  if (event.ctrlKey && event.key === "Enter") spinWheel();
});

drawWheel();
