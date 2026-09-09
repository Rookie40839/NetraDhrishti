import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Download, Filter, Table, CheckCircle2 } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('INSPECTION_PRIORITY');
  const [district, setDistrict] = useState('');
  const [financialYear, setFinancialYear] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await api.post('/reports/generate', {
        reportType,
        district,
        financialYear,
        riskLevel,
        format: 'JSON',
      });
      setRecords(res.data.records || []);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportType, district, financialYear, riskLevel]);

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await api.post(
        '/reports/generate',
        {
          reportType,
          district,
          financialYear,
          riskLevel,
          format: 'CSV',
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `NetraDhrishti_${reportType}_Report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Audit Reports Generator</h1>
          <p className="text-xs text-slate-500">
            Generate formal compliance briefs, inspection priorities, and financial reconciliation summaries.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={exporting || records.length === 0}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Generating...' : 'Export to CSV'}</span>
        </button>
      </div>

      {/* Filter Parameters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Report Dossier Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
          >
            <option value="INSPECTION_PRIORITY">Inspection Priority Queue</option>
            <option value="RISK_SUMMARY">High Risk Works Brief</option>
            <option value="COMPLIANCE_SUMMARY">Compliance Violations Summary</option>
            <option value="FINANCIAL_SUMMARY">Financial Discrepancies Report</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Target District</label>
          <input
            type="text"
            placeholder="e.g. Pune (leave blank for all)"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Financial Year</label>
          <select
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
          >
            <option value="">All Financial Years</option>
            <option value="2023-24">2023-24</option>
            <option value="2022-23">2022-23</option>
            <option value="2021-22">2021-22</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Risk Severity Threshold</label>
          <select
            value={riskLevel}
            onChange={(e) => setRiskLevel(e.target.value)}
            className="w-full border border-slate-300 rounded p-2 bg-white text-slate-800"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Priority Only</option>
            <option value="HIGH">High & Critical</option>
            <option value="MEDIUM">Medium and above</option>
          </select>
        </div>
      </div>

      {/* Live Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">
            Report Preview ({records.length} records generated)
          </span>
          <span className="text-slate-500 font-mono">Format: RFC 4180 CSV / JSON</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Work Number & Name</th>
                <th className="px-4 py-3">District & State</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3">Sanction Amount</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    Compiling report data...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-400">
                    No records found matching criteria.
                  </td>
                </tr>
              ) : (
                records.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <div>{r.workName}</div>
                      <span className="text-[11px] font-mono text-slate-500">{r.uniqueWorkNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.district}, {r.state}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-xs">{r.agency || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      ₹{Number(r.sanctionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        r.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        r.riskLevel === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {r.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{r.riskScore}</td>
                    <td className="px-4 py-3 text-center font-black text-slate-900">{r.priorityScore}</td>
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
