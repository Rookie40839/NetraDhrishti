import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  AlertTriangle,
  ShieldCheck,
  Activity,
  FileCheck2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Layers,
  Building,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, getScopeLabel } = useAuth();
  const [stats, setStats] = useState(null);
  const [riskDist, setRiskDist] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [topWorks, setTopWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Filters
  const [financialYear, setFinancialYear] = useState('');
  const [district, setDistrict] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (financialYear) params.financialYear = financialYear;
      if (district) params.district = district;
      else if (user?.districtId) params.district = user.districtId;

      const [statsRes, distRes, reasonsRes, topRes] = await Promise.all([
        api.get('/dashboard/stats', { params }),
        api.get('/dashboard/risk-distribution', { params }),
        api.get('/dashboard/flagging-reasons'),
        api.get('/dashboard/top-priority', { params: { limit: 8 } }),
      ]);

      setStats(statsRes.data);
      setRiskDist(distRes.data);
      setReasons(reasonsRes.data);
      setTopWorks(topRes.data);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to reach backend server. Please verify Spring Boot API is running on port 8080.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [financialYear, district, user]);

  const getRiskBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Disclaimer Banner */}
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start justify-between">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Automated Screening Advisory
            </h4>
            <p className="text-xs text-amber-800 mt-0.5">
              Risk scores and anomaly flags indicate records requiring administrative verification and physical inspection.
              In accordance with MPLADS guidelines, they do not constitute an official declaration of irregularity.
            </p>
          </div>
        </div>
        <span className="text-[11px] text-amber-700 font-mono shrink-0 ml-4">
          Active Scope: <strong>{getScopeLabel()}</strong>
        </span>
      </div>

      {/* Header with Title & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Compliance & Risk Overview
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time multi-engine audit analytics across sanctions, physical progress, and fund utilization.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* FY Filter */}
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Financial Years</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
          </select>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Updated: {lastUpdated}</span>
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Works */}
        <Link
          to="/works"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition hover:border-indigo-300 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Works Monitored</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{stats ? stats.totalWorks : '—'}</span>
            <span className="text-xs text-slate-500">works in scope</span>
          </div>
          <div className="mt-3 text-[11px] text-indigo-600 font-semibold flex items-center gap-1">
            <span>Explore all records</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Needs Review */}
        <Link
          to="/inspections"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition hover:border-amber-300 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Requiring Review</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600">{stats ? stats.needReviewWorks : '—'}</span>
            <span className="text-xs text-slate-500">priority queue</span>
          </div>
          <div className="mt-3 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span>View inspection queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* High Risk Works */}
        <Link
          to="/works?riskLevel=HIGH"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition hover:border-orange-300 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">High Risk</span>
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:scale-105 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-600">{stats ? stats.highRiskWorks : '—'}</span>
            <span className="text-xs text-slate-500">score 60–79</span>
          </div>
          <div className="mt-3 text-[11px] text-orange-700 font-semibold flex items-center gap-1">
            <span>Filter high risk works</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        {/* Critical Works */}
        <Link
          to="/works?riskLevel=CRITICAL"
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition hover:border-red-300 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Priority</span>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:scale-105 transition">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-red-600">{stats ? stats.criticalWorks : '—'}</span>
            <span className="text-xs text-slate-500">score ≥ 80</span>
          </div>
          <div className="mt-3 text-[11px] text-red-700 font-semibold flex items-center gap-1">
            <span>Immediate inspection mandatory</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Visual Analytics Row (Risk Distribution & Flagging Reasons) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Portfolio Risk Distribution</h3>
              <p className="text-xs text-slate-500 mt-0.5">Classification by composite weighted risk scoring</p>
            </div>
            <Link to="/intelligence/risk" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
              <span>Detailed view</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 mt-4">
            {riskDist.map((item, idx) => {
              const total = stats?.totalWorks || 1;
              const count = item.count || 0;
              const pct = Math.round((count / total) * 100);

              let barColor = 'bg-slate-400';
              if (item.level === 'CRITICAL') barColor = 'bg-red-500';
              else if (item.level === 'HIGH') barColor = 'bg-orange-500';
              else if (item.level === 'MEDIUM') barColor = 'bg-amber-400';
              else if (item.level === 'LOW') barColor = 'bg-emerald-500';
              else if (item.level === 'INSUFFICIENT_DATA') barColor = 'bg-slate-400';

              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-700">{item.level}</span>
                    <span className="text-slate-500">{count} works ({pct}%)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} transition-all duration-500`}
                      style={{ width: `${Math.max(4, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Primary Reasons for Flagging */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Primary Anomaly Drivers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Detection triggers across the 5 specialized analytical engines</p>
            </div>
            <Link to="/compliance" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
              <span>View rules</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {reasons.map((r, idx) => (
              <div key={idx} className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800">{r.category}</span>
                  <span className="text-xs font-black text-indigo-600">{r.count}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${Math.min(100, (r.count / 30) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Works Requiring Attention Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Top Works Requiring Immediate Inspection</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ranked by composite Priority Score (Risk × Financial Exposure)</p>
          </div>
          <Link
            to="/inspections"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Full Inspection Queue</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Work Number & Title</th>
                <th className="px-4 py-3">District & MP</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Sanction Amount</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {topWorks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                    No priority works found matching the selected scope criteria.
                  </td>
                </tr>
              ) : (
                topWorks.map((work, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{work.workName}</div>
                      <div className="font-mono text-[11px] text-slate-500">{work.uniqueWorkNumber}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">{work.district}</div>
                      <div className="text-[11px] text-slate-500">{work.mpName || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">
                      {work.agency || '—'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">
                      ₹{Number(work.sanctionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRiskBadgeClass(work.riskLevel)}`}>
                        {work.riskLevel} ({work.riskScore})
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-black text-slate-900">
                      {work.priorityScore}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/works/${work.workId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md font-semibold text-xs border border-indigo-200 transition"
                      >
                        <span>Review</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
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
