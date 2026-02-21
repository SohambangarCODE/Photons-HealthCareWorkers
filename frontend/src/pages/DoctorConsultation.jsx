import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MessageSquare, Info, Star, Award, Search, MoreVertical } from 'lucide-react';

export default function DoctorConsultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'doctor', text: 'Hello, I have received your case details and AI Assessment.', time: 'Just now' },
    { id: 2, sender: 'doctor', text: 'Please remain calm. Can you confirm if the patient is currently conscious and breathing normally?', time: 'Just now' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

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
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <div className="bg-white p-6 rounded-full shadow-sm mb-4 border border-slate-100">
                 {activeTab === 'call' ? <Phone size={48} className="text-indigo-200" /> : <Video size={48} className="text-indigo-200" />}
              </div>
              <h3 className="text-xl font-bold text-slate-700 mb-2">
                 {activeTab === 'call' ? 'Voice Call Unavailable' : 'Video Consultancy Unavailable'}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm text-center">This feature is currently disabled in the demo environment. Please use the live chat to communicate with the specialist.</p>
              <button onClick={() => setActiveTab('chat')} className="mt-6 text-indigo-600 font-bold text-sm hover:underline px-6 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                 Return to Live Chat
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
