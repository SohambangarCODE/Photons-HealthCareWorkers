import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MessageSquare, Info, Star, Award, Search, MoreVertical, Mic, MicOff, VideoOff, PhoneOff, Maximize, Volume2, Settings } from 'lucide-react';

export default function DoctorConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doctor', text: 'Hello, I have received your case details and AI Assessment.', time: 'Just now' },
    { id: 2, sender: 'doctor', text: 'Please remain calm. Can you confirm if the patient is currently conscious and breathing normally?', time: 'Just now' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [callStatus, setCallStatus] = useState('idle'); // idle, connecting, active, ended
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');

    // Mock doctor reply after 2 seconds
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'doctor',
        text: 'Understood. I advise you to keep them comfortable while I arrange a further review. Are there any other symptoms not logged?',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 2000);
  };

  const startCall = () => {
    setCallStatus('connecting');
    setTimeout(() => {
      setCallStatus('active');
      setCallDuration(0);
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }, 2000);
  };

  const endCall = () => {
    setCallStatus('ended');
    clearInterval(timerRef.current);
    setTimeout(() => {
      setCallStatus('idle');
      setActiveTab('chat');
    }, 2000);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="h-full flex bg-slate-50 relative overflow-hidden">
      {/* Sidebar - Doctor Profile & Controls */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm relative shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
             <ArrowLeft size={20} />
           </button>
           <h2 className="font-bold text-slate-800">Consultation</h2>
        </div>

        {/* Doctor Profile */}
        <div className="p-6 flex flex-col items-center border-b border-slate-100">
          <div className="relative">
             <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden mb-3">
               <img src={`https://ui-avatars.com/api/?name=Dr+Sarah+Jenkins&background=e0e7ff&color=4338ca&size=150`} alt="Doctor" className="w-full h-full object-cover" />
             </div>
             <div className="absolute bottom-4 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Dr. Sarah Jenkins</h3>
          <p className="text-sm font-medium text-indigo-600 mb-1">Senior Specialist & Cardiologist</p>
          <div className="flex items-center gap-1 text-xs text-slate-500 font-medium mt-1">
             <Star size={14} className="text-yellow-500 fill-yellow-500" />
             <span>4.9 (120+)</span>
             <span className="mx-2">•</span>
             <Award size={14} className="text-slate-400" />
             <span>15+ yrs exp</span>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex-1 p-4 flex flex-col gap-2">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Contact Modes</p>
           
           <button 
             onClick={() => setActiveTab('chat')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
           >
             <MessageSquare size={18} className={activeTab === 'chat' ? 'text-indigo-600' : 'text-slate-400'} />
             Chat with Expert
             {activeTab === 'chat' && <span className="ml-auto w-2 h-2 rounded-full bg-indigo-600 shadow-sm"></span>}
           </button>
           
           <button 
             onClick={() => setActiveTab('call')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'call' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
           >
             <Phone size={18} className={activeTab === 'call' ? 'text-indigo-600' : 'text-slate-400'} />
             Call with Expert
           </button>
           
           <button 
             onClick={() => setActiveTab('video')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'video' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm font-semibold' : 'text-slate-600 hover:bg-slate-50 font-medium'}`}
           >
             <Video size={18} className={activeTab === 'video' ? 'text-indigo-600' : 'text-slate-400'} />
             Video Consultancy
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-slate-50 relative">
        {/* Chat Interface Header */}
        <div className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
           <div>
              <h3 className="font-bold text-slate-800">Live Connect</h3>
              <p className="text-xs font-medium text-green-600 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online
              </p>
           </div>
           <div className="flex items-center gap-4 text-slate-400">
             <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Search size={18} /></button>
             <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><Info size={18} /></button>
             <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"><MoreVertical size={18} /></button>
           </div>
        </div>

        {/* Only show Chat UI (user requested chat active by default covering remaining area) */}
        {activeTab === 'chat' ? (
           <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                 <div className="flex justify-center mb-6">
                    <span className="bg-slate-200 text-slate-500 text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-sm">Today</span>
                 </div>
                 
                 {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] lg:max-w-[60%] rounded-2xl p-4 shadow-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-100 text-slate-800 border-l-4 border-l-indigo-500 rounded-tl-sm'}`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-2 font-medium text-right opacity-80 ${msg.sender === 'user' ? 'text-indigo-100' : 'text-slate-500'}`}>
                             {msg.time}
                          </p>
                       </div>
                    </div>
                 ))}
                 <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)]">
                 <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
                    <input 
                      type="text" 
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message to Dr. Sarah Jenkins..." 
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-inner"
                    />
                    <button 
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="absolute right-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 flex items-center justify-center shadow-md active:scale-95"
                    >
                       <Send size={16} className="translate-x-[-1px] translate-y-[1px]" />
                    </button>
                 </form>
              </div>
           </>
        ) : activeTab === 'call' ? (
          <div className="flex-1 flex flex-col bg-slate-900 relative">
            {/* Header overlay for Call */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
              <div className="bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <p className="text-white text-xs font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  {callStatus === 'connecting' ? 'CONNECTING...' : `SECURE CALL - ${formatDuration(callDuration)}`}
                </p>
              </div>
              <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors">
                <Settings size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-10">
              <div className="relative mb-8">
                <div className={`w-40 h-40 rounded-full bg-indigo-500/20 flex items-center justify-center relative ${callStatus === 'active' ? 'animate-[ping_3s_infinite]' : ''}`}>
                  <div className="w-32 h-32 rounded-full bg-indigo-500 border-4 border-slate-900 shadow-2xl flex items-center justify-center overflow-hidden z-10">
                    <img src={`https://ui-avatars.com/api/?name=Dr+Sarah+Jenkins&background=4338ca&color=fff&size=200`} alt="Doctor" className="w-full h-full object-cover" />
                  </div>
                </div>
                {callStatus === 'connecting' && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-indigo-600 text-[10px] font-bold text-white px-3 py-1 rounded-full border-2 border-slate-900">
                    CALLING
                  </div>
                )}
              </div>

              <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Dr. Sarah Jenkins</h2>
                <p className="text-indigo-300 font-medium mb-1">Senior Specialist & Cardiologist</p>
                {callStatus === 'ended' && <p className="text-red-400 font-bold mt-4">Call Ended</p>}
              </div>
            </div>

            {/* Call Controls */}
            <div className="p-10 flex items-center justify-center gap-6 z-20 bg-gradient-to-t from-black/40 to-transparent">
              {callStatus === 'idle' ? (
                <button 
                  onClick={startCall}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95"
                >
                  <Phone size={28} />
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-white text-slate-900' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                  </button>
                  <button 
                    onClick={endCall}
                    className="w-20 h-20 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95 border-4 border-white/20"
                  >
                    <PhoneOff size={32} />
                  </button>
                  <button className="w-14 h-14 bg-white/10 text-white hover:bg-white/20 rounded-full flex items-center justify-center transition-all">
                    <Volume2 size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
            {/* Video Main View */}
            <div className="absolute inset-0 z-0">
               <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  {callStatus === 'active' && !isVideoOff ? (
                    <div className="relative w-full h-full">
                       <img src="https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&q=80&w=2000" alt="Doctor Video" className="w-full h-full object-cover opacity-80" />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-32 h-32 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700">
                        <VideoOff size={48} className="text-slate-600" />
                      </div>
                      <p className="text-slate-500 font-medium">Doctor's camera is off</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Local Preview */}
            <div className="absolute top-6 right-6 w-48 h-32 bg-slate-800 rounded-xl border-2 border-white/10 shadow-2xl overflow-hidden z-20">
               <div className="w-full h-full bg-indigo-900/40 flex items-center justify-center">
                  <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Local Preview</span>
               </div>
            </div>

            {/* Top Overlay */}
            <div className="absolute top-6 left-6 z-20">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <p className="text-white text-xs font-bold flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${callStatus === 'active' ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`}></span>
                  {callStatus === 'active' ? `LIVE - ${formatDuration(callDuration)}` : 'READY TO CONNECT'}
                </p>
              </div>
            </div>

            {/* Bottom Overlay - Doctor Info */}
            <div className="absolute bottom-32 left-8 z-20">
               <h3 className="text-2xl font-bold text-white drop-shadow-lg">Dr. Sarah Jenkins</h3>
               <p className="text-indigo-300 font-medium drop-shadow-md">Onboarding Consultation • HD</p>
            </div>

            {/* Video Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-6 z-30">
               {callStatus === 'idle' ? (
                 <button 
                   onClick={startCall}
                   className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center gap-3 shadow-2xl transition-all font-bold group"
                 >
                   <Video size={20} className="group-hover:scale-110 transition-transform" />
                   Start Consultation
                 </button>
               ) : (
                 <>
                   <button 
                     onClick={() => setIsMuted(!isMuted)}
                     className={`w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   >
                     {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                   </button>
                   <button 
                     onClick={() => setIsVideoOff(!isVideoOff)}
                     className={`w-14 h-14 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                   >
                     {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                   </button>
                   <button 
                     onClick={endCall}
                     className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105 active:scale-95"
                   >
                     <PhoneOff size={28} />
                   </button>
                   <button className="w-14 h-14 bg-white/10 text-white hover:bg-white/20 rounded-full flex items-center justify-center transition-all backdrop-blur-md">
                     <Maximize size={24} />
                   </button>
                 </>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
