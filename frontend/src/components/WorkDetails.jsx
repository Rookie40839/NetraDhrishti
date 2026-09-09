import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, MapPin, Calendar, IndianRupee, AlertTriangle, ShieldCheck } from 'lucide-react'

export default function WorkDetails() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/works/${id}`)
        setData(res.data)
      } catch (error) {
        console.error('Error fetching work details:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <div className="flex justify-center items-center h-64">Loading work details...</div>
  if (!data) return <div className="flex justify-center items-center h-64 text-red-500">Work not found.</div>

  const { work, riskScore, flags } = data

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{work.name}</h1>
            <div className="flex items-center text-gray-500 mt-2 space-x-4">
              <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {work.district}</span>
              <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {work.startDate}</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{work.category}</span>
              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{work.status}</span>
            </div>
          </div>
          {riskScore && (
            <div className={`px-4 py-2 rounded-lg text-center ${
              riskScore.riskCategory === 'HIGH' || riskScore.riskCategory === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
              riskScore.riskCategory === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
              'bg-green-100 text-green-800 border border-green-200'
            }`}>
              <div className="text-sm font-semibold uppercase">{riskScore.riskCategory} RISK</div>
              <div className="text-3xl font-bold">{riskScore.totalRiskScore?.toFixed(1)}</div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Financial Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Cost</span>
              <span className="font-medium flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{work.estimatedCost?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Sanctioned Cost</span>
              <span className="font-medium flex items-center"><IndianRupee className="w-4 h-4 mr-1"/>{work.sanctionedCost?.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Contractor</span>
              <span className="font-medium">{work.contractor || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Compliance Flags</h2>
          {flags && flags.length > 0 ? (
            <ul className="space-y-4">
              {flags.map((flag, idx) => (
                <li key={idx} className="flex items-start bg-orange-50 p-3 rounded-md border border-orange-100">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">{flag.ruleId.replace(/_/g, ' ')}</div>
                    <div className="text-sm text-gray-600 mt-1">{flag.flaggedDescription}</div>
                    <div className="mt-2 flex space-x-2">
                      <span className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-600 font-medium">
                        Severity: {flag.severity}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex items-center justify-center h-32 text-green-600 bg-green-50 rounded-md border border-green-100">
              <ShieldCheck className="w-6 h-6 mr-2" />
              <span className="font-medium">No compliance violations detected.</span>
            </div>
          )}
        </div>
      </div>
      
      {riskScore?.contributingFactors && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">Risk Factor Breakdown</h2>
          <pre className="bg-gray-50 p-4 rounded text-sm text-gray-700 overflow-x-auto">
            {JSON.stringify(JSON.parse(riskScore.contributingFactors), null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
