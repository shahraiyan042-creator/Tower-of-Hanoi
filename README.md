#  Tower of Hanoi — Interactive Solver

## Features

- **Animated solver** — watch every disk move with lift → slide → drop physics
- **1–8 disks** — adjustable via slider
- **Speed control** — Slow / Normal / Fast / Turbo
- **Live math panel** — traces the recursion T(k) = 2·T(k−1) + 1 row by row as the animation plays
- **Move log** — step-by-step log of every disk movement
- **Progress bar** — tracks completion toward the optimal 2ⁿ − 1 total

## The Math

The minimum number of moves to solve Tower of Hanoi with `n` disks is:

```
T(n) = 2ⁿ − 1
```

**Why?** The recurrence relation is:

```
T(1) = 1                    (base case: 1 disk = 1 move)
T(n) = 2·T(n−1) + 1        (move n−1 disks, move biggest, move n−1 again)
```

Solving the recurrence gives the closed form **2ⁿ − 1**.

| n (disks) | Moves (2ⁿ−1) |
|-----------|--------------|
| 1         | 1            |
| 2         | 3            |
| 3         | 7            |
| 4         | 15           |
| 5         | 31           |
| 6         | 63           |
| 7         | 127          |
| 8         | 255          |

