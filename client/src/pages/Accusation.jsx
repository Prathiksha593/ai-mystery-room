import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCase, submitAccusation } from '../api';

export default function Accusation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [selectedSuspect, setSelectedSuspect] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCase(id)
      .then((res) => {
        setCaseData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSuspect) return alert('Select a suspect to issue warrant.');

    setSubmitting(true);
    try {
      await submitAccusation(id, selectedSuspect);
      navigate(`/results/${id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Accusation processing failed.');
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-400">Loading Suspect Profiles...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-3xl font-bold text-rose-400">Formal Arrest Warrant</h2>
        <p className="text-sm text-slate-400">Review case evidence before naming the primary culprit. Action is irreversible.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {caseData.suspects.map((suspect) => (
            <label
              key={suspect.suspectId}
              className={`block border p-4 rounded-xl cursor-pointer transition ${
                selectedSuspect === suspect.suspectId
                  ? 'border-rose-500 bg-rose-950/30'
                  : 'border-slate-800 bg-slate-900 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-4">
                <input
                  type="radio"
                  name="suspect"
                  value={suspect.suspectId}
                  checked={selectedSuspect === suspect.suspectId}
                  onChange={(e) => setSelectedSuspect(e.target.value)}
                  className="accent-rose-500 w-5 h-5"
                />
                <div>
                  <h4 className="text-lg font-bold text-slate-100">{suspect.name}</h4>
                  <p className="text-xs text-rose-400 font-medium">{suspect.role}</p>
                </div>
              </div>
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow transition"
        >
          {submitting ? 'EXECUTING ARREST WARRANT...' : 'ISSUE ARREST WARRANT'}
        </button>
      </form>
    </div>
  );
}