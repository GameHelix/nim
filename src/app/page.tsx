"use client";

import { useCallback, useEffect, useState } from "react";
import { bestMove, isGameOver, Variant } from "./nim";

type Mode = "two-player" | "cpu";
type Player = 0 | 1;

const INITIAL_PILES = [1, 3, 5, 7];

export default function Home() {
  const [piles, setPiles] = useState<number[]>([...INITIAL_PILES]);
  const [current, setCurrent] = useState<Player>(0);
  const [mode, setMode] = useState<Mode>("cpu");
  const [variant, setVariant] = useState<Variant>("normal");
  const [selected, setSelected] = useState<{ pile: number; count: number } | null>(
    null
  );
  const [winner, setWinner] = useState<Player | null>(null);
  const [cpuThinking, setCpuThinking] = useState(false);

  const reset = useCallback(() => {
    setPiles([...INITIAL_PILES]);
    setCurrent(0);
    setSelected(null);
    setWinner(null);
    setCpuThinking(false);
  }, []);

  // Reset board whenever core settings change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset();
  }, [mode, variant, reset]);

  // Apply a move and advance the game state.
  const applyMove = useCallback(
    (pile: number, count: number, mover: Player) => {
      setPiles((prev) => {
        const next = [...prev];
        next[pile] = Math.max(0, next[pile] - count);
        if (isGameOver(next)) {
          // mover took the last object.
          // normal: mover wins; misere: mover loses.
          setWinner(variant === "normal" ? mover : ((1 - mover) as Player));
        } else {
          setCurrent((1 - mover) as Player);
        }
        return next;
      });
    },
    [variant]
  );

  const takeSelected = useCallback(() => {
    if (!selected || winner !== null) return;
    const { pile, count } = selected;
    setSelected(null);
    applyMove(pile, count, current);
  }, [selected, winner, applyMove, current]);

  // CPU turn.
  useEffect(() => {
    if (mode !== "cpu" || winner !== null) return;
    if (current !== 1) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCpuThinking(true);
    const t = setTimeout(() => {
      const move = bestMove(piles, variant);
      if (move) applyMove(move.pile, move.count, 1);
      setCpuThinking(false);
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, mode, winner]);

  const humanTurn =
    winner === null && (mode === "two-player" || current === 0) && !cpuThinking;

  const onClickObject = (pile: number, indexFromBottom: number) => {
    if (!humanTurn) return;
    // Clicking an object selects removing it and everything above it.
    const count = piles[pile] - indexFromBottom;
    setSelected((prev) =>
      prev && prev.pile === pile && prev.count === count
        ? null
        : { pile, count }
    );
  };

  const playerLabel = (p: Player) => {
    if (mode === "cpu") return p === 0 ? "You" : "CPU";
    return p === 0 ? "Player 1" : "Player 2";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <header className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Nim
          </h1>
          <p className="mt-2 text-slate-400">
            The classic strategy game of piles and parity.
          </p>
        </header>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <Toggle
            label="Mode"
            value={mode}
            options={[
              { value: "cpu", label: "vs CPU" },
              { value: "two-player", label: "2 Players" },
            ]}
            onChange={(v) => setMode(v as Mode)}
          />
          <Toggle
            label="Variant"
            value={variant}
            options={[
              { value: "normal", label: "Normal" },
              { value: "misere", label: "Misère" },
            ]}
            onChange={(v) => setVariant(v as Variant)}
          />
        </div>

        {/* Status */}
        <div className="mb-6 rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3 text-center">
          {winner !== null ? (
            <p className="text-lg font-semibold text-emerald-400">
              {playerLabel(winner)} wins! 🎉
            </p>
          ) : (
            <p className="text-lg">
              <span className="text-slate-400">Turn: </span>
              <span className="font-semibold text-cyan-300">
                {playerLabel(current)}
              </span>
              {cpuThinking && (
                <span className="ml-2 text-slate-400 animate-pulse">
                  thinking…
                </span>
              )}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-500">
            {variant === "normal"
              ? "Take the last object to WIN."
              : "Take the last object and you LOSE."}
          </p>
        </div>

        {/* Board */}
        <div className="space-y-4 mb-6">
          {piles.map((size, pileIdx) => (
            <div
              key={pileIdx}
              className="flex items-center gap-3 rounded-xl bg-slate-800/40 border border-slate-700 px-4 py-3"
            >
              <span className="w-16 text-sm text-slate-400 shrink-0">
                Row {pileIdx + 1}
              </span>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: size }).map((_, i) => {
                  const sel =
                    selected && selected.pile === pileIdx ? selected.count : 0;
                  // Objects at the top end of the row are marked for removal.
                  const removing = i >= size - sel;
                  return (
                    <button
                      key={i}
                      onClick={() => onClickObject(pileIdx, i)}
                      disabled={!humanTurn}
                      aria-label={`Row ${pileIdx + 1} object ${i + 1}`}
                      className={[
                        "h-8 w-8 rounded-full border-2 transition-all duration-150",
                        removing
                          ? "bg-rose-500 border-rose-300 scale-110 shadow-lg shadow-rose-500/40"
                          : "bg-cyan-500 border-cyan-300 hover:bg-cyan-400",
                        humanTurn
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-80",
                      ].join(" ")}
                    />
                  );
                })}
                {size === 0 && (
                  <span className="text-slate-600 text-sm italic">empty</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={takeSelected}
            disabled={!selected || !humanTurn}
            className="px-5 py-2.5 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            {selected
              ? `Take ${selected.count} from Row ${selected.pile + 1}`
              : "Select objects to take"}
          </button>
          <button
            onClick={() => setSelected(null)}
            disabled={!selected}
            className="px-5 py-2.5 rounded-lg font-semibold bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Clear
          </button>
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg font-semibold bg-slate-100 hover:bg-white text-slate-900 transition"
          >
            Reset Game
          </button>
        </div>

        {/* Instructions */}
        <section className="mt-10 rounded-xl bg-slate-800/40 border border-slate-700 p-5 text-sm text-slate-300 leading-relaxed">
          <h2 className="font-semibold text-slate-100 mb-2">How to play</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Players alternate turns.</li>
            <li>On your turn, remove any number of objects from a single row.</li>
            <li>
              Click an object to select how many to remove, then press the take
              button.
            </li>
            <li>
              <span className="font-medium">Normal:</span> the player who takes the
              last object wins.
            </li>
            <li>
              <span className="font-medium">Misère:</span> the player who takes the
              last object loses.
            </li>
            <li>
              In <span className="font-medium">vs CPU</span> mode the computer plays
              the mathematically optimal nim-sum strategy — it is unbeatable from a
              winning position, so go first and play sharp!
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}

function Toggle<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="rounded-xl bg-slate-800/40 border border-slate-700 p-2">
      <span className="block text-xs uppercase tracking-wide text-slate-500 px-1 mb-1">
        {label}
      </span>
      <div className="flex gap-1">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={[
              "flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition",
              value === opt.value
                ? "bg-cyan-500 text-slate-900"
                : "bg-slate-700/60 text-slate-300 hover:bg-slate-700",
            ].join(" ")}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
