import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { History, Search, ShieldCheck } from 'lucide-react';

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await api.get('/audit-log?size=50');
        setLogs(res.data.content || []);
      } catch (err) {
        console.error('Error fetching audit log:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Administrative Audit Trail</h1>
        <p className="text-xs text-slate-500">
          Immutable system log capturing all administrative decisions, reviews, settings changes, and user sessions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actor User ID</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Target</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-sans">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-sans">
                    No audit records recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-indigo-700">
                      User #{log.actorUserId || 'System'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {log.targetType} #{log.targetId}
                    </td>
                    <td className="px-4 py-3 text-slate-500 max-w-xs truncate font-sans text-[11px]">
                      {log.details || '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
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
