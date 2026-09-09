import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  BarChart3,
  ListFilter,
  ClipboardCheck,
  BrainCircuit,
  FileCheck2,
  FileText,
  Database,
  History,
  Settings,
  UserCheck,
  LogOut,
  ChevronDown,
  Layers,
  Building2,
  CopyCheck,
  TrendingUp,
} from 'lucide-react';

export default function Header() {
  const { user, logout, switchDemoRole, getScopeLabel } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [intelOpen, setIntelOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/' && (location.pathname === '/' || location.pathname === '/dashboard')) return true;
    return location.pathname.startsWith(path) && path !== '/';
  };

  const navItemClass = (path) =>
    `flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
      isActive(path)
        ? 'bg-indigo-700 text-white shadow-sm'
        : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
    }`;

  return (
    <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
      {/* Top Banner / Gov Bar */}
      <div className="bg-slate-950 px-4 py-1 text-xs text-slate-400 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">GOVERNMENT OF INDIA</span>
          <span>•</span>
          <span>Ministry of Statistics and Programme Implementation (MoSPI)</span>
          <span>•</span>
          <span className="text-amber-400 font-medium">MPLADS Audit Engine v2.4</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Current Scope:</span>
            <span className="px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded font-semibold border border-indigo-800">
              {getScopeLabel()}
            </span>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1 text-amber-300 hover:text-amber-200 bg-slate-800 px-2 py-0.5 rounded border border-amber-700/50"
            >
              <span>Switch Persona:</span>
              <strong className="capitalize">{user?.role || 'Guest'}</strong>
              <ChevronDown className="w-3 h-3" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded shadow-xl py-1 z-50 text-xs border border-slate-200">
                <div className="px-3 py-1 font-bold text-slate-400 border-b uppercase">Test User Persona</div>
                <button
                  onClick={() => { switchDemoRole('district'); setRoleMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between"
                >
                  <span>District Officer</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Pune</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('mp'); setRoleMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between"
                >
                  <span>Member of Parliament</span>
                  <span className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Pune East</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('state'); setRoleMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between"
                >
                  <span>State Admin</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">MH</span>
                </button>
                <button
                  onClick={() => { switchDemoRole('mospi'); setRoleMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 flex items-center justify-between"
                >
                  <span>MoSPI Admin</span>
                  <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded">National</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="hover:text-red-400 flex items-center gap-1"
            title="Log Out"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Header Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center shadow-md text-white">
            <ShieldAlert className="w-6 h-6 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-white">NetraDhrishti</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">नेत्र दृष्टि</span>
            </div>
            <p className="text-[11px] text-slate-400">Integrated Compliance Monitoring & Audit System</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="flex items-center gap-1">
          <Link to="/" className={navItemClass('/')}>
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </Link>

          <Link to="/works" className={navItemClass('/works')}>
            <ListFilter className="w-4 h-4" />
            <span>Works Explorer</span>
          </Link>

          <Link to="/inspections" className={navItemClass('/inspections')}>
            <ClipboardCheck className="w-4 h-4" />
            <span>Inspections Queue</span>
          </Link>

          {/* Intelligence Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIntelOpen(!intelOpen)}
              onBlur={() => setTimeout(() => setIntelOpen(false), 200)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                location.pathname.startsWith('/intelligence')
                  ? 'bg-indigo-700 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              }`}
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Intelligence</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {intelOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white text-slate-800 rounded-lg shadow-xl py-2 z-50 border border-slate-200">
                <Link
                  to="/intelligence/risk"
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="font-semibold text-xs">Risk Distribution</div>
                    <div className="text-[11px] text-slate-500">Breakdown & score clusters</div>
                  </div>
                </Link>

                <Link
                  to="/intelligence/agencies"
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-semibold text-xs">Agency Intelligence</div>
                    <div className="text-[11px] text-slate-500">Delays & high risk shares</div>
                  </div>
                </Link>

                <Link
                  to="/intelligence/duplicates"
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  <CopyCheck className="w-4 h-4 text-red-600" />
                  <div>
                    <div className="font-semibold text-xs">Duplicate Detection</div>
                    <div className="text-[11px] text-slate-500">Cosine & geographic overlap</div>
                  </div>
                </Link>

                <Link
                  to="/intelligence/analytics"
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-indigo-50 text-sm"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-xs">District & State Analytics</div>
                    <div className="text-[11px] text-slate-500">Comparative metrics</div>
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link to="/compliance" className={navItemClass('/compliance')}>
            <FileCheck2 className="w-4 h-4" />
            <span>Compliance</span>
          </Link>

          <Link to="/reports" className={navItemClass('/reports')}>
            <FileText className="w-4 h-4" />
            <span>Reports</span>
          </Link>
        </nav>

        {/* Right Secondary Utilities */}
        <div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">
          <Link
            to="/data-quality"
            className={`p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition ${
              isActive('/data-quality') ? 'text-indigo-400 bg-slate-800' : ''
            }`}
            title="Data Quality & Integrity"
          >
            <Database className="w-4 h-4" />
          </Link>

          <Link
            to="/audit-log"
            className={`p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition ${
              isActive('/audit-log') ? 'text-indigo-400 bg-slate-800' : ''
            }`}
            title="Administrative Audit Trail"
          >
            <History className="w-4 h-4" />
          </Link>

          <Link
            to="/settings"
            className={`p-2 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition ${
              isActive('/settings') ? 'text-indigo-400 bg-slate-800' : ''
            }`}
            title="Risk Weights & System Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
