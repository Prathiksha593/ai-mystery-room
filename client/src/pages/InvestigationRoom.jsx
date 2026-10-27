import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, discoverClue, requestHint } from '../api';

export default function InvestigationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCase = async () => {
    try {
      const res = await getCase(id);
      setCaseData(res.data);
    } catch (err) {
      setError('Unable to load case file.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCase();
  }, [id]);

  const handleDiscoverClue = async (clueId) => {
    try {
      await discoverClue(id, clueId);
      fetchCase();
    } catch (err) {
      alert('Failed to discover clue');
    }
  };

  const handleRequestHint = async () => {
    try {
      await requestHint(id);
      fetchCase();
    } catch (err) {
      alert(err.response?.data?.error || 'No hints available');
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Decrypting Case Briefing...</div>;
  if (error) return <div className="text-center py-20 text-rose-400">{error}</div>;

  const discoveredCount = caseData.clues.filter(c => c.discovered).length;
  const revealedHints = caseData.hints.filter(h => h.revealed);

  return (
    <div className="space-y-8">
      {/* Case Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-4 gap-4">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">
            ACTIVE CASE #{id.slice(-6)} | DIFFICULTY: {caseData.difficulty}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-100">{caseData.title}</h1>
        </div>
        <button
          onClick={() => navigate(`/accuse/${id}`)}
          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 font-bold text-slate-950 rounded-lg shadow"
        >
          PROCEED TO ACCUSATION
        </button>
      </div>

      {/* Case Overview */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-3">
        <h3 className="text-lg font-bold text-slate-200">Incident Report & Context</h3>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{caseData.story}</p>
      </div>

      {/* Suspect Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-200">Interrogated Suspects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {caseData.suspects.map((suspect) => (
            <div key={suspect.suspectId} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-bold text-rose-300">{suspect.name}</h4>
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">{suspect.role}</span>
              </div>
              <p className="text-xs text-slate-400"><strong className="text-slate-300">Bio:</strong> {suspect.bio}</p>
              <p className="text-xs text-slate-400"><strong className="text-slate-300">Stated Alibi:</strong> {suspect.alibi}</p>
              <p className="text-xs text-slate-400"><strong className="text-slate-300">Apparent Motive:</strong> {suspect.motive}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Clues Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-200">Evidence Board ({discoveredCount}/{caseData.clues.length} Discovered)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {caseData.clues.map((clue) => (
            <div
              key={clue.clueId}
              className={`border p-5 rounded-xl space-y-3 flex flex-col justify-between transition ${
                clue.discovered
                  ? 'bg-slate-900 border-emerald-800/60'
                  : 'bg-slate-950/60 border-slate-800 border-dashed'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">{clue.type}</span>
                  {clue.discovered && <span className="text-xs text-emerald-400 font-semibold">LOGGED (+5 pts)</span>}
                </div>
                <h4 className="font-bold text-slate-200">{clue.title}</h4>
                {clue.discovered ? (
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">{clue.description}</p>
                ) : (
                  <p className="text-xs text-slate-600 mt-2 italic">Evidence unexamined.</p>
                )}
              </div>
              {!clue.discovered && (
                <button
                  onClick={() => handleDiscoverClue(clue.clueId)}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold rounded"
                >
                  EXAMINE EVIDENCE
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hints System */}
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-amber-400">HQ Advisory / Lead Analyst Hints</h3>
            <p className="text-xs text-slate-500">Requesting hints imposes a -10 point penalty per hint.</p>
          </div>
          <button
            onClick={handleRequestHint}
            disabled={revealedHints.length >= caseData.hints.length}
            className="px-4 py-2 bg-amber-950/60 border border-amber-800/50 hover:bg-amber-900/60 text-amber-300 text-xs font-bold rounded disabled:opacity-50"
          >
            REQUEST HINT ({revealedHints.length}/{caseData.hints.length})
          </button>
        </div>

        {revealedHints.length > 0 && (
          <div className="space-y-2">
            {revealedHints.map((hint, idx) => (
              <div key={hint.hintId} className="bg-slate-950 p-3 rounded border border-amber-900/30 text-xs text-amber-200">
                <strong>Advisory #{idx + 1}:</strong> {hint.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}