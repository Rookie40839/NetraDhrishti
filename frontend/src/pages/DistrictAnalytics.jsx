import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapPin, TrendingUp, Users, Building } from 'lucide-react';

export default function DistrictAnalytics() {
  const [districts, setDistricts] = useState([]);
  const [mps, setMps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [distRes, mpRes] = await Promise.all([
          api.get('/analytics/district'),
          api.get('/analytics/mp'),
        ]);
        setDistricts(distRes.data);
        setMps(mpRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">District & Constituency Analytics</h1>
        <p className="text-xs text-slate-500">
          Geographic and representative distribution of MPLADS financial commitments and risk concentrations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* District Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">District Intelligence</h3>
            <p className="text-xs text-slate-500">Works monitored per implementing district</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="px-4 py-3">District & State</th>
                  <th className="px-4 py-3 text-center">Works</th>
                  <th className="px-4 py-3">Sanctioned</th>
                  <th className="px-4 py-3 text-center">High Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {districts.map((d, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{d.district}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{d.state}</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{d.totalWorks}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{Number(d.totalSanctioned || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        d.highRiskWorks > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {d.highRiskWorks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MP Constituency Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900">Constituency Portfolio</h3>
            <p className="text-xs text-slate-500">Parliamentary constituency recommendations</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <th className="px-4 py-3">Representative & Seat</th>
                  <th className="px-4 py-3 text-center">Works</th>
                  <th className="px-4 py-3">Sanctioned</th>
                  <th className="px-4 py-3 text-center">High Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {mps.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{m.mpName}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{m.constituency} ({m.state})</span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">{m.totalWorks}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{Number(m.totalSanctioned || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        m.highRiskWorks > 0 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {m.highRiskWorks}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
