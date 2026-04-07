/**
 * Tower of Hanoi — Interactive Solver
 * hanoi.js — animation engine + recursive solver
 *
 * Algorithm:  T(n) = 2ⁿ − 1   (minimum moves)
 * Recurrence: T(n) = 2·T(n−1) + 1,  T(1) = 1
 */

const DISK_COLORS = [
  '#E24B4A', '#D85A30', '#BA7517', '#3B6D11',
  '#0F6E56', '#185FA5', '#534AB7', '#993556'
];
const ROD_NAMES = ['A', 'B', 'C'];

// ── State ──────────────────────────────────────────────────────────
let N = 3;
let moves      = [];   // generated move sequence [{from, to}, ...]
let animIdx    = 0;    // current position in moves[]
let animTimer  = null;
let isRunning  = false;

// Three pegs, each an array of disk numbers (largest = bottom)
let animPeg = [[], [], []];

// Disk currently in flight
let liftDisk     = null;
let liftFrom     = -1;
let liftTo       = -1;
let animPhase    = 'idle'; // 'lift' | 'slide' | 'drop'
let animProgress = 0;      // 0..1 within current phase

// ── Canvas setup ───────────────────────────────────────────────────
const canvas = document.getElementById('hanoi-canvas');
const ctx    = canvas.getContext('2d');

function resize() {
  const W   = canvas.parentElement.offsetWidth - 56;
  const dpr = window.devicePixelRatio || 1;
  canvas.width        = W   * dpr;
  canvas.height       = 210 * dpr;
  canvas.style.width  = W   + 'px';
  canvas.style.height = '210px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw();
}

window.addEventListener('resize', resize);

// ── Geometry helpers ───────────────────────────────────────────────
function cw()     { return parseInt(canvas.style.width) || canvas.offsetWidth; }
function pegX(i)  { return [cw() * 0.18, cw() * 0.50, cw() * 0.82][i]; }
function diskW(d) {
  const min = 30, max = Math.min(cw() * 0.24, 110);
  return min + (d / N) * (max - min);
}
function diskH()  { return Math.max(14, Math.floor(160 / (N + 2))); }
function baseY()  { return 192; }
function rodH()   { return 145; }

// ── Drawing ────────────────────────────────────────────────────────
function draw() {
  const CW = cw(), CH = 210;
  ctx.clearRect(0, 0, CW, CH);

  // Base platform
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.roundRect(CW * 0.04, baseY() + 2, CW * 0.92, 7, 3);
  ctx.fill();

  // Rods + labels
  for (let i = 0; i < 3; i++) {
    const x = pegX(i), bY = baseY();
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.roundRect(x - 3, bY - rodH(), 6, rodH() + 2, 3);
    ctx.fill();
    ctx.fillStyle    = 'rgba(232,230,220,0.3)';
    ctx.font         = '600 11px Syne, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(ROD_NAMES[i], x, bY + 20);
  }

  const dh = diskH();

  // Stacked disks on each peg
  for (let p = 0; p < 3; p++) {
    animPeg[p].forEach((d, j) => {
      drawDisk(d, pegX(p), baseY() - (j + 1) * (dh + 2), dh);
    });
  }

  // Disk currently in flight
  if (liftDisk !== null) {
    const fromX  = pegX(liftFrom), toX = pegX(liftTo);
    const fromH  = animPeg[liftFrom].length;
    const toH    = animPeg[liftTo].length;
    const highY  = baseY() - rodH() - dh - 14;
    let dx, dy;

    if (animPhase === 'lift') {
      const startY = baseY() - (fromH + 1) * (dh + 2);
      dx = fromX;
      dy = startY + (highY - startY) * animProgress;
    } else if (animPhase === 'slide') {
      dx = fromX + (toX - fromX) * animProgress;
      dy = highY;
    } else { // 'drop'
      const endY = baseY() - (toH + 1) * (dh + 2);
      dx = toX;
      dy = highY + (endY - highY) * animProgress;
    }
    drawDisk(liftDisk, dx, dy, dh);
  }
}

function drawDisk(d, cx, y, dh) {
  const w     = diskW(d);
  const color = DISK_COLORS[(d - 1) % DISK_COLORS.length];
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, y, w, dh, dh / 2);
  ctx.fillStyle   = color;
  ctx.globalAlpha = 0.93;
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth   = 1;
  ctx.stroke();
  ctx.font         = `700 ${Math.max(9, dh - 5)}px Space Mono, monospace`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = 'rgba(255,255,255,0.85)';
  ctx.globalAlpha  = 0.9;
  ctx.fillText(d, cx, y + dh / 2);
  ctx.restore();
}

// ── Recursive solver ───────────────────────────────────────────────
/**
 * Generates the optimal move sequence.
 * hanoi(n, from, to, aux) moves n disks from peg `from` to peg `to`
 * using peg `aux` as the auxiliary.
 *
 * Recurrence:  T(n) = 2·T(n−1) + 1
 * Closed form: T(n) = 2ⁿ − 1
 */
function generateMoves() {
  moves = [];
  function hanoi(n, from, to, aux) {
    if (n === 0) return;
    hanoi(n - 1, from, aux, to);  // move n-1 disks to spare
    moves.push([from, to]);        // move largest disk
    hanoi(n - 1, aux, to, from);  // move n-1 disks onto largest
  }
  hanoi(N, 0, 2, 1);
}

// ── Trace table ────────────────────────────────────────────────────
function buildTrace() {
  const tbody = document.getElementById('trace-body');
  tbody.innerHTML = '';
  for (let k = 1; k <= N; k++) {
    const val = Math.pow(2, k) - 1;
    const tr  = document.createElement('tr');
    tr.id     = 'tr-' + k;
    const rec = k === 1
      ? '= 1 (base case)'
      : `= 2·T(${k - 1}) + 1 = 2·${Math.pow(2, k - 1) - 1} + 1`;
    tr.innerHTML = `<td>T(${k})</td><td>${rec}</td><td>${val}</td>`;
    tbody.appendChild(tr);
  }
}

function highlightTrace(k) {
  for (let i = 1; i <= N; i++) {
    const row = document.getElementById('tr-' + i);
    if (!row) continue;
    row.className = i === k ? 'trace-active' : (i < k ? 'trace-done' : '');
  }
}

// ── UI helpers ─────────────────────────────────────────────────────
function updateFormula() {
  const total = Math.pow(2, N) - 1;
  document.getElementById('fn-val').textContent    = N;
  document.getElementById('fn-n2').textContent     = N;
  document.getElementById('fn-exp').textContent    = N;
  document.getElementById('fn-result').textContent = total;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-rem').textContent   = total;
  document.getElementById('stat-move').textContent  = '0';
  document.getElementById('rec-depth').textContent  = N;
}

function logMove(moveNum, disk, from, to) {
  const log  = document.getElementById('move-log');
  if (log.querySelector('div[style]')) log.innerHTML = '';
  const prev = log.querySelector('.latest');
  if (prev) prev.classList.remove('latest');
  const entry = document.createElement('div');
  entry.className = 'move-entry latest';
  entry.textContent = `#${String(moveNum).padStart(3, '0')}  Disk ${disk}  ${ROD_NAMES[from]} → ${ROD_NAMES[to]}`;
  log.insertBefore(entry, log.firstChild);
}

// ── Public controls (called from HTML) ────────────────────────────
function onSlider(v) {
  N = parseInt(v);
  document.getElementById('n-val').textContent = N;
  resetAll();
}

function resetAll() {
  if (animTimer) { clearTimeout(animTimer); animTimer = null; }
  isRunning    = false;
  animIdx      = 0;
  liftDisk     = null;
  animPhase    = 'idle';

  // Init peg A with all disks (largest at bottom)
  animPeg = [[], [], []];
  for (let i = N; i >= 1; i--) animPeg[0].push(i);

  generateMoves();
  buildTrace();
  updateFormula();

  document.getElementById('move-log').innerHTML =
    '<div style="color:rgba(232,230,220,0.18);">Moves appear here as animation plays...</div>';
  document.getElementById('done-msg').style.display  = 'none';
  document.getElementById('btn-play').disabled       = false;
  document.getElementById('prog-fill').style.width   = '0%';
  highlightTrace(0);
  draw();
}

function startAnim() {
  if (isRunning) return;
  isRunning = true;
  document.getElementById('btn-play').disabled = true;
  animateStep();
}

// ── Animation engine ───────────────────────────────────────────────
function animateStep() {
  if (animIdx >= moves.length) {
    isRunning = false;
    liftDisk  = null;
    document.getElementById('done-msg').style.display = 'block';
    document.getElementById('done-count').textContent = moves.length;
    draw();
    return;
  }

  const [from, to] = moves[animIdx];
  const disk       = animPeg[from][animPeg[from].length - 1];
  const speed      = parseInt(document.getElementById('speed-sel').value);
  const PHASES     = ['lift', 'slide', 'drop'];
  const STEPS      = 20;
  let step = 0, phaseIdx = 0;

  liftDisk = disk;
  liftFrom = from;
  liftTo   = to;

  function tick() {
    step++;
    animProgress = step / STEPS;
    animPhase    = PHASES[phaseIdx];
    draw();

    if (step >= STEPS) {
      step = 0;
      phaseIdx++;
      if (phaseIdx >= 3) {
        // Commit the move to state
        animPeg[from].pop();
        animPeg[to].push(disk);
        liftDisk = null;
        animIdx++;

        const total = Math.pow(2, N) - 1;
        document.getElementById('stat-move').textContent = animIdx;
        document.getElementById('stat-rem').textContent  = total - animIdx;
        document.getElementById('prog-fill').style.width =
          ((animIdx / total) * 100).toFixed(1) + '%';

        logMove(animIdx, disk, from, to);
        highlightTrace(disk);
        draw();

        animTimer = setTimeout(animateStep, speed * 0.08);
        return;
      }
    }
    animTimer = setTimeout(tick, speed / STEPS);
  }
  tick();
}

// ── Boot ───────────────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => { resize(); resetAll(); }, 60);
});
