import React, { useState } from "react";

export default function InteractiveMap() {

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-lg font-black text-slate-800 uppercase tracking-tight">
          Misión 01
        </h1>
        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">
          Surface Brushing
        </p>
      </div>
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src="/missions/mission1_1.webp"
            alt="Surface Brushing Area"
            className="w-full h-auto"
          />
        </div>
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <img
            src="/missions/mission1_2.webp"
            alt="Surface Brushing Detail"
            className="w-full h-auto"
          />
        </div>
      </section>
      <section className="space-y-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">
            Area 1 Score
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScore1(score1 - 1)}
              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-lg"
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">
              {score1}
            </span>
            <button
              onClick={() => setScore1(score1 + 1)}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-lg"
            >
              +
            </button>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
          <span className="font-bold text-slate-700">
            Area 2 Score
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setScore2(score2 - 1)}
              className="w-10 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 font-black text-lg"
            >
              -
            </button>
            <span className="text-xl font-black text-blue-700 tabular-nums">
              {score2}
            </span>
            <button
              onClick={() => setScore2(score2 + 1)}
              className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-lg"
            >
              +
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}