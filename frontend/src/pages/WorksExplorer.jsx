import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WorksExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data states
  const [works, setWorks] = useState([]);
  const [pageData, setPageData] = useState({ page: 0, size: 20, totalElements: 0, totalPages: 0 });
  const [filterOptions, setFilterOptions] = useState({
    states: [],
    districts: [],
    categories: [],
    agencies: [],
    financialYears: [],
    statuses: [],
    riskLevels: [],
  });
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true);

  // Filter query states
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [financialYear, setFinancialYear] = useState(searchParams.get('financialYear') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [agency, setAgency] = useState(searchParams.get('agency') || '');
  const [riskLevel, setRiskLevel] = useState(searchParams.get('riskLevel') || '');

  // Pagination & Sorting
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('asc');

  // Load dropdown options once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const res = await api.get('/works/filters');
        setFilterOptions(res.data);
      } catch (err) {
        console.error('Error loading filter options:', err);
      }
    };
    loadFilters();
  }, []);

  // Fetch works when any query parameters change
  const fetchWorks = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        sortBy,
        sortDir,
      };
      if (search) params.search = search;
      if (state) params.state = state;
      if (district) params.district = district;
      if (financialYear) params.financialYear = financialYear;
      if (category) params.category = category;
      if (status) params.status = status;
      if (agency) params.agency = agency;
      if (riskLevel) params.riskLevel = riskLevel;

      const res = await api.get('/works', { params });
      setWorks(res.data.content);
      setPageData({
        page: res.data.page,
        size: res.data.size,
        totalElements: res.data.totalElements,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [page, size, sortBy, sortDir, state, district, financialYear, category, status, agency, riskLevel]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchWorks();
  };

  const handleResetFilters = () => {
    setSearch('');
    setState('');
    setDistrict('');
    setFinancialYear('');
    setCategory('');
    setStatus('');
    setAgency('');
    setRiskLevel('');
    setPage(0);
  };

  const getRiskBadge = (level, score) => {
    let color = 'bg-slate-100 text-slate-700 border-slate-200';
    if (level === 'CRITICAL') color = 'bg-red-100 text-red-800 border-red-200';
    else if (level === 'HIGH') color = 'bg-orange-100 text-orange-800 border-orange-200';
    else if (level === 'MEDIUM') color = 'bg-amber-100 text-amber-800 border-amber-200';
    else if (level === 'LOW') color = 'bg-emerald-100 text-emerald-800 border-emerald-200';

    return (
      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
        {level || 'LOW'} ({score || 0})
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Works Explorer</h1>
          <p className="text-xs text-slate-500">
            Search, filter, and inspect works with comprehensive multi-criteria screening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition ${
              filterOpen ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterOpen ? 'Hide Filters' : 'Show Filters'}</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Work Code, Title, Agency, or District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
        >
          Search
        </button>
      </form>

      {/* Collapsible Filters Drawer */}
      {filterOpen && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase text-slate-600 tracking-wider">Filter Criteria</span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
            {/* Risk Level */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Risk Level</label>
              <select
                value={riskLevel}
                onChange={(e) => { setRiskLevel(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Levels</option>
                {filterOptions.riskLevels.map((lvl) => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => { setState(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All States</option>
                {filterOptions.states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">District</label>
              <select
                value={district}
                onChange={(e) => { setDistrict(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Districts</option>
                {filterOptions.districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Financial Year */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Financial Year</label>
              <select
                value={financialYear}
                onChange={(e) => { setFinancialYear(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Years</option>
                {filterOptions.financialYears.map((fy) => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Categories</option>
                {filterOptions.categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Work Status</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Statuses</option>
                {filterOptions.statuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Agency */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Agency</label>
              <select
                value={agency}
                onChange={(e) => { setAgency(e.target.value); setPage(0); }}
                className="w-full border border-slate-300 rounded p-1.5 bg-white text-slate-800"
              >
                <option value="">All Agencies</option>
                {filterOptions.agencies.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">
            Showing {works.length} of {pageData.totalElements} records
          </span>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Rows per page:</span>
            <select
              value={size}
              onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
              className="border border-slate-300 rounded px-2 py-1 bg-white"
            >
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100/60 border-b border-slate-200 text-slate-600 uppercase font-semibold">
                <th className="px-4 py-3">Work Number & Name</th>
                <th className="px-4 py-3">District & MP</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Agency</th>
                <th className="px-4 py-3 cursor-pointer select-none" onClick={() => { setSortBy('sanctionAmount'); setSortDir(sortDir === 'asc' ? 'desc' : 'asc'); }}>
                  <div className="flex items-center gap-1">
                    <span>Sanction Amount</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Confidence</th>
                <th className="px-4 py-3 text-center">Risk Level</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    Loading works records...
                  </td>
                </tr>
              ) : works.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-slate-400">
                    No works records matched the search and filter criteria.
                  </td>
                </tr>
              ) : (
                works.map((item, idx) => {
                  const w = item.work;
                  const rs = item.riskScore;
                  return (
                    <tr key={w.id || idx} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 line-clamp-1">{w.workName}</div>
                        <div className="font-mono text-[11px] text-slate-500">{w.uniqueWorkNumber}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{w.implementingDistrict}</div>
                        <div className="text-[11px] text-slate-500">{w.mpName || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {w.workCategory || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                        {w.implementingAgencyName || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        ₹{Number(w.sanctionAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-medium border border-slate-200">
                          {w.workStatus || 'In Progress'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-bold text-slate-700">
                          {w.dataConfidence || 80}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getRiskBadge(rs?.riskLevel, rs?.riskScore)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/works/${w.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded text-xs font-semibold transition border border-indigo-200"
                        >
                          <span>Details</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-600">
          <div>
            Page <strong>{page + 1}</strong> of <strong>{Math.max(1, pageData.totalPages)}</strong>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pageData.totalPages - 1, p + 1))}
              disabled={page >= pageData.totalPages - 1}
              className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
