import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseResult } from '../api';

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCaseResult(id)
      .then((res) => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-slate-400">Computing Case Verdict...</div>;
  if (!result) return <div className="text-center py-20 text-rose-400">Failed to load result.</div>;

  const isGuilty = result.verdict === 'Guilty';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Verdict Header */}
      <div className={`p-8 rounded-2xl border text-center space-y-3 ${
        isGuilty
          ? 'bg-emerald-950/40 border-emerald-600 text-emerald-300'
          : 'bg-rose-950/40 border-rose-600 text-rose-300'
      }`}>
        <span className="text-xs uppercase font-extrabold tracking-widest px-3 py-1 bg-slate-950 rounded border border-current">
          CASE CLOSED — VERDICT: {result.verdict}
        </span>
        <h1 className="text-4xl font-black">{isGuilty ? 'CORRECT ACCUSATION' : 'MISCARRIAGE OF JUSTICE'}</h1>
        <div className="text-2xl font-bold">
          TOTAL CASE SCORE: <span className="text-slate-100">{result.score} PTS</span>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold">Your Accused Suspect</h3>
          <h4 className="text-xl font-bold text-slate-100">{result.accused?.name || 'Unknown'}</h4>
          <p className="text-xs text-slate-400">{result.accused?.role}</p>
        </div>

        <div className="bg-slate-900 border border-emerald-900 p-6 rounded-xl space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-emerald-500 font-bold">Actual Perpetrator</h3>
          <h4 className="text-xl font-bold text-emerald-300">{result.culprit?.name}</h4>
          <p className="text-xs text-slate-400">{result.culprit?.role}</p>
        </div>
      </div>

      {/* Case Breakdown */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-xl font-bold text-slate-200">Official Case Solution & Timeline</h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{result.solutionExplanation}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-2xl font-bold text-slate-200">{result.cluesDiscovered} / {result.totalClues}</div>
          <div className="text-xs text-slate-500">Clues Discovered</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-2xl font-bold text-slate-200">{result.hintsUsed}</div>
          <div className="text-xs text-slate-500">Hints Requested</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-2xl font-bold text-slate-200">{result.difficulty}</div>
          <div className="text-xs text-slate-500">Difficulty Rating</div>
        </div>
      </div>

      <button
        onClick={() => navigate('/create')}
        className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-lg transition"
      >
        START NEW INVESTIGATION
      </button>
    </div>
  );
}