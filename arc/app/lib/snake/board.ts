import {
  DIR_VEC,
  type Direction,
  type Vec,
  type Difficulty,
  TICK_MS,
  FOODS_PER_SPEEDUP,
  SPEEDUP_MS,
  MIN_TICK_MS,
} from "./types";

export type SnakeState = {
  size: number; // grid is size × size
  snake: Vec[]; // head at [0]
  food: Vec;
  dir: Direction;
  pendingDir: Direction; // queued input, applied on next tick
  alive: boolean;
  score: number;
  foodEaten: number;
};

export function newGame(size: number, rng: () => number = Math.random): SnakeState {
  const mid = Math.floor(size / 2);
  const snake: Vec[] = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  const food = spawnFood(snake, size, rng);
  return {
    size,
    snake,
    food,
    dir: "right",
    pendingDir: "right",
    alive: true,
    score: 0,
    foodEaten: 0,
  };
}

function eq(a: Vec, b: Vec): boolean {
  return a.x === b.x && a.y === b.y;
}

function spawnFood(snake: Vec[], size: number, rng: () => number): Vec {
  // For small/medium boards a retry-loop is fine. Bound retries; if we fail
  // (snake nearly fills board), fall back to a deterministic scan.
  const taken = new Set(snake.map((s) => `${s.x}:${s.y}`));
  for (let i = 0; i < 200; i++) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);
    if (!taken.has(`${x}:${y}`)) return { x, y };
  }
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!taken.has(`${x}:${y}`)) return { x, y };
    }
  }
  return { x: 0, y: 0 };
}

export function queueDirection(s: SnakeState, dir: Direction): SnakeState {
  // Disallow direct reversal (head can't U-turn into its own neck).
  if (!s.alive) return s;
  const head = s.snake[0];
  const neck = s.snake[1];
  const next = DIR_VEC[dir];
  if (neck && head.x + next.x === neck.x && head.y + next.y === neck.y) return s;
  return { ...s, pendingDir: dir };
}

export function step(s: SnakeState, rng: () => number = Math.random): SnakeState {
  if (!s.alive) return s;
  const dir = s.pendingDir;
  const v = DIR_VEC[dir];
  const head = s.snake[0];
  const nx = head.x + v.x;
  const ny = head.y + v.y;

  // Wall collision
  if (nx < 0 || ny < 0 || nx >= s.size || ny >= s.size) {
    return { ...s, alive: false };
  }

  const eating = eq({ x: nx, y: ny }, s.food);
  // Body collision — we ignore the tail because it'll move out of the way unless eating.
  const body = eating ? s.snake : s.snake.slice(0, -1);
  for (const seg of body) {
    if (seg.x === nx && seg.y === ny) {
      return { ...s, alive: false };
    }
  }

  const newSnake = [{ x: nx, y: ny }, ...(eating ? s.snake : s.snake.slice(0, -1))];
  let food = s.food;
  let foodEaten = s.foodEaten;
  let score = s.score;
  if (eating) {
    foodEaten += 1;
    score += 10;
    food = spawnFood(newSnake, s.size, rng);
  }
  return {
    ...s,
    snake: newSnake,
    food,
    dir,
    foodEaten,
    score,
  };
}

export function tickIntervalMs(difficulty: Difficulty, foodEaten: number): number {
  const base = TICK_MS[difficulty];
  const speedups = Math.floor(foodEaten / FOODS_PER_SPEEDUP);
  return Math.max(MIN_TICK_MS, base - speedups * SPEEDUP_MS);
}
