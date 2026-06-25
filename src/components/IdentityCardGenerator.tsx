import React, { useState, useRef, useEffect } from 'react';
import { 
  CreditCard, Search, GraduationCap, Users, Printer, LayoutGrid, Layers, 
  RotateCw, Check, ShieldCheck, Download, Edit2, Upload, AlertCircle, Sparkles, CheckSquare, Square,
  Shield, KeyRound
} from 'lucide-react';
import { Pupil, Staff, NurseryClass } from '../types';

interface IdentityCardGeneratorProps {
  pupils: Pupil[];
  staff: Staff[];
  schoolName: string;
  schoolLogo: string;
  schoolAddress: string;
  onUpdatePupil: (pupil: Pupil) => void;
  onUpdateStaff: (staff: Staff) => void;
}

type CardTheme = {
  id: string;
  name: string;
  bgClass: string;
  accentColor: string;
  textColor: string;
  bannerClass: string;
  footerClass: string;
  borderColor: string;
};

const THEMES: CardTheme[] = [
  {
    id: 'royal-navy',
    name: 'Royal Navy',
    bgClass: 'bg-slate-50',
    accentColor: '#1e3a8a',
    textColor: 'text-slate-800',
    bannerClass: 'bg-blue-900 text-white',
    footerClass: 'bg-blue-950 text-sky-200',
    borderColor: 'border-blue-900',
  },
  {
    id: 'forest-emerald',
    name: 'Forest Emerald',
    bgClass: 'bg-stone-50',
    accentColor: '#14532d',
    textColor: 'text-stone-800',
    bannerClass: 'bg-emerald-800 text-white',
    footerClass: 'bg-emerald-950 text-emerald-100',
    borderColor: 'border-emerald-800',
  },
  {
    id: 'maroon-gold',
    name: 'Maroon & Gold',
    bgClass: 'bg-amber-50/50',
    accentColor: '#7c2d12',
    textColor: 'text-stone-800',
    bannerClass: 'bg-amber-900 text-amber-100',
    footerClass: 'bg-orange-950 text-amber-200',
    borderColor: 'border-amber-900',
  },
  {
    id: 'playful-violet',
    name: 'Playful Violet',
    bgClass: 'bg-violet-50/40',
    accentColor: '#5b21b6',
    textColor: 'text-slate-800',
    bannerClass: 'bg-violet-800 text-white',
    footerClass: 'bg-violet-950 text-purple-200',
    borderColor: 'border-violet-800',
  },
  {
    id: 'sleek-slate',
    name: 'Sleek Charcoal',
    bgClass: 'bg-zinc-50',
    accentColor: '#27272a',
    textColor: 'text-zinc-800',
    bannerClass: 'bg-zinc-800 text-white',
    footerClass: 'bg-zinc-950 text-zinc-300',
    borderColor: 'border-zinc-800',
  },
];

export default function IdentityCardGenerator({
  pupils,
  staff,
  schoolName,
  schoolLogo,
  schoolAddress,
  onUpdatePupil,
  onUpdateStaff,
}: IdentityCardGeneratorProps) {
  const [activeSubTab, setActiveSubTab] = useState<'learners' | 'staff'>('learners');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'All' | NurseryClass>('All');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('All');
  
  // Customization controls
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>(THEMES[0]);
  const [isVertical, setIsVertical] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [validUntil, setValidUntil] = useState('Dec 2026');
  const [designTemplate, setDesignTemplate] = useState<'standard' | 'minimalist' | 'modern'>('standard');
  const [signatoryRole, setSignatoryRole] = useState('Head Teacher');
  const [isFlipped, setIsFlipped] = useState(false); // Only for live preview card
  
  // Pick-up permission card state definitions
  const [cardType, setCardType] = useState<'id_card' | 'pickup_permission'>('id_card');
  const [pickupAuthorizedNames, setPickupAuthorizedNames] = useState('Mother / Father / listed alternate helper');
  const [pickupSecurityLevel, setPickupSecurityLevel] = useState<'High' | 'Standard' | 'Restricted'>('High');

  // Automatically reset cardType to id_card for staff tab since staff do not have pick-up permission passes
  useEffect(() => {
    if (activeSubTab === 'staff') {
      setCardType('id_card');
    }
  }, [activeSubTab]);

  // Selected item tracking for preview and printing
  const [selectedPreviewId, setSelectedPreviewId] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  // Reference for invisible print elements
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  // Filter lists
  const filteredLearners = pupils.filter(p => {
    const matchesSearch = p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.guardianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'All' || p.classLevel === classFilter;
    return matchesSearch && matchesClass;
  });

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = staffRoleFilter === 'All' || s.role === staffRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Get current active items & current active preview object
  const currentList = activeSubTab === 'learners' ? filteredLearners : filteredStaff;
  
  // Auto select first item as active preview if none is selected
  const activePreviewItem = currentList.find(x => x.id === selectedPreviewId) || currentList[0] || null;

  // Toggle single selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle select all visible
  const isAllSelected = currentList.length > 0 && currentList.every(x => selectedIds[x.id]);
  const handleSelectAll = () => {
    if (isAllSelected) {
      const newSelected = { ...selectedIds };
      currentList.forEach(x => {
        newSelected[x.id] = false;
      });
      setSelectedIds(newSelected);
    } else {
      const newSelected = { ...selectedIds };
      currentList.forEach(x => {
        newSelected[x.id] = true;
      });
      setSelectedIds(newSelected);
    }
  };

  const selectedCount = Object.keys(selectedIds).filter(id => selectedIds[id]).length;

  // Compress photo and update profile helper
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string, isPupil: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 180;
        const MAX_HEIGHT = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          if (isPupil) {
            const found = pupils.find(p => p.id === id);
            if (found) {
              onUpdatePupil({ ...found, photoUrl: compressedDataUrl });
            }
          } else {
            const found = staff.find(s => s.id === id);
            if (found) {
              onUpdateStaff({ ...found, photoUrl: compressedDataUrl });
            }
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Generate CSS Barcode representations in pure CSS
  const renderBarcodeSVG = (id: string) => {
    return (
      <svg className="w-full h-8 max-w-[170px]" viewBox="0 0 100 20" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="transparent" />
        {/* Draw a stylized barcode with varying strip widths */}
        {id.split('').map((char, index) => {
          const size = char.charCodeAt(0) % 5 + 1;
          const offset = index * 8 + 3;
          return (
            <g key={index}>
              <rect x={offset} y="0" width={size * 0.7} height="15" fill="#1e293b" />
              <rect x={offset + size * 0.7 + 1} y="0" width={1.2} height="15" fill="#1e293b" />
            </g>
          );
        })}
        {/* Text of ID */}
        <text x="50" y="20" fontSize="4.5" fill="#475569" fontWeight="bold" textAnchor="middle">{id}</text>
      </svg>
    );
  };

  // Barcode pattern for rendering inside print blocks
  const renderBarcodePrint = (id: string) => {
    return (
      <div className="flex flex-col items-center justify-center mt-1">
        {renderBarcodeSVG(id)}
      </div>
    );
  };

  const getInitialsAvatar = (name: string, isPupil: boolean) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center font-bold text-lg select-none ${isPupil ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-800'}`}>
        <span className="text-xl tracking-wider">{initials}</span>
        <span className="text-[8px] uppercase tracking-wider text-stone-500 mt-1">{isPupil ? 'Learner' : 'Staff'}</span>
      </div>
    );
  };

  // Main Printing Handler: Generates a beautiful HTML payload representing cards, then triggers the browser's printing action
  const handlePrint = (printAllSelected = false) => {
    let itemsToPrint: (Pupil | Staff)[] = [];
    
    if (printAllSelected) {
      // Print everything checkmarked in the current tab
      itemsToPrint = currentList.filter(x => selectedIds[x.id]);
    } else if (activePreviewItem) {
      // Print only the currently active preview item
      itemsToPrint = [activePreviewItem];
    }

    if (itemsToPrint.length === 0) {
      alert("No cards selected for printing! Select cards by checking the boxes or click an item to preview.");
      return;
    }

    // Capture school details
    const finalSchoolLogo = schoolLogo || 'https://img.icons8.com/fluency/192/school.png';
    const cleanSchAddress = schoolAddress || 'Kitemu Nsangi, Wakiso District, Uganda';

    // Built HTML template
    let cardHTMLData = '';

    itemsToPrint.forEach((item) => {
      const isPupil = 'classLevel' in item;
      const titleLabel = isPupil ? 'STUDENT IDENTIFICATION' : 'STAFF IDENTITY CARD';
      const roleOrClass = isPupil ? (item as Pupil).classLevel : (item as Staff).role;
      const secondaryLabel = isPupil ? 'Guardian Contact' : 'Staff ContactNo';
      const secondaryValue = isPupil ? (item as Pupil).guardianPhone : (item as Staff).phone;
      const subdetailLabel = isPupil ? 'Home Village' : 'Assigned Area';
      const subdetailValue = isPupil ? `${(item as Pupil).homeVillage}, ${(item as Pupil).homeDistrict}` : (isPupil ? '' : (item as Staff).assignedClass || 'Full School');
      const formattedID = item.id;

      // Define CSS formatting details strictly mapped from chosen theme presets
      const t = selectedTheme;
      const cardCss = isVertical 
        ? 'width: 250px; height: 380px; margin: 15px; page-break-inside: avoid; display: inline-flex; flex-direction: column; border: 4px solid ' + t.accentColor + '; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; position: relative;'
        : 'width: 380px; height: 250px; margin: 15px; page-break-inside: avoid; display: inline-flex; flex-direction: row; border: 4px solid ' + t.accentColor + '; border-radius: 12px; background: #fff; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; position: relative;';

      const backCss = isVertical 
        ? 'width: 250px; height: 380px; margin: 15px; page-break-inside: avoid; display: inline-flex; flex-direction: column; border: 4px solid ' + t.accentColor + '; border-radius: 12px; background: #faf9f6; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; position: relative; padding: 15px; text-align: center; justify-content: space-between; box-sizing: border-box;'
        : 'width: 380px; height: 250px; margin: 15px; page-break-inside: avoid; display: inline-flex; flex-direction: column; border: 4px solid ' + t.accentColor + '; border-radius: 12px; background: #faf9f6; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif; position: relative; padding: 12px; text-align: center; justify-content: space-between; box-sizing: border-box;';

      // FRONT & BACK template generation
      let frontContent = '';
      let backContent = '';

      if (isPupil && cardType === 'pickup_permission') {
        const pupil = item as Pupil;
        if (isVertical) {
          frontContent = `
            <div style="${cardCss}">
              <!-- Header Banner for Pick-Up -->
              <div style="background-color: #d97706; color: white; padding: 10px 8px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" style="height: 20px; width: 20px; color: #fef08a;">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"></path>
                </svg>
                <div style="text-align: left;">
                  <div style="font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${schoolName}</div>
                  <div style="font-size: 8px; color: #fef08a; font-weight: 950; letter-spacing: 0.5px; text-transform: uppercase;">PICK-UP PERMISSION PASS</div>
                </div>
              </div>

              <!-- Content Area -->
              <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; padding: 12px 10px; text-align: center; justify-content: space-between;">
                <!-- Security verification banner -->
                <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 8px; font-weight: 900; text-transform: uppercase; padding: 4.5px 12px; border-radius: 6px; width: 100%; box-sizing: border-box;">
                  SECURITY PROTOCOL: ${pickupSecurityLevel.toUpperCase()}
                </div>

                <!-- Child and Guardian Data Row -->
                <div style="display: flex; gap: 10px; width: 100%; align-items: center; margin-top: 6px; text-align: left;">
                  <!-- Child Photo -->
                  <div style="width: 60px; height: 75px; border-radius: 6px; border: 1px solid #d97706; overflow: hidden; background: #fafaf9; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    ${item.photoUrl ? `
                      <img src="${item.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" />
                    ` : `
                      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafaf9; color: #d97706; font-weight: bold; font-size: 18px;">
                        ${item.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    `}
                  </div>

                  <div style="min-width: 0; flex-grow: 1;">
                    <span style="font-size: 7px; color: #78716c; font-weight: bold; text-transform: uppercase;">Assigned Student</span>
                    <div style="font-size: 12px; font-weight: 900; color: #1c1917; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">${item.fullName}</div>
                    <span style="background: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 4px; padding: 1.5px 6px; font-size: 7.5px; font-weight: 900; color: #44403c;">${pupil.classLevel}</span>
                  </div>
                </div>

                <!-- Guardian authorized credentials boxes -->
                <div style="width: 100%; text-align: left; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; display: flex; flex-direction: column; gap: 3.5px; margin-top: 6px;">
                  <div style="display: flex; justify-content: space-between; font-size: 8px;"><b style="color: #78350f;">PRIMARY PARENT:</b> <span style="font-weight: 900; color: #1c1917;">${pupil.guardianName}</span></div>
                  <div style="display: flex; justify-content: space-between; font-size: 8px;"><b style="color: #78350f;">GUARDIAN PHONE:</b> <span style="font-weight: bold; color: #b91c1c; font-family: monospace;">${pupil.guardianPhone}</span></div>
                  <div style="border-top: 1px dashed #fcd34d; margin-top: 2px; padding-top: 3px;">
                    <b style="color: #78350f; font-size: 7.5px; display: block; margin-bottom: 1.5px;">AUTHORIZED PICKERS:</b>
                    <span style="font-size: 7.5px; color: #451a03; font-weight: 600; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${pickupAuthorizedNames}</span>
                  </div>
                </div>
              </div>

              <!-- Barcode verification block -->
              <div style="background: #f8fafc; padding: 6px; display: flex; flex-direction: column; align-items: center; border-top: 1px solid #e2e8f0; flex-shrink: 0;">
                ${showBarcode ? `
                  <div style="width: 150px; height: 26px; display: flex; justify-content: center; overflow: hidden;">
                    <svg style="width: 100%; height: 100%;" viewBox="0 0 100 15" preserveAspectRatio="none">
                      <rect width="100%" height="9" fill="transparent" />
                      <rect x="5" y="0" width="2" height="12" fill="#000" />
                      <rect x="10" y="0" width="1" height="12" fill="#000" />
                      <rect x="13" y="0" width="3" height="12" fill="#000" />
                      <rect x="18" y="0" width="2" height="12" fill="#000" />
                      <rect x="22" y="0" width="1" height="12" fill="#000" />
                      <rect x="25" y="0" width="4" height="12" fill="#000" />
                      <rect x="31" y="0" width="1.5" height="12" fill="#000" />
                      <rect x="35" y="0" width="3" height="12" fill="#000" />
                      <rect x="40" y="0" width="1" height="12" fill="#000" />
                    </svg>
                  </div>
                ` : ''}
                <div style="font-size: 7px; color: #475569; font-weight: 900; letter-spacing: 0.4px;">SECURITY GATE VERIFIED PASS • KIDS VILLA ACADEMY</div>
              </div>
            </div>
          `;
        } else {
          // Horizontal landscape pick-up pass
          frontContent = `
            <div style="${cardCss}">
              <!-- Left badge accent -->
              <div style="width: 25px; background: #d97706; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
                <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 7px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; white-space: nowrap;">
                  COLLECTION AUTHORIZATION PASS
                </span>
              </div>

              <!-- Main Card Pane -->
              <div style="flex-grow: 1; display: flex; flex-direction: column; background: #fff; box-sizing: border-box;">
                <!-- Branded Header -->
                <div style="border-bottom: 2px solid #fed7aa; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <img src="${finalSchoolLogo}" style="height: 22px; width: 22px; object-fit: contain; border-radius: 4px; background: white;" referrerpolicy="no-referrer" />
                    <div style="text-align: left;">
                      <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1e293b; letter-spacing: 0.2px;">${schoolName}</div>
                      <div style="font-size: 8px; color: #d97706; font-weight: 900; letter-spacing: 0.5px;">PICK-UP PERMISSION PASS</div>
                    </div>
                  </div>
                  <div style="background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; font-size: 7.5px; font-weight: 900; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
                    SEC: ${pickupSecurityLevel}
                  </div>
                </div>

                <!-- Mid Flex Pane -->
                <div style="flex-grow: 1; display: flex; align-items: center; padding: 8px 12px; gap: 12px;">
                  <!-- Child photo slot -->
                  <div style="width: 65px; height: 75px; border-radius: 6px; border: 1px solid #d97706; overflow: hidden; background: #fcfcfc; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    ${item.photoUrl ? `
                      <img src="${item.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" />
                    ` : `
                      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafaf9; color: #d97706; font-weight: bold; font-size: 18px;">
                        ${item.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    `}
                  </div>

                  <!-- Details panel -->
                  <div style="flex-grow: 1; text-align: left; display: flex; flex-direction: column; min-width: 0;">
                    <span style="font-size: 6.5px; color: #78716c; font-weight: bold; text-transform: uppercase; line-height: 1;">Assigned Child</span>
                    <div style="font-size: 12px; font-weight: 900; color: #1c1917; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px;">
                      ${item.fullName}
                    </div>
                    <div style="color: #854d0e; font-size: 7.5px; font-weight: 900; margin-bottom: 4px; text-transform: uppercase;">
                      CLASS: ${pupil.classLevel}
                    </div>

                    <div style="font-size: 8px; background: #fffbeb; border-radius: 4px; padding: 4px 6px; display: flex; flex-direction: column; gap: 2px; border: 1px solid #fef3c7;">
                      <div style="display: flex; justify-content: space-between;"><span style="color: #78350f; font-weight: bold;">PRIMARY PARENT:</span> <b style="color: #1e293b;">${pupil.guardianName}</b></div>
                      <div style="display: flex; justify-content: space-between;"><span style="color: #78350f; font-weight: bold;">CONTACT PHONE:</span> <b style="color: #b91c1c; font-family: monospace;">${pupil.guardianPhone}</b></div>
                      <div style="border-top: 1px dashed #fcd34d; margin-top: 1px; padding-top: 1.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                        <span style="color: #78350f; font-weight: bold;">AUTHORIZED PICKERS:</span> <b style="color: #451a03;">${pickupAuthorizedNames}</b>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer Barcode -->
                <div style="background: #f8fafc; padding: 4px 12px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; height: 26px; box-sizing: border-box;">
                  <span style="font-size: 6.5px; color: #475569; font-weight: bold;">VALID UNTIL: ${validUntil}</span>
                  ${showBarcode ? `
                    <div style="width: 100px; height: 16px; overflow: hidden;">
                      <svg style="width: 100%; height: 100%;" viewBox="0 0 100 15" preserveAspectRatio="none">
                        <rect width="100%" height="9" fill="transparent" />
                        <rect x="5" y="0" width="3" height="12" fill="#000" />
                        <rect x="10" y="0" width="1" height="12" fill="#000" />
                        <rect x="14" y="0" width="2" height="12" fill="#000" />
                        <rect x="18" y="0" width="4" height="12" fill="#000" />
                        <rect x="24" y="0" width="1" height="12" fill="#000" />
                      </svg>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }

        // Back content for Pick-up permission pass
        backContent = `
          <div style="${backCss}">
            <!-- Top safety heading -->
            <div style="border-bottom: 1.5px solid #d97706; padding-bottom: 6px; box-sizing: border-box;">
              <div style="font-size: 11px; font-weight: 950; color: #b45309; text-transform: uppercase; letter-spacing: 0.3px;">KVA CHILD COLLECTION POLICY</div>
              <div style="font-size: 7px; color: #78350f; font-weight: 850; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px;">"Your Child's Security is Our Direct Priority"</div>
            </div>

            <!-- Policy details -->
            <div style="text-align: left; margin: 8px 0; font-size: 7.5px; line-height: 1.4; color: #451a03; box-sizing: border-box;">
              1. <b>PASS COMPULSORY AT MAIN GATE:</b> Any child being collected from Kids Villa Academy will ONLY be checked out and released upon presentation of this official physical permission card.<br/>
              2. <b>VERIFICATION MATCH:</b> Alternate collectors, including aunts, riders, or drivers, must have their details printed on the front or verified by written administrator text/SMS code verification beforehand.<br/>
              3. <b>LIABILITY LIMIT:</b> The school and security guards are absolved of liability after child handover where physical pass verification was faithfully fulfilled.<br/>
              4. <b>ALERT SYSTEM:</b> For target security inquiries or lost card reports, immediately phone school office registry desk.
            </div>

            <!-- Seals / Stamps row -->
            <div style="border-top: 1px solid #fed7aa; padding-top: 6px; display: flex; justify-content: space-between; align-items: flex-end; box-sizing: border-box;">
              <div style="text-align: left;">
                <div style="font-size: 6px; color: #78350f; font-weight: bold; text-transform: uppercase;">PASS EXPIRES:</div>
                <div style="font-size: 8px; font-weight: 900; color: #1c1917;">${validUntil}</div>
              </div>

              <!-- Official seal -->
              <div style="text-align: center;">
                <div style="border: 1px dashed #b45309; border-radius: 4px; padding: 1.5px 3px; font-size: 5px; color: #b45309; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 3px;">
                  SECURITY DESK SEAL
                </div>
                <div style="font-family: 'Georgia', serif; font-size: 9px; font-style: italic; color: #1e3a8a; font-weight: bold; border-bottom: 1.5px solid #b45309; width: 60px; margin: 0 auto; text-align: center;">
                  Admin
                </div>
                <div style="font-size: 6px; color: #78350f; font-weight: bold; margin-top: 2px;">
                  ${signatoryRole}
                </div>
              </div>
            </div>
          </div>
        `;

      } else {
        // Standard Student / Staff Identification Cards
        if (isVertical) {
          frontContent = `
            <div style="${cardCss}">
              <!-- Header Banner -->
              <div style="background-color: ${t.accentColor}; color: white; padding: 10px 8px; text-align: center; flex-shrink: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <img src="${finalSchoolLogo}" style="height: 24px; width: 24px; object-fit: contain; border-radius: 4px; background: white; padding: 1px;" referrerpolicy="no-referrer" />
                <div style="text-align: left;">
                  <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3px; max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${schoolName}</div>
                  <div style="font-size: 7px; opacity: 0.85; font-weight: bold; letter-spacing: 0.5px;">${titleLabel}</div>
                </div>
              </div>

              <!-- Avatar & Primary Info -->
              <div style="flex-grow: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 12px 10px; text-align: center;">
                <!-- Photo container -->
                <div style="width: 85px; height: 95px; border-radius: 8px; border: 2px solid ${t.accentColor}; overflow: hidden; background: #f3f4f6; margin-bottom: 8px; display: flex; align-items: center; justify-content: center;">
                  ${item.photoUrl ? `
                    <img src="${item.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" />
                  ` : `
                    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f1f5f9; color: ${t.accentColor}; font-weight: bold; font-size: 24px;">
                      ${item.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                      <div style="font-size: 8px; font-weight: bold; margin-top: 4px; opacity: 0.7;">NO PHOTO</div>
                    </div>
                  `}
                </div>

                <!-- General details -->
                <div style="font-size: 13px; font-weight: 900; color: #0f172a; margin-bottom: 3px; max-width: 220px; font-family: sans-serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${item.fullName}
                </div>
                
                <div style="background-color: ${t.accentColor}20; color: ${t.accentColor}; font-size: 9px; font-weight: 900; padding: 3.5px 12px; border-radius: 40px; display: inline-block; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${roleOrClass}
                </div>

                <!-- Metadata -->
                <div style="width: 100%; margin-top: 4px; font-size: 9px; text-align: left; background: #f8fafc; border-radius: 6px; padding: 6px 8px; box-sizing: border-box; display: flex; flex-direction: column; gap: 3.5px;">
                  <div style="display: flex; justify-content: space-between;"><b style="color: #64748b;">ID NUMBER:</b> <b style="color: #1e293b;">${formattedID}</b></div>
                  <div style="display: flex; justify-content: space-between; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><b style="color: #64748b;">${secondaryLabel}:</b> <span style="font-weight: bold; color: #1e293b;">${secondaryValue}</span></div>
                  <div style="display: flex; justify-content: space-between; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><b style="color: #64748b;">${subdetailLabel}:</b> <span style="font-weight: bold; color: #1e293b;">${subdetailValue}</span></div>
                </div>
              </div>

              <!-- Footer Barcode & Status Banner -->
              <div style="background: #f1f5f9; padding: 6px; display: flex; flex-direction: column; align-items: center; border-top: 1px solid #e2e8f0; flex-shrink: 0;">
                ${showBarcode ? `
                  <div style="width: 150px; height: 26px; display: flex; justify-content: center; overflow: hidden;">
                    ${item.id ? `
                      <svg style="width: 100%; height: 100%;" viewBox="0 0 100 15" preserveAspectRatio="none">
                        <rect width="100%" height="9" fill="transparent" />
                        <rect x="5" y="0" width="2" height="12" fill="#000" />
                        <rect x="10" y="0" width="1" height="12" fill="#000" />
                        <rect x="13" y="0" width="3" height="12" fill="#000" />
                        <rect x="18" y="0" width="2" height="12" fill="#000" />
                        <rect x="22" y="0" width="1" height="12" fill="#000" />
                        <rect x="25" y="0" width="4" height="12" fill="#000" />
                        <rect x="31" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="35" y="0" width="3" height="12" fill="#000" />
                        <rect x="40" y="0" width="1" height="12" fill="#000" />
                        <rect x="43" y="0" width="2" height="12" fill="#000" />
                        <rect x="48" y="0" width="2" height="12" fill="#000" />
                        <rect x="52" y="0" width="3" height="12" fill="#000" />
                        <rect x="57" y="0" width="1" height="12" fill="#000" />
                        <rect x="60" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="64" y="0" width="3.5" height="12" fill="#000" />
                        <rect x="70" y="0" width="2" height="12" fill="#000" />
                        <rect x="74" y="0" width="1" height="12" fill="#000" />
                        <rect x="77" y="0" width="2.5" height="12" fill="#000" />
                        <rect x="82" y="0" width="3" height="12" fill="#000" />
                        <rect x="87" y="0" width="1" height="12" fill="#000" />
                        <rect x="90" y="0" width="4" height="12" fill="#000" />
                      </svg>
                    ` : ''}
                  </div>
                ` : ''}
                <div style="font-size: 7px; color: #475569; font-weight: 900; letter-spacing: 0.4px; text-transform: uppercase;">VERIFIED BADGE • KIDS VILLA ACADEMY</div>
              </div>
            </div>
          `;
        } else {
          // Horizontal orientation layout template
          frontContent = `
            <div style="${cardCss}">
              <!-- Left bar accent -->
              <div style="width: 25px; background: ${t.accentColor}; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white;">
                <span style="writing-mode: vertical-rl; transform: rotate(180deg); font-size: 7px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase;">
                  ${isPupil ? 'REGISTERED LEARNER' : 'STAFF MEMBER'}
                </span>
              </div>

              <!-- Main area -->
              <div style="flex-grow: 1; display: flex; flex-direction: column; background: #fff; box-sizing: border-box;">
                <!-- School banner -->
                <div style="border-bottom: 2px solid ${t.accentColor}18; padding: 6px 12px; display: flex; align-items: center; gap: 8px;">
                  <img src="${finalSchoolLogo}" style="height: 22px; width: 22px; object-fit: contain; border-radius: 4px; background: white;" referrerpolicy="no-referrer" />
                  <div style="text-align: left;">
                    <div style="font-size: 11px; font-weight: 900; text-transform: uppercase; color: #1e293b; letter-spacing: 0.2px;">${schoolName}</div>
                    <div style="font-size: 7px; color: ${t.accentColor}; font-weight: 900; letter-spacing: 0.5px;">${titleLabel}</div>
                  </div>
                </div>

                <!-- Content panel -->
                <div style="flex-grow: 1; display: flex; align-items: center; padding: 8px 12px; gap: 12px;">
                  <!-- Avatar image -->
                  <div style="width: 70px; height: 80px; border-radius: 8px; border: 2px solid ${t.accentColor}; overflow: hidden; background: #f3f4f6; flex-shrink: 0; display: flex; align-items: center; justify-content: center;">
                    ${item.photoUrl ? `
                      <img src="${item.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" referrerpolicy="no-referrer" />
                    ` : `
                      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f1f5f9; color: ${t.accentColor}; font-weight: bold; font-size: 20px;">
                        ${item.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        <div style="font-size: 6px; font-weight: bold; margin-top: 2px; opacity: 0.7;">NO CAPTURE</div>
                      </div>
                    `}
                  </div>

                  <!-- Info descriptors -->
                  <div style="flex-grow: 1; text-align: left; display: flex; flex-direction: column; min-width: 0;">
                    <div style="font-size: 12px; font-weight: 900; color: #0f172a; margin-bottom: 1.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${item.fullName}
                    </div>
                    <div style="color: ${t.accentColor}; font-size: 8px; font-weight: 900; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.3px;">
                      ${roleOrClass}
                    </div>

                    <div style="font-size: 8px; background: #f8fafc; border-radius: 4px; padding: 5px 6px; display: flex; flex-direction: column; gap: 2.5px;">
                      <div style="display: flex; justify-content: space-between;"><span style="color: #64748b; font-weight: bold;">ID NO:</span> <b style="color: #1e293b;">${formattedID}</b></div>
                      <div style="display: flex; justify-content: space-between; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span style="color: #64748b; font-weight: bold;">${secondaryLabel.replace(' Contact', '')}:</span> <b style="color: #1e293b;">${secondaryValue}</b></div>
                      <div style="display: flex; justify-content: space-between; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"><span style="color: #64748b; font-weight: bold;">${subdetailLabel.split(' ')[0]}:</span> <b style="color: #1e293b;">${subdetailValue}</b></div>
                    </div>
                  </div>
                </div>

                <!-- Barcode inside horizontal footer -->
                <div style="background: #f1f5f9; padding: 4px 12px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; height: 26px; box-sizing: border-box;">
                  <span style="font-size: 6px; color: #64748b; font-weight: bold;">VALID UNTIL: ${validUntil}</span>
                  ${showBarcode ? `
                    <div style="width: 110px; height: 18px; overflow: hidden;">
                      <svg style="width: 100%; height: 100%;" viewBox="0 0 100 15" preserveAspectRatio="none">
                        <rect width="100%" height="9" fill="transparent" />
                        <rect x="5" y="0" width="3" height="12" fill="#000" />
                        <rect x="10" y="0" width="1" height="12" fill="#000" />
                        <rect x="14" y="0" width="2" height="12" fill="#000" />
                        <rect x="18" y="0" width="4" height="12" fill="#000" />
                        <rect x="24" y="0" width="1" height="12" fill="#000" />
                        <rect x="27" y="0" width="2.5" height="12" fill="#000" />
                        <rect x="32" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="36" y="0" width="3" height="12" fill="#000" />
                        <rect x="41" y="0" width="2" height="12" fill="#000" />
                        <rect x="45" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="49" y="0" width="3" height="12" fill="#000" />
                        <rect x="54" y="0" width="1" height="12" fill="#000" />
                        <rect x="57" y="0" width="2" height="12" fill="#000" />
                        <rect x="61" y="0" width="3.5" height="12" fill="#000" />
                        <rect x="67" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="71" y="0" width="2.5" height="12" fill="#000" />
                        <rect x="76" y="0" width="1" height="12" fill="#000" />
                        <rect x="79" y="0" width="4" height="12" fill="#000" />
                        <rect x="85" y="0" width="1.5" height="12" fill="#000" />
                        <rect x="88" y="0" width="3" height="12" fill="#000" />
                      </svg>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }

        backContent = `
          <div style="${backCss}">
            <!-- Top Branding -->
            <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">
              <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase;">${schoolName}</div>
              <div style="font-size: 7px; color: #64748b; font-weight: bold; margin-top: 2px;">QUALITY & INTEGRITY IN EARLY EDUCATION</div>
            </div>

            <!-- Middle Disclaimer rules -->
            <div style="text-align: left; margin: 10px 0; font-size: 7.5px; line-height: 1.4; color: #475569;">
              <b style="color: #0f172a; display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 8px; text-align: center;">ID CARD RULES & DISCLAIMER</b>
              1. This card is official property of <b>${schoolName}</b> and is non-transferable.<br/>
              2. It must be worn, displayed, or presented upon request by authorities.<br/>
              3. Loss or damage should be reported immediately to the administration desk.<br/>
              4. If found, please return to: <i>${cleanSchAddress}</i> or contact nursery desk.
            </div>

            <!-- Bottom stamps and signatures -->
            <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; align-items: flex-end; box-sizing: border-box;">
              <div style="text-align: left;">
                <div style="font-size: 6.5px; color: #64748b; font-weight: bold; text-transform: uppercase;">VALID UNTIL:</div>
                <div style="font-size: 8px; font-weight: 900; color: #0f172a;">${validUntil}</div>
              </div>

              <!-- Interactive signature preview container -->
              <div style="text-align: center; position: relative; margin-bottom: -4px;">
                <!-- Sign stamp icon simulation -->
                <div style="border: 1px dashed red; transform: rotate(-5deg); border-radius: 4px; padding: 2px 4px; font-size: 5px; color: red; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; font-family: sans-serif; display: inline-block;">
                  SCHOOL STAMP
                </div>
                <div style="font-family: 'Georgia', serif; font-size: 10px; font-style: italic; color: #1e3a8a; font-weight: bold; border-bottom: 1px solid #94a3b8; width: 65px; margin: 0 auto; text-align: center;">
                  Admin
                </div>
                <div style="font-size: 6px; color: #64748b; font-weight: bold; margin-top: 2.5px; text-transform: uppercase;">
                  ${signatoryRole}
                </div>
              </div>
            </div>
          </div>
        `;
      }

      cardHTMLData += `
        <div style="display: inline-block; page-break-inside: avoid; vertical-align: top;">
          ${frontContent}
        </div>
        <div style="display: inline-block; page-break-inside: avoid; vertical-align: top;">
          ${backContent}
        </div>
      `;
    });

    const printWindowHTML = `
      <html>
        <head>
          <title>${schoolName} - Identity Cards Printing Job</title>
          <style>
            @media print {
              body { 
                margin: 0; 
                padding: 0;
                background: white; 
              }
              @page {
                size: portrait;
                margin: 1cm;
              }
              .no-print { display: none !important; }
            }
            body {
              font-family: system-ui, -apple-system, sans-serif;
              background-color: #f3f4f6;
              padding: 20px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="no-print" style="background: white; border: 1px solid #d1d5db; border-radius: 8px; padding: 12px; margin-bottom: 20px; text-align: left; max-width: 800px; margin-left: auto; margin-right: auto; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3 style="margin: 0; font-size: 14px; font-weight: bold; color: #1f2937;">Identity Cards Ready for Printing</h3>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #6b7280;">Press Ctrl+P / Cmd+P to complete if the print dialog does not popup. Ensure to enable background graphics in your print setup.</p>
            </div>
            <button onclick="window.print()" style="background: #8c5a3c; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 12px; cursor: pointer;">
              🖨️ Prompt Print Desk
            </button>
          </div>
          <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; max-width: 1050px; margin: 0 auto; box-sizing: border-box;">
            ${cardHTMLData}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
              }, 500);
            });
          </script>
        </body>
      </html>
    `;

    // Write content to print iframe for sandbox boundary safety
    const iframe = printIframeRef.current;
    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(printWindowHTML);
        doc.close();
        
        // Let the iframe focus and print
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        }, 800);
      }
    } else {
      // Fallback
      alert("Print system setup failed. Preparing popup stream.");
      const nw = window.open('', '_blank');
      if (nw) {
        nw.document.write(printWindowHTML);
        nw.document.close();
      }
    }
  };

  return (
    <div className="space-y-6" id="id-card-generator-root">
      
      {/* Hidden print payload iframe */}
      <iframe 
        id="school-id-card-print-frame"
        ref={printIframeRef} 
        style={{ display: 'none', position: 'absolute', width: 0, height: 0, border: 'none' }}
        title="Print Setup"
      />

      {/* Primary header desk description */}
      <div className="bg-gradient-to-br from-[#8C5A3C]/10 to-[#5A3E2B]/5 border border-[#E0D8CC] p-5 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#8C5A3C]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#8C5A3C]">Branded Credentials Desk</span>
          </div>
          <h3 className="text-xl font-black text-[#3D2B1F] mt-1">Identity Cards & Badge Manager</h3>
          <p className="text-xs text-[#7D6B5D] max-w-2xl mt-0.5">
            Create, design, and bulk print high-quality professional ID cards for {schoolName} learners and staff. Adjust layouts dynamically, customize cards instantly, and export direct reports.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePrint(false)}
            disabled={!activePreviewItem}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 disabled:opacity-45 text-xs font-black uppercase tracking-wider rounded-xl border border-stone-300 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#8C5A3C]" /> Print Previewed
          </button>
          
          <button
            type="button"
            onClick={() => handlePrint(true)}
            disabled={selectedCount === 0}
            className="px-4 py-2 bg-[#8C5A3C] hover:bg-[#6e442a] text-white disabled:opacity-45 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" /> Print Selected ({selectedCount})
          </button>
        </div>
      </div>

      {/* Main layout split: Selection Desk vs Card Style/Live Designer Customizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: SELECTION LIST (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E0D8CC] shadow-xs overflow-hidden flex flex-col">
          
          {/* Sub-tabs: Learners vs Staff */}
          <div className="flex border-b border-[#E0D8CC] gap-2 p-3 bg-stone-50/50">
            <button
              onClick={() => {
                setActiveSubTab('learners');
                setSearchQuery('');
                setSelectedIds({});
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                activeSubTab === 'learners'
                  ? 'bg-white shadow-sm border border-[#E0D8CC] text-[#8C5A3C]'
                  : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
              }`}
            >
              <GraduationCap className="w-4 h-4" /> Learners ({pupils.length})
            </button>
            <button
              onClick={() => {
                setActiveSubTab('staff');
                setSearchQuery('');
                setSelectedIds({});
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wide transition-all cursor-pointer ${
                activeSubTab === 'staff'
                  ? 'bg-white shadow-sm border border-[#E0D8CC] text-[#8C5A3C]'
                  : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
              }`}
            >
              <Users className="w-4 h-4" /> Staff ({staff.length})
            </button>
          </div>

          {/* Filtering row */}
          <div className="p-4 border-b border-[#E0D8CC] bg-white flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="flex-grow relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#7D6B5D]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeSubTab === 'learners' ? 'Search by name, guardian, village...' : 'Search staff, role, staffID...'}
                className="w-full text-xs pl-9 pr-4 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] bg-stone-50/30"
              />
            </div>

            {/* Class filter for Learners */}
            {activeSubTab === 'learners' && (
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value as any)}
                className="text-xs px-3 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-[#3D2B1F]"
              >
                <option value="All">All Classes</option>
                <option value="KG1">KG1</option>
                <option value="KG2">KG2</option>
                <option value="KG3">KG3</option>
                <option value="Primary One">Primary One</option>
                <option value="Primary Two">Primary Two</option>
                <option value="Primary Three">Primary Three</option>
                <option value="Primary Four">Primary Four</option>
                <option value="Primary Five">Primary Five</option>
                <option value="Primary Six">Primary Six</option>
                <option value="Primary Seven">Primary Seven</option>
              </select>
            )}

            {/* Role filter for Staff */}
            {activeSubTab === 'staff' && (
              <select
                value={staffRoleFilter}
                onChange={(e) => setStaffRoleFilter(e.target.value)}
                className="text-xs px-3 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-[#3D2B1F]"
              >
                <option value="All">All Roles</option>
                <option value="Head Teacher">Head Teachers</option>
                <option value="Class Teacher">Class Teachers</option>
                <option value="Nursery Caretaker">Nursery Caretakers</option>
                <option value="Cook">Cooking Staff</option>
                <option value="Security Officer">Security Staff</option>
              </select>
            )}
          </div>

          {/* Records Table and Checklist */}
          <div className="flex-grow overflow-y-auto max-h-[500px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E0D8CC] bg-stone-50 select-none">
                  <th className="py-2.5 px-4 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[#8C5A3C] hover:opacity-85"
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 text-stone-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-2 text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Photo / Avatar</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Full Name / ID</th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">
                    {activeSubTab === 'learners' ? 'Grade Level' : 'Role Position'}
                  </th>
                  <th className="py-2.5 px-3 text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <AlertCircle className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                      <p className="text-xs text-[#7D6B5D] font-bold">No registered profiles matched your filters.</p>
                      <p className="text-[10px] text-stone-400 mt-1">Try resetting the search terms or choosing a different category.</p>
                    </td>
                  </tr>
                ) : (
                  currentList.map((item) => {
                    const isSelected = !!selectedIds[item.id];
                    const isPupil = 'classLevel' in item;
                    const displayLabel = isPupil ? (item as Pupil).classLevel : (item as Staff).role;
                    const isActivePreview = activePreviewItem?.id === item.id;

                    return (
                      <tr 
                        key={item.id}
                        className={`hover:bg-[#F9F7F4]/50 transition-colors cursor-pointer ${
                          isActivePreview ? 'bg-[#8C5A3C]/5 font-semibold' : ''
                        }`}
                        onClick={() => setSelectedPreviewId(item.id)}
                      >
                        {/* Checkbox selector */}
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => toggleSelect(item.id)}
                            className="text-[#8C5A3C] hover:opacity-85"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-stone-400" />
                            )}
                          </button>
                        </td>

                        {/* Image cell */}
                        <td className="py-3 px-2">
                          <div className="w-10 h-10 border border-[#E0D8CC] rounded-full overflow-hidden bg-stone-100 flex items-center justify-center">
                            {item.photoUrl ? (
                              <img src={item.photoUrl} alt={item.fullName} className="w-full h-full object-cover" referrerpolicy="no-referrer" />
                            ) : (
                              <div className="text-[11px] font-bold text-[#8C5A3C]">
                                {item.fullName.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Name and ID cell */}
                        <td className="py-3 px-3">
                          <p className="text-xs text-[#3D2B1F] font-bold max-w-[170px] truncate">{item.fullName}</p>
                          <p className="text-[10px] font-mono text-[#7D6B5D] mt-0.5">{item.id}</p>
                        </td>

                        {/* Grade or Role position */}
                        <td className="py-3 px-3 text-xs text-stone-700">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            isPupil ? 'bg-sky-50 text-sky-800' : 'bg-stone-100 text-stone-800'
                          }`}>
                            {displayLabel}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPreviewId(item.id);
                              setIsFlipped(false);
                            }}
                            className="px-2.5 py-1 text-[10px] font-black text-[#8C5A3C] uppercase tracking-wider border border-[#E0D8CC] bg-white rounded-lg hover:bg-stone-50 transition-all cursor-pointer"
                          >
                            Designer
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom batch metrics */}
          <div className="p-3 bg-stone-50 border-t border-[#E0D8CC] text-[11px] text-[#7D6B5D] flex justify-between items-center">
            <span>Showing <b>{currentList.length}</b> registered profiles</span>
            {selectedCount > 0 && (
              <span className="bg-[#8C5A3C]/15 px-2 py-0.5 rounded-md text-[#8C5A3C] font-extrabold uppercase text-[9px]">
                {selectedCount} Selected
              </span>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CARD STYLE & LIVE TEMPLATE DESIGNER (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">

          {/* Interactive Card Live Preview & Flippable stage */}
          <div className="bg-white rounded-3xl border border-[#E0D8CC] p-5 shadow-xs flex flex-col items-center justify-center">
            <span className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Interactive Identity Card Live Viewfinder
            </span>

            {activePreviewItem ? (
              <div className="flex flex-col items-center gap-4 w-full">
                
                {/* Visual ID Card Stage with CSS 3D Flipping animation */}
                <div className="relative w-[260px] h-[390px] [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                  
                  {/* Card Container wrapper linking flipped transform */}
                  <div className={`relative w-full h-full duration-550 [transform-style:preserve-3d] transition-all origin-center ${
                    isFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}>

                    {/* FRONT OF THE ID CARD */}
                    <div className={`absolute inset-0 w-full h-full rounded-2xl border-4 ${selectedTheme.borderColor} ${selectedTheme.bgClass} flex flex-col justify-between overflow-hidden shadow-md [backface-visibility:hidden] [transform:rotateY(0deg)]`}>
                      
                      {cardType === 'pickup_permission' ? (
                        <>
                          {/* Branded school Header for Pick-up Card */}
                          <div className="p-3 text-white flex items-center gap-2 flex-shrink-0 bg-amber-600">
                            <Shield className="w-6 h-6 text-yellow-350 shrink-0" />
                            <div className="text-left min-w-0">
                              <h4 className="text-[9px] font-black tracking-tight uppercase leading-tight truncate w-[185px]">
                                {schoolName}
                              </h4>
                              <span className="text-[10px] text-yellow-300 uppercase font-black tracking-wider leading-none block mt-0.5">
                                PICK-UP PERMISSION PASS
                              </span>
                            </div>
                          </div>

                          {/* Pick-up Card Core Details */}
                          <div className="flex-grow flex flex-col justify-between p-3 text-center">
                            
                            {/* Warning Security Flag */}
                            <div className="bg-red-50 border border-red-200 text-red-700 text-[8px] font-black uppercase rounded-md py-1 px-2 tracking-wide flex items-center justify-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
                              VERIFICATION LEVEL: {pickupSecurityLevel.toUpperCase()}
                            </div>

                            {/* Dual layout child photo and primary details */}
                            <div className="flex gap-2 items-center mt-2.5">
                              {/* Small child target photo */}
                              <div className="w-16 h-20 border rounded-lg bg-stone-100 flex items-center justify-center overflow-hidden shrink-0" style={{ borderColor: selectedTheme.accentColor }}>
                                {activePreviewItem.photoUrl ? (
                                  <img 
                                    src={activePreviewItem.photoUrl} 
                                    alt={activePreviewItem.fullName} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  getInitialsAvatar(activePreviewItem.fullName, true)
                                )}
                              </div>

                              <div className="text-left flex-grow min-w-0 space-y-0.5">
                                <span className="text-[7px] text-stone-400 uppercase font-bold block">Assigned Learner</span>
                                <h5 className="text-[12px] font-black text-stone-900 truncate" title={activePreviewItem.fullName}>
                                  {activePreviewItem.fullName}
                                </h5>
                                <span className="inline-block bg-stone-100 text-[#8C5A3C] text-[8px] font-black uppercase rounded-sm px-1.5 py-0.5 border border-stone-200">
                                  {'classLevel' in activePreviewItem ? (activePreviewItem as Pupil).classLevel : 'Nursery Student'}
                                </span>
                              </div>
                            </div>

                            {/* Authorized guardians listings */}
                            <div className="mt-2 text-left bg-amber-50/50 border border-amber-100 rounded-lg p-2 space-y-1">
                              <div className="text-[8px] flex justify-between">
                                <span className="text-stone-400 font-bold uppercase">Primary Guardian:</span>
                                <span className="font-extrabold text-stone-900">{'classLevel' in activePreviewItem ? (activePreviewItem as Pupil).guardianName : 'Emergency Handler'}</span>
                              </div>
                              <div className="text-[8px] flex justify-between">
                                <span className="text-stone-400 font-bold uppercase">Contact Phone:</span>
                                <span className="font-mono font-black text-rose-700">{'classLevel' in activePreviewItem ? (activePreviewItem as Pupil).guardianPhone : 'N/A'}</span>
                              </div>
                              <div className="text-[7.5px] border-t border-amber-100 pt-1">
                                <span className="text-amber-800 font-extrabold uppercase block text-[7px]">Other Authorized Pickers:</span>
                                <span className="text-stone-700 font-medium truncate block max-w-[210px]" title={pickupAuthorizedNames}>
                                  {pickupAuthorizedNames}
                                </span>
                              </div>
                            </div>

                          </div>
                        </>
                      ) : (
                        <>
                          {/* Branded school Header */}
                          <div className="p-3 text-white flex items-center gap-2 flex-shrink-0" style={{ backgroundColor: selectedTheme.accentColor }}>
                            <img 
                              src={schoolLogo || 'https://img.icons8.com/fluency/192/school.png'} 
                              alt="School logo preview" 
                              className="w-7 h-7 object-contain bg-white rounded-md p-0.5" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="text-left min-w-0">
                              <h4 className="text-[10px] font-black tracking-tight uppercase leading-tight truncate w-[185px]">
                                {schoolName}
                              </h4>
                              <span className="text-[8px] opacity-80 uppercase font-bold tracking-widest leading-none block mt-0.5">
                                {'classLevel' in activePreviewItem ? 'LEARNER ID CARD' : 'STAFF MEMBER'}
                              </span>
                            </div>
                          </div>

                          {/* Photo / Initials slot & main ID parameters */}
                          <div className="flex-grow flex flex-col items-center justify-center p-3 text-center">
                            {/* Physical Photo with trigger upload cover */}
                            <div className="relative w-24 h-28 border-2 rounded-xl overflow-hidden shadow-xs bg-stone-100 group flex items-center justify-center" style={{ borderColor: selectedTheme.accentColor }}>
                              {activePreviewItem.photoUrl ? (
                                <img 
                                  src={activePreviewItem.photoUrl} 
                                  alt={activePreviewItem.fullName} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                getInitialsAvatar(activePreviewItem.fullName, 'classLevel' in activePreviewItem)
                              )}
                              
                              {/* Hover Upload Button */}
                              <label className="absolute inset-0 bg-[#3D2B1F]/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-150 rounded-xl">
                                <Upload className="w-5 h-5 mb-1" />
                                <span className="text-[8px] font-black uppercase">Change Photo</span>
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={(e) => handlePhotoUpload(e, activePreviewItem.id, 'classLevel' in activePreviewItem)}
                                />
                              </label>
                            </div>

                            {/* Name and Tag */}
                            <h5 className="text-[14px] font-black text-stone-900 mt-2.5 truncate max-w-[210px]" title={activePreviewItem.fullName}>
                              {activePreviewItem.fullName}
                            </h5>
                            <span className="px-3 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase mt-1" style={{ backgroundColor: selectedTheme.accentColor + '18', color: selectedTheme.accentColor }}>
                              {'classLevel' in activePreviewItem ? (activePreviewItem as Pupil).classLevel : (activePreviewItem as Staff).role}
                            </span>

                            {/* System parameters table overlay */}
                            <div className="w-full mt-3 bg-stone-50/70 border border-slate-100 rounded-lg p-2 text-[9px] text-left space-y-1">
                              <div className="flex justify-between">
                                <span className="text-stone-400 font-bold uppercase">ID Number:</span>
                                <span className="font-mono font-bold text-stone-800">{activePreviewItem.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-400 font-bold uppercase">Emergency:</span>
                                <span className="font-bold text-[#8C5A3C]">{ 'classLevel' in activePreviewItem ? (activePreviewItem as Pupil).guardianPhone : (activePreviewItem as Staff).phone }</span>
                              </div>
                              <div className="flex justify-between truncate">
                                <span className="text-stone-400 font-bold uppercase">
                                  {'classLevel' in activePreviewItem ? 'Home Region:' : 'Assigned Area:'}
                                </span>
                                <span className="font-bold text-stone-800 max-w-[120px] truncate">
                                  { 'classLevel' in activePreviewItem ? `${(activePreviewItem as Pupil).homeVillage}, ${(activePreviewItem as Pupil).homeDistrict}` : ( (activePreviewItem as Staff).assignedClass || 'Full School' ) }
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Front footer barcodes */}
                      <div className="bg-slate-50 border-t border-slate-100 px-3 py-1.5 flex flex-col items-center">
                        {showBarcode && renderBarcodeSVG(activePreviewItem.id)}
                        <span className="text-[6px] text-stone-400 uppercase tracking-widest mt-1">Verified Kids Villa Portal Desk</span>
                      </div>
                    </div>

                    {/* BACK OF THE ID CARD (Flipped) */}
                    <div className={`absolute inset-0 w-full h-full rounded-2xl border-4 ${selectedTheme.borderColor} bg-stone-50 flex flex-col justify-between overflow-hidden shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] p-4 text-center`}>
                      
                      {cardType === 'pickup_permission' ? (
                        <>
                          {/* Top back branding for Pick-up Pass */}
                          <div className="border-b border-stone-200 pb-2">
                            <h4 className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                              SECURITY & COLLECTION PROTOCOL
                            </h4>
                            <span className="text-[5.5px] tracking-widest text-stone-500 font-extrabold uppercase block mt-1">
                              STRICT HANDOVER SAFEGUARD LAW
                            </span>
                          </div>

                          {/* ID Rules details */}
                          <div className="text-left py-2 space-y-1.5 text-[6.5px] text-stone-700 leading-normal font-medium">
                            <p>1. <b>COMPULSORY CARD:</b> Gate security guards will not release any student under any circumstance without presentation of this physical card.</p>
                            <p>2. <b>GUARDIAN PHONE MATCH:</b> If this card is lost, parents must call current head teacher to dispatch an authorization token.</p>
                            <p>3. <b>UNAUTHORIZED CALLS:</b> Boda boda riders must register their ID at the security log before boarding are verified.</p>
                            <p className="mt-2 text-[6.5px] italic text-[#8C5A3C] text-center border-t border-stone-150 pt-1">
                              "Nurturing premium safety for our children."
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Top back branding */}
                          <div className="border-b border-stone-200 pb-2">
                            <h4 className="text-[9px] font-black uppercase text-stone-800 tracking-wider">
                              {schoolName}
                            </h4>
                            <span className="text-[6px] tracking-widest text-[#8C5A3C] font-semibold uppercase block mt-0.5">
                              QUALITY PRE-SCHOOL SYSTEM
                            </span>
                          </div>

                          {/* ID Rules details */}
                          <div className="text-left py-2 space-y-1.5 text-[7px] text-[#5A3E2B] leading-normal font-medium">
                            <span className="block text-[8px] font-black text-center text-stone-800 border-b border-[#E0D8CC] pb-0.5 mb-1">
                              CARD RULES & POLICES
                            </span>
                            <p>1. This card is valid only for official term-based registration and operations.</p>
                            <p>2. Report loss details immediately to administration.</p>
                            <p>3. If found, please return to Kitemu Nsangi school address or call the hotline immediately.</p>
                            <p className="mt-2 text-[6.5px] italic text-[#8C5A3C] text-center border-t border-stone-100 pt-1">
                              "Shaping stars of tomorrow lovingly"
                            </p>
                          </div>
                        </>
                      )}

                      {/* Card expiration and official seals desk */}
                      <div className="border-t border-stone-200 pt-2 flex justify-between items-end">
                        <div className="text-left">
                          <span className="block text-[6px] text-stone-400 uppercase font-bold">Valid Until:</span>
                          <span className="text-[8px] font-black text-stone-900">{validUntil}</span>
                        </div>

                        {/* Stamp signature preview */}
                        <div className="text-right">
                          <span className="block border border-red-500 border-dashed text-[5px] text-red-500 font-bold px-1 rounded-sm rotate-3 mb-1 uppercase">
                            OFFICIAL STAMP
                          </span>
                          <span className="block font-serif text-[10px] italic text-sky-800 border-b border-stone-400 font-bold text-center w-14">
                            Admin
                          </span>
                          <span className="block text-[5.5px] text-stone-400 font-bold uppercase mt-1">
                            {signatoryRole}
                          </span>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* Flip control utility */}
                <button
                  type="button"
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-4 py-1.5 bg-[#8C5A3C]/10 hover:bg-[#8C5A3C]/15 text-[#8C5A3C] font-black uppercase text-[10px] tracking-widest rounded-full transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCw className="w-3.5 h-3.5" /> Flip Card ({isFlipped ? "BACK" : "FRONT"})
                </button>

                {/* Print individual preview button */}
                <button
                  type="button"
                  onClick={() => handlePrint(false)}
                  className="w-full mt-2 py-2.5 bg-zinc-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print This Card
                </button>

              </div>
            ) : (
              <div className="py-24 text-center">
                <AlertCircle className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-400 mt-2 font-bold uppercase">No Profile selected</p>
                <p className="text-[10px] text-stone-400">Click a learner or staff row from the selection desk to begin designing cards.</p>
              </div>
            )}
          </div>

          {/* Card customization settings desk panel */}
          <div className="bg-white rounded-3xl border border-[#E0D8CC] p-5 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase text-[#3D2B1F] tracking-wider border-b border-[#E0D8CC] pb-2 flex items-center gap-1">
              <Layers className="w-4 h-4 text-[#8C5A3C]" /> ID Theme & Layout Configurator
            </h4>

            {/* Card Type Selector (Only for Learners) */}
            {activeSubTab === 'learners' && (
              <div className="space-y-1.5 p-3.5 bg-amber-50/40 rounded-2xl border border-amber-200">
                <span className="block text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-amber-600" /> Card Purpose / Function
                </span>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setCardType('id_card')}
                    className={`py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      cardType === 'id_card'
                        ? 'bg-stone-900 text-white border-transparent'
                        : 'bg-white border-[#E0D8CC] text-[#7D6B5D] hover:bg-stone-50'
                    }`}
                  >
                    Student ID Badge
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('pickup_permission')}
                    className={`py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      cardType === 'pickup_permission'
                        ? 'bg-stone-900 text-white border-transparent'
                        : 'bg-white border-[#E0D8CC] text-[#7D6B5D] hover:bg-stone-50'
                    }`}
                  >
                    Pick-up Permission
                  </button>
                </div>
              </div>
            )}

            {/* Pick-up Extra Custom Fields */}
            {activeSubTab === 'learners' && cardType === 'pickup_permission' && (
              <div className="space-y-3 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                <span className="block text-[10px] font-black uppercase text-stone-800 tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#8C5A3C]" /> Pick-Up Security Settings
                </span>
                
                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-[#7D6B5D]">Authorized Picker Names</label>
                  <textarea
                    rows={2}
                    value={pickupAuthorizedNames}
                    onChange={(e) => setPickupAuthorizedNames(e.target.value)}
                    placeholder="E.g. Uncle John Mugisha, Aunt Kankiriho, Boda No. 12"
                    className="w-full text-xs px-3 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-stone-800 bg-white"
                  />
                  <p className="text-[9px] text-[#7D6B5D]">Family members or carers authorized to collect the child.</p>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] font-black uppercase text-[#7D6B5D]">Gate Verification Level</label>
                  <select
                    value={pickupSecurityLevel}
                    onChange={(e) => setPickupSecurityLevel(e.target.value as any)}
                    className="w-full text-xs px-2 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-stone-800 bg-white cursor-pointer"
                  >
                    <option value="High">🔴 CRITICAL (Strictest - Physical Card Compulsory)</option>
                    <option value="Standard">🟡 STANDARD (Caretakers cleared on call verify)</option>
                    <option value="Restricted">🛡️ RESTRICTED (Direct parents only - No proxy)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Print Orientation Selector */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Badge Orientation</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsVertical(true)}
                  className={`py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isVertical 
                      ? 'bg-stone-900 text-white border-transparent' 
                      : 'bg-white border-[#E0D8CC] text-[#7D6B5D] hover:bg-stone-50'
                  }`}
                >
                  Vertical (Portrait)
                </button>
                <button
                  type="button"
                  onClick={() => setIsVertical(false)}
                  className={`py-2 px-3 border rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    !isVertical 
                      ? 'bg-stone-900 text-white border-transparent' 
                      : 'bg-white border-[#E0D8CC] text-[#7D6B5D] hover:bg-stone-50'
                  }`}
                >
                  Horizontal (Landscape)
                </button>
              </div>
            </div>

            {/* Presets Themes palette swatch */}
            <div className="space-y-1.5">
              <span className="block text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Choose Theme Preset</span>
              <div className="flex flex-wrap gap-2">
                {THEMES.map((theme) => {
                  const isThemeSelected = selectedTheme.id === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedTheme(theme)}
                      className={`h-8 px-3 rounded-full text-[10px] font-black uppercase tracking-wide border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isThemeSelected 
                          ? 'border-stone-950 text-stone-950 font-black' 
                          : 'border-slate-200 text-slate-500 hover:border-slate-350'
                      }`}
                      style={{ backgroundColor: isThemeSelected ? theme.accentColor + '10' : '#fff' }}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-stone-400" style={{ backgroundColor: theme.accentColor }} />
                      {theme.name}
                      {isThemeSelected && <Check className="w-3 h-3 text-stone-950 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inputs settings */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* Expiration date */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-[#7D6B5D]">Expiration Date</label>
                <input
                  type="text"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  placeholder="Dec 2026"
                  className="w-full text-xs px-3 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-stone-800"
                />
              </div>

              {/* Back signatory role */}
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-[#7D6B5D]">Back Signatory Role</label>
                <select
                  value={signatoryRole}
                  onChange={(e) => setSignatoryRole(e.target.value)}
                  className="w-full text-xs px-2 py-2 border border-[#E0D8CC] rounded-xl outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-stone-800 bg-white"
                >
                  <option value="Head Teacher">Head Teacher</option>
                  <option value="Director">School Director</option>
                  <option value="Principal">School Principal</option>
                  <option value="Registrar Desk">Registrar Desk</option>
                </select>
              </div>
            </div>

            {/* Barcode & Extra triggers */}
            <div className="flex items-center justify-between pt-2 border-t border-stone-100">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-stone-800">Show CSS Barcode</span>
                <span className="text-[10px] text-[#7D6B5D]">Render barcode for student/staff scanner</span>
              </div>
              <button
                type="button"
                onClick={() => setShowBarcode(!showBarcode)}
                className={`w-10 h-6 p-0.5 rounded-full transition-colors cursor-pointer ${
                  showBarcode ? 'bg-[#8C5A3C] flex justify-end' : 'bg-stone-200 flex justify-start'
                }`}
              >
                <div className="w-5 h-5 bg-white rounded-full shadow-sm" />
              </button>
            </div>

            <div className="bg-[#6B8E23]/10 border border-[#6B8E23]/25 p-3.5 rounded-2xl flex items-start gap-2 text-[#58751d] text-[11px]">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <b className="font-extrabold uppercase block text-[10px]">Print-Ready Layout sheets</b>
                Cards will output beautifully framed when printed as PDF or physical copies on your local browser. Use a standard A4 cardstock paper!
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
