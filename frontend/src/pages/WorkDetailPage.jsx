import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldAlert,
  Layers,
  FileCheck2,
  CopyCheck,
  Send,
  HelpCircle,
  FileText,
  BadgeAlert,
  Scale,
} from 'lucide-react';

export default function WorkDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review case modal states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewDecision, setReviewDecision] = useState('Needs verification');
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewFindings, setReviewFindings] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/works/${id}/details`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching work details:', err);
      setError('Unable to load work details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleSaveReview = async (e) => {
    e.preventDefault();
    setSavingReview(true);
    setReviewSuccess('');
    try {
      const existingInsp = data?.latestInspection;
      if (existingInsp) {
        await api.put(`/inspections/${existingInsp.inspectionId}`, {
          status: 'Completed',
          reviewDecision,
          findings: reviewFindings,
          remarks: reviewRemarks,
        });
      } else {
        const created = await api.post('/inspections', {
          workId: Number(id),
          assignedTo: user?.id || 2,
          remarks: reviewRemarks,
        });
        await api.put(`/inspections/${created.data.inspectionId}`, {
          status: 'Completed',
          reviewDecision,
          findings: reviewFindings,
          remarks: reviewRemarks,
        });
      }
      setReviewSuccess('Inspection and review case successfully recorded in audit trail!');
      setTimeout(() => {
        setReviewModalOpen(false);
        fetchDetails();
      }, 1200);
    } catch (err) {
      console.error('Error saving review:', err);
    } finally {
      setSavingReview(false);
    }
  };

  if (loading) {
    return <div className="py-16 text-center text-slate-500 text-sm">Loading comprehensive work dossier...</div>;
  }

  if (error || !data || !data.work) {
    return (
      <div className="py-16 text-center text-red-600 text-sm">
        <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p>{error || 'Work record not found.'}</p>
        <Link to="/works" className="mt-4 inline-block text-indigo-600 font-semibold underline">
          Return to Works Explorer
        </Link>
      </div>
    );
  }

  const { work, riskScore, flags = [], fundReleases = [], fundAnomalies = [], duplicateCandidates = [], latestInspection, dataQualityIssues = [] } = data;

  const getRiskBadgeClass = (level) => {
    switch (level?.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/works" className="hover:text-indigo-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Works Explorer</span>
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-mono font-semibold">{work.uniqueWorkNumber}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold border border-slate-200">
                {work.uniqueWorkNumber}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
                {work.workCategory || 'Community Asset'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                FY {work.financialYear || '2023-24'}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                {work.workStatus || 'In Progress'}
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">
              {work.workName}
            </h1>

            {work.workDescription && (
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                {work.workDescription}
              </p>
            )}

            {/* Geographical & Administrative Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <strong>{work.implementingDistrict}</strong>, {work.state}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                MP: <strong>{work.mpName || '—'}</strong> ({work.constituency || 'Constituency'})
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                Agency: <strong>{work.implementingAgencyName || '—'}</strong>
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={() => setReviewModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{latestInspection ? 'Update Officer Review' : 'Open Review Case'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Section 1 (Risk Card) & Section 2 (Data Confidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 1: Composite Risk Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Composite Risk Assessment
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted multi-model anomaly scoring across 5 audit vectors
              </p>
            </div>

            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskBadgeClass(riskScore?.riskLevel)}`}>
              {riskScore?.riskLevel || 'LOW RISK'}
            </div>
          </div>

          <div className="flex items-baseline gap-3 py-2">
            <span className="text-5xl font-black text-slate-900 tracking-tight">
              {riskScore ? riskScore.riskScore : '0'}
            </span>
            <span className="text-sm text-slate-500 font-semibold">/ 100 Risk Score</span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-700 font-bold">
              Priority Score: {riskScore?.priorityScore || '—'}
            </span>
          </div>

          {/* Mandatory verification alert */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>⚠ Requires official administrative verification. Automated scores do not establish misconduct.</span>
          </div>

          {/* 5-Engine Horizontal Sub-Score Bars */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-700">Sub-Score Vector Breakdown</div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
              {/* Cost */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Cost Dev</span>
                  <span className="font-bold text-slate-900">{riskScore?.costScore || 0}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${riskScore?.costScore || 0}%` }} />
                </div>
              </div>

              {/* Delay */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Timeline</span>
                  <span className="font-bold text-slate-900">{riskScore?.delayScore || 0}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500" style={{ width: `${riskScore?.delayScore || 0}%` }} />
                </div>
              </div>

              {/* Fund Flow */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Fund Flow</span>
                  <span className="font-bold text-slate-900">{riskScore?.fundScore || 0}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500" style={{ width: `${riskScore?.fundScore || 0}%` }} />
                </div>
              </div>

              {/* Duplicates */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Duplicates</span>
                  <span className="font-bold text-slate-900">{riskScore?.duplicateScore || 0}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500" style={{ width: `${riskScore?.duplicateScore || 0}%` }} />
                </div>
              </div>

              {/* Compliance */}
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                  <span>Rules</span>
                  <span className="font-bold text-slate-900">{riskScore?.complianceScore || 0}</span>
                </div>
                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500" style={{ width: `${riskScore?.complianceScore || 0}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Data Confidence & Integrity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Data Confidence & Completeness
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Reliability of digital footprint</p>

            <div className="mt-4 flex items-center gap-3">
              <div className="text-4xl font-black text-indigo-600">
                {work.dataConfidence || 85}%
              </div>
              <span className="text-xs text-slate-600 font-medium leading-snug">
                Based on milestone date coverage & digital evidence
              </span>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 mt-5 text-xs">
              <div className="flex items-center gap-2">
                {work.sanctionDate ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Sanction milestone recorded</span>
              </div>

              <div className="flex items-center gap-2">
                {work.commencementDate ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Commencement date verified</span>
              </div>

              <div className="flex items-center gap-2">
                {work.imageUploaded === 'Yes' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>Site geo-tagged photography</span>
              </div>

              <div className="flex items-center gap-2">
                {work.latitude && work.longitude ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span>GPS coordinates coordinates logged</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-500">
            Engine Confidence: <strong>High</strong> (Model v2.4)
          </div>
        </div>
      </div>

      {/* Section 3: Why This Work Was Flagged */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Why This Work Was Flagged</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Key contributing anomaly reasons detected by screening models
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flags.length === 0 && fundAnomalies.length === 0 ? (
            <div className="col-span-2 p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">
              No guideline violations or fund flow anomalies flagged for this work.
            </div>
          ) : (
            <>
              {flags.map((flag, idx) => (
                <div key={`flag-${idx}`} className="p-4 rounded-xl border border-red-200 bg-red-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded">
                      {flag.ruleId}
                    </span>
                    <span className="text-[11px] font-bold text-red-700 uppercase">
                      Severity: {flag.severity || 'HIGH'}
                    </span>
                  </div>
                  <p className="text-xs text-red-950 font-medium">
                    {flag.description || 'Compliance rule violation identified during automated text & metadata audit.'}
                  </p>
                  {flag.observedValue && (
                    <div className="text-[11px] text-red-800 bg-white/70 p-2 rounded border border-red-200 font-mono">
                      Observed: {flag.observedValue} | Expected: {flag.expectedValue || 'Permissible parameter'}
                    </div>
                  )}
                </div>
              ))}

              {fundAnomalies.map((ano, idx) => (
                <div key={`ano-${idx}`} className="p-4 rounded-xl border border-orange-200 bg-orange-50/50 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[11px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                      {ano.anomalyType}
                    </span>
                    <span className="text-[11px] font-bold text-orange-700 uppercase">
                      Severity: {ano.severity || 'HIGH'}
                    </span>
                  </div>
                  <p className="text-xs text-orange-950 font-medium">
                    {ano.description || 'Discrepancy detected between financial release, milestone progress, or expenditure.'}
                  </p>
                  {ano.amountInvolved && (
                    <div className="text-[11px] text-orange-800 bg-white/70 p-2 rounded border border-orange-200 font-mono">
                      Amount Involved: ₹{Number(ano.amountInvolved).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Section 4: Work Lifecycle Timeline */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Work Lifecycle Milestones</h3>
          <p className="text-xs text-slate-500 mt-0.5">Chronological progression through statutory MPLADS stages</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
          {[
            { label: '1. Recommended', date: work.recommendationDate, icon: Calendar },
            { label: '2. Approval', date: work.administrativeApprovalDate, icon: CheckCircle2 },
            { label: '3. Sanction', date: work.sanctionDate, icon: FileCheck2 },
            { label: '4. Commencement', date: work.commencementDate, icon: Clock },
            { label: '5. Progress', date: work.latestProgressDate, icon: Layers },
            { label: '6. Completion', date: work.completionDate, icon: CheckCircle2 },
            { label: '7. Final Payment', date: work.finalPaymentDate, icon: IndianRupee },
            { label: '8. Handover', date: work.handoverDate, icon: Building },
          ].map((step, idx) => {
            const isDone = Boolean(step.date);
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center flex flex-col justify-between ${
                  isDone
                    ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div>
                  <Icon className={`w-4 h-4 mx-auto mb-1.5 ${isDone ? 'text-indigo-600' : 'text-slate-300'}`} />
                  <div className="font-bold text-[11px]">{step.label}</div>
                </div>
                <div className="font-mono text-[10px] mt-2 font-semibold">
                  {step.date || 'Pending'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 5: Fund Flow & Financial Analysis */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Fund Flow & Financial Integrity</h3>
          <p className="text-xs text-slate-500 mt-0.5">Sanction, tranche releases, and actual expenditure reconciliation</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Sanction Amount</span>
            <div className="text-xl font-black text-slate-900 mt-1">
              ₹{Number(work.sanctionAmount || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Released Amount</span>
            <div className="text-xl font-black text-indigo-600 mt-1">
              ₹{Number(work.releasedAmount || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Actual Expenditure</span>
            <div className="text-xl font-black text-emerald-600 mt-1">
              ₹{Number(work.actualExpenditure || 0).toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Unutilized Balance</span>
            <div className="text-xl font-black text-amber-600 mt-1">
              ₹{Math.max(0, (work.releasedAmount || 0) - (work.actualExpenditure || 0)).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Tranches Table */}
        {fundReleases.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-2">Installment Releases Log</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <th className="px-3 py-2">Installment</th>
                    <th className="px-3 py-2">Release Date</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fundReleases.map((fr, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-slate-700">Tranche #{fr.installmentNumber || idx + 1}</td>
                      <td className="px-3 py-2 text-slate-600 font-mono">{fr.releaseDate || '—'}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">₹{Number(fr.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-3 py-2 text-slate-500 font-mono text-[11px]">{fr.sourceReference || 'PFMS-Direct'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 6: Possible Duplicate Works */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Duplicate Screening Candidates</h3>
          <p className="text-xs text-slate-500 mt-0.5">High-similarity matches in same district or implementing agency</p>
        </div>

        {duplicateCandidates.length === 0 ? (
          <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
            No matching duplicate candidates identified for this work.
          </p>
        ) : (
          <div className="space-y-3">
            {duplicateCandidates.map((dup, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      {dup.matchedWork?.workName || 'Candidate Match'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-red-100 text-red-800 font-bold rounded">
                      {Math.round((dup.overallSimilarity || 0.85) * 100)}% Similarity
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-3 font-mono">
                    <span>Text: {Math.round((dup.textSimilarity || 0.8) * 100)}%</span>
                    <span>Location: {Math.round((dup.locationSimilarity || 0.9) * 100)}%</span>
                    <span>Agency: {Math.round((dup.agencySimilarity || 0.85) * 100)}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/works/${dup.matchedWork?.id || ''}`}
                    className="px-3 py-1 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium hover:bg-slate-100"
                  >
                    Compare Side-by-Side
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: Inspection & Review History */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Administrative Review & Inspection Record</h3>
            <p className="text-xs text-slate-500 mt-0.5">Official findings, remarks, and decision audit trail</p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition"
          >
            {latestInspection ? 'Edit Review' : 'Create Record'}
          </button>
        </div>

        {latestInspection ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="font-bold text-slate-800">
                Decision: <span className="text-indigo-700 font-extrabold">{latestInspection.reviewDecision || 'Needs verification'}</span>
              </span>
              <span className="text-slate-500">
                Status: <strong className="text-slate-800">{latestInspection.status}</strong> | Last updated: {latestInspection.updatedAt ? new Date(latestInspection.updatedAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>

            {latestInspection.findings && (
              <div>
                <span className="font-semibold text-slate-700">Findings:</span>
                <p className="text-slate-600 mt-0.5 bg-white p-2.5 rounded border border-slate-200">
                  {latestInspection.findings}
                </p>
              </div>
            )}

            {latestInspection.remarks && (
              <div>
                <span className="font-semibold text-slate-700">Remarks / Evidence Note:</span>
                <p className="text-slate-600 mt-0.5 bg-white p-2.5 rounded border border-slate-200">
                  {latestInspection.remarks}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
            No official review case opened yet. Click 'Open Review Case' to record officer findings.
          </p>
        )}
      </div>

      {/* Review Modal Dialog */}
      {reviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-slate-900">Officer Review Case</h3>
                <p className="text-xs text-slate-500">{work.uniqueWorkNumber} • {work.workName}</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold">
                {reviewSuccess}
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Administrative Decision</label>
                <select
                  value={reviewDecision}
                  onChange={(e) => setReviewDecision(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Confirmed">Confirmed Irregularity (Requires Rectification)</option>
                  <option value="Needs verification">Needs Physical Verification</option>
                  <option value="False positive">False Positive / Justified Variance</option>
                  <option value="No action">No Action Required</option>
                  <option value="Escalated">Escalate to State / MoSPI Directorate</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Findings</label>
                <textarea
                  rows="3"
                  placeholder="Record verification observations, physical progress state, or document checks..."
                  value={reviewFindings}
                  onChange={(e) => setReviewFindings(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Officer Remarks & Evidence References</label>
                <textarea
                  rows="2"
                  placeholder="Supporting dispatch letters, site report reference numbers..."
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingReview}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow transition"
                >
                  {savingReview ? 'Recording...' : 'Submit Official Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
