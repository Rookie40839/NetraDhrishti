import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = async (roleKey, demoEmail) => {
    setError('');
    await switchDemoRole(roleKey);
    navigate('/');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center text-white">
          <div className="inline-flex p-3 bg-indigo-600 rounded-xl mb-3 shadow-md">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">NetraDhrishti</h1>
          <p className="text-xs text-indigo-200 mt-1">MPLADS Compliance & Risk Intelligence Portal</p>
          <div className="mt-2 text-[11px] text-amber-300 bg-amber-950/60 py-1 px-3 rounded-full inline-block border border-amber-800/60">
            Official Use Only • Restricted Access
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Official Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="officer@india.gov.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition flex items-center justify-center gap-2 text-sm"
            >
              <span>Sign In with Credentials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Instant Demo Switcher */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              One-Click Role Demonstration
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickLogin('district', 'do.pune@india.gov.in')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition text-xs flex flex-col"
              >
                <span className="font-semibold text-slate-800">District Officer</span>
                <span className="text-[10px] text-slate-500">Pune District</span>
              </button>

              <button
                onClick={() => handleQuickLogin('mp', 'mp.pune@india.gov.in')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition text-xs flex flex-col"
              >
                <span className="font-semibold text-slate-800">Member of Parliament</span>
                <span className="text-[10px] text-slate-500">Pune East Constituency</span>
              </button>

              <button
                onClick={() => handleQuickLogin('state', 'admin.mh@india.gov.in')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition text-xs flex flex-col"
              >
                <span className="font-semibold text-slate-800">State Admin</span>
                <span className="text-[10px] text-slate-500">Maharashtra State</span>
              </button>

              <button
                onClick={() => handleQuickLogin('mospi', 'admin@mospi.gov.in')}
                className="p-2 border border-slate-200 rounded-lg text-left hover:bg-slate-50 transition text-xs flex flex-col"
              >
                <span className="font-semibold text-slate-800">MoSPI Admin</span>
                <span className="text-[10px] text-slate-500">National Directorate</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
