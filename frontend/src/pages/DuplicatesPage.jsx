import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CopyCheck, Check, X, AlertTriangle, ExternalLink } from 'lucide-react';

export default function DuplicatesPage() {
  const { user } = useAuth();
  const [duplicates, setDuplicates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDuplicates = async () => {
    setLoading(true);
    try {
      const res = await api.get('/duplicates');
      setDuplicates(res.data);
    } catch (err) {
      console.error('Error fetching duplicates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDuplicates();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.put(`/duplicates/${id}`, {
        status,
        reviewedBy: user?.id || 2,
      });
      fetchDuplicates();
    } catch (err) {
      console.error('Error updating duplicate status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Duplicate Detection Hub</h1>
        <p className="text-xs text-slate-500">
          Screening for dual-funded, replicated, or overlapping MPLADS proposals across districts.
        </p>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Loading duplicate candidates...</div>
        ) : duplicates.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
            No duplicate candidates pending review.
          </div>
        ) : (
          duplicates.map((dup) => (
            <div
              key={dup.id}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">Work #{dup.workId}</span>
                  <span className="text-xs text-slate-400 font-bold">⟷</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {dup.matchedWork ? `Work #${dup.matchedWork.id}: ${dup.matchedWork.workName}` : `Matched Work #${dup.id}`}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800 ml-2">
                    {Math.round((dup.overallSimilarity || 0.85) * 100)}% Similarity
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600 font-mono pt-1">
                  <span>Text: {Math.round((dup.textSimilarity || 0.8) * 100)}%</span>
                  <span>Location: {Math.round((dup.locationSimilarity || 0.9) * 100)}%</span>
                  <span>Agency: {Math.round((dup.agencySimilarity || 0.85) * 100)}%</span>
                  <span>Status: <strong className="text-slate-800">{dup.status}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/works/${dup.workId}`}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <span>Examine</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => handleUpdateStatus(dup.id, 'CONFIRMED')}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm flex items-center gap-1"
                  title="Confirm Duplicate Irregularity"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm Duplicate</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus(dup.id, 'REJECTED')}
                  className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1"
                  title="Mark as Non-Duplicate"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Dismiss</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
