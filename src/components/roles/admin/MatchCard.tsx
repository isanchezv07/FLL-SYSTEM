'use client';

import { useState } from "react";

interface Match {
  id: string;
  teamA: string;
  teamB: string;
  scoreA?: number;
  scoreB?: number;
}

interface Props {
  match: Match;
  index: number;
  updateMatch: (id: string, scoreA: number, scoreB: number) => void;
}

export default function MatchCard({ match, index, updateMatch }: Props) {

  const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
  const [scoreB, setScoreB] = useState(match.scoreB ?? 0);

  return (
    <div className="border rounded p-3 bg-gray-50 w-56">

      <p className="text-xs text-gray-500 mb-2">
        Match #{index + 1}
      </p>

      <div className="flex justify-between items-center mb-1">

        <span>{match.teamA || "TBD"}</span>

        <input
          type="number"
          value={scoreA}
          onChange={(e) => setScoreA(Number(e.target.value))}
          className="border w-12 text-center"
        />

      </div>

      <div className="flex justify-between items-center mb-2">

        <span>{match.teamB || "TBD"}</span>

        <input
          type="number"
          value={scoreB}
          onChange={(e) => setScoreB(Number(e.target.value))}
          className="border w-12 text-center"
        />

      </div>

      <button
        onClick={() => updateMatch(match.id, scoreA, scoreB)}
        className="bg-green-500 text-white text-xs px-2 py-1 rounded w-full"
      >
        Guardar
      </button>

    </div>
  );
}