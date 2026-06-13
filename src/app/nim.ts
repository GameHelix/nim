// Pure Nim game logic and CPU strategy.

export type Variant = "normal" | "misere";

export type Move = { pile: number; count: number };

// XOR of all pile sizes (the "nim-sum").
export function nimSum(piles: number[]): number {
  return piles.reduce((acc, p) => acc ^ p, 0);
}

export function isGameOver(piles: number[]): boolean {
  return piles.every((p) => p === 0);
}

// Number of piles with more than one object.
function pilesAboveOne(piles: number[]): number {
  return piles.filter((p) => p > 1).length;
}

// Compute the optimal move for the CPU for the given variant.
// Returns null only when no move is possible (game already over).
export function bestMove(piles: number[], variant: Variant): Move | null {
  if (isGameOver(piles)) return null;

  const nonEmpty = piles
    .map((p, i) => ({ p, i }))
    .filter((x) => x.p > 0);

  if (variant === "normal") {
    const move = winningMoveNormal(piles);
    if (move) return move;
    // Losing position: take 1 from the largest pile to stay alive.
    return takeOneFromLargest(piles);
  }

  // Misère play.
  const above = pilesAboveOne(piles);

  if (above === 0) {
    // All remaining piles have exactly one object.
    // In misère, with only heaps of size 1, you want to leave your
    // opponent an ODD number of heaps (so they take the last one).
    // Take exactly one object; with only size-1 heaps the parity is fixed,
    // but we still must make a legal move.
    return { pile: nonEmpty[0].i, count: 1 };
  }

  if (above === 1) {
    // Exactly one pile has >1. Reduce it so that the number of size-1
    // piles becomes odd (leave an odd count of 1s for the opponent).
    const big = nonEmpty.find((x) => x.p > 1)!;
    const ones = nonEmpty.length - 1; // existing size-1 piles
    // After our move, big pile becomes either 0 or 1.
    // We want total remaining heaps (all size 1) to be odd.
    // If we make big -> 1: heaps = ones + 1; if -> 0: heaps = ones.
    const targetIsOne = (ones + 1) % 2 === 1; // leave odd
    const newBig = targetIsOne ? 1 : 0;
    return { pile: big.i, count: big.p - newBig };
  }

  // More than one pile has >1 objects: play normal optimal strategy.
  const move = winningMoveNormal(piles);
  if (move) return move;
  return takeOneFromLargest(piles);
}

// Find a move that makes the nim-sum zero (winning move in normal play).
function winningMoveNormal(piles: number[]): Move | null {
  const xor = nimSum(piles);
  if (xor === 0) return null;
  for (let i = 0; i < piles.length; i++) {
    const target = piles[i] ^ xor;
    if (target < piles[i]) {
      return { pile: i, count: piles[i] - target };
    }
  }
  return null;
}

function takeOneFromLargest(piles: number[]): Move {
  let idx = 0;
  let max = -1;
  for (let i = 0; i < piles.length; i++) {
    if (piles[i] > max) {
      max = piles[i];
      idx = i;
    }
  }
  return { pile: idx, count: 1 };
}
