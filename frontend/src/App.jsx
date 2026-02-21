import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import WorkerDashboard from './pages/WorkerDashboard';
import CreateCase from './pages/CreateCase';
import MyCases from './pages/MyCases';
import CaseDetails from './pages/CaseDetails';

import SpecialistDashboard from './pages/SpecialistDashboard';
import ReviewCase from './pages/ReviewCase';
import DoctorConsultation from './pages/DoctorConsultation';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-colors duration-200">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto relative bg-slate-50">
          <Routes>
            {/* Worker Routes */}
            <Route path="/" element={<WorkerDashboard />} />
            <Route path="/worker/dashboard" element={<WorkerDashboard />} />
            <Route path="/worker/create-case" element={<CreateCase />} />
            <Route path="/worker/cases" element={<MyCases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/consultation/:id" element={<DoctorConsultation />} />

            {/* Specialist Routes */}
            <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
            <Route path="/review-case/:id" element={<ReviewCase />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
