# Nim

A polished, fully playable implementation of the classic mathematical strategy
game **Nim**, built with Next.js and TypeScript.

## About the game

Nim is played with several piles (rows) of objects. By default the board starts
with four rows holding **1, 3, 5, and 7** objects. Players alternate turns, and
on each turn a player removes **any positive number of objects from a single
row**.

Two win conditions are supported:

- **Normal play** — the player who takes the **last** object **wins**.
- **Misère play** — the player who takes the **last** object **loses**.

## Features

- **Two-player local** mode — play against a friend on the same device.
- **vs CPU** mode — the computer uses the optimal **nim-sum (XOR)** strategy and
  plays correctly for both the normal and misère variants. From a winning
  position it is unbeatable.
- Click objects in a row to choose how many to remove, then confirm with the
  take button.
- Turn indicator, winner announcement, reset, and mode / variant toggles.
- Responsive, modern UI styled with Tailwind CSS.

## How to play

1. Choose a **Mode** (vs CPU or 2 Players) and a **Variant** (Normal or Misère).
2. On your turn, click an object in a row — it and the objects above it are
   highlighted for removal.
3. Press **Take** to confirm your move (or **Clear** to change your selection).
4. Play alternates until the final object is removed; the winner is announced
   according to the chosen variant.
5. Press **Reset Game** to start over.

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/) (client component)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- ESLint

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run lint     # lint the project
```

Open [http://localhost:3000](http://localhost:3000) to play locally.
