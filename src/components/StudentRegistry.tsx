import React, { useState, useEffect } from 'react';
import { Pupil, NurseryClass, PupilRequirement, RequirementItemName, ShuttleJourney } from '../types';
import { ExcelImporter } from './ExcelImporter';
import { CSVImporter } from './CSVImporter';
import { Search, UserPlus, GraduationCap, Phone, MapPin, CheckCircle, XCircle, Edit, Save, Plus, X, Camera, Upload, Trash2, Bus, Clock, List, Grid, Download } from 'lucide-react';

interface StudentRegistryProps {
  pupils: Pupil[];
  onAddPupil: (
    pupil: Omit<KeepIdAndRequirements<Pupil>, 'id' | 'installments' | 'requirements'>,
    initialInstallment?: {
      amount: number;
      paymentMethod: 'Bank Slip' | 'Mobile Money' | 'Cash' | 'Agent Banking' | 'Equity Bank' | 'DFCU Bank' | 'School Pay';
      receiptNo: string;
      notes?: string;
    }
  ) => void;
  onImportPupils?: (pupils: Pupil[]) => void;
  onUpdatePupil: (pupil: Pupil) => void;
  onDeletePupil: (pupilId: string) => void;
  globalSearchTerm?: string;
}

// Simple type helper to work around generic Pupil interface
type KeepIdAndRequirements<T> = T;


export function StudentRegistry({ pupils, onAddPupil, onImportPupils, onUpdatePupil, onDeletePupil, globalSearchTerm }: StudentRegistryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<NurseryClass | 'All'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [editingPupil, setEditingPupil] = useState<Pupil | null>(null);

  const handleExcelImportCompleted = (importedPupils: any[]) => {
    if (onImportPupils) {
      onImportPupils(importedPupils as Pupil[]);
    } else {
      importedPupils.forEach((p) => {
        onAddPupil(p);
      });
    }
  };

  const handleCSVImportCompleted = (importedPupils: Pupil[]) => {
    if (onImportPupils) {
      onImportPupils(importedPupils);
    } else {
      importedPupils.forEach((p) => {
        onAddPupil(p);
      });
    }
  };

  const handleExportCSV = () => {
    // Column headers matching standard Ugandan schema and mapping requirements
    const headers = [
      "ID",
      "Full Name",
      "Class Level",
      "Age",
      "Gender",
      "Guardian Name",
      "Guardian Phone",
      "Guardian Email",
      "Home Village",
      "Home District",
      "Immunized Status",
      "Term Fees Required UGX",
      "Total Fees Paid UGX",
      "Outstanding Balance UGX",
      "Status",
      "Enrollment Date",
      "Next of Kin Name",
      "Next of Kin Phone"
    ];

    const rows = pupils.map(pupil => {
      const totalPaid = pupil.installments?.reduce((sum, inst) => sum + inst.amount, 0) || 0;
      const balance = Math.max(0, pupil.termFeesRequired - totalPaid);
      return [
        pupil.id,
        pupil.fullName,
        pupil.classLevel,
        pupil.age,
        pupil.gender,
        pupil.guardianName,
        pupil.guardianPhone,
        pupil.guardianEmail || "",
        pupil.homeVillage,
        pupil.homeDistrict,
        pupil.immunized ? "Yes" : "No",
        pupil.termFeesRequired,
        totalPaid,
        balance,
        pupil.status,
        pupil.enrollmentDate,
        pupil.nextOfKinName || "",
        pupil.nextOfKinPhone || ""
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => 
        row.map(val => {
          const strVal = String(val === null || val === undefined ? "" : val);
          // If there are commas, double quotes, or newlines, wrap in quotes and escape quotes
          if (strVal.includes(",") || strVal.includes('"') || strVal.includes("\n") || strVal.includes("\r")) {
            return `"${strVal.replace(/"/g, '""')}"`;
          }
          return strVal;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `KVA_Student_Registry_Backup_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const [viewStyle, setViewStyle] = useState<'lists' | 'tiles'>(() => {
    return (localStorage.getItem('kva_students_view_style') as 'lists' | 'tiles') || 'tiles';
  });

  useEffect(() => {
    localStorage.setItem('kva_students_view_style', viewStyle);
  }, [viewStyle]);

  // Local state for shuttle journey creator inside Edit Modal
  const [newSjRoute, setNewSjRoute] = useState('');
  const [newSjDriver, setNewSjDriver] = useState('');
  const [newSjVan, setNewSjVan] = useState('');
  const [newSjPickup, setNewSjPickup] = useState('07:15 AM');
  const [newSjDropoff, setNewSjDropoff] = useState('04:30 PM');
  const [newSjCost, setNewSjCost] = useState(150000);
  const [newSjStatus, setNewSjStatus] = useState<'Active' | 'Suspended' | 'Completed'>('Active');
  const [showAddSjForm, setShowAddSjForm] = useState(false);

  const handleAddShuttleJourney = () => {
    if (!editingPupil) return;
    if (!newSjRoute) {
      alert("Please select or enter a shuttle route!");
      return;
    }
    const newJourney: ShuttleJourney = {
      id: `SJ-${Date.now()}`,
      routeName: newSjRoute,
      driverName: newSjDriver || 'Uncle Moses',
      shuttleVanNo: newSjVan || 'UBC-401A',
      pickupTime: newSjPickup,
      dropoffTime: newSjDropoff,
      status: newSjStatus,
      costPerTermUGX: Number(newSjCost)
    };
    
    const updatedJourneys = [...(editingPupil.shuttleJourneys || []), newJourney];
    setEditingPupil({
      ...editingPupil,
      shuttleJourneys: updatedJourneys
    });
    
    // Reset journey fields
    setNewSjRoute('');
    setNewSjDriver('');
    setNewSjVan('');
    setNewSjPickup('07:15 AM');
    setNewSjDropoff('04:30 PM');
    setNewSjCost(150000);
    setNewSjStatus('Active');
    setShowAddSjForm(false);
  };

  const handleRemoveShuttleJourney = (journeyId: string) => {
    if (!editingPupil) return;
    const updatedJourneys = (editingPupil.shuttleJourneys || []).filter(j => j.id !== journeyId);
    setEditingPupil({
      ...editingPupil,
      shuttleJourneys: updatedJourneys
    });
  };

  // Form State for Adding
  const [fullName, setFullName] = useState('');
  const [classLevel, setClassLevel] = useState<NurseryClass>('KG1');
  const [age, setAge] = useState(3);
  const [gender, setGender] = useState<'Boy' | 'Girl'>('Boy');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [nextOfKinName, setNextOfKinName] = useState('');
  const [nextOfKinPhone, setNextOfKinPhone] = useState('');
  const [homeVillage, setHomeVillage] = useState('');
  const [homeDistrict, setHomeDistrict] = useState('Kampala');
  const [immunized, setImmunized] = useState(true);
  const [termFeesRequired, setTermFeesRequired] = useState(400000);
  const [photoUrl, setPhotoUrl] = useState('');

  // Initial deposit states
  const [initialDepositAmount, setInitialDepositAmount] = useState(0);
  const [initialDepositMethod, setInitialDepositMethod] = useState<'Bank Slip' | 'Mobile Money' | 'Cash' | 'Agent Banking' | 'Equity Bank' | 'DFCU Bank' | 'School Pay'>('Bank Slip');
  const [initialDepositReceipt, setInitialDepositReceipt] = useState('');
  const [initialDepositNotes, setInitialDepositNotes] = useState('');

  // Helper to handle initial deposit fields inside the Edit Modal
  const handleEditInitialDepositField = (field: string, value: any) => {
    if (!editingPupil) return;
    const installmentsCopy = editingPupil.installments ? [...editingPupil.installments] : [];
    if (installmentsCopy.length > 0) {
      installmentsCopy[0] = {
        ...installmentsCopy[0],
        [field]: value
      };
    } else {
      // Create new initial installment
      const newInst = {
        id: `I${Date.now()}`,
        amount: field === 'amount' ? Number(value) : 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: field === 'paymentMethod' ? value : 'Bank Slip',
        receiptNo: field === 'receiptNo' ? value : `REC-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: field === 'notes' ? value : 'Initial fees deposit.',
        center: 'Academic Instruction & Tuition'
      };
      installmentsCopy.push(newInst);
    }
    setEditingPupil({
      ...editingPupil,
      installments: installmentsCopy
    });
  };


  // Camera States
  const [activeCamStream, setActiveCamStream] = useState<MediaStream | null>(null);
  const [activeEditCamStream, setActiveEditCamStream] = useState<MediaStream | null>(null);

  // Cleanup camera streams on helper unmount
  useEffect(() => {
    return () => {
      if (activeCamStream) {
        activeCamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeCamStream]);

  useEffect(() => {
    return () => {
      if (activeEditCamStream) {
        activeEditCamStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeEditCamStream]);

  // Stop camera when modalities change
  useEffect(() => {
    if (!showAddModal && activeCamStream) {
      activeCamStream.getTracks().forEach(track => track.stop());
      setActiveCamStream(null);
    }
  }, [showAddModal]);

  useEffect(() => {
    if (!editingPupil && activeEditCamStream) {
      activeEditCamStream.getTracks().forEach(track => track.stop());
      setActiveEditCamStream(null);
    }
  }, [editingPupil]);

  const startCamera = async (isEdit: boolean) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (isEdit) {
        setActiveEditCamStream(stream);
      } else {
        setActiveCamStream(stream);
      }
    } catch (err: any) {
      alert("Could not start device camera! Check if application permissions are allowed. Details: " + err.message);
    }
  };

  const stopCamera = (isEdit: boolean) => {
    const stream = isEdit ? activeEditCamStream : activeCamStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (isEdit) {
        setActiveEditCamStream(null);
      } else {
        setActiveCamStream(null);
      }
    }
  };

  const capturePhoto = (isEdit: boolean) => {
    const videoId = isEdit ? 'edit-camera-video' : 'add-camera-video';
    const video = document.getElementById(videoId) as HTMLVideoElement | null;
    if (!video) {
      alert('Camera feed element not found!');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        if (isEdit && editingPupil) {
          setEditingPupil({ ...editingPupil, photoUrl: dataUrl });
        } else {
          setPhotoUrl(dataUrl);
        }
      }
      stopCamera(isEdit);
    } catch (err: any) {
      alert("Error capturing snapshot: " + err.message);
    }
  };

  // Filtered pupils
  const effectiveSearchTerm = globalSearchTerm !== undefined ? globalSearchTerm : searchTerm;
  const filteredPupils = pupils.filter(pupil => {
    const matchesSearch = pupil.fullName.toLowerCase().includes(effectiveSearchTerm.toLowerCase()) || 
                          pupil.guardianName.toLowerCase().includes(effectiveSearchTerm.toLowerCase());
    const matchesClass = selectedClass === 'All' || pupil.classLevel === selectedClass;
    return matchesSearch && matchesClass;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !guardianName || !guardianPhone) {
      alert('Please fill in Name, Guardian Name, and Phone number!');
      return;
    }

    const initialInstallment = initialDepositAmount > 0 ? {
      amount: initialDepositAmount,
      paymentMethod: initialDepositMethod,
      receiptNo: initialDepositReceipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: initialDepositNotes || 'Initial deposit paid during enrollment.'
    } : undefined;

    onAddPupil({
      fullName,
      classLevel,
      age: Number(age),
      gender,
      guardianName,
      guardianPhone,
      guardianEmail: guardianEmail || undefined,
      nextOfKinName: nextOfKinName || undefined,
      nextOfKinPhone: nextOfKinPhone || undefined,
      homeVillage,
      homeDistrict,
      immunized,
      termFeesRequired: Number(termFeesRequired),
      status: 'Active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      photoUrl: photoUrl || undefined
    }, initialInstallment);
    // Reset form
    setFullName('');
    setAge(3);
    setGuardianName('');
    setGuardianPhone('');
    setGuardianEmail('');
    setNextOfKinName('');
    setNextOfKinPhone('');
    setHomeVillage('');
    setHomeDistrict('Kampala');
    setImmunized(true);
    setTermFeesRequired(400000);
    setPhotoUrl('');
    setInitialDepositAmount(0);
    setInitialDepositMethod('Bank Slip');
    setInitialDepositReceipt('');
    setInitialDepositNotes('');
    stopCamera(false);
    setShowAddModal(false);
  };


  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPupil) return;
    onUpdatePupil(editingPupil);
    stopCamera(true);
    setEditingPupil(null);
  };

  const toggleRequirement = (pupil: Pupil, reqName: RequirementItemName) => {
    const updatedRequirements = pupil.requirements.map(req => {
      if (req.name === reqName) {
        return {
          ...req,
          brought: !req.brought,
          dateBrought: !req.brought ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return req;
    });
    onUpdatePupil({
      ...pupil,
      requirements: updatedRequirements
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Control Rail */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-4 rounded-3xl border border-[#E0D8CC]">
        <div className="flex-1 flex flex-col md:flex-row gap-3">
          {globalSearchTerm === undefined && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7D6B5D]" />
              <input
                id="registry-search"
                type="text"
                placeholder="Search pupils or guardian names..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-[#FDFBF7] text-[#3D2B1F] border border-[#E0D8CC] rounded-lg focus:outline-hidden focus:border-[#6B8E23]"
              />
            </div>
          )}
          <div className="flex gap-2">
            {(['All', 'KG1', 'KG2', 'KG3', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'] as const).map((lvl) => (
              <button
                id={`filter-${lvl.replace(/\s+/g, '-')}`}
                key={lvl}
                onClick={() => setSelectedClass(lvl)}
                className={`py-1.5 px-3.5 text-xs font-semibold rounded-full border transition-colors ${
                  selectedClass === lvl
                    ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                    : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                }`}
              >
                {lvl === 'All' ? 'All Classes' : lvl.replace('Primary ', 'P.')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 border border-[#E0D8CC] p-1 rounded-2xl bg-[#FAF8F5] shrink-0" id="view-mode-selector">
            <button
              type="button"
              id="view-lists-btn"
              title="Lists View"
              onClick={() => setViewStyle('lists')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                viewStyle === 'lists'
                  ? 'bg-white text-[#6B8E23] border border-[#E0D8CC]/70 shadow-xs scale-102'
                  : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              id="view-tiles-btn"
              title="Tiles View"
              onClick={() => setViewStyle('tiles')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                viewStyle === 'tiles'
                  ? 'bg-white text-[#6B8E23] border border-[#E0D8CC]/70 shadow-xs scale-102'
                  : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            id="btn-import-excel"
            onClick={() => setShowExcelImport(true)}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="h-4 w-4 text-sky-450" /> Import via Excel
          </button>

          <button
            id="btn-import-csv"
            onClick={() => setShowCSVImport(true)}
            className="px-5 py-2 text-sm font-semibold rounded-full bg-indigo-950 hover:bg-indigo-900 text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer animate-pulse"
            title="Import students list from a local CSV file to register them in bulk"
          >
            <Upload className="h-4 w-4 text-emerald-400" /> Bulk Import CSV
          </button>

          <button
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-5 py-2 text-sm font-semibold rounded-full border border-amber-800/35 hover:bg-[#FAF5EE] text-amber-900 bg-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            title="Export all student registry data to a CSV file for backups and external analysis"
          >
            <Download className="h-4 w-4 text-amber-700" /> Export CSV Backup
          </button>

          <button
            id="btn-add-pupil"
            onClick={() => setShowAddModal(true)}
            className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-5 py-2 text-sm font-semibold rounded-full flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="h-4 w-4" /> Enroll Student
          </button>
        </div>
      </div>

      {/* Pupils List Container */}
      {filteredPupils.length === 0 ? (
        <div className="bg-white text-center py-16 rounded-3xl border border-dashed border-[#E0D8CC]">
          <GraduationCap className="h-12 w-12 text-[#7D6B5D] opacity-40 mx-auto mb-3" />
          <p className="text-[#3D2B1F] font-semibold">No pupils found matching current filters.</p>
          <p className="text-[#7D6B5D] text-sm mt-1">Enroll a pupil to populate this registry class list.</p>
        </div>
      ) : viewStyle === 'tiles' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          {filteredPupils.map((pupil) => {
            const requirementsBroughtCount = pupil.requirements.filter(r => r.brought).length;
            const requirementsTotalCount = pupil.requirements.length;
            const totalFeesPaid = pupil.installments.reduce((sum, inst) => sum + inst.amount, 0);
            const remainingFees = Math.max(0, pupil.termFeesRequired - totalFeesPaid);

            return (
              <div key={pupil.id} id={`pupil-card-${pupil.id}`} className="bg-white rounded-3xl border border-[#E0D8CC] p-6 hover:shadow-xs transition-all relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#8C5A3C]"></div>
                
                <div className="flex justify-between items-start mb-4 pl-2 gap-3">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0 w-11 h-11 rounded-2xl overflow-hidden border border-[#E0D8CC] bg-[#F2EDE4] flex items-center justify-center shadow-xs">
                      {pupil.photoUrl ? (
                        <img 
                          src={pupil.photoUrl} 
                          alt={pupil.fullName} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-sm font-black text-[#8C5A3C] uppercase">
                          {pupil.fullName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-[#3D2B1F] leading-tight flex flex-wrap items-center gap-1.5">
                        {pupil.fullName}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          pupil.gender === 'Girl' ? 'bg-[#F9ECE4] text-[#8C5A3C]' : 'bg-[#E8F1D7] text-[#6B8E23]'
                        }`}>
                          {pupil.gender === 'Girl' ? 'Girl' : 'Boy'}
                        </span>
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-[#7D6B5D]">
                        <GraduationCap className="h-3.5 w-3.5 text-[#6B8E23]" />
                        <span className="font-semibold text-[#5A3E2B]">{pupil.classLevel}</span>
                        <span>•</span>
                        <span>{pupil.age} Yr Old</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      id={`edit-pupil-${pupil.id}`}
                      onClick={() => setEditingPupil(pupil)}
                      className="p-1.5 text-[#7D6B5D] hover:text-[#8C5A3C] hover:bg-[#F2EDE4] rounded-lg transition-colors cursor-pointer"
                      title="Edit Pupil Details"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      id={`delete-pupil-${pupil.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to permanently delete learner ${pupil.fullName} from the registry?`)) {
                          onDeletePupil(pupil.id);
                        }
                      }}
                      className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-100 hover:border-red-500 cursor-pointer"
                      title="Delete Pupil"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold self-center ${
                      pupil.status === 'Active' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-[#F9ECE4] text-[#8C5A3C]'
                    }`}>
                      {pupil.status}
                    </span>
                  </div>
                </div>

                {/* Grid Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[#FDFBF7] p-4 rounded-2xl border border-[#E0D8CC] mb-4 pl-4">
                  <div className="space-y-1.5">
                    <p className="text-[#7D6B5D] font-bold uppercase tracking-wider text-[10px]">Guardian Contact</p>
                    <p className="font-bold text-[#3D2B1F]">{pupil.guardianName}</p>
                    <p className="flex items-center gap-1 text-[#7D6B5D] font-mono">
                      <Phone className="h-3 w-3 text-[#6B8E23]" /> {pupil.guardianPhone}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[#7D6B5D] font-bold uppercase tracking-wider text-[10px]">Next of Kin (NOK)</p>
                    {pupil.nextOfKinName ? (
                      <>
                        <p className="font-bold text-[#3D2B1F]">{pupil.nextOfKinName}</p>
                        <p className="flex items-center gap-1 text-[#7D6B5D] font-mono">
                          <Phone className="h-3 w-3 text-[#8C5A3C]" /> {pupil.nextOfKinPhone || 'N/A'}
                        </p>
                      </>
                    ) : (
                      <p className="text-[#3D2B1F] italic text-xs">None Registered</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[#7D6B5D] font-bold uppercase tracking-wider text-[10px]">Residence Location</p>
                    <p className="flex items-center gap-1 font-semibold text-[#3D2B1F]">
                      <MapPin className="h-3 w-3 text-[#8C5A3C]" /> {pupil.homeVillage}
                    </p>
                    <p className="text-[#7D6B5D] font-medium">{pupil.homeDistrict} District</p>
                  </div>
                  <div className="col-span-1 md:col-span-3 flex items-center justify-between border-t border-[#E0D8CC] pt-2.5 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#7D6B5D] font-semibold">Health:</span>
                      {pupil.immunized ? (
                        <span className="flex items-center gap-1 text-[#6B8E23] font-bold bg-[#E8F1D7] px-2 py-0.5 rounded text-[10px]">
                          <CheckCircle className="h-3 w-3" /> Immunized
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[#8C5A3C] font-bold bg-[#F9ECE4] px-2 py-0.5 rounded text-[10px]">
                          <XCircle className="h-3 w-3" /> Due UNEPI card
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="text-[#7D6B5D] mr-1.5 font-semibold">Fees Balance:</span>
                      <span className={`font-bold text-xs ${remainingFees === 0 ? 'text-[#6B8E23] bg-[#E8F1D7] px-2 py-0.5 rounded-full' : 'text-[#8C5A3C] bg-[#F9ECE4] px-2 py-0.5 rounded-full'}`}>
                        {remainingFees === 0 ? 'Fully Paid' : `${remainingFees.toLocaleString()} UGX`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements Checklist Card segment */}
                <div className="pl-2 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A3E2B]">
                      Term Requirements Provided ({requirementsBroughtCount}/{requirementsTotalCount})
                    </span>
                    <span className="text-[10px] text-[#7D6B5D] italic">Click bubble to toggle</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pupil.requirements.map((req) => (
                      <button
                        id={`toggle-req-${pupil.id}-${req.name.split(' ')[0]}`}
                        key={req.name}
                        onClick={() => toggleRequirement(pupil, req.name)}
                        className={`text-[10px] py-1 px-2.5 rounded-full font-medium border flex items-center gap-1.5 transition-all ${
                          req.brought
                            ? 'bg-[#E8F1D7] text-[#6B8E23] border-[#6B8E23] font-bold'
                            : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${req.brought ? 'bg-[#6B8E23]' : 'bg-[#E0D8CC]'}`} />
                        {req.name.split(' ')[0]} {req.name.includes('Paper') ? 'Paper' : req.name.includes('Flour') ? 'Flour' : req.name.split(' ').slice(1,2).join(' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shuttle Journeys Card segment */}
                <div className="pl-2 pt-3 border-t border-dashed border-[#E0D8CC]/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#5A3E2B] flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-sky-650" /> Shuttle Journeys ({pupil.shuttleJourneys?.length || 0})
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingPupil(pupil)}
                      className="text-[10px] text-sky-600 hover:text-sky-850 font-bold transition-all cursor-pointer"
                    >
                      + Manage
                    </button>
                  </div>
                  {pupil.shuttleJourneys && pupil.shuttleJourneys.length > 0 ? (
                    <div className="space-y-1.5">
                      {pupil.shuttleJourneys.map((sj) => (
                        <div key={sj.id} className="flex justify-between items-center bg-[#F0F9FF] p-2.5 rounded-xl border border-[#E0F2FE] text-[11px]">
                          <div className="flex flex-col">
                            <span className="font-extrabold text-[#3D2B1F]">{sj.routeName}</span>
                            <span className="text-[#7D6B5D] text-[10px] font-semibold">Van: {sj.shuttleVanNo} • {sj.driverName}</span>
                          </div>
                          <div className="text-right flex flex-col items-end">
                            <span className="font-bold text-[#0284c7] bg-[#E0F2FE] px-1.5 py-0.2 rounded flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#0284c7]" /> {sj.pickupTime} - {sj.dropoffTime}
                            </span>
                            <span className="text-[9px] text-[#7D6B5D] uppercase tracking-wider font-extrabold mt-0.5">{sj.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#7D6B5D] italic">No nursery shuttle journeys scheduled for this learner.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Gorgeous Tabular Lists Style View */
        <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden shadow-2xs animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E0D8CC] text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider">
                  <th className="py-4 px-6">Learner Profile</th>
                  <th className="py-4 px-4">Class & Age</th>
                  <th className="py-4 px-4">Guardian Contact</th>
                  <th className="py-4 px-4">Fees Status (UGX)</th>
                  <th className="py-4 px-4">Term Requirements</th>
                  <th className="py-4 px-4">Shuttle Status</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2EDE4]/80 text-xs text-[#3D2B1F]">
                {filteredPupils.map((pupil) => {
                  const requirementsBroughtCount = pupil.requirements.filter(r => r.brought).length;
                  const requirementsTotalCount = pupil.requirements.length;
                  const totalFeesPaid = pupil.installments.reduce((sum, inst) => sum + inst.amount, 0);
                  const remainingFees = Math.max(0, pupil.termFeesRequired - totalFeesPaid);

                  return (
                    <tr key={pupil.id} id={`pupil-row-${pupil.id}`} className="hover:bg-[#FAF8F5]/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="shrink-0 w-9 h-9 rounded-xl overflow-hidden border border-[#E0D8CC] bg-[#F2EDE4] flex items-center justify-center shadow-3xs">
                            {pupil.photoUrl ? (
                              <img src={pupil.photoUrl} alt={pupil.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-xs font-black text-[#8C5A3C] uppercase">{pupil.fullName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-[#3D2B1F] block">{pupil.fullName}</span>
                            <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider ${
                              pupil.gender === 'Girl' ? 'bg-[#F9ECE4] text-[#8C5A3C]' : 'bg-[#E8F1D7] text-[#6B8E23]'
                            }`}>
                              {pupil.gender}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-[#5A3E2B] block">{pupil.classLevel}</span>
                        <span className="text-[#7D6B5D] text-[10px]">{pupil.age} Yr Old</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#3D2B1F]">{pupil.guardianName}</p>
                          <p className="text-[#7D6B5D] font-mono text-[10px] flex items-center gap-1">
                            <Phone className="h-3 w-3 text-[#6B8E23]" /> {pupil.guardianPhone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full ${remainingFees === 0 ? 'text-[#6B8E23] bg-[#E8F1D7]' : 'text-[#8C5A3C] bg-[#F9ECE4]'}`}>
                          {remainingFees === 0 ? 'Fully Paid' : `${remainingFees.toLocaleString()} Bal`}
                        </span>
                        <p className="text-[10px] text-[#7D6B5D] mt-0.5">Paid {totalFeesPaid.toLocaleString()} / {pupil.termFeesRequired.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#5A3E2B]">
                            <span>{requirementsBroughtCount}/{requirementsTotalCount}</span>
                            <span className="text-[#7D6B5D] font-normal">Brought</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {pupil.requirements.map((req) => (
                              <button
                                id={`toggle-list-req-${pupil.id}-${req.name.split(' ')[0]}`}
                                key={req.name}
                                title={`${req.name}: ${req.brought ? 'Provided' : 'Pending (Click to toggle)'}`}
                                onClick={() => toggleRequirement(pupil, req.name)}
                                className={`text-[9px] px-1.5 py-0.5 rounded-md border font-medium cursor-pointer transition-all ${
                                  req.brought 
                                    ? 'bg-[#E8F1D7] text-[#6B8E23] border-[#6B8E23] font-bold shadow-3xs' 
                                    : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                                }`}
                              >
                                {req.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {pupil.shuttleJourneys && pupil.shuttleJourneys.length > 0 ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-[#0284c7] text-[10px] bg-[#E0F2FE] px-1.5 py-0.5 rounded flex items-center gap-1 w-max">
                              <Bus className="w-2.5 h-2.5" /> Van Scheduled
                            </span>
                            <span className="text-[10px] text-[#7D6B5D] block">{pupil.shuttleJourneys[0].routeName}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-[#7D6B5D] italic">No Shuttle</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            id={`list-edit-${pupil.id}`}
                            onClick={() => setEditingPupil(pupil)}
                            className="p-1 px-2.5 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer border border-sky-100 flex items-center gap-1 text-[10px] font-black"
                            title="Edit details"
                          >
                            <Edit className="h-3 w-3" /> Edit
                          </button>
                          <button
                            id={`list-delete-${pupil.id}`}
                            onClick={() => {
                              if (confirm(`Are you absolutely sure you want to permanently delete learner ${pupil.fullName}?`)) {
                                onDeletePupil(pupil.id);
                              }
                            }}
                            className="p-1 px-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 cursor-pointer flex items-center gap-1 text-[10px] font-black"
                            title="Delete pupil"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </button>
                          <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                            pupil.status === 'Active' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-[#F9ECE4] text-[#8C5A3C]'
                          }`}>
                            {pupil.status}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Total number of students below the table */}
          <div className="bg-[#FAF8F5] border-t border-[#E0D8CC] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#7D6B5D] font-bold" id="student-registry-table-footer">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#6B8E23] animate-pulse"></span>
              <span>Showing <strong className="text-[#3D2B1F] font-black">{filteredPupils.length}</strong> of <strong className="text-[#3D2B1F] font-black">{pupils.length}</strong> enrolled kids in active registry selection level.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-105 bg-amber-50 text-[#8C5A3C] px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border border-[#E0D8CC]">
                🏫 KVA Total Academic Register: {pupils.length} Learners
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Excel Importer Modal */}
      {showExcelImport && (
        <ExcelImporter 
          type="pupils"
          onImportCompleted={handleExcelImportCompleted}
          onClose={() => setShowExcelImport(false)}
        />
      )}

      {/* CSV Importer Modal */}
      {showCSVImport && (
        <CSVImporter 
          onImportCompleted={handleCSVImportCompleted}
          onClose={() => setShowCSVImport(false)}
        />
      )}

      {/* Add Pupil Modal */}
      {showAddModal && (
        <div id="add-pupil-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#E0D8CC] max-h-[90vh] overflow-y-auto text-[#3D2B1F]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E0D8CC]">
              <h2 className="text-lg font-bold text-[#5A3E2B] flex items-center gap-2">
                <GraduationCap className="text-[#6B8E23] h-5 w-5" /> Enrolling New Student
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F2EDE4] rounded-lg">
                <X className="h-5 w-5 text-[#7D6B5D]" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pupil Name */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Pupil's Full Name *</label>
                  <input
                    id="add-pupil-name"
                    type="text"
                    required
                    placeholder="e.g. Wasswa Paul"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden focus:border-[#6B8E23]"
                  />
                </div>

                {/* Class options */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Nursery Class *</label>
                  <select
                    id="add-pupil-class"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as NurseryClass)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden"
                  >
                    <option value="KG1">KG1 (3-4 Yrs)</option>
                    <option value="KG2">KG2 (4-5 Yrs)</option>
                    <option value="KG3">KG3 (5-6 Yrs)</option>
                    <option value="Primary One">Primary One (P.1)</option>
                    <option value="Primary Two">Primary Two (P.2)</option>
                    <option value="Primary Three">Primary Three (P.3)</option>
                    <option value="Primary Four">Primary Four (P.4)</option>
                    <option value="Primary Five">Primary Five (P.5)</option>
                    <option value="Primary Six">Primary Six (P.6)</option>
                    <option value="Primary Seven">Primary Seven (P.7)</option>
                  </select>
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Age (Years) *</label>
                  <input
                    id="add-pupil-age"
                    type="number"
                    min="2"
                    max="8"
                    required
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Gender *</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3D2B1F] cursor-pointer">
                      <input
                        id="add-pupil-gender-boy"
                        type="radio"
                        name="gender"
                        checked={gender === 'Boy'}
                        onChange={() => setGender('Boy')}
                        className="text-[#6B8E23] focus:ring-[#6B8E23]"
                      /> Boy
                    </label>
                    <label className="flex items-center gap-2 text-sm font-semibold text-[#3D2B1F] cursor-pointer">
                      <input
                        id="add-pupil-gender-girl"
                        type="radio"
                        name="gender"
                        checked={gender === 'Girl'}
                        onChange={() => setGender('Girl')}
                        className="text-[#6B8E23] focus:ring-[#6B8E23]"
                      /> Girl
                    </label>
                  </div>
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Parent / Guardian Name *</label>
                  <input
                    id="add-pupil-guardian-name"
                    type="text"
                    required
                    placeholder="e.g. Sserwadda Joseph"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden"
                  />
                </div>

                {/* Guardian Phone */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Guardian Phone *</label>
                  <input
                    id="add-pupil-guardian-phone"
                    type="text"
                    required
                    placeholder="e.g. +256 702 123456"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg font-mono focus:outline-hidden"
                  />
                </div>

                {/* Guardian Email */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Guardian Email</label>
                  <input
                    id="add-pupil-guardian-email"
                    type="email"
                    placeholder="optional"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                {/* Next of Kin Name */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Next of Kin Name</label>
                  <input
                    id="add-pupil-nok-name"
                    type="text"
                    placeholder="e.g. Aunt Sarah Sserwadda"
                    value={nextOfKinName}
                    onChange={(e) => setNextOfKinName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden"
                  />
                </div>

                {/* Next of Kin Contact */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Next of Kin Contact</label>
                  <input
                    id="add-pupil-nok-phone"
                    type="text"
                    placeholder="e.g. +256 752 987654"
                    value={nextOfKinPhone}
                    onChange={(e) => setNextOfKinPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg font-mono focus:outline-hidden"
                  />
                </div>

                {/* Village */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Home Village / Sub-county</label>
                  <input
                    id="add-pupil-village"
                    type="text"
                    placeholder="e.g. Kigo / Makindye"
                    value={homeVillage}
                    onChange={(e) => setHomeVillage(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                {/* District */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Home District</label>
                  <input
                    id="add-pupil-district"
                    type="text"
                    required
                    value={homeDistrict}
                    onChange={(e) => setHomeDistrict(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                {/* Term Fee Target */}
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Tuition Fees per Term (UGX) *</label>
                  <input
                    id="add-pupil-fees"
                    type="number"
                    step="5000"
                    required
                    value={termFeesRequired}
                    onChange={(e) => setTermFeesRequired(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden font-bold"
                  />
                </div>

                {/* Initial Fees Deposit configuration */}
                <div className="col-span-1 md:col-span-2 p-5 bg-[#ECFDF5] rounded-3xl border border-[#A7F3D0] space-y-3">
                  <h4 className="text-xs font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                    💵 Initial Fees Deposit (First Payment)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Deposit Amount (UGX)</label>
                      <input
                        id="add-pupil-initial-deposit"
                        type="number"
                        placeholder="0"
                        step="5000"
                        value={initialDepositAmount || ''}
                        onChange={(e) => setInitialDepositAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-bold text-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Payment Method</label>
                      <select
                        id="add-pupil-initial-deposit-method"
                        value={initialDepositMethod}
                        onChange={(e) => setInitialDepositMethod(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-semibold text-stone-800"
                      >
                        <option value="Bank Slip">Bank Slip</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Cash">Cash</option>
                        <option value="Agent Banking">Agent Banking</option>
                        <option value="Equity Bank">Equity Bank</option>
                        <option value="DFCU Bank">DFCU Bank</option>
                        <option value="School Pay">School Pay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Receipt Reference Number</label>
                      <input
                        id="add-pupil-initial-deposit-receipt"
                        type="text"
                        placeholder="e.g. REC-5821"
                        value={initialDepositReceipt}
                        onChange={(e) => setInitialDepositReceipt(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Deposit Payment Notes</label>
                    <input
                      id="add-pupil-initial-deposit-notes"
                      type="text"
                      placeholder="e.g. Paid first installment at school desk"
                      value={initialDepositNotes}
                      onChange={(e) => setInitialDepositNotes(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>


                {/* Photo & Avatar Upload/Selector Option */}
                <div className="col-span-1 sm:col-span-2 bg-[#F9F7F4] border border-[#E0D8CC] p-4 rounded-2xl space-y-3.5">
                  <span className="block text-xs font-black uppercase tracking-wider text-[#7D6B5D]">Learner Photo Selection</span>
                  
                  {/* Live Camera Interface */}
                  {activeCamStream ? (
                    <div className="bg-[#3D2B1F]/5 p-3 rounded-xl border border-[#E0D8CC] space-y-2.5">
                      <span className="block text-[10px] font-bold text-[#8C5A3C] uppercase tracking-wider">Live Camera Viewfinder</span>
                      <div className="relative aspect-video sm:max-w-md mx-auto rounded-xl overflow-hidden bg-black border-2 border-[#8C5A3C] shadow-inner">
                        <video 
                          id="add-camera-video" 
                          autoPlay 
                          playsInline 
                          ref={el => { if (el) el.srcObject = activeCamStream; }}
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => capturePhoto(false)}
                          className="px-4 py-1.5 bg-[#6B8E23] text-white font-bold rounded-lg text-xs hover:bg-[#58751d] shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" /> Take Snapshot
                        </button>
                        <button
                          type="button"
                          onClick={() => stopCamera(false)}
                          className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg text-xs hover:bg-red-600 shadow-sm cursor-pointer"
                        >
                          Cancel Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Visual Preview */}
                      <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#8C5A3C] bg-white flex items-center justify-center shadow-xs">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-1 text-[10px] text-[#7D6B5D] font-bold">
                            <Camera className="w-5 h-5 mx-auto text-[#8C5A3C] mb-1" />
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        {/* Device image upload and Live Camera trigger */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Upload Device Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setPhotoUrl(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-[#8C5A3C] file:text-white hover:file:bg-[#744a30] cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <button
                              type="button"
                              onClick={() => startCamera(false)}
                              className="w-full py-1.5 px-3 bg-[#8C5A3C] text-white font-bold rounded-lg text-[11px] hover:bg-[#744a30] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5 shrink-0" /> Live Camera
                            </button>
                          </div>
                        </div>

                        {/* URL input field */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Or Paste Image URL</label>
                          <input
                            id="add-pupil-photo"
                            type="url"
                            placeholder="https://images.unsplash.com/child-photo"
                            value={photoUrl}
                            onChange={(e) => setPhotoUrl(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden text-[#3D2B1F]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Quick selections */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase text-[#7D6B5D]">Or Select Free Preschooler Portrait Preset:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { name: 'Preset 1', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 2', url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 4', url: 'https://images.unsplash.com/photo-1514161911277-41d7d296ae22?auto=format&fit=crop&w=150&h=150&q=80' }
                      ].map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPhotoUrl(item.url)}
                          className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            photoUrl === item.url ? 'border-[#8C5A3C] scale-105 shadow-xs' : 'border-transparent hover:border-[#E0D8CC]'
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl('')}
                          className="text-[10px] text-red-500 hover:underline font-bold ml-2 cursor-pointer"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Immunization checklist */}
                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="add-pupil-immunized"
                    type="checkbox"
                    checked={immunized}
                    onChange={(e) => setImmunized(e.target.checked)}
                    className="w-4 h-4 text-[#6B8E23] border-[#E0D8CC] rounded focus:ring-[#6B8E23]"
                  />
                  <label htmlFor="add-pupil-immunized" className="text-xs font-bold text-[#3D2B1F] cursor-pointer">
                    Fully Immunized (UNEPI Standard)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8CC] mt-6">
                <button
                  type="button"
                  id="add-pupil-cancel"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-[#F2EDE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="add-pupil-submit"
                  className="px-5 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingPupil && (
        <div id="edit-pupil-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#E0D8CC] max-h-[90vh] overflow-y-auto text-[#3D2B1F]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E0D8CC]">
              <h2 className="text-lg font-bold text-[#5A3E2B] flex items-center gap-2">
                <Edit className="text-[#6B8E23] h-5 w-5" /> Edit Pupil Profile
              </h2>
              <button onClick={() => setEditingPupil(null)} className="p-1 hover:bg-[#F2EDE4] rounded-lg">
                <X className="h-5 w-5 text-[#7D6B5D]" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Pupil Name</label>
                  <input
                    id="edit-pupil-name"
                    type="text"
                    required
                    value={editingPupil.fullName}
                    onChange={(e) => setEditingPupil({ ...editingPupil, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Class Level</label>
                  <select
                    id="edit-pupil-class"
                    value={editingPupil.classLevel}
                    onChange={(e) => setEditingPupil({ ...editingPupil, classLevel: e.target.value as NurseryClass })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  >
                    <option value="KG1">KG1</option>
                    <option value="KG2">KG2</option>
                    <option value="KG3">KG3</option>
                    <option value="Primary One">Primary One (P.1)</option>
                    <option value="Primary Two">Primary Two (P.2)</option>
                    <option value="Primary Three">Primary Three (P.3)</option>
                    <option value="Primary Four">Primary Four (P.4)</option>
                    <option value="Primary Five">Primary Five (P.5)</option>
                    <option value="Primary Six">Primary Six (P.6)</option>
                    <option value="Primary Seven">Primary Seven (P.7)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Age</label>
                  <input
                    id="edit-pupil-age"
                    type="number"
                    value={editingPupil.age}
                    onChange={(e) => setEditingPupil({ ...editingPupil, age: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Status</label>
                  <select
                    id="edit-pupil-status"
                    value={editingPupil.status}
                    onChange={(e) => setEditingPupil({ ...editingPupil, status: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Guardian Name</label>
                  <input
                    id="edit-pupil-guardian"
                    type="text"
                    required
                    value={editingPupil.guardianName}
                    onChange={(e) => setEditingPupil({ ...editingPupil, guardianName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Guardian Phone</label>
                  <input
                    id="edit-pupil-phone"
                    type="text"
                    required
                    value={editingPupil.guardianPhone}
                    onChange={(e) => setEditingPupil({ ...editingPupil, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Next of Kin Name</label>
                  <input
                    id="edit-pupil-nok-name"
                    type="text"
                    value={editingPupil.nextOfKinName || ''}
                    onChange={(e) => setEditingPupil({ ...editingPupil, nextOfKinName: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                    placeholder="e.g. Aunt Sarah Sserwadda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Next of Kin Contact</label>
                  <input
                    id="edit-pupil-nok-phone"
                    type="text"
                    value={editingPupil.nextOfKinPhone || ''}
                    onChange={(e) => setEditingPupil({ ...editingPupil, nextOfKinPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg font-mono"
                    placeholder="e.g. +256 752 987654"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Village/Residence</label>
                  <input
                    id="edit-pupil-village"
                    type="text"
                    value={editingPupil.homeVillage}
                    onChange={(e) => setEditingPupil({ ...editingPupil, homeVillage: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">District</label>
                  <input
                    id="edit-pupil-district"
                    type="text"
                    value={editingPupil.homeDistrict}
                    onChange={(e) => setEditingPupil({ ...editingPupil, homeDistrict: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Required Fees (UGX)</label>
                  <input
                    id="edit-pupil-fees-required"
                    type="number"
                    value={editingPupil.termFeesRequired}
                    onChange={(e) => setEditingPupil({ ...editingPupil, termFeesRequired: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm bg-white border border-[#E0D8CC] rounded-lg font-bold"
                  />
                </div>

                {/* Edit Initial Fees Deposit configuration */}
                <div className="col-span-1 md:col-span-2 p-5 bg-[#ECFDF5] rounded-3xl border border-[#A7F3D0] space-y-3">
                  <h4 className="text-xs font-black text-[#10B981] uppercase tracking-wider flex items-center gap-1.5">
                    💵 Edit Initial Fees Deposit (First Payment)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Deposit Amount (UGX)</label>
                      <input
                        id="edit-pupil-initial-deposit"
                        type="number"
                        placeholder="0"
                        step="5000"
                        value={editingPupil.installments && editingPupil.installments.length > 0 ? editingPupil.installments[0].amount : ''}
                        onChange={(e) => handleEditInitialDepositField('amount', Number(e.target.value))}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-bold text-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Payment Method</label>
                      <select
                        id="edit-pupil-initial-deposit-method"
                        value={editingPupil.installments && editingPupil.installments.length > 0 ? editingPupil.installments[0].paymentMethod : 'Bank Slip'}
                        onChange={(e) => handleEditInitialDepositField('paymentMethod', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-semibold text-stone-800"
                      >
                        <option value="Bank Slip">Bank Slip</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Cash">Cash</option>
                        <option value="Agent Banking">Agent Banking</option>
                        <option value="Equity Bank">Equity Bank</option>
                        <option value="DFCU Bank">DFCU Bank</option>
                        <option value="School Pay">School Pay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Receipt Reference Number</label>
                      <input
                        id="edit-pupil-initial-deposit-receipt"
                        type="text"
                        placeholder="e.g. REC-5821"
                        value={editingPupil.installments && editingPupil.installments.length > 0 ? editingPupil.installments[0].receiptNo : ''}
                        onChange={(e) => handleEditInitialDepositField('receiptNo', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#78716C] uppercase mb-1">Deposit Payment Notes</label>
                    <input
                      id="edit-pupil-initial-deposit-notes"
                      type="text"
                      placeholder="e.g. Paid first installment at school desk"
                      value={editingPupil.installments && editingPupil.installments.length > 0 ? (editingPupil.installments[0].notes || '') : ''}
                      onChange={(e) => handleEditInitialDepositField('notes', e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-[#E2E8F0] rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Photo & Avatar Upload/Selector option for editing */}
                <div className="col-span-1 sm:col-span-2 bg-[#F9F7F4] border border-[#E0D8CC] p-4 rounded-2xl space-y-3.5">
                  <span className="block text-xs font-black uppercase tracking-wider text-[#7D6B5D]">Learner Photo Selection</span>
                  
                  {/* Live Camera Interface */}
                  {activeEditCamStream ? (
                    <div className="bg-[#3D2B1F]/5 p-3 rounded-xl border border-[#E0D8CC] space-y-2.5">
                      <span className="block text-[10px] font-bold text-[#8C5A3C] uppercase tracking-wider">Live Camera Viewfinder</span>
                      <div className="relative aspect-video sm:max-w-md mx-auto rounded-xl overflow-hidden bg-black border-2 border-[#8C5A3C] shadow-inner">
                        <video 
                          id="edit-camera-video" 
                          autoPlay 
                          playsInline 
                          ref={el => { if (el) el.srcObject = activeEditCamStream; }}
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                      </div>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => capturePhoto(true)}
                          className="px-4 py-1.5 bg-[#6B8E23] text-white font-bold rounded-lg text-xs hover:bg-[#58751d] shadow-sm cursor-pointer flex items-center gap-1"
                        >
                          <Camera className="w-3.5 h-3.5" /> Take Snapshot
                        </button>
                        <button
                          type="button"
                          onClick={() => stopCamera(true)}
                          className="px-3 py-1.5 bg-red-500 text-white font-bold rounded-lg text-xs hover:bg-red-600 shadow-sm cursor-pointer"
                        >
                          Cancel Camera
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Visual Preview */}
                      <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#8C5A3C] bg-white flex items-center justify-center shadow-xs">
                        {editingPupil.photoUrl ? (
                          <img 
                            src={editingPupil.photoUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="text-center p-1 text-[10px] text-[#7D6B5D] font-bold">
                            <Camera className="w-5 h-5 mx-auto text-[#8C5A3C] mb-1" />
                            No Photo
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2 w-full">
                        {/* Device image upload and Live Camera trigger */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Upload New Local Image</label>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditingPupil({ ...editingPupil, photoUrl: reader.result as string });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-[#8C5A3C] file:text-white hover:file:bg-[#744a30] cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-col justify-end">
                            <button
                              type="button"
                              onClick={() => startCamera(true)}
                              className="w-full py-1.5 px-3 bg-[#8C5A3C] text-white font-bold rounded-lg text-[11px] hover:bg-[#744a30] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Camera className="w-3.5 h-3.5 shrink-0" /> Live Camera
                            </button>
                          </div>
                        </div>

                        {/* URL input field */}
                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Or Edit Image URL</label>
                          <input
                            id="edit-pupil-photo-url"
                            type="url"
                            placeholder="https://images.unsplash.com/child-photo"
                            value={editingPupil.photoUrl || ''}
                            onChange={(e) => setEditingPupil({ ...editingPupil, photoUrl: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E0D8CC] rounded-lg focus:outline-hidden text-[#3D2B1F]"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preset Quick selections */}
                  <div className="space-y-1">
                    <span className="block text-[9px] font-extrabold uppercase text-[#7D6B5D]">Or Select Free Preschooler Portrait Preset:</span>
                    <div className="flex items-center gap-2">
                      {[
                        { name: 'Preset 1', url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 2', url: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 3', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80' },
                        { name: 'Preset 4', url: 'https://images.unsplash.com/photo-1514161911277-41d7d296ae22?auto=format&fit=crop&w=150&h=150&q=80' }
                      ].map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setEditingPupil({ ...editingPupil, photoUrl: item.url })}
                          className={`relative w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            editingPupil.photoUrl === item.url ? 'border-[#8C5A3C] scale-105 shadow-xs' : 'border-transparent hover:border-[#E0D8CC]'
                          }`}
                        >
                          <img src={item.url} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                      {editingPupil.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setEditingPupil({ ...editingPupil, photoUrl: '' })}
                          className="text-[10px] text-red-500 hover:underline font-bold ml-2 cursor-pointer"
                        >
                          Clear Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    id="edit-pupil-immunized"
                    type="checkbox"
                    checked={editingPupil.immunized}
                    onChange={(e) => setEditingPupil({ ...editingPupil, immunized: e.target.checked })}
                    className="w-4 h-4 text-[#6B8E23] border-[#E0D8CC] rounded focus:ring-[#6B8E23]"
                  />
                  <label htmlFor="edit-pupil-immunized" className="text-xs font-bold text-[#3D2B1F] cursor-pointer">
                    UNEPI Standard Immunized
                  </label>
                </div>

                {/* SCHOOL SHUTTLE JOURNEYS EDITOR AREA */}
                <div className="mt-6 pt-6 border-t border-[#E0D8CC] space-y-4">
                  <div className="flex justify-between items-center bg-[#F0F9FF] p-3.5 rounded-2xl border border-[#E0F2FE]">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase text-[#0284c7] tracking-wider flex items-center gap-1.5">
                        <Bus className="w-4 h-4 text-[#0284c7]" /> Learner Shuttle Service
                      </h4>
                      <p className="text-[10px] text-[#7D6B5D] mt-0.5">Assign, schedule, and edit school van travel routes for this child.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddSjForm(!showAddSjForm)}
                      className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-[10px] rounded-full transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {showAddSjForm ? 'Cancel Form' : '+ Add Journey'}
                    </button>
                  </div>

                  {/* Add Shuttle Journey Form Drawer */}
                  {showAddSjForm && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-[#E0D8CC] space-y-3 animate-fadeInSmooth">
                      <span className="text-[10px] font-black uppercase text-[#8C5A3C] block border-b border-[#E0D8CC] pb-1">Schedule Journey Detail</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Route & Locations</label>
                          <select
                            value={newSjRoute}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewSjRoute(val);
                              // Auto populate driver and van depending on selections
                              if (val === 'Kitemu - Nsangi - Wakiso') {
                                setNewSjDriver('Uncle Moses');
                                setNewSjVan('UBC-401A');
                              } else if (val === 'Kabalagala - Muyenga - Makindye') {
                                setNewSjDriver('Uncle Moses');
                                setNewSjVan('UBC-401A');
                              } else if (val === 'Ntinda - Kiwatule - Bukoto') {
                                setNewSjDriver('Uncle Robert');
                                setNewSjVan('UBC-928K');
                              }
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F] focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="">-- Choose Route --</option>
                            <option value="Kitemu - Nsangi - Wakiso">Kitemu - Nsangi - Wakiso (Uncle Moses, UBC-401A)</option>
                            <option value="Kabalagala - Muyenga - Makindye">Kabalagala - Muyenga - Makindye (Uncle Moses, UBC-401A)</option>
                            <option value="Ntinda - Kiwatule - Bukoto">Ntinda - Kiwatule - Bukoto (Uncle Robert, UBC-928K)</option>
                            <option value="Custom Route">-- Custom Route Name --</option>
                          </select>
                          {newSjRoute?.startsWith('Custom') && (
                            <input
                              type="text"
                              placeholder="Enter custom route..."
                              value={newSjRoute === 'Custom Route' ? '' : newSjRoute}
                              onChange={(e) => setNewSjRoute(e.target.value)}
                              className="w-full mt-1.5 px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Driver Name / Uncle / Auntie</label>
                          <input
                            type="text"
                            value={newSjDriver}
                            placeholder="e.g. Uncle Moses"
                            onChange={(e) => setNewSjDriver(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Shuttle Van Registration Plate</label>
                          <input
                            type="text"
                            value={newSjVan}
                            placeholder="e.g. UBC-401A"
                            onChange={(e) => setNewSjVan(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Termly Cost Allocation (UGX)</label>
                          <input
                            type="number"
                            value={newSjCost}
                            onChange={(e) => setNewSjCost(Number(e.target.value))}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Morning Pickup Time</label>
                          <input
                            type="text"
                            value={newSjPickup}
                            placeholder="e.g. 07:15 AM"
                            onChange={(e) => setNewSjPickup(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Evening Drop-off Time</label>
                          <input
                            type="text"
                            value={newSjDropoff}
                            placeholder="e.g. 04:30 PM"
                            onChange={(e) => setNewSjDropoff(e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Commencement Status</label>
                          <select
                            value={newSjStatus}
                            onChange={(e) => setNewSjStatus(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 bg-white border border-[#E0D8CC] rounded-lg text-[#3D2B1F]"
                          >
                            <option value="Active">Active Route Run</option>
                            <option value="Suspended">Suspended / Vacation</option>
                            <option value="Completed">Completed Termly Plan</option>
                          </select>
                        </div>

                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={handleAddShuttleJourney}
                            className="w-full py-2 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold text-[11px] rounded-lg cursor-pointer transition-all uppercase"
                          >
                            Confirm & Insert Journey
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Existing Shuttle Journeys table editor */}
                  <div className="space-y-2">
                    {editingPupil.shuttleJourneys && editingPupil.shuttleJourneys.length > 0 ? (
                      <div className="border border-[#E0D8CC]/85 rounded-2xl overflow-hidden text-xs">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-[#E0D8CC]/90 text-[#7D6B5D] font-bold text-[10px] uppercase">
                              <th className="p-3">Route details</th>
                              <th className="p-3 text-center">Timings (AM/PM)</th>
                              <th className="p-3 text-center">Cost allocation</th>
                              <th className="p-3 text-center">Status</th>
                              <th className="p-3 text-right">Delete</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E0D8CC]/70">
                            {editingPupil.shuttleJourneys.map((sj, idx) => (
                              <tr key={sj.id || idx} className="hover:bg-slate-50/40">
                                <td className="p-3">
                                  <div className="font-extrabold text-[#3D2B1F]">{sj.routeName}</div>
                                  <div className="text-[10px] text-[#7D6B5D]">{sj.shuttleVanNo} • driver: {sj.driverName}</div>
                                </td>
                                <td className="p-3 text-center font-semibold text-[#3D2B1F]">
                                  {sj.pickupTime} — {sj.dropoffTime}
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-[#8C5A3C]">
                                  {sj.costPerTermUGX.toLocaleString()} UGX
                                </td>
                                <td className="p-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                    sj.status === 'Active' ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-[#F9ECE4] text-[#8C5A3C]'
                                  }`}>
                                    {sj.status}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveShuttleJourney(sj.id)}
                                    className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-50 hover:border-red-500 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-slate-50/60 rounded-2xl border border-dashed border-[#E0D8CC] text-[#7D6B5D] text-xs">
                        🎒 No shuttle journeys are currently scheduled for this learner profile.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8CC] mt-6">
                <button
                  type="button"
                  id="edit-pupil-cancel"
                  onClick={() => setEditingPupil(null)}
                  className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-[#F2EDE4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="edit-pupil-save"
                  className="px-5 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
