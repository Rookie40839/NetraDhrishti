import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  FileCheck2,
  AlertTriangle,
  BookOpen,
  Filter,
  ExternalLink,
  ChevronRight,
  Search,
} from 'lucide-react';

export default function ComplianceCentre() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modal for viewing flagged works of a rule
  const [selectedRule, setSelectedRule] = useState(null);
  const [ruleFlags, setRuleFlags] = useState([]);
  const [flagsLoading, setFlagsLoading] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        const res = await api.get('/compliance/rules');
        setRules(res.data);
      } catch (err) {
        console.error('Error fetching compliance rules:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleOpenRule = async (rule) => {
    setSelectedRule(rule);
    setFlagsLoading(true);
    try {
      const res = await api.get(`/compliance/rules/${rule.ruleId}`);
      setRuleFlags(res.data.flags || []);
    } catch (err) {
      console.error('Error fetching rule flags:', err);
    } finally {
      setFlagsLoading(false);
    }
  };

  const filteredRules = rules.filter((r) => {
    if (activeCategory !== 'ALL' && r.ruleType !== activeCategory) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        r.ruleName.toLowerCase().includes(term) ||
        r.ruleId.toLowerCase().includes(term) ||
        (r.description && r.description.toLowerCase().includes(term))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Compliance Centre</h1>
          <p className="text-xs text-slate-500">
            Official MPLADS 2023 guideline constraints and active non-permissible works audit detectors.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search guidelines or rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {['ALL', 'CATEGORY', 'TIMELINE', 'FINANCIAL', 'ENTITLEMENT', 'DATA_COMPLETENESS', 'RELATIONSHIP'].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {/* Rules Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading compliance rules catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const isHigh = rule.severity === 'HIGH';
            const flagCount = rule.flaggedCount || 0;

            return (
              <div
                key={rule.ruleId}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition hover:border-slate-300"
              >
                <div className="space-y-2.5">
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {rule.ruleId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        isHigh ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rule.severity || 'MEDIUM'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{rule.ruleName}</h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {rule.description || 'Statutory condition outlined under MPLADS Guidelines 2023.'}
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{rule.sourceReference || 'Guidelines 2023'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full ${
                        flagCount > 0 ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {flagCount}
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">Flagged Works</span>
                  </div>

                  <button
                    onClick={() => handleOpenRule(rule)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Rule Flags Modal */}
      {selectedRule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-500">{selectedRule.ruleId}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedRule.ruleName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedRule.description}</p>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
              {flagsLoading ? (
                <div className="py-8 text-center text-slate-400 text-xs">Loading flagged records...</div>
              ) : ruleFlags.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No works currently flagged under rule {selectedRule.ruleId}.
                </div>
              ) : (
                ruleFlags.map((flag, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">
                        Work #{flag.workId}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                        {flag.reviewStatus || 'PENDING'}
                      </span>
                    </div>
                    <p className="text-slate-600">{flag.description}</p>
                    {flag.observedValue && (
                      <div className="text-[11px] font-mono bg-white p-2 rounded border border-slate-200 text-slate-700">
                        Observed: {flag.observedValue}
                      </div>
                    )}
                    <div className="text-right pt-1">
                      <Link
                        to={`/works/${flag.workId}`}
                        onClick={() => setSelectedRule(null)}
                        className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Open Work Dossier</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedRule(null)}
                className="px-4 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
