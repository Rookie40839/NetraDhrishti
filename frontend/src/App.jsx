import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import DashboardPage from './pages/DashboardPage';
import WorksExplorer from './pages/WorksExplorer';
import WorkDetailPage from './pages/WorkDetailPage';
import InspectionsPage from './pages/InspectionsPage';
import ComplianceCentre from './pages/ComplianceCentre';
import RiskIntelligence from './pages/RiskIntelligence';
import AgencyIntelligence from './pages/AgencyIntelligence';
import DuplicatesPage from './pages/DuplicatesPage';
import DistrictAnalytics from './pages/DistrictAnalytics';
import DataQualityPage from './pages/DataQualityPage';
import AuditLogPage from './pages/AuditLogPage';
import SettingsPage from './pages/SettingsPage';
import ReportsPage from './pages/ReportsPage';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
          <Header />

          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Routes>
              {/* Primary Views */}
              <Route path="/" element={<DashboardPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/works" element={<WorksExplorer />} />
              <Route path="/works/:id" element={<WorkDetailPage />} />
              <Route path="/inspections" element={<InspectionsPage />} />
              <Route path="/compliance" element={<ComplianceCentre />} />

              {/* Intelligence Suite */}
              <Route path="/intelligence/risk" element={<RiskIntelligence />} />
              <Route path="/intelligence/agencies" element={<AgencyIntelligence />} />
              <Route path="/intelligence/duplicates" element={<DuplicatesPage />} />
              <Route path="/intelligence/analytics" element={<DistrictAnalytics />} />

              {/* Secondary & Governance */}
              <Route path="/data-quality" element={<DataQualityPage />} />
              <Route path="/audit-log" element={<AuditLogPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/login" element={<Login />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
