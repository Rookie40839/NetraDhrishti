import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { Activity, AlertTriangle, CheckCircle, Search } from 'lucide-react'

export default function Dashboard() {
  const [works, setWorks] = useState([])
  const [stats, setStats] = useState({ totalWorks: 0, totalFlags: 0, highRiskWorks: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const worksRes = await axios.get('http://localhost:8080/api/works')
        const statsRes = await axios.get('http://localhost:8080/api/dashboard/stats')
        setWorks(worksRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64">Loading dashboard...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Compliance Dashboard</h1>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search works..." 
            className="pl-10 pr-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Total Works Monitored</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalWorks}</p>
            </div>
            <Activity className="w-10 h-10 text-blue-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">Compliance Flags Detected</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalFlags}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-orange-500 opacity-50" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 uppercase font-semibold">High Risk Works</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.highRiskWorks}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500 opacity-50" />
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Works Under Review</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                <th className="px-6 py-3 font-medium">Work Name</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Risk Score</th>
                <th className="px-6 py-3 font-medium">Flags</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {works.slice(0, 15).map((w, idx) => {
                const rs = w.riskScore?.totalRiskScore || 0;
                const riskLevel = w.riskScore?.riskCategory || 'LOW';
                const flagCount = w.flags?.length || 0;
                
                return (
                  <tr key={idx} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.work.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{w.work.category}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        riskLevel === 'HIGH' || riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                        riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {rs.toFixed(1)} - {riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {flagCount > 0 ? (
                        <span className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="w-4 h-4" /> {flagCount} rules flagged
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-4 h-4" /> Clean
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <Link to={`/works/${w.work.id}`} className="text-indigo-600 hover:text-indigo-900 font-medium">
                        Review Details
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
