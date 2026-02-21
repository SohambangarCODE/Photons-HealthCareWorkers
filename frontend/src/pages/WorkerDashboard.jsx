import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getCases } from '../services/caseService';
import { SocketContext } from '../context/SocketContext';
import CaseCard from '../components/CaseCard';
import Loader from '../components/Loader';
import { Activity, Users, AlertCircle, CheckCircle } from 'lucide-react';

export default function WorkerDashboard() {
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
        setCases(prev => prev.map(c => c._id === updatedCase._id ? updatedCase : c));
      });
      socket.on('case_resolved', ({ case: resolvedCase }) => {
        setCases(prev => prev.map(c => c._id === resolvedCase._id ? resolvedCase : c));
      });
    }

    return () => {
      if (socket) {
        socket.off('case_updated');
        socket.off('case_resolved');
      }
    };
  }, [socket]);

  if (loading) return <Loader />;

  const stats = {
    total: cases.length,
    pending: cases.filter(c => c.status === 'pending').length,
    escalated: cases.filter(c => c.status === 'escalated' || c.status === 'under_review').length,
    resolved: cases.filter(c => c.status === 'resolved').length
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Track your patient cases and second opinions</p>
        </div>
        <Link to="/worker/create-case" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + New Case
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Total Cases</dt>
                <dd className="text-2xl font-semibold text-slate-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <Activity className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Pending AI</dt>
                <dd className="text-2xl font-semibold text-slate-900">{stats.pending}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Escalated</dt>
                <dd className="text-2xl font-semibold text-slate-900">{stats.escalated}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-slate-200">
          <div className="p-5 flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-slate-500 truncate">Resolved</dt>
                <dd className="text-2xl font-semibold text-slate-900">{stats.resolved}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Cases</h2>
        {cases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            
            <h3 className="mt-2 text-sm font-medium text-slate-900">No cases</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating a new patient case.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.slice(0, 6).map(c => (
              <CaseCard key={c._id} caseItem={c} role="worker" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
