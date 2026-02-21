import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const getStatusColor = (status) => {
  switch (status) {
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
    case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getRiskColor = (risk) => {
  switch (risk) {
    case 'Critical': return 'bg-red-600 text-white';
    case 'High': return 'bg-orange-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-white';
    default: return 'bg-green-500 text-white';
  }
};

export default function CaseCard({ caseItem, role }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-all duration-200 fade-in">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{caseItem.patientName}</h3>
          <p className="text-sm text-slate-500">{caseItem.age} yrs • {caseItem.gender}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
          {caseItem.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="mb-4">
        <p className="text-sm text-slate-600 line-clamp-2">
          <span className="font-medium text-slate-700">Symptoms:</span> {caseItem.symptoms}
        </p>
      </div>

      {caseItem.aiAnalysis && (
        <div className="bg-slate-50 rounded-lg p-3 mb-4 text-sm border border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium flex items-center gap-1 text-slate-700">
              <Activity size={16} className="text-blue-500"/> AI Assessment
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full shadow-sm ${getRiskColor(caseItem.aiAnalysis.riskLevel)}`}>
              {caseItem.aiAnalysis.riskLevel} Risk
            </span>
          </div>
          <p className="text-slate-600 line-clamp-1">{caseItem.aiAnalysis.possibleDiseases?.join(', ') || 'Processing...'}</p>
        </div>
      )}

      <div className="flex justify-end mt-2 pt-4 border-t border-slate-100">
        <Link 
          to={role === 'worker' ? `/cases/${caseItem._id}` : `/review-case/${caseItem._id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 transition-colors"
        >
          {role === 'worker' ? 'View Details' : 'Review Case'}
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
