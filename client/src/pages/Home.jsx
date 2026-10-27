import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 space-y-8">
      <div className="max-w-3xl space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-100">
          Unravel Crime. Deconstruct Deception.
        </h1>
        <p className="text-lg text-slate-400">
          Step into high-stakes investigations powered by generative AI. Analyze evidence, uncover digital trails, interrogate suspects, and bring cold-blooded killers to justice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl text-left">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-rose-400 mb-2">1. Define Premise</h3>
          <p className="text-sm text-slate-400">Input any thriller baseline or launch pre-configured crime scenarios like the Navya Deshpande case.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">2. Analyze Evidence</h3>
          <p className="text-sm text-slate-400">Examine forensic reports, digital logs, phone records, and suspect alibis dynamically populated by Gemini.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h3 className="text-lg font-semibold text-emerald-400 mb-2">3. Issue Verdict</h3>
          <p className="text-sm text-slate-400">Make your accusation, score points based on your analytical precision, and reveal the truth.</p>
        </div>
      </div>

      <button
        onClick={() => navigate('/create')}
        className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg hover:shadow-rose-600/30 transition duration-200"
      >
        OPEN INVESTIGATION DESK
      </button>
    </div>
  );
}