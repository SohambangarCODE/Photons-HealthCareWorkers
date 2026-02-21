import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, respondToCase } from '../services/caseService';
import Loader from '../components/Loader';
import { User, Clock, ArrowLeft, Send, Activity } from 'lucide-react';

export default function ReviewCase() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    recommendation: '',
    notes: ''
  });

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await getCaseById(id);
        setCaseItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCase();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await respondToCase(id, formData);
      navigate('/specialist/dashboard');
    } catch (err) {
      console.error(err);
      alert('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskColor = (risk) => {
      switch (risk) {
        case 'Critical': return 'text-red-600 bg-red-100 px-2 py-0.5 rounded';
        case 'High': return 'text-orange-600 bg-orange-100 px-2 py-0.5 rounded';
        default: return 'text-slate-800 bg-slate-100 px-2 py-0.5 rounded';
      }
  };

  if (loading) return <Loader />;
  if (!caseItem) return <div className="text-center py-12">Case not found</div>;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 fade-in">
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Inbox
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-blue-400 text-xs font-bold tracking-wider uppercase mb-1 block">Clinical Review</span>
            <h1 className="text-2xl font-bold text-white">{caseItem.patientName}</h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
               Worker: {caseItem.createdBy?.name || 'Unknown'} • {caseItem.age} yrs • {caseItem.gender}
            </p>
          </div>
        </div>

        <div className="p-6">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Initial Assessment</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Symptoms</h3>
                    <p className="text-slate-800">{caseItem.symptoms}</p>
                  </div>
                  {caseItem.history && (
                     <div>
                        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Medical History</h3>
                        <p className="text-slate-800">{caseItem.history}</p>
                     </div>
                  )}
                  <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-3">
                     <div>
                       <span className="block text-xs font-medium text-slate-500">Temp</span>
                       <span className="font-semibold text-slate-800">{caseItem.temperature || '--'}°</span>
                     </div>
                     <div>
                       <span className="block text-xs font-medium text-slate-500">BP</span>
                       <span className="font-semibold text-slate-800">{caseItem.bloodPressure || '--'}</span>
                     </div>
                     <div>
                       <span className="block text-xs font-medium text-slate-500">HR</span>
                       <span className="font-semibold text-slate-800">{caseItem.heartRate || '--'}</span>
                     </div>
                  </div>
               </div>

               {/* AI Pre-Analysis */}
               {caseItem.aiAnalysis && (
                 <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                    <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2 mb-3">
                       <Activity size={16} className="text-blue-600" /> AI Initial Screening
                    </h3>
                    <div className="space-y-3 text-sm">
                       <div>
                          <span className="font-medium text-slate-500">Identified Risk: </span>
                          <span className={`font-semibold ${getRiskColor(caseItem.aiAnalysis.riskLevel)}`}>{caseItem.aiAnalysis.riskLevel}</span>
                       </div>
                       <div>
                          <span className="block font-medium text-slate-500 mb-1">Matches:</span>
                          <p className="text-slate-800 font-medium">{caseItem.aiAnalysis.possibleDiseases?.join(', ')}</p>
                       </div>
                       <div>
                          <span className="block font-medium text-slate-500 mb-1">AI Recommendation:</span>
                          <p className="text-slate-700 italic border-l-2 border-blue-200 pl-3">{caseItem.aiAnalysis.recommendation}</p>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            {/* Specialist Form */}
            {caseItem.status !== 'resolved' ? (
                <div className="bg-blue-50/30 rounded-2xl border border-blue-100 p-6 mt-8">
                <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-5">Your Official Opinion</h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Diagnosis</label>
                    <input
                        type="text"
                        required
                        className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="E.g., Stage 2 Hypertension"
                        value={formData.diagnosis}
                        onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Treatment Recommendation & Plan</label>
                    <textarea
                        required
                        rows={4}
                        className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Provide clear steps for the primary health worker..."
                        value={formData.recommendation}
                        onChange={(e) => setFormData({ ...formData, recommendation: e.target.value })}
                    />
                    </div>

                    <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <textarea
                        rows={2}
                        className="appearance-none block w-full px-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                    </div>

                    <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
                    >
                        {submitting ? 'Submitting...' : (
                            <><Send size={18} /> Submit Resolution</>
                        )}
                    </button>
                    </div>
                </form>
                </div>
            ) : (
                <div className="bg-green-50 text-green-800 p-4 rounded-xl text-center font-medium border border-green-200">
                    You have already resolved this case.
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
