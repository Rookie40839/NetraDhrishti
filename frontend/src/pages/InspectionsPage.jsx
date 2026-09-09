import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ClipboardCheck,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Search,
  RotateCcw,
} from 'lucide-react';

export default function InspectionsPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, CRITICAL, HIGH, PENDING, COMPLETED
  const [district, setDistrict] = useState(user?.districtId || '');
  const [search, setSearch] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = {};
      if (district) params.district = district;
      if (activeTab === 'CRITICAL') params.riskLevel = 'CRITICAL';
      else if (activeTab === 'HIGH') params.riskLevel = 'HIGH';

      const res = await api.get('/inspections/priority', { params });
      setQueue(res.data);
    } catch (err) {
      console.error('Error fetching inspection queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [activeTab, district]);

  const filteredQueue = queue.filter((item) => {
    if (activeTab === 'PENDING') {
      const status = item.inspection?.status || 'Pending';
      return status !== 'Completed';
    }
    if (activeTab === 'COMPLETED') {
      return item.inspection?.status === 'Completed';
    }
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        item.workName.toLowerCase().includes(term) ||
        item.uniqueWorkNumber.toLowerCase().includes(term) ||
        (item.agency && item.agency.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Inspections Queue</h1>
          <p className="text-xs text-slate-500">
            Priority-ranked inspection queue targeting works with highest composite risk exposure.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search in queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-semibold">
        {[
          { id: 'ALL', label: 'All Priority Works' },
          { id: 'CRITICAL', label: 'Critical Priority (Score ≥ 80)' },
          { id: 'HIGH', label: 'High Priority (Score 60-79)' },
          { id: 'PENDING', label: 'Pending Inspection' },
          { id: 'COMPLETED', label: 'Completed Reviews' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-3 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Work Number & Name</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Sanction Amount</th>
                <th className="px-4 py-3 text-center">Risk Score</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3">Review Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    Loading prioritized inspection queue...
                  </td>
                </tr>
              ) : filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    No works in this inspection category.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((item, idx) => {
                  const insp = item.inspection;
                  const isCompleted = insp?.status === 'Completed';

                  return (
                    <tr key={item.workId || idx} className="hover:bg-slate-50 transition">
                      <td className="px-3 py-3.5 text-center font-black text-indigo-700 bg-slate-50/50">
                        #{item.priorityRank}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900 line-clamp-1">{item.workName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{item.uniqueWorkNumber}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {item.district}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">
                        {item.agency || '—'}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        ₹{Number(item.sanctionAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                          item.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                          item.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {item.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center font-black text-slate-900">
                        {item.priorityScore}
                      </td>
                      <td className="px-4 py-3.5">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>{insp.reviewDecision || 'Completed'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Inspection Due</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/works/${item.workId}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition shadow-sm"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
