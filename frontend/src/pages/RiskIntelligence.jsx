import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Layers, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function RiskIntelligence() {
  const [riskDist, setRiskDist] = useState([]);
  const [topWorks, setTopWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [distRes, topRes] = await Promise.all([
          api.get('/dashboard/risk-distribution'),
          api.get('/dashboard/top-priority?limit=15'),
        ]);
        setRiskDist(distRes.data);
        setTopWorks(topRes.data);
      } catch (err) {
        console.error('Error fetching risk intelligence:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Risk Intelligence</h1>
        <p className="text-xs text-slate-500">
          Aggregated risk distribution and anomaly score distribution across the monitored portfolio.
        </p>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {riskDist.map((item) => (
          <div key={item.level} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{item.level}</span>
            <div className="text-3xl font-black text-slate-900 mt-2">{item.count}</div>
            <span className="text-[10px] text-slate-400">works classified</span>
          </div>
        ))}
      </div>

      {/* Top Risk Queue */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Highest Risk Projects</h3>
            <p className="text-xs text-slate-500">Works with critical and high risk scores</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Work Number & Name</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3 text-center">Risk Score</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topWorks.map((w, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-bold text-slate-900">
                    <div>{w.workName}</div>
                    <span className="text-[10px] font-mono text-slate-500">{w.uniqueWorkNumber}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">{w.district}</td>
                  <td className="px-4 py-3.5 text-slate-600 truncate max-w-xs">{w.agency || '—'}</td>
                  <td className="px-4 py-3.5 text-center font-bold text-red-600">{w.riskScore}</td>
                  <td className="px-4 py-3.5 text-center font-black text-slate-900">{w.priorityScore}</td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      to={`/works/${w.workId}`}
                      className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded font-semibold text-xs border border-indigo-200 hover:bg-indigo-100"
                    >
                      Dossier
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
