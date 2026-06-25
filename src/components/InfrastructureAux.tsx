import React, { useState } from 'react';
import { MapPin, Bus, BookOpen, AlertTriangle, Sparkles, Plus, Star, Award, Calendar, RefreshCcw, Search, Clock, Trash2, Edit } from 'lucide-react';
import { Pupil, ShuttleJourney } from '../types';

// Interfaces
interface TransportRoute {
  vanNo: string;
  driver: string;
  route: string;
  points: string[];
  currentLocation: { lat: number; lng: number; lastPoint: string };
}

interface LibraryBook {
  isbn: string;
  title: string;
  author: string;
  status: 'In Shelf' | 'Borrowed';
  borrowerName?: string;
  dueDate?: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minThreshold: number;
  unit: string;
}

interface BehaviorIncident {
  id: string;
  studentName: string;
  type: 'Positive Merit' | 'Minor Incident' | 'Counseling Log';
  desc: string;
  points: number;
  date: string;
}

interface SchoolEvent {
  id: string;
  title: string;
  type: 'Academics' | 'Sports' | 'Parents Meet' | 'Excursions';
  date: string;
  desc: string;
}

// Initial Mock Datasets
const INITIAL_ROUTES: TransportRoute[] = [
  { vanNo: 'UBC-401A', driver: 'Uncle Moses', route: 'Kabalagala - Muyenga - Makindye', points: ['Kabalagala Junction', 'Muyenga Hill Post', 'Makindye Barracks Road'], currentLocation: { lat: 1.25, lng: 32.55, lastPoint: 'Muyenga Hill Post' } },
  { vanNo: 'UBC-928K', driver: 'Uncle Robert', route: 'Ntinda - Kiwatule - Bukoto', points: ['Ntinda Capital Shoppers', 'Kiwatule Recreation Centre', 'Bukoto Flats Area'], currentLocation: { lat: 1.30, lng: 32.60, lastPoint: 'Ntinda Capital Shoppers' } }
];

const INITIAL_BOOKS: LibraryBook[] = [
  { isbn: '978-01', title: 'NCDC Pre-School sounds Book 1', author: 'Uganda Curriculum Board', status: 'In Shelf' },
  { isbn: '978-02', title: 'The Greedy Hyena & Other Ugandan Tales', author: 'Nalule Florence', status: 'Borrowed', borrowerName: 'Kato Ivan', dueDate: '2026-06-22' },
  { isbn: '978-03', title: 'Rhythmic Counting for KG1', author: 'Tr. Agnes Patience', status: 'In Shelf' }
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'I1', name: 'Rotatrim Printing Paper reams', quantity: 18, minThreshold: 20, unit: 'Reams' },
  { id: 'I2', name: 'White Dustless Classroom Chalk boxes', quantity: 9, minThreshold: 10, unit: 'Boxes' },
  { id: 'I3', name: 'Sisal Brooms for daily garden cleanup', quantity: 42, minThreshold: 15, unit: 'Units' },
  { id: 'I4', name: 'Liquid antiseptic wash soap', quantity: 24, minThreshold: 12, unit: 'Liters' }
];

const INITIAL_BEHAVIORS: BehaviorIncident[] = [
  { id: 'B1', studentName: 'Babirye Shifra', type: 'Positive Merit', desc: 'Outstanding helper during class porridge tray cleanup.', points: 15, date: '2026-06-17' },
  { id: 'B2', studentName: 'Mukasa Ronald', type: 'Counseling Log', desc: 'Guided child on sharing plastic blocks sets peacefully.', points: 0, date: '2026-06-18' }
];

const INITIAL_EVENTS: SchoolEvent[] = [
  { id: 'E1', title: 'Parent-Teacher Term 2 Briefing', type: 'Parents Meet', date: '2026-06-20', desc: 'Review NCDC milestones progression cards and tuition balance clearing.' },
  { id: 'E2', title: 'Kids Villa Sports Day & Healthy Recess', type: 'Sports', date: '2026-06-25', desc: 'Races across the playground for Baby, Middle, & Top classes.' }
];

interface InfrastructureAuxProps {
  pupils: Pupil[];
  onUpdatePupil: (pupil: Pupil) => void;
  mode?: 'shuttle' | 'assets';
  globalSearchTerm?: string;
}

export function InfrastructureAux({ pupils = [], onUpdatePupil, mode = 'shuttle', globalSearchTerm = '' }: InfrastructureAuxProps) {
  const [subTab, setSubTab] = useState<'transport' | 'library' | 'inventory' | 'discipline' | 'events'>(
    mode === 'assets' ? 'library' : 'transport'
  );

  React.useEffect(() => {
    if (mode === 'assets' && subTab === 'transport') {
      setSubTab('library');
    } else if (mode === 'shuttle' && subTab !== 'transport') {
      setSubTab('transport');
    }
  }, [mode]);
  
  // Transport State
  const [routes, setRoutes] = useState<TransportRoute[]>(INITIAL_ROUTES);
  const [routeSimulationCount, setRouteSimulationCount] = useState(0);

  // Transport Sub-state for Scheduling / Allocating journeys across all learners
  const [learnerJourneySearch, setLearnerJourneySearch] = useState('');
  const [selectedPupilId, setSelectedPupilId] = useState('');
  const [infraSjRoute, setInfraSjRoute] = useState('');
  const [infraSjDriver, setInfraSjDriver] = useState('');
  const [infraSjVan, setInfraSjVan] = useState('');
  const [infraSjPickup, setInfraSjPickup] = useState('07:15 AM');
  const [infraSjDropoff, setInfraSjDropoff] = useState('04:30 PM');
  const [infraSjCost, setInfraSjCost] = useState(150000);
  const [infraSjStatus, setInfraSjStatus] = useState<'Active' | 'Suspended' | 'Completed'>('Active');
  const [showInfraSjForm, setShowInfraSjForm] = useState(false);

  const handleInfraAddJourney = () => {
    if (!selectedPupilId) {
      alert("Please select a learner!");
      return;
    }
    if (!infraSjRoute) {
      alert("Please choose or enter a route!");
      return;
    }

    const targetPupil = pupils.find(p => p.id === selectedPupilId);
    if (!targetPupil) {
      alert("Student not found!");
      return;
    }

    const newJourney: ShuttleJourney = {
      id: `SJ-${Date.now()}`,
      routeName: infraSjRoute,
      driverName: infraSjDriver || 'Uncle Moses',
      shuttleVanNo: infraSjVan || 'UBC-401A',
      pickupTime: infraSjPickup,
      dropoffTime: infraSjDropoff,
      status: infraSjStatus,
      costPerTermUGX: Number(infraSjCost)
    };

    const updatedJourneys = [...(targetPupil.shuttleJourneys || []), newJourney];
    onUpdatePupil({
      ...targetPupil,
      shuttleJourneys: updatedJourneys
    });

    // Reset Form
    setSelectedPupilId('');
    setInfraSjRoute('');
    setInfraSjDriver('');
    setInfraSjVan('');
    setInfraSjPickup('07:15 AM');
    setInfraSjDropoff('04:30 PM');
    setInfraSjCost(150000);
    setInfraSjStatus('Active');
    setShowInfraSjForm(false);
  };

  const handleInfraRemoveJourney = (pupilId: string, journeyId: string) => {
    const targetPupil = pupils.find(p => p.id === pupilId);
    if (!targetPupil) return;

    const updatedJourneys = (targetPupil.shuttleJourneys || []).filter(j => j.id !== journeyId);
    onUpdatePupil({
      ...targetPupil,
      shuttleJourneys: updatedJourneys
    });
  };

  // Library State
  const [books, setBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [selectedBorrowBook, setSelectedBorrowBook] = useState<LibraryBook | null>(null);
  const [borrowerNameInput, setBorrowerNameInput] = useState('');

  // Inventory State
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [replenishItemId, setReplenishItemId] = useState<string | null>(null);
  const [customAddQty, setCustomAddQty] = useState('10');
  
  // New Asset Creation States
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetQty, setNewAssetQty] = useState(10);
  const [newAssetMin, setNewAssetMin] = useState(5);
  const [newAssetUnit, setNewAssetUnit] = useState('Units');

  // Discipline State
  const [behaviorLogs, setBehaviorLogs] = useState<BehaviorIncident[]>(INITIAL_BEHAVIORS);
  const [newDiscName, setNewDiscName] = useState('');
  const [newDiscType, setNewDiscType] = useState<'Positive Merit' | 'Minor Incident' | 'Counseling Log'>('Positive Merit');
  const [newDiscDesc, setNewDiscDesc] = useState('');
  const [newDiscPts, setNewDiscPts] = useState(10);

  // Excursions Events State
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('2026-06-26');
  const [newEventType, setNewEventType] = useState<'Academics' | 'Sports' | 'Parents Meet' | 'Excursions'>('Excursions');

  // Trigger GPS Simulator walk status
  const handleSimulateGPSMove = () => {
    setRouteSimulationCount(prev => prev + 1);
    const updated = routes.map((r, idx) => {
      // Rotate active GPS locations
      const currentPointIdx = r.points.indexOf(r.currentLocation.lastPoint);
      const nextPointIdx = (currentPointIdx + 1) % r.points.length;
      return {
        ...r,
        currentLocation: {
          lat: r.currentLocation.lat + 0.002 * (Math.random() > 0.5 ? 1 : -1),
          lng: r.currentLocation.lng + 0.002 * (Math.random() > 0.5 ? 1 : -1),
          lastPoint: r.points[nextPointIdx]
        }
      };
    });
    setRoutes(updated);
  };

  // Library functions
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    const item: LibraryBook = {
      isbn: `978-${Date.now()}`,
      title: newTitle,
      author: newAuthor || 'Unknown Author',
      status: 'In Shelf'
    };
    setBooks([...books, item]);
    setNewTitle('');
    setNewAuthor('');
  };

  const handleBorrowConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBorrowBook || !borrowerNameInput) return;
    const updated = books.map(b => b.isbn === selectedBorrowBook.isbn ? {
      ...b,
      status: 'Borrowed' as const,
      borrowerName: borrowerNameInput,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    } : b);
    setBooks(updated);
    setSelectedBorrowBook(null);
    setBorrowerNameInput('');
  };

  const handleReturnBook = (isbn: string) => {
    const updated = books.map(b => b.isbn === isbn ? {
      ...b,
      status: 'In Shelf' as const,
      borrowerName: undefined,
      dueDate: undefined
    } : b);
    setBooks(updated);
  };

  // Inventory Replenish
  const handleReplenishStock = (itemId: string, addQty: number) => {
    const updated = inventory.map(item => item.id === itemId ? {
      ...item,
      quantity: item.quantity + addQty
    } : item);
    setInventory(updated);
    setReplenishItemId(null);
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    const newItem: InventoryItem = {
      id: `I-${Date.now()}`,
      name: newAssetName.trim(),
      quantity: Number(newAssetQty),
      minThreshold: Number(newAssetMin),
      unit: newAssetUnit || 'Units'
    };
    setInventory([...inventory, newItem]);
    setNewAssetName('');
    setNewAssetQty(10);
    setNewAssetMin(5);
    setNewAssetUnit('Units');
  };

  const handleDeleteAsset = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  // Add Incident handler
  const handleAddIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscName || !newDiscDesc) return;
    const log: BehaviorIncident = {
      id: `B-${Date.now()}`,
      studentName: newDiscName,
      type: newDiscType,
      desc: newDiscDesc,
      points: Number(newDiscPts),
      date: new Date().toISOString().split('T')[0]
    };
    setBehaviorLogs([log, ...behaviorLogs]);
    setNewDiscName('');
    setNewDiscDesc('');
    setNewDiscPts(10);
  };

  // New Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    const ev: SchoolEvent = {
      id: `E-${Date.now()}`,
      title: newEventTitle,
      type: newEventType,
      date: newEventDate,
      desc: 'Exciting outdoor curriculum exercise. Attendance is highly tracked!'
    };
    setEvents([...events, ev]);
    setNewEventTitle('');
  };

  return (
    <div className="space-y-6">
      
      {/* department header selector bubbles */}
      {mode === 'assets' && (
        <div className="flex flex-wrap gap-2 pb-2.5 border-b border-[#E0D8CC]">
          <button
            onClick={() => setSubTab('library')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              subTab === 'library'
                ? 'bg-[#E8F1D7] text-[#3D2B1F] border-[#6B8E23]'
                : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]/50'
            }`}
          >
            📚 Library catalog Shelf ({books.length})
          </button>
          <button
            onClick={() => setSubTab('inventory')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              subTab === 'inventory'
                ? 'bg-[#E8F1D7] text-[#3D2B1F] border-[#6B8E23]'
                : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]/50'
            }`}
          >
            📦 Auxiliary Stock assets ({inventory.length})
          </button>
          <button
            onClick={() => setSubTab('discipline')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              subTab === 'discipline'
                ? 'bg-[#E8F1D7] text-[#3D2B1F] border-[#6B8E23]'
                : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]/50'
            }`}
          >
            ⭐ Merits and Counseling ({behaviorLogs.length})
          </button>
          <button
            onClick={() => setSubTab('events')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
              subTab === 'events'
                ? 'bg-[#E8F1D7] text-[#3D2B1F] border-[#6B8E23]'
                : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]/50'
            }`}
          >
            📅 sports & Recess Calendar ({events.length})
          </button>
        </div>
      )}

      {/* SUB-VIEW 1: TRANSPORT & MAP SIMULATOR */}
      {subTab === 'transport' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Active fleet information list */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D]">Nursery Shuttle Fleet tracking</h4>
              <button
                type="button"
                onClick={handleSimulateGPSMove}
                className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Simulate Vans Movement
              </button>
            </div>

            <div className="space-y-4">
              {routes.filter(val => !globalSearchTerm || val.vanNo.toLowerCase().includes(globalSearchTerm.toLowerCase()) || val.driver.toLowerCase().includes(globalSearchTerm.toLowerCase()) || val.route.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(val => (
                <div key={val.vanNo} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/80 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-sm">
                    <span className="flex items-center gap-1 text-[#3D2B1F]">
                      <Bus className="w-4 h-4 text-[#8C5A3C]" /> {val.vanNo} ({val.driver})
                    </span>
                    <span className="text-[#6B8E23] font-normal uppercase font-mono text-[9px] bg-[#E8F1D7] px-2 py-0.5 rounded-full font-bold">● Active Route</span>
                  </div>
                  <p className="text-[#7D6B5D] font-semibold">Route: <span className="font-normal text-[#3D2B1F]">{val.route}</span></p>
                  <p className="font-bold text-[#8C5A3C] flex items-center gap-1 text-[11px]">
                    <MapPin className="w-3.5 h-3.5" /> Current GPS Point: <span className="font-semibold text-[#3D2B1F] bg-white border px-2 py-0.5 rounded">{val.currentLocation.lastPoint}</span>
                  </p>
                  
                  {/* Progress milestones list */}
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold pt-1">
                    {val.points.map(pt => (
                      <span key={pt} className={val.currentLocation.lastPoint === pt ? 'text-[#6B8E23] font-bold underline' : ''}>
                        • {pt.split(' ')[0]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual GPS MAP simulation representation */}
          <div className="lg:col-span-6 bg-[#F2EDE4]/35 rounded-3xl border border-[#E0D8CC] p-6 flex flex-col justify-between min-h-[300px] relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#8C5A3C] uppercase tracking-widest block">Active Route GIS tracker (Simulation)</span>
              <p className="text-[11px] text-[#7D6B5D]">Vans push real-time SMS to parents when arriving at pick-up points.</p>
            </div>

            {/* Custom SVG canvas map drawing */}
            <div className="relative w-full h-44 bg-white border border-[#E0D8CC] rounded-2xl my-4 overflow-hidden flex items-center justify-center">
              
              {/* Abstract Kampala grid streets */}
              <div className="absolute inset-0 opacity-40 select-none">
                <div className="absolute top-1/3 left-0 w-full h-1 bg-[#F2EDE4]" />
                <div className="absolute top-2/3 left-0 w-full h-1 bg-[#F2EDE4]" />
                <div className="absolute top-0 left-1/4 h-full w-1 bg-[#F2EDE4]" />
                <div className="absolute top-0 left-3/4 h-full w-1 bg-[#F2EDE4]" />
              </div>

              {/* Draw animated schools marker central */}
              <div className="absolute top-1/2 left-1/2 -ml-5 -mt-5 w-10 h-10 rounded-full bg-[#8C5A3C]/10 border-2 border-dashed border-[#8C5A3C] flex items-center justify-center animate-pulse">
                <span className="font-extrabold text-[#8C5A3C] text-[10px]">KVA</span>
              </div>

              {/* Van UBC-401A */}
              <div 
                className="absolute p-1.5 bg-[#6B8E23] text-white font-extrabold rounded-lg text-[9px] shadow-xs flex items-center gap-1 transition-all duration-700" 
                style={{ top: '25%', left: routeSimulationCount % 2 === 0 ? '20%' : '55%' }}
              >
                <Bus className="w-3 h-3" /> UBC-401A
              </div>

              {/* Van UBC-928K */}
              <div 
                className="absolute p-1.5 bg-[#8C5A3C] text-white font-extrabold rounded-lg text-[9px] shadow-xs flex items-center gap-1 transition-all duration-700" 
                style={{ top: '70%', left: routeSimulationCount % 2 === 0 ? '75%' : '35%' }}
              >
                <Bus className="w-3 h-3" /> UBC-928K
              </div>

            </div>

            <div className="text-[10px] text-gray-400 italic text-center font-bold">
              GPS Satellite sync frequency: 16,000Hz via dual Uganda cell columns.
            </div>

          </div>

          {/* Centralized Learner Shuttle Registry & Journey Manager */}
          <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0F9FF] pb-4">
              <div>
                <h4 className="font-extrabold text-[#3D2B1F] text-sm flex items-center gap-1.5">
                  <Bus className="w-5 h-5 text-[#0284c7]" /> Learner Shuttle Scheduling Directory
                </h4>
                <p className="text-xs text-[#7D6B5D] mt-0.5">Define, edit, and dispatch shuttle journeys for every individual learner in Kids Villa.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {!globalSearchTerm && (
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      placeholder="Search by student or route..."
                      value={learnerJourneySearch}
                      onChange={(e) => setLearnerJourneySearch(e.target.value)}
                      className="pl-8 pr-3 py-1 bg-white border border-[#E0D8CC] rounded-full text-xs text-[#3D2B1F] focus:outline-hidden"
                    />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowInfraSjForm(!showInfraSjForm)}
                  className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  {showInfraSjForm ? 'Cancel Form' : '+ Add New Journey'}
                </button>
              </div>
            </div>

            {/* Inline Journey Creation form */}
            {showInfraSjForm && (
              <div className="p-5 bg-[#F0F9FF] rounded-2xl border border-[#E0F2FE] space-y-4 animate-fadeInSmooth">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#0284c7] block">Dispatch New Journey Assignment</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Select Learner</label>
                    <select
                      value={selectedPupilId}
                      onChange={(e) => setSelectedPupilId(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    >
                      <option value="">-- Choose Pupil --</option>
                      {pupils.map(p => (
                        <option key={p.id} value={p.id}>{p.fullName} ({p.classLevel})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Select Shuttle Route</label>
                    <select
                      value={infraSjRoute}
                      onChange={(e) => {
                        const val = e.target.value;
                        setInfraSjRoute(val);
                        if (val === 'Kitemu - Nsangi - Wakiso') {
                          setInfraSjDriver('Uncle Moses');
                          setInfraSjVan('UBC-401A');
                        } else if (val === 'Kabalagala - Muyenga - Makindye') {
                          setInfraSjDriver('Uncle Moses');
                          setInfraSjVan('UBC-401A');
                        } else if (val === 'Ntinda - Kiwatule - Bukoto') {
                          setInfraSjDriver('Uncle Robert');
                          setInfraSjVan('UBC-928K');
                        }
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    >
                      <option value="">-- Choose Preset or Custom --</option>
                      <option value="Kitemu - Nsangi - Wakiso">Kitemu - Nsangi - Wakiso (Uncle Moses)</option>
                      <option value="Kabalagala - Muyenga - Makindye">Kabalagala - Muyenga - Makindye (Uncle Moses)</option>
                      <option value="Ntinda - Kiwatule - Bukoto">Ntinda - Kiwatule - Bukoto (Uncle Robert)</option>
                      <option value="Custom Route">-- Type Custom Route --</option>
                    </select>
                    {infraSjRoute?.startsWith('Custom') && (
                      <input
                        type="text"
                        placeholder="Enter custom route..."
                        value={infraSjRoute === 'Custom Route' ? '' : infraSjRoute}
                        onChange={(e) => setInfraSjRoute(e.target.value)}
                        className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Driver In Charge</label>
                    <input
                      type="text"
                      value={infraSjDriver}
                      onChange={(e) => setInfraSjDriver(e.target.value)}
                      placeholder="e.g. Uncle Moses"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Shuttle Registration No</label>
                    <input
                      type="text"
                      value={infraSjVan}
                      onChange={(e) => setInfraSjVan(e.target.value)}
                      placeholder="e.g. UBC-401A"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Morning Pickup Time</label>
                    <input
                      type="text"
                      value={infraSjPickup}
                      onChange={(e) => setInfraSjPickup(e.target.value)}
                      placeholder="e.g. 07:15 AM"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Evening Drop-off Time</label>
                    <input
                      type="text"
                      value={infraSjDropoff}
                      onChange={(e) => setInfraSjDropoff(e.target.value)}
                      placeholder="e.g. 04:30 PM"
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Termly Charge Rate (UGX)</label>
                    <input
                      type="number"
                      value={infraSjCost}
                      onChange={(e) => setInfraSjCost(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Route Status</label>
                    <select
                      value={infraSjStatus}
                      onChange={(e) => setInfraSjStatus(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                    >
                      <option value="Active">Active Route Run</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Completed">Completed Plan</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInfraSjForm(false)}
                    className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-slate-100"
                  >
                    Discard Fields
                  </button>
                  <button
                    type="button"
                    onClick={handleInfraAddJourney}
                    className="px-5 py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-full cursor-pointer uppercase transition-all"
                  >
                    Confirm Assignment
                  </button>
                </div>
              </div>
            )}

            {/* Display list of active journeys per learner */}
            <div className="overflow-x-auto border border-[#E0D8CC]/80 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#F2EDE4] text-[#7D6B5D] font-bold">
                    <th className="p-3">Learner Profile</th>
                    <th className="p-3">Shuttle Route</th>
                    <th className="p-3 text-center">Timings (AM/PM)</th>
                    <th className="p-3 text-center">Driver & Vehicle</th>
                    <th className="p-3 text-center">Term Budget</th>
                    <th className="p-3 text-center">Service Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EDE4]">
                  {(() => {
                    const matchedPupils = pupils.filter(p => {
                      const search = (globalSearchTerm || learnerJourneySearch).toLowerCase();
                      return p.fullName.toLowerCase().includes(search) || 
                             p.guardianName.toLowerCase().includes(search) || 
                             p.shuttleJourneys?.some(j => j.routeName.toLowerCase().includes(search));
                    });

                    let journeyCount = 0;
                    const rows = matchedPupils.flatMap(pupil => {
                      const journeys = pupil.shuttleJourneys || [];
                      return journeys.map(sj => {
                        journeyCount++;
                        return (
                          <tr key={sj.id} className="hover:bg-slate-50/50">
                            <td className="p-3">
                              <strong className="text-[#3D2B1F]">{pupil.fullName}</strong>
                              <div className="text-[10px] text-[#7D6B5D]">{pupil.classLevel} • Guardian: {pupil.guardianName}</div>
                            </td>
                            <td className="p-3 font-semibold text-sky-850">
                              {sj.routeName}
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-bold text-[#0284c7] bg-[#E0F2FE] px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-[#0284c7]" /> {sj.pickupTime} - {sj.dropoffTime}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono">
                              <div className="font-bold text-[#3D2B1F]">{sj.shuttleVanNo}</div>
                              <div className="text-[10px] text-[#7D6B5D]">{sj.driverName}</div>
                            </td>
                            <td className="p-3 text-center font-bold text-[#8C5A3C]">
                              {sj.costPerTermUGX.toLocaleString()} UGX
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                sj.status === 'Active' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-[#F9ECE4] text-[#8C5A3C]'
                              }`}>
                                {sj.status}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleInfraRemoveJourney(pupil.id, sj.id)}
                                className="p-1 px-2.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg border border-red-200 transition-colors cursor-pointer text-[10px] font-bold"
                              >
                                Remove Link
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    });

                    if (journeyCount === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-[#7D6B5D] italic">
                            No learner shuttle route journeys matched this filter. Click "+ Add New Journey" to schedule service.
                          </td>
                        </tr>
                      );
                    }

                    return rows;
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SUB-VIEW 2: LIBRARY BOOK CATALOGS */}
      {subTab === 'library' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Books catalog table list */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D]">Book Catalog & Loan entries</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#F2EDE4] text-[#7D6B5D] font-bold">
                    <th className="pb-3">Book Title</th>
                    <th className="pb-3 text-center">Reference ISBN</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F2EDE4] font-medium">
                  {books.filter(bk => !globalSearchTerm || bk.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || bk.author.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(bk => (
                    <tr key={bk.isbn} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <strong className="text-[#3D2B1F] text-[13px]">{bk.title}</strong>
                        <p className="text-[10px] text-[#7D6B5D]">{bk.author}</p>
                      </td>
                      <td className="py-3 text-center font-mono opacity-80 font-semibold">{bk.isbn}</td>
                      <td className="py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                          bk.status === 'In Shelf' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-[#F9ECE4] text-[#8C5A3C]'
                        }`}>
                          {bk.status === 'In Shelf' ? 'In Shelf' : `Borrowed by ${bk.borrowerName}`}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {bk.status === 'In Shelf' ? (
                          <button
                            onClick={() => setSelectedBorrowBook(bk)}
                            className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold cursor-pointer"
                          >
                            Rent out Book
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReturnBook(bk.isbn)}
                            className="bg-[#F2EDE4] text-[#3D2B1F] px-2.5 py-1 rounded-lg text-[10px] font-bold"
                          >
                            Return Safe
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Catalog registration form / Borrow modal */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Rent Modal form */}
            {selectedBorrowBook && (
              <form onSubmit={handleBorrowConfirm} className="bg-white p-5 rounded-3xl border-2 border-[#6B8E23] space-y-3.5 animate-fadeIn">
                <span className="text-[10px] font-bold text-[#6B8E23] uppercase block mb-1">Issue Book: {selectedBorrowBook.title}</span>
                
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Caretaker / Student borrower full name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kato Ivan"
                    value={borrowerNameInput}
                    onChange={(e) => setBorrowerNameInput(e.target.value)}
                    className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F] font-semibold"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedBorrowBook(null)}
                    className="px-3.5 py-1.1 bg-white border text-xs text-[#7D6B5D] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4.5 py-1.1 bg-[#6B8E23] text-white text-xs font-bold rounded-lg"
                  >
                    Approve Loan
                  </button>
                </div>
              </form>
            )}

            {/* Catalog book creation form */}
            <form onSubmit={handleAddBook} className="bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-3.5">
              <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-1">Register New Shelf Asset</span>
              
              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Traditional Uganda Songs & Folklore"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full h-9 p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Book Author</label>
                <input
                  type="text"
                  placeholder="optional"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full h-9 p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8C5A3C] text-white py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer text-center"
              >
                Incorporate Book on Rack
              </button>
            </form>

          </div>

        </div>
      )}

      {/* SUB-VIEW 3: AUXILIARY INVENTORY STOCK DEPT */}
      {subTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          {/* Main Inventory items display list */}
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <div className="flex justify-between items-center border-b border-[#F2EDE4] pb-3">
              <div>
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D]">Auxiliary Store Asset & Material Registry</h4>
                <p className="text-xs text-[#7D6B5D]">Ensure printing papers, clean brooms, and scholastic supplies are always stocked.</p>
              </div>
              <span className="bg-[#E8F1D7] text-[#6B8E23] text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
                Live Stock Alarms Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {inventory.filter(item => !globalSearchTerm || item.name.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(item => {
                const isLow = item.quantity <= item.minThreshold;
                return (
                  <div key={item.id} className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isLow ? 'bg-[#F9ECE4] border-[#8C5A3C]/70' : 'bg-[#FDFBF7] border-[#E0D8CC]'
                  }`}>
                    <div className="space-y-1 relative">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold text-gray-400 block">{item.id}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteAsset(item.id)}
                          className="p-1 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors"
                          title="Delete Material Asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <h5 className="font-extrabold text-[#3D2B1F] text-xs leading-snug pr-4">{item.name}</h5>
                      <p className="text-2xl font-black text-[#3D2B1F] pt-2">
                        {item.quantity} <span className="text-xs font-normal text-[#7D6B5D]">{item.unit}</span>
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 mt-3 space-y-2">
                      <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                        <span>Min limit:</span>
                        <span className={isLow ? 'text-[#8C5A3C]' : 'text-gray-500'}>{item.minThreshold} {item.unit}</span>
                      </div>

                      {isLow && (
                        <div className="bg-[#8C5A3C]/10 text-[#8C5A3C] p-2 rounded-lg text-[9px] font-black flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-[#8C5A3C]" /> REORDER CRITICAL
                        </div>
                      )}

                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleReplenishStock(item.id, 10)}
                          className="w-full bg-[#6B8E23] hover:bg-[#58751d] text-white text-[10px] font-bold py-1 rounded-md cursor-pointer text-center transition-all"
                        >
                          + Replenish 10
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {inventory.length === 0 && (
                <div className="col-span-full py-12 text-center text-[#7D6B5D] italic text-xs">
                  📦 No stock assets registered in directory. Use the right form to register products.
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Asset Inception Form */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-3.5 h-fit">
            <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-1">Incorporate Material / Asset</span>

            <form onSubmit={handleAddAsset} className="space-y-3.5">
              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Item Description / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A4 Pastel Manila paper packs"
                  value={newAssetName}
                  onChange={(e) => setNewAssetName(e.target.value)}
                  className="w-full h-9 p-2.5 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Initial Qty *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newAssetQty}
                    onChange={(e) => setNewAssetQty(Number(e.target.value))}
                    className="w-full h-9 p-2.5 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Min Level *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newAssetMin}
                    onChange={(e) => setNewAssetMin(Number(e.target.value))}
                    className="w-full h-9 p-2.5 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Measurement Unit</label>
                <select
                  value={newAssetUnit}
                  onChange={(e) => setNewAssetUnit(e.target.value)}
                  className="w-full h-9 p-2.5 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                >
                  <option value="Units">Units / Single items</option>
                  <option value="Reams">Reams</option>
                  <option value="Boxes">Boxes</option>
                  <option value="Liters">Liters</option>
                  <option value="Kgs">Kgs</option>
                  <option value="Cartons">Cartons</option>
                  <option value="Metres">Metres</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#8C5A3C] hover:bg-[#72482e] text-white py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer text-center"
              >
                Inscribe Asset in Ledger
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-VIEW 4: DISCIPLINE & COUNCIL MERITS BOARD */}
      {subTab === 'discipline' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D]">Behavior Merit Stars & Counseling index</h4>
            
            <div className="space-y-3.5 pr-1 max-h-[350px] overflow-y-auto">
              {behaviorLogs.filter(log => !globalSearchTerm || log.studentName.toLowerCase().includes(globalSearchTerm.toLowerCase()) || log.desc.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(log => (
                <div key={log.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/85 flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full ${
                        log.type === 'Positive Merit' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-orange-50 text-orange-700'
                      }`}>
                        {log.type}
                      </span>
                      <strong className="text-xs text-[#3D2B1F] uppercase">{log.studentName}</strong>
                    </div>
                    <p className="text-xs text-gray-700">{log.desc}</p>
                    <span className="block text-[9px] text-[#7D6B5D]">{log.date} Log Entry</span>
                  </div>

                  <div className="text-right flex items-center gap-1.5 font-bold text-[#6B8E23] text-sm bg-[#E8F1D7] px-3 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 fill-[#6B8E23]" /> +{log.points} Pts
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add merit form */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-3.5 h-fit">
            <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-1">Record Incident or Merit Points</span>
            
            <form onSubmit={handleAddIncident} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babirye Shifra"
                  value={newDiscName}
                  onChange={(e) => setNewDiscName(e.target.value)}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Tracking Category</label>
                <select
                  value={newDiscType}
                  onChange={(e) => setNewDiscType(e.target.value as any)}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                >
                  <option value="Positive Merit">🏆 Positive Merit Stamp</option>
                  <option value="Counseling Log">🗣️ Counseling / Guiding session</option>
                  <option value="Minor Incident">⚠️ Playground Incident</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Detail Remarks / description *</label>
                <textarea
                  required
                  placeholder="e.g. Shared sorting balls graciously with peers."
                  value={newDiscDesc}
                  onChange={(e) => setNewDiscDesc(e.target.value)}
                  className="w-full h-18 text-xs p-2 bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Merit points Awarded</label>
                <input
                  type="number"
                  value={newDiscPts}
                  onChange={(e) => setNewDiscPts(Number(e.target.value))}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg font-bold text-[#6B8E23]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6B8E23] text-white py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                Incorporate Merit into Star Ledger
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUB-VIEW 5: RECESS & EVENTS CALENDAR */}
      {subTab === 'events' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
          
          <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-[#7D6B5D]">sports and academic outings planner</h4>
            
            <div className="space-y-4">
              {events.filter(ev => !globalSearchTerm || ev.title.toLowerCase().includes(globalSearchTerm.toLowerCase()) || ev.desc.toLowerCase().includes(globalSearchTerm.toLowerCase())).map(ev => (
                <div key={ev.id} className="p-4 bg-[#FDFBF7] rounded-3xl border border-[#E0D8CC]/80 flex gap-4">
                  <div className="w-16 bg-[#F2EDE4] rounded-2xl flex flex-col items-center justify-center text-center p-2 border border-[#E0D8CC]/50 shrink-0">
                    <Calendar className="w-5 h-5 text-[#8C5A3C] mb-1" />
                    <span className="font-mono font-bold text-[10px] text-[#3D2B1F]">{ev.date.split('-')[2]}th</span>
                    <span className="font-sans text-[8px] text-[#7D6B5D] font-extrabold uppercase">June</span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <span className="text-[9px] bg-[#E8F1D7] text-[#6B8E23] px-2 py-0.5 rounded-full font-bold uppercase">{ev.type}</span>
                    <h5 className="font-extrabold text-[13px] text-[#3D2B1F] leading-snug">{ev.title}</h5>
                    <p className="text-gray-600 font-medium leading-relaxed">{ev.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add event list */}
          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-3.5 h-fit">
            <span className="text-[10px] font-bold text-[#8C5A3C] uppercase block mb-1">Add School Outing or Briefing</span>
            
            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zoo Excursion Outing"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">Event Type *</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg"
                >
                  <option value="Excursions">🦁 Zoo Excursion Outing</option>
                  <option value="Sports">🏆 Recess Sports Matches</option>
                  <option value="Parents Meet">🗣️ Parent-Teacher Conference</option>
                  <option value="Academics">📚 Term examinations week</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[#7D6B5D] uppercase mb-1">School Date *</label>
                <input
                  type="date"
                  required
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  className="w-full p-2 text-xs bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg font-mono font-bold"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#8C5A3C] text-white py-2 rounded-xl text-xs font-bold shadow-xs cursor-pointer text-center"
              >
                Publish Event Circular
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
