import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCase } from '../services/caseService';
import { Mic, MicOff, Activity, UploadCloud, X } from 'lucide-react';

export default function CreateCase() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'Male',
    symptoms: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    history: ''
  });
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Voice Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Files handling
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Voice Recognition logic
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      
      if (finalTranscript) {
        setFormData(prev => ({
          ...prev,
          symptoms: prev.symptoms + (prev.symptoms ? ' ' : '') + finalTranscript
        }));
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
       // Only update state if it wasn't manually stopped to allow continuous reflection
       if (isListening) {
          setIsListening(false);
       }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const submitData = new FormData();
      
      // Append robust numeric parsing
      const ageNum = Number(formData.age);
      const tempNum = Number(formData.temperature);
      const hrNum = Number(formData.heartRate);

      submitData.append('patientName', formData.patientName);
      submitData.append('gender', formData.gender);
      submitData.append('symptoms', formData.symptoms);
      submitData.append('bloodPressure', formData.bloodPressure);
      submitData.append('history', formData.history);
      
      if (!isNaN(ageNum)) submitData.append('age', ageNum);
      if (!isNaN(tempNum)) submitData.append('temperature', tempNum);
      if (!isNaN(hrNum)) submitData.append('heartRate', hrNum);

      files.forEach((file) => {
        submitData.append('files', file);
      });

      const res = await createCase(submitData);
      navigate(`/cases/${res._id}`); // Redirect to case details
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze and create case');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create New Case</h1>
        <p className="mt-1 text-sm text-slate-500">Enter patient details and upload files to get a precise AI analysis.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-slate-700 mb-1">Patient Full Name</label>
              <input
                type="text"
                name="patientName"
                required
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.patientName}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                required
                min="0"
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.age}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                name="gender"
                className="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                value={formData.gender}
                onChange={handleChange}
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between items-center">
                <span>Symptoms</span>
                <button 
                  type="button" 
                  onClick={toggleListening}
                  className={`text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors ${isListening ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                >
                  {isListening ? (
                    <><MicOff size={14} className="animate-pulse" /> Stop Listening...</>
                  ) : (
                    <><Mic size={14} /> Voice Input</>
                  )}
                </button>
              </label>
              <textarea
                name="symptoms"
                required
                rows={4}
                placeholder="Describe patient symptoms in detail... (You can use the voice input button to dictate)"
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.symptoms}
                onChange={handleChange}
              />
            </div>

            <div className="sm:col-span-6">
               <h3 className="text-slate-900 font-medium text-sm mb-3 flex items-center gap-2"><Activity size={16} className="text-slate-400" /> Vitals</h3>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Temperature (°F)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      placeholder="98.6"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.temperature}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Blood Pressure</label>
                    <input
                      type="text"
                      name="bloodPressure"
                      placeholder="120/80"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.bloodPressure}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Heart Rate (BPM)</label>
                    <input
                      type="number"
                      name="heartRate"
                      placeholder="72"
                      className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={formData.heartRate}
                      onChange={handleChange}
                    />
                  </div>
               </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Medical History <span className="text-slate-400 text-xs font-normal">(Optional)</span></label>
              <textarea
                name="history"
                rows={2}
                className="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.history}
                onChange={handleChange}
              />
            </div>
            
             <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Attachments <span className="text-slate-400 text-xs font-normal">(Provide Lab Reports, X-Rays, etc.)</span></label>
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 transition-colors rounded-xl p-6 text-center cursor-pointer relative">
                    <input 
                      type="file" 
                      multiple 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      title="Upload files"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <UploadCloud size={32} className="text-slate-400" />
                       <span className="text-sm font-medium text-blue-600">Click to upload <span className="text-slate-600 font-normal">or drag and drop</span></span>
                       <span className="text-xs text-slate-500">PDF, JPG, PNG up to 5MB each</span>
                    </div>
                </div>
                
                {/* File Previews */}
                {files.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <li key={index} className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                        <span className="text-xs font-medium text-slate-700 truncate mr-4">{file.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)} 
                          className="text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
             </div>

          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
             <button
              type="button"
              onClick={() => navigate('/worker/dashboard')}
              className="py-2.5 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Analyzing with AI...' : (
                <>
                  <Activity size={16} className="mr-2" />
                  Analyze Case
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
