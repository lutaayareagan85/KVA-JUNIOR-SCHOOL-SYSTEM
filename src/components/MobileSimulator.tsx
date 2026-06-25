import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Bell, Heart, Bus, Star, ClipboardCheck, BookOpen, Layers, Send, 
  Award, Calendar, CreditCard, MessageSquare, Settings, LogOut, ShieldCheck, 
  CheckCircle2, Sliders, Sparkles, User, Users, Sun, Coffee, BookMarked, 
  Compass, Check, ArrowRight, Play, RotateCcw, HelpCircle, Lock, Phone, 
  UserX, Trash2, ChevronRight, Gift, Activity, MapPin, Eye, Zap, RefreshCw
} from 'lucide-react';

type Persona = 'parent' | 'teacher' | 'pupil' | 'admin';
type MobileScreen = 'splash' | 'login' | 'dashboard' | 'progress' | 'attendance' | 'fees' | 'messages' | 'settings';

interface ChildProfile {
  id: string;
  name: string;
  class: string;
  photo: string;
  age: string;
  porridgePreference: string;
  attendanceRate: string;
  outstandingBalance: number;
  skills: {
    language: { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
    cognitive: { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
    physical: { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
    creative: { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
    social: { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
  };
}

interface SmsMessage {
  id: string;
  sender: string;
  recipient: string;
  msg: string;
  time: string;
  category: 'transit' | 'finance' | 'health' | 'merit' | 'administrative';
}

interface Announcement {
  id: string;
  title: string;
  date: string;
  category: 'event' | 'holiday' | 'alert';
  excerpt: string;
  read: boolean;
}

export function MobileSimulator({ 
  studentsCount = 45, 
  presentCount = 42 
}: { 
  studentsCount?: number; 
  presentCount?: number; 
}) {
  // Main simulator control levels
  const [activePersona, setActivePersona] = useState<Persona>('parent');
  const [currentScreen, setCurrentScreen] = useState<MobileScreen>('splash');
  const [activeDevice, setActiveDevice] = useState<'smartphone' | 'tablet' | 'desktop'>('smartphone');
  const [unreadNotifications, setUnreadNotifications] = useState(4);
  const [selectedChildId, setSelectedChildId] = useState<string>('babirye_shifra');
  
  // Mobile money payment simulator states
  const [momoPhoneNumber, setMomoPhoneNumber] = useState('');
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [momoPin, setMomoPin] = useState('');
  const [repayingAmount, setRepayingAmount] = useState<number>(150000);
  const [paymentStep, setPaymentStep] = useState<'idle' | 'processing' | 'done'>('idle');
  
  // Custom message inputs
  const [newSmsMsg, setNewSmsMsg] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [chatThread, setChatThread] = useState<Array<{ sender: 'parent' | 'teacher'; text: string; time: string }>>([
    { sender: 'teacher', text: 'Good morning! Shifra has arrived and is feeling very cheerful. Normal temperature recorded.', time: '08:15 AM' },
    { sender: 'parent', text: 'Thank you for the update! Please remind her to drink her afternoon fluids.', time: '08:42 AM' }
  ]);

  // Children mock database inside the simulator
  const [childrenDb, setChildrenDb] = useState<ChildProfile[]>([
    {
      id: 'babirye_shifra',
      name: 'Babirye Shifra',
      class: 'KG2 (Zebra)',
      photo: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=150&auto=format&fit=crop&q=80',
      age: '4 Years',
      porridgePreference: 'Sugar porridge (No milk)',
      attendanceRate: '96%',
      outstandingBalance: 150000,
      skills: {
        language: { score: 85, status: 'Achieved', remarks: 'Enjoys phonetic rhythm play and identifying local animal names.' },
        cognitive: { score: 78, status: 'Progressing', remarks: 'Good at coloring nested geometric frames; sorting matches nicely.' },
        physical: { score: 92, status: 'Achieved', remarks: 'Excellent balance during outdoor hopping, plays safely with peer circles.' },
        creative: { score: 65, status: 'Progressing', remarks: 'Developing correct finger grip control for paint brush strokes.' },
        social: { score: 80, status: 'Achieved', remarks: 'Consistently shares playground blocks and respects sharing limits.' }
      }
    },
    {
      id: 'mugisha_brian',
      name: 'Mugisha Brian',
      class: 'KG1 (Ducklings)',
      photo: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=150&auto=format&fit=crop&q=80',
      age: '3 Years',
      porridgePreference: 'Milk porridge with honey',
      attendanceRate: '92%',
      outstandingBalance: 0,
      skills: {
        language: { score: 62, status: 'Progressing', remarks: 'Learning simple 3-syllable chants. Expanding vocabulary day-by-day.' },
        cognitive: { score: 88, status: 'Achieved', remarks: 'Extremely fast at jigsaw color assemblies. Recognizes basic symbols.' },
        physical: { score: 74, status: 'Progressing', remarks: 'Improving jumping exercises under guided sandpit activities.' },
        creative: { score: 82, status: 'Achieved', remarks: 'Highly expressive with clay modeling and structural free-draws.' },
        social: { score: 55, status: 'Needs Support', remarks: 'Struggles with toy separation anxiety. Teachers are counseling gently.' }
      }
    }
  ]);

  // Current active child instance inside simulator
  const activeChild = childrenDb.find(c => c.id === selectedChildId) || childrenDb[0];

  // Daily classroom logs simulated for today
  const [breakfastState, setBreakfastState] = useState<'Pending' | 'Completed'>('Completed');
  const [tempChecked, setTempChecked] = useState('36.4°C');
  const [activeMutedSms, setActiveMutedSms] = useState(false);
  
  // Real-time parents SMS simulator records (showing triggers)
  const [smsLogs, setSmsLogs] = useState<SmsMessage[]>([
    { 
      id: 'S1', 
      sender: 'Kids Villa Gate', 
      recipient: '0706-XXXXXX', 
      msg: 'KVA MOBILE LINK: Infant Babirye Shifra checked in successfully at 7:55 AM. Temperature recorded is 36.4°C. Have a lovely learning day!', 
      time: '07:56 AM',
      category: 'transit'
    },
    { 
      id: 'S2', 
      sender: 'Kids Villa Admin', 
      recipient: '0706-XXXXXX', 
      msg: 'Tuition Notification: Outstanding term fees for Babirye Shifra is UGX 150,000. Pay with ease on the portal via Mobile Money.', 
      time: '09:00 AM',
      category: 'finance'
    }
  ]);

  // Star collection state for Pupil zone
  const [pupilCoins, setPupilCoins] = useState(140);
  const [currentPupilGame, setCurrentPupilGame] = useState<'alphabet' | 'math' | 'colors'>('alphabet');
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>(['First Step Chant', 'Alphabet Maestro']);

  // Official school board announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: '1', title: '🐠 Swimming Gala & Fruit Festival', date: 'Fri, 26th June', category: 'event', excerpt: 'Pack additional dry clothes and a slice of watermelons or pineapples for the class share circle.', read: false },
    { id: '2', title: '🚍 Route 4 Bus Upgrades (Kitemu/Nsangi)', date: 'Mon, 29th June', category: 'alert', excerpt: 'New tracking signals added! The bus is transitioning to exact geofence triggers to match schedule timings.', read: false },
    { id: '3', title: '📅 Independence Day Half-term Break', date: 'Wed, 1st July', category: 'holiday', excerpt: 'Campus operations paused for three days. Learning logs will reside on tablet profiles.', read: true }
  ]);

  // Add notification event helper
  const triggerExternalSMSLog = (messageText: string, category: SmsMessage['category'] = 'administrative') => {
    const freshSms: SmsMessage = {
      id: `SMS_${Date.now()}`,
      sender: 'KVA Automated',
      recipient: '0706-XXXXXX',
      msg: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      category
    };
    setSmsLogs(prev => [freshSms, ...prev]);
    setUnreadNotifications(prev => prev + 1);
  };

  // Broadcast manual bulk SMS simulated from administration panel
  const handleTriggerSimSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSmsMsg.trim()) return;
    triggerExternalSMSLog(newSmsMsg, 'administrative');
    setNewSmsMsg('');
  };

  // Chat sender simulated on messages page
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    // add parent chat
    const parentText = chatMessage;
    setChatThread(prev => [...prev, { sender: 'parent', text: parentText, time: 'Just now' }]);
    setChatMessage('');

    // Trigger auto-reply from caregivers
    setTimeout(() => {
      setChatThread(prev => [
        ...prev, 
        { sender: 'teacher', text: `Dear parent, thank you for writing. Teacher Martha has logged this and will check in during play-rest hours. Web portal updated.`, time: 'Just now' }
      ]);
      triggerExternalSMSLog(`KVA CHAT ALERT: Your teacher sent a message response regarding your chat inquiry!`, 'administrative');
    }, 1500);
  };

  // Quick action helper: simulate checking porridge intake on Teacher console
  const handleLogPorridgeChecked = (studentId: string, kidName: string) => {
    if (breakfastState === 'Completed') {
      setBreakfastState('Pending');
      triggerExternalSMSLog(`STUDENT REPORT: Nutrition log for ${kidName} updated back to 'Pending' check-in.`, 'health');
    } else {
      setBreakfastState('Completed');
      triggerExternalSMSLog(`HEALTH REGISTER: ${kidName} consumed 100% of morning milk porridge. Preference correctly observed by kitchen caregivers.`, 'health');
    }
  };

  // Quick action helper: give merit coins directly from playground screen
  const handleAwardMeritPoints = (points: number, childName: string) => {
    // If we are parent, pupil coins increases
    setPupilCoins(prev => prev + points);
    triggerExternalSMSLog(`STARS RECOLLECTION: Congratulations! Caregiver awarded ${points} Star Coins to ${childName} for displaying active playground kindness.`, 'merit');
  };

  // Simulate checkout simulation sequence
  const handleSimulateMoMoPayment = () => {
    if (!momoPhoneNumber || !momoPin) {
      alert("Please enter a valid simulated Mobile Money number and 4-digit security PIN first.");
      return;
    }
    setPaymentStep('processing');
    
    setTimeout(() => {
      setPaymentStep('done');
      // Update outstanding balance inside childhood DB state
      setChildrenDb(prev => prev.map(child => {
        if (child.id === selectedChildId) {
          return { ...child, outstandingBalance: 0 };
        }
        return child;
      }));
      triggerExternalSMSLog(`FINANCE TRUST-PAY: UGX ${repayingAmount.toLocaleString()} successfully received for school fees account of ${activeChild.name}. Bank receipt ref: KVA_MOMO_${Date.now().toString().slice(-6)}.`, 'finance');
    }, 2000);
  };

  const handleResetPaymentSimulation = () => {
    setPaymentStep('idle');
    setMomoPin('');
    setMomoPhoneNumber('');
  };

  // Sync state between activePersona and simulated landing screens
  useEffect(() => {
    if (currentScreen !== 'splash' && currentScreen !== 'login') {
      // stay on dashboard or other subpages safely
    }
  }, [activePersona]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner introducing the redesign benefits */}
      <div className="bg-gradient-to-r from-sky-50 to-emerald-50 p-6 rounded-3xl border border-sky-100/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100/50 rounded-full blur-2xl -mr-8 -mt-8" />
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-sky-100 text-sky-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Premium Redesign</span>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full uppercase tracking-wider">Child-Friendly & Safe</span>
            </div>
            <h3 className="font-extrabold text-[#3D2B1F] text-xl tracking-tight">
              Interactive Nursery Mobile App Redesign Preview
            </h3>
            <p className="text-xs text-[#7D6B5D] max-w-2xl leading-relaxed">
              Experience the transformed, high-fidelity app mockup. Blending **warm educational aesthetics** with **executive administrative dashboards**, Kitemu Campus operates a modern, real-time responsive web experience that empowers parents, teachers, and administrators.
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                setCurrentScreen('splash');
                triggerExternalSMSLog("SIMULATION RESET: Reverted to first experience launch flow.");
              }}
              className="px-3.5 py-2 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-black rounded-xl border border-stone-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              alt="Reset flow"
            >
              <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> Reboot Demo
            </button>
          </div>
        </div>
      </div>

      {/* Device Viewport & Form-Factor Responsive Layout Switcher */}
      <div className="bg-[#FAF9F5] p-5 rounded-3xl border border-[#E0D8CC] shadow-2xs flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h4 className="font-extrabold text-sm text-[#4E3626] uppercase tracking-wider">Multi-Format Device Viewport Hub</h4>
          </div>
          <p className="text-[11px] text-[#7D6B5D] leading-normal">
            Visualize Kids Villa software scaled for modern smartphones, high-resolution classroom tablets, and administrative web portals.
          </p>
        </div>
        
        <div className="bg-stone-200/60 p-1.5 rounded-2xl flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {[
            { id: 'smartphone', name: '📱 Smartphone View', desc: 'Compact iOS/Android UI' },
            { id: 'tablet', name: '📟 Classroom Tablet', desc: 'Sleek iPad Multi-Pane' },
            { id: 'desktop', name: '💻 Executive Web Portal', desc: 'Full-Scale Desktop Dashboard' }
          ].map((device) => {
            const isSel = activeDevice === device.id;
            return (
              <button
                key={device.id}
                onClick={() => {
                  setActiveDevice(device.id as 'smartphone' | 'tablet' | 'desktop');
                  triggerExternalSMSLog(`VIEWPORT UPDATE: Switched simulator workspace to ${device.name}.`);
                }}
                className={`px-4.5 py-2.5 rounded-xl text-[11px] font-black transition-all cursor-pointer whitespace-nowrap flex-1 md:flex-initial text-center shadow-3xs ${
                  isSel 
                    ? 'bg-gradient-to-r from-[#4E3626] to-[#3A271A] text-white shadow-md' 
                    : 'text-stone-600 hover:text-stone-900 hover:bg-white/40'
                }`}
                title={device.desc}
              >
                {device.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: SIMULATOR CONTROL CONSOLE */}
        <div className={`${activeDevice === 'smartphone' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
          
          {/* Persona selector widget block */}
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-light-tonal-3 pb-3">
              <Compass className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-[#4E3626] uppercase tracking-wider">Switch Perspective Demo</h4>
            </div>
            <p className="text-[11px] text-[#7D6B5D] leading-normal">
              Toggle specific roles below to instantly customize the active app view and responsive tools inside the phone frame launcher:
            </p>
            
            <div className="flex flex-col gap-2.5">
              {[
                { id: 'parent', label: '👨‍👩‍👦 Child Parent Portal', subtitle: 'Check meals, GPS bus, pay school slips & marks', color: 'border-sky-200 hover:bg-sky-50/40' },
                { id: 'teacher', label: '👩‍🏫 Caregiver Classroom', subtitle: 'Track biometric porridge, log temperatures & awards', color: 'border-emerald-200 hover:bg-emerald-50/40' },
                { id: 'pupil', label: '🧸 Pupil Play Companion', subtitle: 'Child-friendly color sorting games & star collection', color: 'border-yellow-200 hover:bg-yellow-50/30' },
                { id: 'admin', label: '💼 Campus Administrator', subtitle: 'Track revenue, staff appraisal & district compliance', color: 'border-stone-200 hover:bg-stone-50/40' }
              ].map((pers) => (
                <button
                  key={pers.id}
                  onClick={() => {
                    setActivePersona(pers.id as Persona);
                    // if currently on login/splash, we keep but if dashboard is open, make sure it reflects
                    if (currentScreen === 'splash' || currentScreen === 'login') {
                      setCurrentScreen('dashboard');
                    }
                    triggerExternalSMSLog(`ROLE CONNECTED: Session swiped into general workspace of [${pers.label}].`);
                  }}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-0.5 ${
                    activePersona === pers.id
                      ? 'bg-gradient-to-r from-emerald-50/70 to-sky-50/50 border-emerald-500 shadow-sm text-neutral-900 font-extrabold'
                      : `bg-white text-neutral-600 ${pers.color}`
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-black text-xs">{pers.label}</span>
                    {activePersona === pers.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  </div>
                  <span className="text-[10px] text-neutral-500 leading-normal font-medium">{pers.subtitle}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick interactive parameters */}
          {activePersona === 'parent' && (
            <div className="bg-white p-5 rounded-3xl border border-[#E0D8CC] shadow-sm space-y-3.5">
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Parent Context Settings:</span>
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-bold block">Select Simulated Active Child:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => {
                      setSelectedChildId('babirye_shifra');
                      triggerExternalSMSLog("PORTAL SWAP: Switched focus to KG2 ledger for Shifra.", "administrative");
                    }} 
                    className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChildId === 'babirye_shifra' ? 'bg-sky-50 border-sky-400 text-sky-800' : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    👧 Shifra (KG2)
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedChildId('mugisha_brian');
                      triggerExternalSMSLog("PORTAL SWAP: Switched focus to KG1 progress logs for Brian.", "administrative");
                    }} 
                    className={`p-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      selectedChildId === 'mugisha_brian' ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-white border-stone-200 text-stone-600'
                    }`}
                  >
                    👦 Brian (KG1)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Developer quick-access triggers */}
          <div className="bg-[#FAF9F6] p-5 rounded-3xl border border-[#E0D8CC] space-y-4">
            <div className="space-y-1">
              <h5 className="font-extrabold text-[11px] text-[#5A3E2B] uppercase tracking-wider">SMS Transmitter Sandbox</h5>
              <p className="text-[10px] text-[#7D6B5D] leading-normal">
                Want to simulate a security gate trigger or healthy food log? Broadcast a message straight to the logs on the right:
              </p>
            </div>
            
            <form onSubmit={handleTriggerSimSMS} className="space-y-2">
              <textarea
                rows={2}
                placeholder="Write parents alert description (e.g. Bus delayed by 10 mins near Kampala Central...)"
                value={newSmsMsg}
                onChange={(e) => setNewSmsMsg(e.target.value)}
                className="w-full text-xs p-2.5 bg-white border border-stone-200 rounded-xl text-neutral-800 shadow-2xs focus:ring-1 focus:ring-emerald-500 font-medium placeholder-stone-400 resize-none"
              />
              <button
                type="submit"
                className="w-full bg-[#4E3626] hover:bg-[#3C281B] text-white py-2 rounded-xl text-xs font-black shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider"
              >
                <Send className="w-3.5 h-3.5 text-sky-300 animate-pulse" /> Dispatch SMS Alert
              </button>
            </form>
          </div>

          {/* If DESKTOP view is active, we stack the SMS logs directly in the Left Column controls panel to conserve space & ensure visibility! */}
          {activeDevice === 'desktop' && (
            <div className="bg-white p-5 rounded-3xl border border-[#E0D8CC] shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b border-light-tonal-3 pb-3">
                <div className="flex items-center gap-1.5 text-[#5A3E2B]">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  <h4 className="font-extrabold text-xs uppercase tracking-wider">Guardian SMS Handset Log</h4>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setSmsLogs([]);
                    setUnreadNotifications(0);
                  }}
                  className="p-1 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-rose-500 transition-all cursor-pointer"
                  title="Clear log alerts history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {smsLogs.length > 0 ? (
                  smsLogs.map((log) => {
                    const getCatColor = (cat: SmsMessage['category']) => {
                      switch (cat) {
                        case 'finance': return 'bg-rose-50 border-rose-200 text-rose-800';
                        case 'health': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
                        case 'merit': return 'bg-yellow-50 border-yellow-200 text-amber-900';
                        case 'transit': return 'bg-sky-50 border-sky-200 text-sky-800';
                        default: return 'bg-stone-50 border-stone-200 text-stone-800';
                      }
                    };

                    return (
                      <div key={log.id} className={`p-3 rounded-2xl border ${getCatColor(log.category)} text-[11px] leading-normal animate-fade-in font-semibold`}>
                        <div className="flex justify-between text-[8px] uppercase tracking-wider opacity-75 mb-1">
                          <span>{log.sender}</span>
                          <span>{log.time}</span>
                        </div>
                        <p>{log.msg}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-neutral-400 space-y-2">
                    <Smartphone className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
                    <p className="text-[10px] font-bold">No simulated logs triggered yet.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* MIDDLE COLUMN: THE INTEGRATED PREMIUM MOBILE DEVICE PHONE MOCKUP */}
        <div className={`${
          activeDevice === 'smartphone' ? 'lg:col-span-4' : activeDevice === 'tablet' ? 'lg:col-span-6' : 'lg:col-span-9'
        } flex justify-center w-full transition-all duration-300`}>
          
          {/* Custom iOS/Android Outer Frame Design */}
          <div className={`${
            activeDevice === 'smartphone' 
              ? 'w-[310px] h-[590px] bg-neutral-900 rounded-[44px] p-4 shadow-2xl border-[6px] border-neutral-800' 
              : activeDevice === 'tablet'
                ? 'w-[490px] h-[645px] bg-stone-900 rounded-[48px] p-5 shadow-2xl border-[8px] border-stone-850'
                : 'w-full h-[645px] bg-[#FAF9F5] rounded-3xl shadow-xl border border-[#E0D8CC]'
          } relative flex flex-col justify-between overflow-hidden select-none transition-all duration-300`}>
            
            {/* Elegant Phone Ear Notch Spacer */}
            {activeDevice === 'smartphone' && (
              <div className="absolute top-2 left-1/3 w-1/3 h-6 bg-neutral-900 rounded-b-xl z-30 flex justify-center items-center pb-1">
                <div className="w-10 h-1.5 bg-neutral-700/80 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-neutral-800 ml-1.5" />
              </div>
            )}
            {activeDevice === 'tablet' && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-stone-700 z-30" />
            )}

            {/* If DESKTOP/WEB outer container, we first render the top browser bar */}
            {activeDevice === 'desktop' && (
              <div className="bg-stone-100 px-4 py-2.5 border-b border-stone-200/60 flex items-center justify-between gap-3 shrink-0 select-none">
                <div className="flex gap-1.5 shrink-0">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 max-w-sm bg-white border border-stone-200/60 rounded-lg px-4 py-0.5 text-[9.5px] text-stone-500 font-mono text-center flex items-center justify-center gap-1.5 shadow-3xs">
                  <span className="text-emerald-500 leading-none">🔒</span> https://portal.kidsvillaacademy.sc.ug/{currentScreen}
                </div>
                <div className="flex gap-2 text-stone-400 text-xs items-center">
                  <span className="text-[9px] font-black uppercase text-stone-400 tracking-wider font-mono">KVA WEB ENGINE</span>
                </div>
              </div>
            )}

            {/* Inner high-contrast bright phone screen container */}
            <div className={`w-full h-full bg-[#FAF9F6] ${
              activeDevice === 'smartphone' || activeDevice === 'tablet' 
                ? 'rounded-[32px] flex flex-col justify-between' 
                : 'flex flex-row flex-1'
            } overflow-hidden relative text-xs`}>
              
              {/* DESKTOP SIDEBAR NAVIGATION (Drawn on Left of Web Portal only) */}
              {activeDevice === 'desktop' && (
                <div className="w-[190px] bg-[#5A3E2B] text-[#F3ECE5] p-3.5 flex flex-col justify-between shrink-0 border-r border-[#4E3626] animate-fade-in select-none">
                  <div className="space-y-6">
                    {/* Brand header */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-white text-[#5A3E2B] flex items-center justify-center font-black text-xs shadow-xs">
                          KV
                        </div>
                        <h5 className="font-extrabold text-[10.5px] tracking-tight uppercase leading-tight truncate">
                          Kids Villa Academy
                        </h5>
                      </div>
                      <div className="text-[8.5px] bg-[#4E3626] text-amber-100 font-semibold py-1 px-2 rounded-lg flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5 text-sky-300 animate-pulse" /> Kitemu Campus
                      </div>
                    </div>

                    {/* Navigation list */}
                    <div className="flex flex-col gap-1">
                      {[
                        { id: 'dashboard', name: '📊 Web Dashboard', screen: 'dashboard', log: 'Switched focus to Principal Web Dashboard.' },
                        { id: 'progress', name: '🧸 Skills Rubric', screen: 'progress', log: 'Inspected Uganda ECD skills from web.' },
                        { id: 'fees', name: '💳 Financial Ledger', screen: 'fees', log: 'Navigated to Tuition Billing checks.' },
                        { id: 'messages', name: '💬 Connection Chat', screen: 'messages', log: 'Opened messenger board.' }
                      ].map((menuItem) => {
                        const isMainSel = currentScreen === menuItem.screen;
                        return (
                          <button
                            key={menuItem.id}
                            type="button"
                            onClick={() => {
                              setCurrentScreen(menuItem.screen as MobileScreen);
                              triggerExternalSMSLog(`WEB NAV: ${menuItem.log}`);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[10px] font-black transition-all cursor-pointer flex items-center justify-between ${
                              isMainSel 
                                ? 'bg-[#FAF9F6] text-[#5A3E2B] shadow-sm font-black' 
                                : 'text-[#ECDCCB] hover:bg-neutral-800/10 hover:text-white'
                            }`}
                          >
                            <span>{menuItem.name}</span>
                            {isMainSel && <span className="w-1.5 h-1.5 bg-[#4E3626] rounded-full animate-ping" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Profile & reset */}
                  <div className="pt-4 border-t border-[#4E3626] space-y-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#FAF9F6] p-0.5 border border-[#E0D8CC]">
                        <img 
                          src={activeChild.photo} 
                          alt="Student Profile" 
                          className="w-full h-full rounded-full object-cover shadow-3xs" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-black text-white truncate leading-none mb-0.5">{activeChild.name}</p>
                        <p className="text-[8px] text-stone-300 truncate leading-none">{activeChild.class}</p>
                      </div>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setCurrentScreen('splash');
                        triggerExternalSMSLog("DEMORUN RESET: Locked session from full desktop view.");
                      }}
                      className="w-full text-center py-1.5 bg-[#4E3626] hover:bg-[#3C281B] text-white text-[9px] font-black uppercase rounded-lg border border-[#3C281B] cursor-pointer transition-all flex items-center justify-center gap-1"
                    >
                      <LogOut className="w-2.5 h-2.5 text-rose-350" /> Lock Terminal
                    </button>
                  </div>
                </div>
              )}

              {/* THE VIEWS CONTAINER: Displays as smartphone/tablet column stack, or right-hand panel of desktop sidebar */}
              <div className="flex-1 flex flex-col justify-between h-full overflow-hidden relative">
                
                {/* SYSTEM STATUS BAR (Only shown on Phone & Tablet formats) */}
                {activeDevice !== 'desktop' && (
                  <div className="bg-[#4E3626] text-[#F9ECE4] px-4.5 py-2 flex justify-between items-center text-[9px] font-extrabold z-20 pt-2.5 shrink-0 select-none">
                    <div className="flex items-center gap-1">
                      <Smartphone className="w-2.5 h-2.5 text-sky-300" />
                      <span>{activeDevice === 'tablet' ? 'KVA Tablet Pro' : 'KVA Mobile'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeDevice === 'tablet' && <span className="text-[7.5px] uppercase font-black bg-[#5A3E2B] px-1 text-emerald-300 rounded leading-none py-0.5">Tablet Mode</span>}
                      <span>12:02 PM</span>
                      <span>🔋 {activeDevice === 'tablet' ? '82%' : '98%'}</span>
                    </div>
                  </div>
                )}

              {/* CORE CUSTOM APP HEADER */}
              {currentScreen !== 'splash' && currentScreen !== 'login' && (
                <div className="bg-[#5A3E2B] text-white px-4 pb-3.5 pt-2 flex justify-between items-center shrink-0 shadow-sm relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-100 to-amber-100 border-[1.5px] border-white flex items-center justify-center font-black text-[#5A3E2B] text-xs shadow-xs select-none">
                      KV
                    </div>
                    <div>
                      <h4 className="font-extrabold leading-tight text-[11px] tracking-tight uppercase flex items-center gap-0.5">
                        Kids Villa Academy <ShieldCheck className="w-3 h-3 text-sky-300" />
                      </h4>
                      <p className="text-[8px] text-[#F2EDE4]/85 font-medium">Campus: Kitemu-Nsangi</p>
                    </div>
                  </div>

                  {/* Header action helpers */}
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => {
                        setCurrentScreen('messages');
                        setUnreadNotifications(0);
                      }} 
                      className="relative p-1 hover:bg-white/10 rounded-full transition-all cursor-pointer"
                      title="Alerts Hub"
                    >
                      <Bell className="w-4 h-4 text-emerald-250" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white font-mono text-[7px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black animate-pulse">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                    
                    <button 
                      onClick={() => setCurrentScreen('login')}
                      className="p-1 hover:bg-white/11 rounded-full transition-all cursor-pointer text-stone-300 hover:text-white"
                      title="Log Out / Lock Portal"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-300" />
                    </button>
                  </div>
                </div>
              )}

              {/* MOBILE BODY CLIENT VIEWPORTS */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-neutral-50/50 scrollbar-none">
                
                {/* 1. SCREEN: SPLASH ONBOARDING */}
                {currentScreen === 'splash' && (
                  <div className="h-full flex flex-col justify-between py-6 text-center animate-fade-in">
                    
                    <div className="space-y-4 my-auto">
                      {/* SVG child friendly badge */}
                      <div className="w-20 h-20 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border-4 border-emerald-100/50 shadow-sm">
                        <Award className="w-10 h-10 text-emerald-500" />
                      </div>
                      
                      <div className="space-y-2 px-2">
                        <h3 className="font-black text-lg text-neutral-800 tracking-tight leading-snug">
                          Kids Villa Academy
                        </h3>
                        <p className="text-[10px] text-gray-500 font-semibold px-4 leading-normal">
                          Certified Early Childhood Development with real-time biometric and parental peace of mind portals.
                        </p>
                      </div>

                      {/* Rounded highlights */}
                      <div className="flex justify-center gap-1.5 py-1">
                        <span className="w-4 h-1.5 bg-emerald-500 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                        <span className="w-1.5 h-1.5 bg-stone-300 rounded-full" />
                      </div>
                      
                      <div className="space-y-1.5 max-w-[210px] mx-auto pt-2">
                        <div className="bg-emerald-50/50 text-emerald-800 p-2 rounded-xl text-[9px] font-bold text-left flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Nutritional check & Porridge safety</span>
                        </div>
                        <div className="bg-sky-50/50 text-sky-800 p-2 rounded-xl text-[9px] font-bold text-left flex items-center gap-2">
                          <Bus className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span>Approaching transport GPS maps</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('login');
                        triggerExternalSMSLog("APP ONBOARDED: Swiped past splash screen to security authentication screen.");
                      }}
                      className="w-full bg-[#5A3E2B] hover:bg-[#452E20] text-white py-3 rounded-2xl text-xs font-black tracking-wider uppercase shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      Enter Portal <ArrowRight className="w-3.5 h-3.5 text-sky-300" />
                    </button>
                  </div>
                )}


                {/* 2. SCREEN: LOGIN & ROLE RECRUITMENT */}
                {currentScreen === 'login' && (
                  <div className="space-y-4 py-3 animate-fade-in">
                    <div className="text-center space-y-1 pt-2">
                      <span className="text-[9px] font-extrabold uppercase bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">Secure Passkey Link</span>
                      <h4 className="font-extrabold text-neutral-800 text-base">Authorize Device</h4>
                      <p className="text-[10px] text-gray-400">Specify your unique 4-digit passkey assigned during registration:</p>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-600 uppercase block">Guardian / Staff Email</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            disabled 
                            value={activePersona === 'parent' ? 'parent.lutaaya@gmail.com' : activePersona === 'teacher' ? 'martha.teacher@kva.ac' : activePersona === 'pupil' ? 'pupil.shifra@edu.co' : 'admin.campbell@kva.ac'}
                            className="w-full bg-[#FAF9F6] p-2 rounded-xl border border-stone-150 text-[11px] text-stone-700 italic select-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-neutral-600 uppercase block">4-Digit Security Passkey PIN</label>
                        <div className="flex gap-2">
                          {['•', '•', '•', '•'].map((dot, idx) => (
                            <div key={idx} className="flex-1 text-center py-2 bg-stone-100 rounded-lg text-lg font-bold border border-stone-200">
                              {dot}
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setCurrentScreen('dashboard');
                          triggerExternalSMSLog(`PORTAL AUTHENTICATED: Successfully authorized device as [${activePersona.toUpperCase()}]. Session key validated.`);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black uppercase transition-all shadow-sm cursor-pointer"
                      >
                        Authenticate securely
                      </button>
                    </div>

                    {/* Quick bypass tips */}
                    <div className="p-3 bg-neutral-100/70 rounded-2xl border border-stone-200/50 space-y-2">
                      <span className="text-[8px] font-black uppercase text-[#5A3E2B] tracking-wider block text-center">💡 Quick Role Bypass for Testing:</span>
                      <p className="text-[9px] text-stone-500 text-center leading-tight">Change roles using the left control panel to see different UI styles inside the portal.</p>
                      
                      <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-bold">
                        <button 
                          onClick={() => { setActivePersona('parent'); setCurrentScreen('dashboard'); }}
                          className={`p-1.5 rounded-lg border ${activePersona === 'parent' ? 'bg-sky-50 border-sky-300 text-sky-800' : 'bg-white text-stone-600'}`}>
                          Parent Dashboard
                        </button>
                        <button 
                          onClick={() => { setActivePersona('teacher'); setCurrentScreen('dashboard'); }}
                          className={`p-1.5 rounded-lg border ${activePersona === 'teacher' ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white text-stone-600'}`}>
                          Teacher Console
                        </button>
                      </div>
                    </div>
                  </div>
                )}


                {/* 3. SCREEN: MAIN PERSPECTIVE DASHBOARD */}
                {currentScreen === 'dashboard' && (
                  <div className="space-y-3.5 py-1.5 animate-fade-in">
                    
                    {/* Welcome personalization Banner */}
                    <div className="bg-gradient-to-r from-stone-50 to-neutral-200/50 p-3 rounded-2xl border border-stone-200/80 flex justify-between items-center relative">
                      <div>
                        {activePersona === 'parent' && (
                          <>
                            <h4 className="font-extrabold text-neutral-800 leading-tight">Oli bulungi, Mr. Lutaaya!</h4>
                            <p className="text-[9.5px] text-slate-500 font-semibold leading-none mt-0.5">2 Children Registered</p>
                          </>
                        )}
                        {activePersona === 'teacher' && (
                          <>
                            <h4 className="font-extrabold text-neutral-800 leading-tight">Akiiki, Teacher Martha!</h4>
                            <p className="text-[9.5px] text-emerald-700 font-bold leading-none mt-0.5">Class: Middle Zebra 🦓</p>
                          </>
                        )}
                        {activePersona === 'pupil' && (
                          <>
                            <h4 className="font-extrabold text-[#5A3E2B] leading-tight">Oli bulungi, Shifra! 🧸</h4>
                            <p className="text-[9.5px] text-amber-700 font-bold mt-0.5">Let's collect beautiful stars!</p>
                          </>
                        )}
                        {activePersona === 'admin' && (
                          <>
                            <h4 className="font-extrabold text-neutral-800 leading-tight">Good day, Administrator</h4>
                            <p className="text-[9.5px] text-stone-600 font-semibold leading-none mt-0.5">All Kitemu Campuses Live</p>
                          </>
                        )}
                      </div>
                      
                      {activePersona === 'pupil' ? (
                        <div className="flex items-center gap-1 bg-yellow-150 border border-yellow-250 px-2 py-1 rounded-full">
                          <Star className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500 animate-spin-slow" />
                          <span className="font-mono font-black text-amber-950 text-xs">{pupilCoins}</span>
                        </div>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0">
                          {activePersona}
                        </span>
                      )}
                    </div>

                    {/* DYNAMIC CONTENTS: PART 1 - THE PARENT VIEW */}
                    {activePersona === 'parent' && (
                      <div className="space-y-3">
                        
                        {/* Selector child bar */}
                        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] text-[#5A3E2B] font-extrabold uppercase">Learner Focus</span>
                            <span className="text-[10px] text-gray-500 font-bold">Age: {activeChild.age}</span>
                          </div>
                          
                          <div className="flex items-center gap-3 bg-stone-50 p-2 rounded-xl">
                            <img 
                              src={activeChild.photo} 
                              alt={activeChild.name} 
                              className="w-10 h-10 rounded-xl object-cover shrink-0 border border-stone-200 shadow-2xs" 
                            />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-black text-xs text-stone-800 truncate">{activeChild.name}</h5>
                              <p className="text-[9.5px] text-stone-500 font-medium truncate">{activeChild.class}</p>
                            </div>
                            
                            <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                          </div>
                        </div>

                        {/* Interactive school bus tracker card */}
                        <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-sky-800 flex items-center gap-1">
                              <Bus className="w-3 h-3 text-sky-600" /> Live Transit GPS
                            </span>
                            <span className="text-[8px] bg-white text-sky-800 font-bold px-2 py-0.5 rounded-full border border-sky-200">
                              Approaching
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[11px] font-black text-stone-850 block">Van UBC-401A is approaching</span>
                            <p className="text-[10px] text-slate-600 leading-tight">Estimated transit duration: **7 minutes remaining** to home terminal.</p>
                          </div>

                          {/* Visual progress track locator */}
                          <div className="h-1.5 bg-sky-200 rounded-full relative overflow-hidden mt-1 select-none">
                            <div className="absolute left-0 top-0 h-full w-4/5 bg-sky-600 rounded-full" />
                            <div className="absolute right-1/5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border border-sky-600 shadow-2xs" />
                          </div>
                        </div>

                        {/* Porridge biometric ingestion health status container */}
                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-800 flex items-center gap-1">
                              <Heart className="w-3 h-3 text-emerald-600 fill-emerald-600" /> Daily Care Nutrition Check
                            </span>
                            <span className={`text-[8.5px] font-black px-2 py-0.5 rounded-full ${
                              breakfastState === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {breakfastState}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-black text-stone-850 block">Midday Porridge & Hydration</span>
                            <p className="text-[10px] text-emerald-950/85">
                              {breakfastState === 'Completed' 
                                ? `Caregiver Martha checked of biometric porridge intake logs. Completed 100% with porridge choice: ${activeChild.porridgePreference}.`
                                : `Morning register check-in done (Temp recorded: ${tempChecked}). Porridge serving scheduled next.`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Tuition fees risk component */}
                        {activeChild.outstandingBalance > 0 ? (
                          <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl flex justify-between items-center">
                            <div className="space-y-1">
                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-rose-800 block">Tuition Ledger Alert</span>
                              <span className="text-sm font-black text-neutral-800 block">UGX {activeChild.outstandingBalance.toLocaleString()}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentScreen('fees');
                                triggerExternalSMSLog("LEDGER SHORTCUT: Redirected to mobile pay slip checkout modal.");
                              }}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[10px] rounded-xl flex items-center gap-1 cursor-pointer transition-all uppercase tracking-wide"
                            >
                              <CreditCard className="w-3 h-3" /> Pay Fees
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <div>
                                <span className="text-[8px] uppercase font-black text-emerald-800 block">Tuition Status</span>
                                <span className="text-[11px] font-extrabold text-emerald-950">Term Fees 100% Paid</span>
                              </div>
                            </div>
                            <span className="text-[9px] text-emerald-700 font-bold">No Risk</span>
                          </div>
                        )}

                        {/* Mini Dashboard Shortcuts Grid */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] pt-1">
                          {[
                            { label: 'Progress', screen: 'progress', icon: Award, color: 'text-amber-500 bg-amber-50 border-amber-100' },
                            { label: 'Calendar', screen: 'attendance', icon: Calendar, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                            { label: 'Bills', screen: 'fees', icon: CreditCard, color: 'text-rose-500 bg-rose-50 border-rose-100' },
                            { label: 'Noticeboard', screen: 'messages', icon: MessageSquare, color: 'text-sky-500 bg-sky-50 border-sky-100' }
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={() => {
                                setCurrentScreen(item.screen as MobileScreen);
                                triggerExternalSMSLog(`SCREEN TRANSITION: Parent navigated into [${item.label}] tab.`);
                              }}
                              className={`p-2.5 rounded-xl border ${item.color} flex flex-col items-center justify-center gap-1 transition-all cursor-pointer`}
                            >
                              <item.icon className="w-4 h-4" />
                              <span className="font-extrabold text-[8.5px] tracking-tight">{item.label}</span>
                            </button>
                          ))}
                        </div>

                      </div>
                    )}

                    {/* DYNAMIC CONTENTS: PART 2 - THE TEACHER CONSOLE */}
                    {activePersona === 'teacher' && (
                      <div className="space-y-3">
                        
                        {/* Interactive biometric classroom checkers */}
                        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-3 shadow-2xs">
                          <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                            <span className="text-[9px] font-extrabold text-[#5A3E2B] uppercase">Today's Class Roll</span>
                            <span className="text-[9.5px] text-gray-500 font-bold">Middle Zebra (2 present)</span>
                          </div>

                          <div className="space-y-2">
                            {childrenDb.map((child) => (
                              <div key={child.id} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex justify-between items-center gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <img src={child.photo} alt={child.name} className="w-8 h-8 rounded-lg object-cover border border-stone-150" />
                                  <div className="min-w-0">
                                    <span className="font-extrabold text-[11px] block truncate text-stone-800">{child.name}</span>
                                    <span className="text-[10px] text-amber-800 block truncate font-medium">Pref: {child.porridgePreference.slice(0, 15)}...</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    onClick={() => handleLogPorridgeChecked(child.id, child.name)}
                                    className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer ${
                                      child.id === 'babirye_shifra' && breakfastState === 'Completed'
                                        ? 'bg-emerald-600 text-white shadow-3xs'
                                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                                    }`}
                                  >
                                    🥣 Feed
                                  </button>
                                  
                                  <button
                                    onClick={() => handleAwardMeritPoints(10, child.name)}
                                    className="px-2 py-1 bg-yellow-450 hover:bg-yellow-550 text-amber-950 rounded-lg text-[9px] font-black cursor-pointer"
                                  >
                                    ★ Award
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive daily temperature logger */}
                        <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-2xl space-y-2">
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-800 block">🌡️ Fast Clinical Entry</span>
                          
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={tempChecked} 
                              onChange={(e) => setTempChecked(e.target.value)}
                              className="bg-white p-2 text-stone-700 font-mono font-bold border border-emerald-200 rounded-xl w-24 text-center text-xs" 
                              placeholder="e.g. 36.5°C"
                            />
                            <button
                              onClick={() => triggerExternalSMSLog(`KVA HEALTH REGISTER: Temperature for Babirye Shifra recorded is ${tempChecked}. Status validated as NORMAL.`, 'health')}
                              className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-[10px] font-black uppercase shadow-2xs cursor-pointer transition-all"
                            >
                              Log clinical check
                            </button>
                          </div>
                          <span className="text-[8px] text-[#7D6B5D] block">Automatically relays a secure receipt to guardian handset logs.</span>
                        </div>

                        {/* Fast diagnostic tools shortcuts */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setCurrentScreen('progress');
                              triggerExternalSMSLog("TEACHER WORKSPACE: Navigated to National Curriculum developmental rubric entry sheet.");
                            }}
                            className="p-3 bg-white hover:bg-star-tonal rounded-2xl border border-stone-200 text-center space-y-1 cursor-pointer transition-all"
                          >
                            <Sliders className="w-4 h-4 mx-auto text-amber-600" />
                            <span className="font-extrabold text-[10.5px] text-stone-800 block">Edit Curriculum Sheets</span>
                          </button>

                          <button
                            onClick={() => {
                              setCurrentScreen('messages');
                              triggerExternalSMSLog("TEACHER WORKSPACE: Navigated to Noticeboard to post Parent notifications.");
                            }}
                            className="p-3 bg-white hover:bg-star-tonal rounded-2xl border border-stone-200 text-center space-y-1 cursor-pointer transition-all"
                          >
                            <MessageSquare className="w-4 h-4 mx-auto text-sky-600" />
                            <span className="font-extrabold text-[10.5px] text-stone-800 block">Broadcast Announcement</span>
                          </button>
                        </div>

                      </div>
                    )}

                    {/* DYNAMIC CONTENTS: PART 3 - THE PUPIL zone */}
                    {activePersona === 'pupil' && (
                      <div className="space-y-4 text-center py-2">
                        
                        {/* Play card animation icon */}
                        <div className="p-5 bg-gradient-to-tr from-yellow-50 to-amber-150 rounded-3xl border-2 border-dashed border-yellow-400 space-y-2 relative">
                          <span className="absolute top-2 right-2 text-xs">✨</span>
                          <div className="w-14 h-14 bg-white rounded-full mx-auto flex items-center justify-center border-2 border-yellow-250 shadow-sm animate-bounce-short">
                            <Star className="w-7 h-7 text-yellow-500 fill-yellow-400" />
                          </div>
                          <h4 className="font-black text-sm text-[#4E3626] leading-none mb-1">Oli bulungi child!</h4>
                          <p className="text-[10px] text-neutral-600 leading-snug px-2">You earned **{pupilCoins} Coins**. You are an absolute superstar today!</p>
                        </div>

                        <div className="text-left space-y-1">
                          <span className="text-[8px] font-black uppercase text-amber-800 tracking-wider block">Choose study play game:</span>
                          <div className="grid grid-cols-2 gap-2 text-center text-xs font-black uppercase">
                            <button 
                              onClick={() => {
                                setCurrentPupilGame('alphabet');
                                setPupilCoins(prev => prev + 10);
                                triggerExternalSMSLog("PUPIL SOUND PLAY: Shifra played 'Alphabet Zoo Phonics matching' and scored 10 reward stars!", "merit");
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                currentPupilGame === 'alphabet' ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-3xs' : 'bg-white border-stone-200 text-stone-500'
                              }`}
                            >
                              🍎 Alpha Phonics
                            </button>
                            <button
                              onClick={() => {
                                setCurrentPupilGame('colors');
                                setPupilCoins(prev => prev + 15);
                                triggerExternalSMSLog("PUPIL SOUND PLAY: Shifra completed 'Color block sorting games' successfully. Earned 15 stars.", "merit");
                              }}
                              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                                currentPupilGame === 'colors' ? 'bg-amber-100 border-amber-400 text-amber-950 shadow-3xs' : 'bg-white border-stone-200 text-stone-500'
                              }`}
                            >
                              🦒 Zoo Color Match
                            </button>
                          </div>
                        </div>

                        <div className="bg-stone-50 p-3 rounded-2xl text-left border border-stone-200">
                          <span className="text-[9px] font-black uppercase text-stone-700 block mb-1">Superstar Badges:</span>
                          <div className="flex gap-1.5 flex-wrap">
                            {unlockedAchievements.map(ach => (
                              <span key={ach} className="bg-amber-50 text-amber-950 rounded-lg px-2 py-0.5 border border-amber-150 text-[8.5px] font-extrabold flex items-center gap-1">
                                🏅 {ach}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                    {/* DYNAMIC CONTENTS: PART 4 - THE ADMIN VIEW */}
                    {activePersona === 'admin' && (
                      <div className="space-y-3.5">
                        <div className="bg-[#5A3E2B] text-white p-4 rounded-2xl text-center space-y-1.5 shadow-sm">
                          <span className="text-[8px] font-bold text-[#F2EDE4]/80 uppercase tracking-widest block">Kampala Multi-Campus Revenue</span>
                          <h3 className="text-xl font-black text-white leading-none">UGX 14,250,000</h3>
                          <span className="text-[8px] bg-[#E8F1D7] text-[#5A3E2B] font-extrabold px-3 py-1.5 rounded-full inline-block mt-1">
                            100% Secure Audited Receipts
                          </span>
                        </div>

                        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 space-y-2.5 shadow-2xs">
                          <span className="text-[8.5px] font-black uppercase text-stone-500 block">Kitemu Campus Registry Snapshot</span>
                          
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-sky-50/50 p-2 rounded-xl border border-sky-100">
                              <span className="text-[9px] text-[#5A3E2B] font-extrabold block">Children enrolled</span>
                              <span className="text-sm font-black text-sky-800">{studentsCount}</span>
                            </div>
                            <div className="bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                              <span className="text-[9px] text-[#5A3E2B] font-extrabold block">Present today</span>
                              <span className="text-sm font-black text-emerald-800">{presentCount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-150 p-3.5 rounded-2xl space-y-1 text-[10px] text-amber-950 font-bold leading-normal">
                          <span className="text-[8.5px] text-amber-800 flex items-center gap-1 uppercase block tracking-wider mb-0.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" /> Compliance Verified
                          </span>
                          <span>* Registered with ministry primary guidelines. Staff qualifications certificates and payroll checks are reconciled cleanly.</span>
                        </div>

                      </div>
                    )}

                  </div>
                )}


                {/* 4. SCREEN: STUDENT PROGRESS / NCDC ECD COMPETENCIES */}
                {currentScreen === 'progress' && (
                  <div className="space-y-3.5 py-1 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h4 className="font-extrabold text-neutral-800 text-sm">Learning Profile</h4>
                      <span className="text-[10px] text-[#5A3E2B] font-bold bg-[#FAF9F6] border px-2.5 py-0.5 rounded-full">
                        NCDC Standards
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Sub-learner info */}
                      <span className="text-[9px] font-black uppercase text-gray-400 block -mb-1">Competency Rubric Matrix:</span>
                      
                      {Object.entries(activeChild.skills).map(([key, rawItem]) => {
                        const item = rawItem as { score: number; status: 'Achieved' | 'Progressing' | 'Needs Support'; remarks: string };
                        return (
                          <div key={key} className="bg-white p-3 rounded-2xl border border-stone-200/80 space-y-1.5 shadow-3xs">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-extrabold text-neutral-800 uppercase tracking-tight">{key} competence</span>
                              <span className={`px-2 py-0.5 text-[8.5px] font-black rounded ${
                                item.status === 'Achieved' ? 'bg-emerald-50 text-emerald-800' : item.status === 'Progressing' ? 'bg-yellow-50 text-yellow-800' : 'bg-rose-50 text-rose-800'
                              }`}>
                                {item.status}
                              </span>
                            </div>

                            {/* Beautiful Progress Bar indicator */}
                            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  item.status === 'Achieved' ? 'bg-emerald-500' : item.status === 'Progressing' ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${item.score}%` }} 
                              />
                            </div>

                            <p className="text-[9.5px] text-gray-500 leading-tight font-medium">Remarks: "{item.remarks}"</p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Caregivers authorization signature */}
                    <div className="p-3 bg-stone-100 rounded-2xl text-[9px] text-stone-600 font-bold leading-normal">
                      <span>* Recorded and confirmed on physical playground floor by Lead Caregiver. Click specific fields on physical screens to update.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        triggerExternalSMSLog("SCREEN TRANSITION: Returned to main dashboard from child curriculum records.");
                      }}
                      className="w-full bg-stone-700 hover:bg-stone-800 text-white py-2 rounded-xl text-xs font-black uppercase transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}


                {/* 5. SCREEN: VISUAL ATTENDANCE CALENDAR */}
                {currentScreen === 'attendance' && (
                  <div className="space-y-3.5 py-1 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h4 className="font-extrabold text-neutral-800 text-sm">Roster/Attendance</h4>
                      <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Rate: {activeChild.attendanceRate}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-3xl border border-stone-250 shadow-2xs space-y-3">
                      <span className="text-[9px] font-black uppercase text-stone-500 block text-center">June Calendar Tracker</span>
                      
                      <div className="grid grid-cols-7 gap-1 text-center font-bold text-[9px] text-[#5A3E2B]">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d}>{d}</span>)}
                        {Array.from({ length: 14 }).map((_, idx) => {
                          const isAbsent = idx === 3 || idx === 10;
                          return (
                            <span 
                              key={idx} 
                              className={`py-1 rounded-full ${
                                isAbsent ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          );
                        })}
                      </div>

                      <div className="flex justify-center gap-4 text-[9px] font-bold">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Present</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-400" /> Excused Absent</span>
                      </div>
                    </div>

                    <div className="bg-stone-50 p-3.5 rounded-2xl border space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase block">Biometric Porridge Logs Info</span>
                      <div className="space-y-1 text-[10px] text-[#4E3626] font-semibold leading-normal">
                        <p>✓ Checked in: **7:55 AM today**</p>
                        <p>✓ Midday meal check: **Completed**</p>
                        <p>✓ Temperature log: **36.4°C (Normal)**</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="w-full bg-stone-700 hover:bg-stone-800 text-white py-2 rounded-xl text-xs font-black uppercase transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}


                {/* 6. SCREEN: MOBILE MONEY TUITION PAY slips */}
                {currentScreen === 'fees' && (
                  <div className="space-y-3.5 py-1 animate-fade-in">
                    <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                      <h4 className="font-extrabold text-neutral-800 text-sm">Tuition Checkout</h4>
                      <span className="text-[10px] text-rose-800 font-black bg-rose-50 px-2.5 py-0.5 rounded-full">
                        Ledger No. 4410
                      </span>
                    </div>

                    {paymentStep === 'idle' && (
                      <div className="space-y-3">
                        <div className="bg-stone-50 p-3.5 rounded-2xl border space-y-1">
                          <span className="text-[8.5px] font-black uppercase text-stone-500 block">Tuition Itemized Balance</span>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-[#5A3E2B] font-bold">Outstanding Term Slips:</span>
                            <span className="font-mono font-black text-xs text-rose-700">UGX {activeChild.outstandingBalance.toLocaleString()}</span>
                          </div>
                        </div>

                        {activeChild.outstandingBalance > 0 ? (
                          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 space-y-3 shadow-2xs">
                            <span className="text-[8.5px] font-black uppercase text-amber-800 block">Mobile Money Pay-Slip Process</span>
                            
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => setMomoProvider('MTN')}
                                  className={`flex-1 py-1.5 rounded-xl border text-[10px] font-black text-center transition-all cursor-pointer ${
                                    momoProvider === 'MTN' ? 'bg-yellow-100 border-yellow-400 text-amber-950' : 'bg-stone-50 border-stone-200 text-stone-500'
                                  }`}
                                >
                                  MTN MoMo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setMomoProvider('Airtel')}
                                  className={`flex-1 py-1.5 rounded-xl border text-[10px] font-black text-center transition-all cursor-pointer ${
                                    momoProvider === 'Airtel' ? 'bg-red-50 border-red-300 text-red-900' : 'bg-stone-50 border-stone-200 text-stone-500'
                                  }`}
                                >
                                  Airtel Pay
                                </button>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-stone-500 block">Mobile Handset No.</label>
                                <input
                                  type="text"
                                  placeholder="e.g. 0706-123456"
                                  value={momoPhoneNumber}
                                  onChange={(e) => setMomoPhoneNumber(e.target.value)}
                                  className="w-full p-2.5 bg-[#FAF9F6] border border-stone-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-emerald-500 text-neutral-800 outline-none"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[9px] uppercase font-bold text-stone-500 block">MoMo Secret PIN</label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="****"
                                  value={momoPin}
                                  onChange={(e) => setMomoPin(e.target.value)}
                                  className="w-full p-2.5 bg-[#FAF9F6] border border-stone-200 rounded-xl font-mono text-center text-xs focus:ring-1 focus:ring-emerald-500 tracking-widest text-neutral-800 outline-none"
                                />
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleSimulateMoMoPayment}
                              className="w-full bg-[#5A3E2B] hover:bg-[#432E20] text-white py-2.5 rounded-xl text-xs font-black uppercase transition-all shadow-sm cursor-pointer"
                            >
                              Reconcile Now
                            </button>
                          </div>
                        ) : (
                          <div className="text-center py-6 space-y-2">
                            <span className="text-3xl">🎉</span>
                            <div className="space-y-1">
                              <h5 className="font-extrabold text-neutral-800">Payment Completed!</h5>
                              <p className="text-[10px] text-gray-500">Your school pay slip ledgers are cleanly processed with zero active defaults.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                // reset to show default is 150000 again for demo purposes
                                setChildrenDb(prev => prev.map(child => {
                                  if (child.id === selectedChildId) {
                                    return { ...child, outstandingBalance: 150000 };
                                  }
                                  return child;
                                }));
                                handleResetPaymentSimulation();
                                triggerExternalSMSLog("LEDGER RESET: Recalled 150,000 balance for another checkout simulation.");
                              }}
                              className="px-3 py-1 bg-[#FAF9F6] hover:bg-stone-100 text-stone-800 text-[10px] rounded-lg border border-stone-200 outline-none font-extrabold mt-2 cursor-pointer"
                            >
                              Re-simulate outstanding bill
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentStep === 'processing' && (
                      <div className="text-center py-10 space-y-3">
                        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <div className="space-y-1">
                          <h5 className="font-extrabold text-stone-800">Processing MM Gateway...</h5>
                          <p className="text-[10px] text-slate-500">Awaiting safe Bank API callback loops to confirm UGX balance check.</p>
                        </div>
                      </div>
                    )}

                    {paymentStep === 'done' && (
                      <div className="text-center py-6 space-y-4 animate-fade-in">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full mx-auto flex items-center justify-center border-4 border-emerald-100 text-emerald-600 animate-bounce-short">
                          <Check className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="font-black text-sm text-stone-900">UGX Paid Successfully!</h5>
                          <p className="text-[10.5px] text-[#7D6B5D] px-2 leading-normal">
                            Excellent! MTN/Airtel reconciled. Your learner database records have been securely matched in Wakiso district registry.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('dashboard')}
                          className="px-6 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-[10.5px] font-black uppercase tracking-wide transition-all cursor-pointer"
                        >
                          Exit Payments Screen
                        </button>
                      </div>
                    )}

                    {paymentStep === 'idle' && (
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('dashboard')}
                        className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-xl text-xs font-black uppercase transition-all"
                      >
                        Back to Dashboard
                      </button>
                    )}
                  </div>
                )}


                {/* 7. SCREEN: ANNOUNCEMENTS NOTICEBOARD & CHAT CHANNELS */}
                {currentScreen === 'messages' && (
                  <div className="space-y-3.5 py-1 animate-fade-in">
                    
                    {/* View categories tab */}
                    <div className="flex border-b border-light-tonal-3 pb-1 gap-4 text-[10.5px] font-black uppercase">
                      <span className="text-[#5A3E2B] border-b-2 border-[#5A3E2B] pb-1 cursor-pointer">📢 Events Feed</span>
                      <span className="text-gray-400 cursor-pointer">💬 Teacher Chat</span>
                    </div>

                    {/* Announcement list boards */}
                    <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="bg-white p-3 rounded-2xl border border-stone-200 space-y-1 shadow-3xs text-left">
                          <div className="flex justify-between items-center text-[9px] font-bold">
                            <span className="text-gray-400">{ann.date}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] uppercase ${
                              ann.category === 'event' ? 'bg-emerald-50 text-emerald-800' : ann.category === 'alert' ? 'bg-rose-100 text-rose-800' : 'bg-sky-50 text-sky-800'
                            }`}>
                              {ann.category}
                            </span>
                          </div>

                          <h5 className="font-extrabold text-[11px] text-[#4E3626] leading-tight mt-0.5">{ann.title}</h5>
                          <p className="text-[10px] text-gray-500 leading-normal">{ann.excerpt}</p>
                        </div>
                      ))}
                    </div>

                    {/* Simple live chat message log */}
                    <div className="border-t border-stone-200 pt-3 space-y-2 text-left">
                      <span className="text-[9px] font-black uppercase text-[#5A3E2B] block tracking-wide">Direct Caregiver Chat Sandbox:</span>
                      
                      <div className="bg-stone-100/55 p-2 rounded-xl text-[10.5px] space-y-1.5 max-h-[140px] overflow-y-auto">
                        {chatThread.map((chat, idx) => (
                          <div key={idx} className={`p-2 rounded-xl text-[10px] leading-tight ${
                            chat.sender === 'parent' ? 'bg-sky-100 text-sky-950 ml-6 text-right' : 'bg-emerald-50 text-emerald-950 mr-6'
                          }`}>
                            <span className="text-[8px] opacity-70 block font-bold mb-0.5">{chat.sender === 'parent' ? 'You' : 'Teacher Martha'}</span>
                            <span>{chat.text}</span>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={handleSendChat} className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Type inquiry..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="flex-1 bg-white p-2 rounded-xl border border-stone-250 font-medium text-xs text-neutral-800 placeholder-stone-400 focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                        <button
                          type="submit"
                          className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-3 font-bold text-xs"
                        >
                          Send
                        </button>
                      </form>
                    </div>

                    <button
                      type="button"
                      onClick={() => setCurrentScreen('dashboard')}
                      className="w-full bg-stone-700 hover:bg-stone-800 text-white py-2 rounded-xl text-xs font-black uppercase transition-all"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                )}

              </div>

              {/* PHONE LOWER DEVICE SYSTEM NAVIGATION DOC BAR */}
              {currentScreen !== 'splash' && currentScreen !== 'login' && activeDevice !== 'desktop' && (
                <div className="bg-white border-t border-[#E0D8CC] px-3.5 py-3.5 flex justify-between items-center text-center text-[8px] font-extrabold text-stone-450 shrink-0 select-none">
                  
                  <button 
                    onClick={() => {
                      setCurrentScreen('dashboard');
                      triggerExternalSMSLog("TAP NAV: Switched focus back to principal Dashboard metrics screen.");
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 cursor-pointer outline-none ${
                      currentScreen === 'dashboard' ? 'text-[#5A3E2B]' : 'text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setCurrentScreen('progress');
                      triggerExternalSMSLog("TAP NAV: Inspected Uganda ECD developmental checklists.");
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 cursor-pointer outline-none ${
                      currentScreen === 'progress' ? 'text-[#5A3E2B]' : 'text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Skills</span>
                  </button>

                  <button 
                    onClick={() => {
                      setCurrentScreen('fees');
                      triggerExternalSMSLog("TAP NAV: Navigation swiped into Mobile Money ledger checks.");
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 cursor-pointer outline-none ${
                      currentScreen === 'fees' ? 'text-[#5A3E2B]' : 'text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Billing</span>
                  </button>
                  
                  <button 
                    onClick={() => {
                      setCurrentScreen('messages');
                      triggerExternalSMSLog("TAP NAV: Switched views to announcement lists & direct messaging.");
                    }}
                    className={`flex flex-col items-center justify-center gap-0.5 flex-1 cursor-pointer outline-none ${
                      currentScreen === 'messages' ? 'text-[#5A3E2B]' : 'text-stone-300 hover:text-stone-500'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Chat</span>
                  </button>
                </div>
              )}

              </div>

            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: SIMULATED SMS LOG HANDSETS FOR THE ADVERSE AUDITED PORTAL */}
        {activeDevice !== 'desktop' && (
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#E0D8CC] shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-light-tonal-3 pb-3">
            <div className="flex items-center gap-1.5 text-[#5A3E2B]">
              <Phone className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-xs uppercase tracking-wider">Guardian SMS Handset Log</h4>
            </div>
            
            <button
              onClick={() => {
                setSmsLogs([]);
                setUnreadNotifications(0);
              }}
              className="p-1 hover:bg-neutral-50 rounded-lg text-neutral-400 hover:text-rose-500 transition-all cursor-pointer"
              title="Clear log alerts history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-gray-500 leading-normal">
            Every operational milestone inside Kitemu school systems automatically alerts parent mobile interfaces instantly without requiring high battery usage:
          </p>

          <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
            {smsLogs.length > 0 ? (
              smsLogs.map((log) => {
                const getCatColor = (cat: SmsMessage['category']) => {
                  switch (cat) {
                    case 'finance': return 'bg-rose-50 border-rose-200 text-rose-800';
                    case 'health': return 'bg-emerald-50 border-emerald-200 text-emerald-800';
                    case 'merit': return 'bg-yellow-50 border-yellow-200 text-amber-900';
                    case 'transit': return 'bg-sky-50 border-sky-200 text-sky-800';
                    default: return 'bg-stone-50 border-stone-200 text-stone-800';
                  }
                };

                return (
                  <div key={log.id} className={`p-3 rounded-2xl border ${getCatColor(log.category)} text-[11px] leading-normal animate-fade-in font-semibold`}>
                    <div className="flex justify-between text-[8px] uppercase tracking-wider opacity-75 mb-1">
                      <span>Sender: {log.sender}</span>
                      <span>{log.time}</span>
                    </div>
                    <p>{log.msg}</p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-neutral-400 space-y-2">
                <Smartphone className="w-8 h-8 mx-auto text-neutral-300 stroke-1" />
                <p className="text-[10px] font-bold">No simulated logs triggered yet.</p>
                <p className="text-[9px]">Tap buttons inside the phone frame to broadcast live events!</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-sky-50 rounded-2xl text-[9px] text-sky-900 font-bold leading-normal border border-sky-100">
            <span>💡 **Integration Check**: Watch this panel update live in real-time when you mark porridge, log student temperatures, update developmental remarks, or complete payment checkouts inside the phone simulator preview!</span>
          </div>
        </div>
        )}

      </div>

    </div>
  );
}
