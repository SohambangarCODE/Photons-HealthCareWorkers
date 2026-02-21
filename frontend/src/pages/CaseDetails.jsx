import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCaseById, getCaseResponses, requestSecondOpinion, getSpecialists } from '../services/caseService';
import { SocketContext } from '../context/SocketContext';
import Loader from '../components/Loader';
import { User, Activity, Clock, ShieldAlert, ArrowLeft, Send, Zap, AlertTriangle, CheckCircle, PhoneCall, PhoneForwarded } from 'lucide-react';

const getRiskColor = (risk) => {
  switch (risk) {
    case 'Critical': return 'bg-red-600 text-white';
    case 'High': return 'bg-orange-500 text-white';
    case 'Medium': return 'bg-yellow-500 text-white';
    default: return 'bg-green-500 text-white';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
    case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
    case 'under_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default: return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

export default function CaseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useContext(SocketContext);
  
  const [caseItem, setCaseItem] = useState(null);
  const [responses, setResponses] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
    fetchResponses();
    fetchSpecialists();

    if (socket) {
      socket.on('case_updated', (updatedCase) => {
        if (updatedCase._id === id) setCaseItem(updatedCase);
      });
      socket.on('case_resolved', ({ case: updatedCase, response }) => {
        if (updatedCase._id === id) {
          setCaseItem(updatedCase);
          setResponses(prev => [response, ...prev]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('case_updated');
        socket.off('case_resolved');
      }
    };
  }, [id, socket]);

  const fetchSpecialists = async () => {
    try {
      const data = await getSpecialists();
      setSpecialists(data);
    } catch (err) {
      console.error('Failed to load specialists', err);
    }
  };

  const fetchCaseDetails = async () => {
    try {
      const data = await getCaseById(id);
      setCaseItem(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch case data');
    } finally {
      setLoading(false);
    }
  };

  const fetchResponses = async () => {
    try {
      const data = await getCaseResponses(id);
      setResponses(data);
    } catch (err) {
      console.error('Failed to load responses', err);
    }
  };

  // Legacy Escalate (kept just in case)
  const handleEscalate = async () => {
    setActionLoading(true);
    try {
      await requestSecondOpinion(id, selectedSpecialist || null);
      fetchCaseDetails(); // Refresh status
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to request second opinion');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConnect = (type) => {
     setIsConnecting(true);
     // Simulate buffering delay (3-5s for emergency, 5-10s for standard)
     const minDelay = type === 'emergency' ? 3000 : 5000;
     const extraDelayRange = type === 'emergency' ? 2000 : 5000;
     const delay = minDelay + Math.random() * extraDelayRange;

     setTimeout(() => {
        setIsConnecting(false);
        navigate(`/consultation/${id}`);
     }, delay);
  };

  if (loading) return <Loader />;
  if (!caseItem) return <div className="text-center py-12">Case not found</div>;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6 fade-in">
      <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{caseItem.patientName}</h1>
            <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
              <User size={14} /> {caseItem.age} yrs • {caseItem.gender}
              <span className="text-slate-300">|</span>
              <Clock size={14} /> {new Date(caseItem.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(caseItem.status)} uppercase tracking-wider`}>
            {caseItem.status.replace('_', ' ')}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Symptoms reported</h3>
              <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100">{caseItem.symptoms}</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Temperature</p>
                <p className="text-lg font-semibold text-slate-800">{caseItem.temperature || '--'} °F</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Blood Pressure</p>
                <p className="text-lg font-semibold text-slate-800">{caseItem.bloodPressure || '--'}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">Heart Rate</p>
                <p className="text-lg font-semibold text-slate-800">{caseItem.heartRate || '--'} bpm</p>
              </div>
            </div>

            {caseItem.history && (
               <div>
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Medical History</h3>
                  <p className="text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{caseItem.history}</p>
               </div>
            )}
            
            {caseItem.attachments && caseItem.attachments.length > 0 && (
               <div>
                  <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider mb-2">Attachments</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {caseItem.attachments.map((file, idx) => {
                       const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}`.replace('/api', '') + '/' + file.path;
                       const isImage = file.mimetype.startsWith('image/');
                       return (
                         <a key={idx} href={fileUrl} target="_blank" rel="noopener noreferrer" className="block bg-slate-50 p-2 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors cursor-pointer group overflow-hidden">
                           {isImage ? (
                             <div className="aspect-video w-full bg-slate-200 rounded-lg overflow-hidden mb-2">
                               <img src={fileUrl} alt={file.filename} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                             </div>
                           ) : (
                             <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center mb-2">
                               <span className="text-slate-400 text-xs font-semibold uppercase">{file.filename.split('.').pop()} Document</span>
                             </div>
                           )}
                           <p className="text-xs text-slate-700 font-medium truncate px-1">{file.filename}</p>
                         </a>
                       )
                     })}
                  </div>
               </div>
            )}
            
            {/* AI Panel */}
            {caseItem.aiAnalysis && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-100 p-6 relative overflow-hidden shadow-sm mt-8">
                   {/* Decorative Elements */}
                   <div className="absolute -top-10 -right-10 bg-indigo-200/40 w-32 h-32 rounded-full blur-3xl" />
                   <div className="absolute -bottom-10 -left-10 bg-blue-200/40 w-32 h-32 rounded-full blur-3xl" />
                   
                   <div className="relative z-10">
                      <div className="flex items-center justify-between mb-5 pb-4 border-b border-indigo-200/60">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-sm">
                            <Zap size={20} />
                          </div>
                          <span className="font-bold text-indigo-950 text-lg">AI Assessment</span>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm flex items-center gap-1.5 ${getRiskColor(caseItem.aiAnalysis.riskLevel)}`}>
                          <AlertTriangle size={14} /> {caseItem.aiAnalysis.riskLevel} Risk
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column: Diseases & Confidence */}
                        <div className="flex flex-col justify-between space-y-6">
                          <div>
                            <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                               <Activity size={14} /> Possible Diseases
                            </p>
                            <div className="flex flex-wrap gap-2">
                               {caseItem.aiAnalysis.possibleDiseases?.map((disease, i) => (
                                 <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-900 border border-indigo-200/50 shadow-sm">
                                   {disease}
                                 </span>
                               ))}
                            </div>
                          </div>
                          
                          <div className="bg-white/50 p-4 rounded-xl border border-indigo-100/50">
                             <span className="text-xs text-indigo-800 font-bold uppercase tracking-wider mb-2 block">Confidence Score</span>
                             <div className="flex items-center gap-3">
                               <div className="flex-grow h-2.5 bg-indigo-200/60 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                                    style={{ width: `${caseItem.aiAnalysis.confidence}%` }}
                                  />
                               </div>
                               <span className="font-bold text-indigo-950 bg-white px-2.5 py-1 rounded-md shadow-sm border border-indigo-100 text-sm">
                                 {caseItem.aiAnalysis.confidence}%
                               </span>
                             </div>
                          </div>
                        </div>
                        
                        {/* Right Column: Recommendation */}
                        <div className="md:col-span-2 bg-white/50 p-5 rounded-2xl border border-indigo-100/50 h-full">
                          <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                             <CheckCircle size={14} /> Recommended Action Plan
                          </p>
                          <div className="prose prose-sm prose-indigo max-w-none text-slate-700 leading-relaxed font-medium">
                            {caseItem.aiAnalysis.recommendation.split('\n').map((line, idx) => (
                               <p key={idx} className="mb-2 last:mb-0">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                   </div>
                </div>
             )}

            {/* Specialist Responses block */}
            {responses.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4">Specialist Opinions</h3>
                <div className="space-y-4">
                  {responses.map(resp => (
                    <div key={resp._id} className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-3 opacity-10">
                          <ShieldAlert size={64} className="text-blue-500" />
                       </div>
                       <div className="relative z-10">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-semibold text-blue-900 flex items-center gap-2">
                              <User size={16} /> Dr. {resp.specialistId?.name || 'Unknown'}
                            </span>
                            <span className="text-xs text-blue-600 font-medium">{new Date(resp.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="mb-3">
                             <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Diagnosis</p>
                             <p className="text-slate-800 mt-1">{resp.diagnosis}</p>
                          </div>
                          <div className="mb-3">
                             <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Recommendation</p>
                             <p className="text-slate-800 mt-1">{resp.recommendation}</p>
                          </div>
                          {resp.notes && (
                            <div>
                               <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Additional Notes</p>
                               <p className="text-slate-700 italic mt-1">{resp.notes}</p>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* AI Panel & Actions */}
          <div className="space-y-6">
             {/* Spacer removed */}

             {/* Action Box */}
             {caseItem.status !== 'resolved' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mt-6">
                  <h3 className="font-semibold text-slate-800 mb-3">Require Assistance?</h3>
                  <div className="space-y-3">
                     <p className="text-sm text-slate-500 mb-4">Connect with an available expert doctor for consultation.</p>
                     
                     <button
                       onClick={() => handleConnect('emergency')}
                       disabled={isConnecting}
                       className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-all text-sm animate-pulse focus:ring-4 focus:ring-red-200"
                     >
                        <PhoneForwarded size={18} /> Emergency Connect
                     </button>
                     
                     <button
                       onClick={() => handleConnect('standard')}
                       disabled={isConnecting}
                       className="w-full flex justify-center items-center gap-2 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-semibold py-3 px-4 rounded-xl shadow-sm transition-colors text-sm"
                     >
                        <PhoneCall size={18} /> Find Expert Doctors
                     </button>
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>

      {/* Connection Buffering Overlay */}
      {isConnecting && (
         <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center scale-up border-4 border-indigo-500/20">
               <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                 <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
                 <PhoneCall size={24} className="text-indigo-600 animate-pulse" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Connecting...</h3>
               <p className="text-slate-500 text-sm">We are connecting you with our Expert doctors. Please do not close this window.</p>
            </div>
         </div>
      )}
    </div>
  );
}
