# Tower of Hanoi — Interactive Solver

A browser-based animated solver for the Tower of Hanoi puzzle. Pick a disk count (1–8), hit Solve, and watch the optimal solution play out step by step.

---

## How to Run

Download the files and open `index.html` in any browser. No installs needed.

---

## The Math

The goal is to move all disks from peg A to peg C without placing a larger disk on a smaller one.

To move **n** disks you always need three steps:
1. Move the top n−1 disks to the spare peg → T(n−1) moves
2. Move the largest disk to the target → 1 move
3. Move the n−1 disks on top of it → T(n−1) moves

This gives the recurrence: **T(n) = 2·T(n−1) + 1**

Solving it gives the closed form: **T(n) = 2ⁿ − 1**

| Disks | Min Moves |
|-------|-----------|
| 1 | 1 |
| 2 | 3 |
| 3 | 7 |
| 4 | 15 |
| 5 | 31 |

---

## How the Code Works

**`generateMoves()`** — Runs the recursive algorithm before animation starts and stores every move as a `[from, to]` pair in an array.

**`animateStep()`** — Plays through the move array one at a time. Each move is split into three visual phases: lift, slide, and drop.

**`draw()`** — Redraws the canvas every tick. Each peg is stored as a stack array; disk positions are calculated from the stack height.

**`resetAll()`** — Clears state and rebuilds everything when the slider or reset button is used.

---

## Complexity

- Time: **O(2ⁿ)** — the number of moves doubles with each extra disk
- Space: **O(n)** — one stack frame per recursion level
