import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Database, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function DataQualityPage() {
  const [summary, setSummary] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sumRes, issRes] = await Promise.all([
          api.get('/data-quality/summary'),
          api.get('/data-quality/issues'),
        ]);
        setSummary(sumRes.data);
        setIssues(issRes.data);
      } catch (err) {
        console.error('Error fetching data quality:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Data Quality & Completeness</h1>
        <p className="text-xs text-slate-500">
          Automated evaluation of MPLADS record completeness, missing milestone dates, and data anomalies.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Completeness Score</span>
            <div className="text-3xl font-black text-indigo-600 mt-1">
              {summary ? `${summary.overallCompletenessScore}%` : '—'}
            </div>
            <span className="text-[11px] text-slate-400">Average field coverage</span>
          </div>
          <Database className="w-8 h-8 text-indigo-400 opacity-60" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Total Quality Issues</span>
            <div className="text-3xl font-black text-amber-600 mt-1">
              {summary ? summary.totalIssues : '—'}
            </div>
            <span className="text-[11px] text-slate-400">Flagged anomalies</span>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400 opacity-60" />
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Total Works Evaluated</span>
            <div className="text-3xl font-black text-slate-900 mt-1">
              {summary ? summary.totalWorks : '—'}
            </div>
            <span className="text-[11px] text-slate-400">Ingested database records</span>
          </div>
          <ShieldAlert className="w-8 h-8 text-slate-400 opacity-60" />
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Detected Data Quality Deficiencies</h3>
          <p className="text-xs text-slate-500">Records with missing fields or inconsistent values</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Work ID</th>
                <th className="px-4 py-3">Field Name</th>
                <th className="px-4 py-3">Issue Type</th>
                <th className="px-4 py-3 text-center">Severity</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {issues.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                    No data quality discrepancies detected.
                  </td>
                </tr>
              ) : (
                issues.map((iss, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">#{iss.workId}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">{iss.fieldName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">
                        {iss.issueType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        iss.severity === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {iss.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{iss.message}</td>
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
