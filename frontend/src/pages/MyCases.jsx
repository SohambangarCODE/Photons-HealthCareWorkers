import { useState, useContext, useEffect } from 'react';
import { getCases } from '../services/caseService';
import { SocketContext } from '../context/SocketContext';
import CaseCard from '../components/CaseCard';
import Loader from '../components/Loader';

export default function MyCases() {
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
    }

    return () => {
      if (socket) socket.off('case_updated');
    };
  }, [socket]);

  if (loading) return <Loader />;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 fade-in">
      <div className="border-b border-slate-200 pb-5">
        <h1 className="text-2xl font-bold text-slate-900">My Cases</h1>
        <p className="mt-1 text-sm text-slate-500">All cases created by you</p>
      </div>

      {cases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No cases found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cases.map(c => (
            <CaseCard key={c._id} caseItem={c} role="worker" />
          ))}
        </div>
      )}
    </div>
  );
}
