import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [weights, setWeights] = useState({
    costW: 0.30,
    delayW: 0.25,
    fundW: 0.20,
    duplicateW: 0.15,
    complianceW: 0.10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchWeights = async () => {
      setLoading(true);
      try {
        const res = await api.get('/settings/risk-weights');
        if (res.data) {
          setWeights({
            costW: res.data.costW,
            delayW: res.data.delayW,
            fundW: res.data.fundW,
            duplicateW: res.data.duplicateW,
            complianceW: res.data.complianceW,
          });
        }
      } catch (err) {
        console.error('Error fetching weights:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeights();
  }, []);

  const totalSum = (
    Number(weights.costW || 0) +
    Number(weights.delayW || 0) +
    Number(weights.fundW || 0) +
    Number(weights.duplicateW || 0) +
    Number(weights.complianceW || 0)
  ).toFixed(2);

  const isValid = Math.abs(Number(totalSum) - 1.0) <= 0.01;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setMsg({ type: 'error', text: `Weights must sum to exactly 1.00 (Current: ${totalSum})` });
      return;
    }
    setSaving(true);
    setMsg({ type: '', text: '' });
    try {
      await api.put('/settings/risk-weights', {
        ...weights,
        updatedBy: user?.id || 2,
      });
      setMsg({ type: 'success', text: 'Risk scoring weights updated and logged to audit trail!' });
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Risk Calibration</h1>
        <p className="text-xs text-slate-500">
          Configure weighting multipliers for composite risk scoring across analytical engines.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Composite Risk Model Weights</h3>
            <p className="text-xs text-slate-500">Adjust the influence of each engine on the final risk score</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            Sum: {Math.round(totalSum * 100)}% / 100%
          </div>
        </div>

        {msg.text && (
          <div className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {[
            { id: 'costW', label: 'Cost Deviation Weight', desc: 'Sanction amount deviation from district/state peers' },
            { id: 'delayW', label: 'Timeline Delay Weight', desc: 'Sanction & completion delay against statutory milestones' },
            { id: 'fundW', label: 'Fund Flow Discrepancy Weight', desc: 'Mismatch between released amount, progress & expenditure' },
            { id: 'duplicateW', label: 'Duplicate Funding Likelihood', desc: 'Cosine & text similarity with proximate works' },
            { id: 'complianceW', label: 'Compliance Violation Weight', desc: 'Non-permissible category & procedural rules' },
          ].map((field) => (
            <div key={field.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <div>
                <span className="font-bold text-slate-900">{field.label}</span>
                <p className="text-[11px] text-slate-500">{field.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={weights[field.id]}
                  onChange={(e) => setWeights({ ...weights, [field.id]: parseFloat(e.target.value) || 0 })}
                  className="w-20 p-1.5 border border-slate-300 rounded font-mono font-bold text-right bg-white"
                />
                <span className="text-slate-500 font-bold w-12">
                  ({Math.round((weights[field.id] || 0) * 100)}%)
                </span>
              </div>
            </div>
          ))}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving || !isValid}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl font-bold shadow transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save & Calibrate'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
