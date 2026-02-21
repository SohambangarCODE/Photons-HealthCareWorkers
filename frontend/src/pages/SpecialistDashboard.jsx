import { useState, useEffect, useContext } from 'react';
import { getCases } from '../services/caseService';
import { SocketContext } from '../context/SocketContext';
import CaseCard from '../components/CaseCard';
import Loader from '../components/Loader';
import { Activity, Bell, FileText } from 'lucide-react';

export default function SpecialistDashboard() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useContext(SocketContext);

  const fetchCases = async () => {
    try {
      const data = await getCases();
      setCases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();

    if (socket) {
      socket.on('case_updated', (updatedCase) => {
        // Find if exists, else it might be newly escalated to us
        setCases(prev => {
          const exists = prev.find(c => c._id === updatedCase._id);
          if (exists) {
              return prev.map(c => c._id === updatedCase._id ? updatedCase : c);
          } else {
              return [updatedCase, ...prev];
          }
        });
      });
      socket.on('new_assignment', (newCase) => {
         setCases(prev => [newCase, ...prev.filter(c => c._id !== newCase._id)]);
      });
    }

    return () => {
      if (socket) {
        socket.off('case_updated');
        socket.off('new_assignment');
      }
    };
  }, [socket]);

  if (loading) return <Loader />;

  const pendingReview = cases.filter(c => c.status === 'escalated' || c.status === 'under_review');
  const resolved = cases.filter(c => c.status === 'resolved');

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Specialist Inbox</h1>
        <p className="text-slate-500 text-sm mt-1">Review cases requiring second opinions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Requires Attention</p>
               <p className="text-3xl font-bold text-slate-900 mt-1">{pendingReview.length}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
               <Bell size={24} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
               <p className="text-sm font-medium text-slate-500">Resolved Consultations</p>
               <p className="text-3xl font-bold text-slate-900 mt-1">{resolved.length}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
               <Activity size={24} />
            </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Action Required</h2>
        {pendingReview.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
             <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
             <p className="text-slate-500 text-sm font-medium">Inbox zero! No pending cases.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingReview.map(c => (
              <CaseCard key={c._id} caseItem={c} role="specialist" />
            ))}
          </div>
        )}
      </div>

       {resolved.length > 0 && (
         <div className="opacity-70">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">Past Consultations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {resolved.slice(0, 3).map(c => (
                 <CaseCard key={c._id} caseItem={c} role="specialist" />
               ))}
            </div>
         </div>
       )}
    </div>
  );
}
