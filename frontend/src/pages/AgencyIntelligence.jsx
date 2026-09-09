import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, AlertTriangle, ChevronRight, Search } from 'lucide-react';

export default function AgencyIntelligence() {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAgencies = async () => {
      setLoading(true);
      try {
        const res = await api.get('/analytics/agency');
        setAgencies(res.data);
      } catch (err) {
        console.error('Error fetching agency analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgencies();
  }, []);

  const filtered = agencies.filter((a) =>
    a.agencyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Agency Intelligence</h1>
          <p className="text-xs text-slate-500">
            Performance risk metrics and execution concentration across implementing agencies.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search implementing agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Implementing Agency</th>
                <th className="px-4 py-3 text-center">Total Works</th>
                <th className="px-4 py-3">Total Sanctioned</th>
                <th className="px-4 py-3 text-center">High Risk Works</th>
                <th className="px-4 py-3 text-center">High Risk %</th>
                <th className="px-4 py-3 text-center">Districts Covered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">Loading agency records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400">No agencies found.</td>
                </tr>
              ) : (
                filtered.map((agency, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      <span>{agency.agencyName}</span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {agency.totalWorks}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      ₹{Number(agency.totalSanctioned || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        agency.highRiskCount > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {agency.highRiskCount}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-semibold text-slate-800">
                      {agency.highRiskPercentage}%
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono text-slate-600">
                      {agency.districtCount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
