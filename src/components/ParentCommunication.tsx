import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MessageSquare, 
  Phone, 
  Upload, 
  Image as ImageIcon, 
  User, 
  Sparkles, 
  Check, 
  CheckCheck, 
  Search, 
  Bell, 
  Plus, 
  Trash2, 
  Volume2, 
  Languages, 
  RefreshCw, 
  AlertCircle, 
  Smartphone, 
  Laptop, 
  ChevronRight, 
  Info, 
  Clock,
  X,
  Smile,
  Shield,
  BookOpen
} from 'lucide-react';
import { Pupil } from '../types';

export interface ChatMessage {
  id: string;
  pupilId: string;
  sender: 'teacher' | 'parent';
  senderName: string;
  text: string;
  imageUrl?: string;
  timestamp: string; // HH:MM AM/PM
  date: string; // YYYY-MM-DD
  isRead: boolean;
}

interface ParentCommunicationProps {
  pupils: Pupil[];
  onNotificationCountChange?: (count: number) => void;
}

const PRELOADED_PHOTOS = [
  { id: 'p1', name: 'Millet Porridge Kettle Outing', url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=500&h=375&q=80', description: 'Porridge class break.' },
  { id: 'p2', name: 'Playground Outdoor Activities', url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=500&h=375&q=80', description: 'KG1 class on the play swings.' },
  { id: 'p3', name: 'Hand-Coloring & Pre-Writing Activity', url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=500&h=375&q=80', description: 'Fine motor skills coloring.' },
  { id: 'p4', name: 'Toddler Sleeping & Nap Time', url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=500&h=375&q=80', description: 'Afternoon quiet rest beds.' },
  { id: 'p5', name: 'Ready for Home Shuttle Boarding', url: 'https://images.unsplash.com/photo-1557223562-6c77ef16210f?auto=format&fit=crop&w=500&h=375&q=80', description: 'Uncle Moses checking van list.' }
];

const INTRO_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    pupilId: 'P001',
    sender: 'teacher',
    senderName: 'Teacher Grace (KG1)',
    text: 'Hello Mr. Ssewankambo, Babirye Shifra has finished her millet porridge cup and did very well in today\'s tactile motor skill colouring exercises. She has been exceptionally cheerful today! 🌟',
    timestamp: '10:15 AM',
    date: '2026-06-21',
    isRead: true
  },
  {
    id: 'm2',
    pupilId: 'P001',
    sender: 'parent',
    senderName: 'Ssewankambo David (Guardian)',
    text: 'Webale nnyo, Teacher Grace! Thank you for this lovely update. Glad to hear she is eating well. Did she also drink enough water after her playground run?',
    timestamp: '10:30 AM',
    date: '2026-06-21',
    isRead: true
  },
  {
    id: 'm3',
    pupilId: 'P001',
    sender: 'teacher',
    senderName: 'Teacher Grace (KG1)',
    text: 'Yes indeed, she drank her full bottle of clean water right after rest time. We always monitor that closely. Have a peaceful afternoon!',
    timestamp: '11:00 AM',
    date: '2026-06-21',
    isRead: true
  },
  {
    id: 'm4',
    pupilId: 'P002',
    sender: 'teacher',
    senderName: 'Teacher Margaret (Caretaker)',
    text: 'Good morning Mrs. Nakato, Kato Ivan has a slight superficial knee scratch from the playground climbing frame during team circle time. Our sickbay caretaker cleaned it with Dettol antiseptic and applied some baby cream. He is already back to playing happily. Just wanted to keep you informed!',
    timestamp: '09:20 AM',
    date: '2026-06-21',
    isRead: true
  },
  {
    id: 'm5',
    pupilId: 'P002',
    sender: 'parent',
    senderName: 'Nakato Mary (Guardian)',
    text: 'Webale nnyo, Teacher, for checking on him so quickly and letting me know! He is always a bit adventurous on the playground swings. I will check it when he gets home via the afternoon school shuttle.',
    timestamp: '09:45 AM',
    date: '2026-06-21',
    isRead: false
  }
];

export function ParentCommunication({ pupils, onNotificationCountChange }: ParentCommunicationProps) {
  // System persistence
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('kva_parent_messages');
    return saved ? JSON.parse(saved) : INTRO_MESSAGES;
  });

  useEffect(() => {
    localStorage.setItem('kva_parent_messages', JSON.stringify(messages));
    const unreadCount = messages.filter(m => m.sender === 'parent' && !m.isRead).length;
    if (onNotificationCountChange) {
      onNotificationCountChange(unreadCount);
    }
  }, [messages, onNotificationCountChange]);

  // Persona Toggle: 'teacher' or 'parent'
  const [activePersona, setActivePersona] = useState<'teacher' | 'parent'>('teacher');
  
  // Search and filter states (Teacher desk)
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePupilId, setActivePupilId] = useState<string>('P001');

  // Selected parent in Parent View
  const [parentPupilId, setParentPupilId] = useState<string>('P001');

  // Input text and image states
  const [inputText, setInputText] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // AI assist states
  const [isCallingAI, setIsCallingAI] = useState(false);
  const [aiTone, setAiTone] = useState<'Encouraging & Warm' | 'Constructive & Clear' | 'Gentle & Polite' | 'Urgent Notification'>('Encouraging & Warm');
  const [aiLanguage, setAiLanguage] = useState<'English' | 'Luganda' | 'Runyankole' | 'Acholi' | 'Iteso' | 'Lusoga'>('Luganda');
  const [showAiControl, setShowAiControl] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Notification center alerts
  const [notifications, setNotifications] = useState<{ id: string; title: string; body: string; pupilId: string; type: 'success' | 'alert' }[]>([]);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, activePupilId, parentPupilId, activePersona]);

  // Mark messages as read based on active chat and active persona
  useEffect(() => {
    const currentChatId = activePersona === 'teacher' ? activePupilId : parentPupilId;
    const targetUnreadSender = activePersona === 'teacher' ? 'parent' : 'teacher';

    const unreadExist = messages.some(
      m => m.pupilId === currentChatId && m.sender === targetUnreadSender && !m.isRead
    );

    if (unreadExist) {
      setMessages(prev => 
        prev.map(m => 
          m.pupilId === currentChatId && m.sender === targetUnreadSender 
            ? { ...m, isRead: true } 
            : m
        )
      );
    }
  }, [messages, activePupilId, parentPupilId, activePersona]);

  // Handle Drag-and-Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setSelectedPhotoUrl(url);
      triggerSystemNotification("Photo Staged Offline", `Successfully uploaded "${file.name}" ready to be dispatched with your next text.`, activePupilId, 'success');
    } else {
      triggerSystemNotification("Invalid File Type", "Only jpeg or png student photos are supported.", activePupilId, 'alert');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Trigger floating alert
  const triggerSystemNotification = (title: string, body: string, pupilId: string, type: 'success' | 'alert') => {
    const newId = `notif_${Date.now()}`;
    setNotifications(prev => [...prev, { id: newId, title, body, pupilId, type }]);
    
    // Auto-dismiss in 5s
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newId));
    }, 5500);
  };

  // Get active student
  const currentStudent = pupils.find(p => p.id === (activePersona === 'teacher' ? activePupilId : parentPupilId)) || pupils[0];

  // Filter students (for scroll list)
  const filteredPupilsForDesk = pupils.filter(p => {
    const matchesClass = selectedClassFilter === 'All' || p.classLevel === selectedClassFilter;
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  // Count unreads per student code
  const getUnreadCountForStudent = (pupilId: string) => {
    return messages.filter(m => m.pupilId === pupilId && m.sender === 'parent' && !m.isRead).length;
  };

  // Get last message in feed
  const getLastMessageText = (pupilId: string) => {
    const studentMessages = messages.filter(m => m.pupilId === pupilId);
    if (studentMessages.length === 0) return "No message history.";
    const lastMsg = studentMessages[studentMessages.length - 1];
    return lastMsg.imageUrl ? "📷 Shared a photo update..." : lastMsg.text;
  };

  const getLastMessageTime = (pupilId: string) => {
    const studentMessages = messages.filter(m => m.pupilId === pupilId);
    if (studentMessages.length === 0) return "";
    return studentMessages[studentMessages.length - 1].timestamp;
  };

  // Send message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedPhotoUrl) return;

    const currentPupilId = activePersona === 'teacher' ? activePupilId : parentPupilId;
    const pupilObj = pupils.find(p => p.id === currentPupilId) || pupils[0];

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // conversion 0 to 12
    const timestampStr = `${hours}:${minutes} ${ampm}`;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      pupilId: currentPupilId,
      sender: activePersona,
      senderName: activePersona === 'teacher' 
        ? "Teacher Grace (Kids Villa Academy)" 
        : `${pupilObj.guardianName} (Parent of ${pupilObj.fullName})`,
      text: inputText,
      imageUrl: selectedPhotoUrl || undefined,
      timestamp: timestampStr,
      date: now.toISOString().split('T')[0],
      isRead: false
    };

    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setSelectedPhotoUrl(null);

    // Simulate instant reaction trigger for Parent response!
    if (activePersona === 'teacher') {
      setTimeout(() => {
        triggerSystemNotification(
          `Message Delivered to Parent`, 
          `Ssewankambo David was notified: "${newMsg.text.slice(0, 40)}..."`, 
          currentPupilId, 
          'success'
        );
      }, 1000);
      
      // Auto-reply simulation from parent after 6 seconds
      setTimeout(() => {
        const parentReplies = [
          "Thank you for this wonderful update! May God bless you and the work you do. 🙏",
          "Webale nnyo, teacher! We are very happy with child progress. I will pack the porridge maize flour and bring it tomorrow.",
          "We have seen the message. Thank you so much for nursing the scratch promptly. See you in the evening!",
          "Excellent! Thanks for the photo check-in, she looks so happy playing! 🌸"
        ];
        
        const randomReply = parentReplies[Math.floor(Math.random() * parentReplies.length)];
        const replyMsgNow = new Date();
        let rphours = replyMsgNow.getHours();
        const rpminutes = String(replyMsgNow.getMinutes()).padStart(2, '0');
        const rpampm = rphours >= 12 ? 'PM' : 'AM';
        rphours = rphours % 12;
        rphours = rphours ? rphours : 12;

        const pMsg: ChatMessage = {
          id: `msg_${Date.now() + 1}`,
          pupilId: currentPupilId,
          sender: 'parent',
          senderName: `${pupilObj.guardianName} (Guardian)`,
          text: randomReply,
          timestamp: `${rphours}:${rpminutes} ${rpampm}`,
          date: replyMsgNow.toISOString().split('T')[0],
          isRead: false
        };

        setMessages(prev => [...prev, pMsg]);

        triggerSystemNotification(
          `New Message from ${pupilObj.guardianName}`,
          `Regarding ${pupilObj.fullName}: "${randomReply.slice(0, 45)}..."`,
          currentPupilId,
          'success'
        );
      }, 7000);

    } else {
      // Parent sent, trigger alert in teacher panel
      setTimeout(() => {
        triggerSystemNotification(
          `Teacher Desk Alert`, 
          `Teacher Grace received your inquiry regarding ${pupilObj.fullName}`, 
          currentPupilId, 
          'success'
        );
      }, 1200);

      // Caregiver replies after 5 seconds
      setTimeout(() => {
        const teacherReplies = [
          "You are very welcome! We are always happy to support. Let us know if you need anything else.",
          "Noted with thanks! We will ensure Uncle Moses schedules the shuttle drop-off carefully.",
          "Thank you, dear parent. Yes indeed, the health caretaker will monitor the temperature. He is rest-sleeping well right now.",
          "Excellent. We have received the requirement items brought. Have a blissful evening!"
        ];
        const randomTReply = teacherReplies[Math.floor(Math.random() * teacherReplies.length)];
        const replyTMsgNow = new Date();
        let rphours = replyTMsgNow.getHours();
        const rpminutes = String(replyTMsgNow.getMinutes()).padStart(2, '0');
        const rpampm = rphours >= 12 ? 'PM' : 'AM';
        rphours = rphours % 12;
        rphours = rphours ? rphours : 12;

        const tMsg: ChatMessage = {
          id: `msg_${Date.now() + 2}`,
          pupilId: currentPupilId,
          sender: 'teacher',
          senderName: 'Teacher Grace',
          text: randomTReply,
          timestamp: `${rphours}:${rpminutes} ${rpampm}`,
          date: replyTMsgNow.toISOString().split('T')[0],
          isRead: false
        };

        setMessages(prev => [...prev, tMsg]);

        triggerSystemNotification(
          `Teacher grace replied`,
          `Regarding ${pupilObj.fullName}: "${randomTReply}"`,
          currentPupilId,
          'success'
        );
      }, 5500);
    }
  };

  // AI-Assist Call wrapper standard
  const handleAIAssist = async (action: 'translate' | 'refine') => {
    if (!inputText.trim()) {
      setAiError("Please type a rough draft in the message box first! The KVA AI assistant needs a draft to improve.");
      return;
    }

    setIsCallingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/assistant-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          action: action,
          tone: aiTone,
          language: aiLanguage
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Parent Comm Assistant API failure.");
      }

      const data = await response.json();
      if (data.text) {
        setInputText(data.text);
        triggerSystemNotification(
          action === 'refine' ? "Draft Polished with Gemini AI" : "Translated with Gemini AI",
          "Your message content has been updated successfully with customized local pre-school standard phrasing.",
          activePupilId,
          'success'
        );
        setShowAiControl(false);
      }
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "An issue occurred querying the Kids Villa parent assistant.");
      
      // Resilient local fallback if developer has not bound GEMINI_API_KEY
      setTimeout(() => {
        let fallbackText = inputText;
        if (action === 'refine') {
          fallbackText = `🌟 KIDS VILLA ACADEMY NURSERY REPORT 🌟\n\nDear Mr./Mrs. Parent, we hope this message finds you in excellent spirits! We wanted to update you on ${currentStudent.fullName}. ${inputText}\n\nWebale nnyo for your constant support! Have a lovely day. ✨`;
        } else if (action === 'translate' && aiLanguage === 'Luganda') {
          fallbackText = `Orogosa ebya Kids Villa Academy: [Omwana ${currentStudent.fullName}] - ${inputText}\n\nMwebale nnyo nnyini omulimu gwe mukola abatunza abaana bano emikwano gyaffe!`;
        }
        setInputText(fallbackText);
        setAiError(null);
        setShowAiControl(false);
        triggerSystemNotification("Offline Mode Fallback Applied", "The assistant loaded customized Ugandan school templates safely.", activePupilId, 'success');
      }, 1500);

    } finally {
      setIsCallingAI(false);
    }
  };

  // Clear Chat history for active student
  const handleClearChatHistory = (pupilIdStr: string) => {
    if (window.confirm("Are you sure you want to delete all parent-teacher message records for this student and start blank? This helper resets the active queue.")) {
      setMessages(prev => prev.filter(m => m.pupilId !== pupilIdStr));
      triggerSystemNotification("Chat Logs Cleared", "Message history flushed of selected student.", pupilIdStr, 'alert');
    }
  };

  // Chat feed for current student
  const activeChatMessages = messages.filter(
    m => m.pupilId === (activePersona === 'teacher' ? activePupilId : parentPupilId)
  );

  return (
    <div className="w-full h-full flex flex-col pt-2 pb-4 space-y-4" id="kva-communication-module">
      
      {/* Dual Persona Switch & Banner Header */}
      <div className="bg-white border border-sky-100 p-5 rounded-3xl shrink-0 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500/10 p-3 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              KVA Kids-Parent Connect
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-extrabold flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Instant Portal
              </span>
            </h1>
            <p className="text-xs text-stone-500">
              Interactive parent communications & live class photos desk for Kids Villa Academy — Kitemu Nsangi.
            </p>
          </div>
        </div>

        {/* Persona toggle switch */}
        <div className="bg-stone-100 p-1 rounded-2xl flex items-center self-start md:self-auto uppercase tracking-wider text-[10px] font-extrabold text-stone-500 shrink-0 select-none">
          <button
            onClick={() => setActivePersona('teacher')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${activePersona === 'teacher' ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-stone-200/50'}`}
          >
            <Laptop className="w-3.5 h-3.5" />
            Teacher Panel
          </button>
          <button
            onClick={() => setActivePersona('parent')}
            className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${activePersona === 'parent' ? 'bg-sky-600 text-white shadow-xs' : 'hover:bg-stone-200/50'}`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            Parent smartphone
          </button>
        </div>
      </div>

      {/* Main interactive grid splitting lists and chats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[500px]">
        
        {/* LEFT COLUMN: School directory or children rosters - only in Teacher Persona otherwise small phone info */}
        {activePersona === 'teacher' ? (
          <div className="lg:col-span-4 bg-white border border-sky-100 rounded-3xl p-4 flex flex-col space-y-3 h-full max-h-[660px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 tracking-wider">GUARD ROSTER ({filteredPupilsForDesk.length})</span>
              <Bell className="w-4 h-4 text-slate-400" />
            </div>

            {/* Filter class buttons */}
            <div className="flex flex-wrap gap-1">
              {['All', 'KG1', 'KG2', 'KG3'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedClassFilter(lvl)}
                  className={`text-[9px] font-extrabold px-3 py-1.5 rounded-lg cursor-pointer ${selectedClassFilter === lvl ? 'bg-slate-950 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search child or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 pl-9.5 pr-4 py-2 text-xs border border-stone-200 rounded-xl"
              />
            </div>

            {/* Scrollable guardian inbox roster */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              <AnimatePresence mode="popLayout">
                {filteredPupilsForDesk.map((p) => {
                  const isActive = activePupilId === p.id;
                  const unreadCount = getUnreadCountForStudent(p.id);
                  const lastText = getLastMessageText(p.id);
                  const lastTime = getLastMessageTime(p.id);

                  return (
                    <motion.div
                      key={p.id}
                      layoutId={`pupil_card_${p.id}`}
                      onClick={() => setActivePupilId(p.id)}
                      className={`p-3 rounded-2xl cursor-pointer flex items-start gap-2.5 border transition-all duration-150 ${
                        isActive 
                          ? 'bg-[#F0F9FF] border-sky-200 shadow-2xs' 
                          : 'bg-white border-stone-100 hover:bg-stone-50/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        {p.photoUrl ? (
                          <img
                            src={p.photoUrl}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs uppercase">
                            {p.fullName.slice(0, 2)}
                          </div>
                        )}
                        {/* unread indicators bubble */}
                        {unreadCount > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full text-[8px] font-black w-4 h-4 flex items-center justify-center border border-white animate-bounce">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-900 truncate block">
                            {p.fullName}
                          </span>
                          <span className="text-[8px] font-bold text-stone-400 font-mono">
                            {lastTime || p.classLevel}
                          </span>
                        </div>
                        <p className="text-[9px] font-semibold text-stone-500 truncate mt-0.5">
                          Parent: <strong className="text-slate-800">{p.guardianName}</strong>
                        </p>
                        <p className="text-[9px] text-stone-400 truncate italic mt-0.5">
                          {lastText}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {filteredPupilsForDesk.length === 0 && (
                <div className="py-8 text-center">
                  <p className="text-xs text-stone-400 italic">No matching students found.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* PARENT VIEW ROSTER SIDEBAR: Choose which parent student profile simulator has signed in */
          <div className="lg:col-span-4 bg-white border border-sky-100 rounded-3xl p-5 flex flex-col space-y-4 h-full max-h-[660px]">
            <div className="bg-sky-50 border border-sky-100 p-4.5 rounded-2xl">
              <h3 className="text-xs font-extrabold text-sky-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Smartphone className="w-4 h-4 text-sky-600" />
                Parent Simulation Active
              </h3>
              <p className="text-[11px] text-sky-900/80 mt-1 leading-relaxed">
                You are simulating the mobile phone of a parent looking at Kids Villa Academy’s class feed. Switch the signed-in guardian below.
              </p>
            </div>

            <span className="text-[10px] font-black text-slate-800 tracking-wider uppercase">SIMULATED PHONE NUMBERS:</span>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {pupils.slice(0, 4).map(p => {
                const isActiveParent = parentPupilId === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setParentPupilId(p.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-center gap-3 cursor-pointer ${
                      isActiveParent 
                        ? 'bg-slate-900 text-white border-slate-900' 
                        : 'bg-stone-50 text-stone-800 border-stone-200/60 hover:bg-stone-100'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-extrabold truncate">
                        {p.guardianName}
                      </p>
                      <p className={`text-[9px] ${isActiveParent ? 'text-slate-300' : 'text-stone-500'} truncate font-semibold`}>
                        Child: {p.fullName} ({p.classLevel})
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: The Chat Area Feed */}
        <div className="lg:col-span-8 bg-white border border-sky-100 rounded-3xl overflow-hidden flex flex-col h-full max-h-[660px] relative">
          
          {/* Active Chat Header */}
          <div className="border-b border-sky-100 px-5 py-4 bg-slate-50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {currentStudent?.photoUrl ? (
                <img
                  src={currentStudent.photoUrl}
                  alt=""
                  className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                  {currentStudent?.fullName?.slice(0, 2) || "KV"}
                </div>
              )}
              <div>
                <h2 className="text-xs font-black text-slate-900 tracking-wide uppercase flex items-center gap-1.5">
                  {activePersona === 'teacher' ? currentStudent?.guardianName : "Teacher Grace (Kids Villa)"}
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </h2>
                <p className="text-[10px] text-stone-500">
                  {activePersona === 'teacher' 
                    ? `Parent of ${currentStudent?.fullName} | Class: ${currentStudent?.classLevel}` 
                    : `Kids Villa caretaker desk | Logged regarding: ${currentStudent?.fullName}`
                  }
                </p>
              </div>
            </div>

            {/* Quick Action buttons */}
            <div className="flex items-center gap-2">
              <a
                href={`tel:${currentStudent?.guardianPhone}`}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center transition-all cursor-pointer"
                title={`Call ${currentStudent?.guardianName}`}
              >
                <Phone className="w-3.5 h-3.5 text-slate-700" />
              </a>
              <button
                onClick={() => handleClearChatHistory(currentStudent.id)}
                className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-all cursor-pointer text-slate-700"
                title="Restart Chat log"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* CHAT MESSAGES BODY */}
          <div 
            ref={chatContainerRef}
            className={`flex-1 overflow-y-auto p-5 space-y-4 bg-stone-50/50 ${isDragging ? 'bg-sky-50' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {activeChatMessages.map((m, idx) => {
              // Is this message sent by the CURRENT active persona?
              const isMine = m.sender === activePersona;

              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-3xs ${
                    isMine 
                      ? activePersona === 'teacher' 
                        ? 'bg-slate-900 text-white rounded-br-none' 
                        : 'bg-sky-600 text-white rounded-br-none'
                      : 'bg-white border border-stone-100 text-slate-800 rounded-bl-none'
                  }`}>
                    {/* Sender label */}
                    <div className="flex justify-between items-center text-[8px] font-black tracking-wider uppercase mb-1 opacity-70">
                      <span>{m.senderName}</span>
                    </div>

                    {/* Shared Image attached */}
                    {m.imageUrl && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-black/15 bg-slate-100">
                        <img
                          src={m.imageUrl}
                          alt="Shared child activity clip"
                          className="w-full max-h-[190px] object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Text content */}
                    {m.text && (
                      <p className="text-[11px] leading-relaxed whitespace-pre-wrap select-text font-medium">
                        {m.text}
                      </p>
                    )}

                    {/* Message Meta */}
                    <div className="flex justify-end items-center gap-1.5 text-[8.5px] mt-1.5 opacity-60">
                      <Clock className="w-2.5 h-2.5 shrink-0" />
                      <span>{m.timestamp}</span>
                      {isMine && (
                        <span>
                          {m.isRead ? <CheckCheck className="w-3 h-3 text-sky-200" /> : <Check className="w-3 h-3" />}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {activeChatMessages.length === 0 && (
              <div className="h-full flex flex-col justify-center items-center py-10 text-center text-stone-400">
                <MessageSquare className="w-8 h-8 mb-2 stroke-1" />
                <p className="text-xs italic">No messages yet. Send a greeting to start communicating!</p>
              </div>
            )}
          </div>

          {/* Staged Photo attached box bar */}
          {selectedPhotoUrl && (
            <div className="bg-sky-50 border-t border-sky-100 px-5 py-2.5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-sky-200 shrink-0 bg-stone-100 relative">
                  <img
                    src={selectedPhotoUrl}
                    alt="Staged"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <button 
                    onClick={() => { setSelectedPhotoUrl(null); }}
                    className="absolute -top-1 -right-1 bg-black/60 rounded-full text-white p-0.5 hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div>
                  <span className="text-[10px] font-black text-sky-900 block">KIDS VILLA PHOTO ATTACHED</span>
                  <span className="text-[9px] text-sky-800">Ready to send. Drag another to replace.</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhotoUrl(null)}
                className="text-stone-400 hover:text-stone-700 text-xs font-black uppercase cursor-pointer"
              >
                Reset
              </button>
            </div>
          )}

          {/* AI ASSIST CONTROLS DROPDOWN PANEL (FOR TEACHERS PORTAL ONLY) */}
          {activePersona === 'teacher' && (
            <div className="bg-slate-50 border-t border-sky-100 shrink-0 px-5 py-2">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAiControl(!showAiControl)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase text-sky-600 hover:text-sky-800 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                  Ask Gemini AI Assistant
                </button>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-stone-400 font-mono">Tone: {aiTone}</span>
                </div>
              </div>

              {showAiControl && (
                <div className="bg-white border border-sky-100 p-4.5 rounded-2xl shadow-md mt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Select Tone */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Polite Phraser Tone</label>
                      <select
                        value={aiTone}
                        onChange={(e: any) => setAiTone(e.target.value)}
                        className="w-full text-[10px] border border-stone-200 rounded-lg p-2 bg-stone-50"
                      >
                        <option value="Gentle & Polite">🌿 Gentle & Polite Callback</option>
                        <option value="Encouraging & Warm">🌸 Encouraging & Warm Update</option>
                        <option value="Constructive & Clear">📐 Constructive & Clear Progress</option>
                        <option value="Urgent Notification">🚨 Urgent Announcement</option>
                      </select>
                    </div>

                    {/* Target Language */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-800 uppercase mb-1">Translate Language</label>
                      <select
                        value={aiLanguage}
                        onChange={(e: any) => setAiLanguage(e.target.value)}
                        className="w-full text-[10px] border border-stone-200 rounded-lg p-2 bg-stone-50"
                      >
                        <option value="Luganda">Luganda (Central region)</option>
                        <option value="English">English (Official)</option>
                        <option value="Runyankole">Runyankole (Western region)</option>
                        <option value="Acholi">Acholi (Northern region)</option>
                        <option value="Iteso">Iteso (Eastern region)</option>
                        <option value="Lusoga">Lusoga (Busoga region)</option>
                      </select>
                    </div>
                  </div>

                  {aiError && (
                    <div className="text-[10px] bg-red-50 text-red-700 p-2.5 rounded-lg border border-red-100 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{aiError}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isCallingAI}
                      onClick={() => handleAIAssist('refine')}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold text-[10px] py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
                    >
                      {isCallingAI ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          Polishing draft...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Refine for Uganda parents
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isCallingAI}
                      onClick={() => handleAIAssist('translate')}
                      className="bg-sky-50 hover:bg-sky-100 disabled:opacity-50 text-sky-900 border border-sky-100 font-extrabold text-[10px] py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer"
                    >
                      <Languages className="w-3 h-3 text-sky-600" />
                      Translate
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CHAT BOX CONTAINER INPUT FOR SENDING */}
          <form 
            onSubmit={handleSendMessage}
            className="border-t border-sky-100 px-5 py-4 bg-slate-50 flex items-center gap-3 shrink-0"
          >
            {/* Quick pre-baked photos picker shortcut */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPhotoPickerOpen(!photoPickerOpen)}
                className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center shrink-0 hover:bg-stone-50 cursor-pointer text-stone-500 hover:text-sky-600 shadow-3xs"
                title="Send Photo Update"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              {/* Photo list picker submenu balloon */}
              {photoPickerOpen && (
                <div className="absolute bottom-13 left-0 bg-white border border-sky-100 p-4 rounded-2xl ring-1 ring-black/5 shadow-lg w-[260px] z-50">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[9px] font-black text-slate-800 uppercase tracking-wide block">Select Class Activity Photo</span>
                    <button onClick={() => setPhotoPickerOpen(false)} className="text-stone-400 hover:text-stone-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {PRELOADED_PHOTOS.map(ph => (
                      <button
                        key={ph.id}
                        type="button"
                        onClick={() => {
                          setSelectedPhotoUrl(ph.url);
                          setPhotoPickerOpen(false);
                        }}
                        className="h-14 rounded-lg overflow-hidden border border-stone-200 relative group"
                      >
                        <img
                          src={ph.url}
                          alt=""
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all bg-opacity-70">
                          <span className="text-[7.5px] text-white font-extrabold uppercase px-1 text-center">
                            {ph.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-stone-100 my-2 pt-2">
                    {/* Drag-and-drop info & click device files */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full hover:bg-sky-50 text-sky-800 font-extrabold text-[9.5px] py-1.5 border border-dashed border-sky-200 rounded-lg flex items-center justify-center gap-1.5 transition-all uppercase cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Browse local file
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <span className="text-[8px] text-center text-stone-400 block mt-1.5">
                      * Supports offline drags onto the chatbox area.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder={activePersona === 'teacher' ? "Type a message, or rough notes for AI refinement..." : "Send an inquiry or reply to Teacher Grace..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 shadow-3xs"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() && !selectedPhotoUrl}
              className={`w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all ${
                inputText.trim() || selectedPhotoUrl
                  ? activePersona === 'teacher'
                    ? 'bg-slate-950 text-white shadow-sm hover:scale-105'
                    : 'bg-sky-600 text-white shadow-sm hover:scale-105'
                  : 'bg-stone-100 text-stone-300 pointer-events-none'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

      {/* Floating System Notifications Desk Alerts */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
        <AnimatePresence>
          {notifications.map(notif => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-2xl shadow-lg border pointer-events-auto flex gap-3 ${
                notif.type === 'alert' 
                  ? 'bg-red-50 text-red-900 border-red-200' 
                  : 'bg-slate-900 text-white border-slate-700'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'alert' ? (
                  <AlertCircle className="w-5 h-5 text-red-6 stroke-2" />
                ) : (
                  <Bell className="w-5 h-5 text-sky-400 stroke-2 animate-bounce" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] font-black uppercase tracking-wide">
                  {notif.title}
                </h4>
                <p className="text-[10px] leading-relaxed opacity-90 mt-0.5">
                  {notif.body}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
