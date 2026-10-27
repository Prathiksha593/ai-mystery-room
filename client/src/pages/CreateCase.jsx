import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../api';

const DEFAULT_PREMISE = `The story revolves around the murder of college student Navya Deshpande, whose body is discovered in the trunk of a car submerged in Lake Venna. ACP Sangavi Verma is assigned the case on her final day before relocating. The submerged vehicle belongs to Senior Politician Harshvardhan Rao, sponsor of the "Abhaya" women's safety app. Verma is paired with her aggressive successor, ACP Pramod Kanwal. Suspects include Navya's ex-boyfriend Sid, Politician Rao, CS Dept Head Prof. Kulkarni, and app developer Rohan Rao.`;

export default function CreateCase() {
  const [premise, setPremise] = useState(DEFAULT_PREMISE);
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await createCase({ premise, difficulty });
      navigate(`/investigate/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initialize case file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-bold text-slate-100">Initialize New Case File</h2>
        <p className="text-sm text-slate-400">Configure parameters for the AI case generation engine.</p>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-800 text-rose-200 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Crime Premise / Case Context</label>
          <textarea
            rows="6"
            value={premise}
            onChange={(e) => setPremise(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Investigation Difficulty</label>
          <div className="grid grid-cols-3 gap-4">
            {['Easy', 'Medium', 'Hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level)}
                className={`p-4 rounded-lg border text-center font-bold transition ${
                  difficulty === level
                    ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>{level}</div>
                <div className="text-xs font-normal mt-1 text-slate-500">
                  {level === 'Easy' && '3 Suspects | 5 Clues | 2 Hints'}
                  {level === 'Medium' && '4 Suspects | 7 Clues | 3 Hints'}
                  {level === 'Hard' && '5 Suspects | 9 Clues | 3 Hints'}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-bold rounded-lg shadow transition"
        >
          {loading ? 'Synthesizing Crime Scene & Dossiers...' : 'GENERATE INVESTIGATION DOSSIER'}
        </button>
      </form>
    </div>
  );
}