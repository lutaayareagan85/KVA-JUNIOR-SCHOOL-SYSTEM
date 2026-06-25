import React, { useState, useEffect, useRef } from 'react';
import { Pupil, Staff, PorridgeScheduleItem, ECDReport, AttendanceRecord, NurseryClass, Term, PupilRequirement, PaymentInstallment, RequirementItemName, CustomSubjectScore, Expenditure, MiscellaneousIncome, OperationalCenter, Vendor } from './types';
import { INITIAL_PUPILS, INITIAL_STAFF, PORRIDGE_SCHEDULE, INITIAL_REPORTS, INITIAL_ATTENDANCE, INITIAL_EXPENDITURES, INITIAL_MISC_INCOME, INITIAL_OPERATIONAL_CENTERS, INITIAL_VENDORS } from './mockData';
import { StudentRegistry } from './components/StudentRegistry';
import { AcademicTimetable } from './components/AcademicTimetable';
import { ExcelImporter } from './components/ExcelImporter';
import { InfrastructureAux } from './components/InfrastructureAux';
import { ECDInsightsAI } from './components/ECDInsightsAI';
import { RoleMatrix } from './components/RoleMatrix';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { TeachersPayroll } from './components/TeachersPayroll';
import ECDCurriculumAI from './components/ECDCurriculumAI';
import IdentityCardGenerator from './components/IdentityCardGenerator';
import { ParentCommunication } from './components/ParentCommunication';
import { ClassroomPhotoSlider } from './components/ClassroomPhotoSlider';
import { SystemAuth, UserSession } from './components/SystemAuth';
import { SyncedPortalHub } from './components/SyncedPortalHub';
import { db, SYNC_DOC_REF } from './lib/firebase';
import { onSnapshot } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileText, 
  Coins, 
  Soup, 
  Users, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  UserPlus, 
  AlertTriangle, 
  Plus, 
  X,
  Monitor,
  Laptop,
  Sparkles, 
  FileCheck, 
  Search,
  BookOpen, 
  Heart,
  MoveUp,
  Award,
  DollarSign,
  Briefcase,
  Printer,
  ChevronRight,
  ChevronDown,
  Clock,
  Smartphone,
  Database,
  Lock,
  LogOut,
  MapPin,
  Smile,
  Download,
  Wifi,
  WifiOff,
  School,
  Upload,
  Image,
  Trash2,
  Share2,
  Loader2,
  Phone,
  MessageSquare,
  Send,
  CreditCard,
  Check,
  Edit,
  Building,
  TrendingUp,
  TrendingDown,
  Settings,
  Bus,
  Package,
  Apple,
  List,
  Grid,
  RefreshCw,
  CloudUpload,
  CloudDownload
} from 'lucide-react';

export const GRADE_COMPETENCIES: Record<'A' | 'B' | 'C' | 'D' | 'E', string> = {
  'A': 'Excellent - Demonstrates consistent mastery, independent execution, and active participation.',
  'B': 'Very Good - Shows high ability, initiates tasks with minimal prompts, and executes cleanly.',
  'C': 'Good - Has acquired standard competencies and performs tasks correctly with simple modeling.',
  'D': 'Fair - Shows basic progress, but is still developing steadiness and needs frequent scaffolding.',
  'E': 'Emerging - Learning is in the beginning stages, requiring close adult assistance and repetition.'
};

const migrateClassLevel = (cls: string): any => {
  if (cls === 'Baby Class') return 'KG1';
  if (cls === 'Middle Class') return 'KG2';
  if (cls === 'Top Class') return 'KG3';
  return cls;
};

export default function App() {
  // Sync state with LocalStorage for durable cloud-like client persistence
  const [pupils, setPupils] = useState<Pupil[]>(() => {
    const saved = localStorage.getItem('kva_pupils') || localStorage.getItem('sanyu_pupils');
    const parsed = saved ? JSON.parse(saved) : INITIAL_PUPILS;
    return parsed.map((p: any) => ({ 
      ...p, 
      classLevel: migrateClassLevel(p.classLevel),
      installments: [] // Reset student fee payment monies to zero!
    }));
  });

  const [staff, setStaff] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('kva_staff') || localStorage.getItem('sanyu_staff');
    const parsed = saved ? JSON.parse(saved) : INITIAL_STAFF;
    return parsed.map((s: any) => ({ ...s, assignedClass: s.assignedClass ? migrateClassLevel(s.assignedClass) : 'All' }));
  });

  const [reports, setReports] = useState<ECDReport[]>(() => {
    const saved = localStorage.getItem('kva_reports') || localStorage.getItem('sanyu_reports');
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('kva_attendance') || localStorage.getItem('sanyu_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [porridgeSchedule, setPorridgeSchedule] = useState<PorridgeScheduleItem[]>(() => {
    const saved = localStorage.getItem('kva_porridge') || localStorage.getItem('sanyu_porridge');
    return saved ? JSON.parse(saved) : PORRIDGE_SCHEDULE;
  });

  const [expenditures, setExpenditures] = useState<Expenditure[]>([]);

  const [miscIncomes, setMiscIncomes] = useState<MiscellaneousIncome[]>([]);

  const [operationalCenters, setOperationalCenters] = useState<OperationalCenter[]>(() => {
    const saved = localStorage.getItem('kva_operational_centers') || localStorage.getItem('sanyu_operational_centers');
    return saved ? JSON.parse(saved) : INITIAL_OPERATIONAL_CENTERS;
  });


  // Client side transient states
  const [currentUserSession, setCurrentUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('kva_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'registry' | 'assessments' | 'fees' | 'meals' | 'staff' | 
    'timetables' | 'shuttle' | 'assets' | 'predictions' | 'role-matrix' | 'database' | 'curriculum' | 'idcards' | 'messages'
  >('dashboard');
  const [unreadMessageCount, setUnreadMessageCount] = useState<number>(1);
  const [selectedTerm, setSelectedTerm] = useState<Term>(() => {
    const saved = localStorage.getItem('kva_selected_term');
    return (saved as Term) || 'Term 2';
  });
  const [academicYear, setAcademicYear] = useState(() => {
    return localStorage.getItem('kva_academic_year') || '2026';
  });
  const [todayDate, setTodayDate] = useState('2026-06-18'); // In sync with development local time

  // Local state for Sickbay records
  const [sickbayLogs, setSickbayLogs] = useState<{ id: string; pupilName: string; issue: string; action: string; date: string }[]>(() => {
    const saved = localStorage.getItem('kva_sickbay') || localStorage.getItem('sanyu_sickbay');
    return saved ? JSON.parse(saved) : [
      { id: 'S1', pupilName: 'Babirye Shifra', issue: 'Slight fever (38.2 C)', action: 'Gave Panadol Syrup & placed on rest bed.', date: '2026-06-17' },
      { id: 'S2', pupilName: 'Kato Ivan Wasswa', issue: 'Superficial knee scratch from playground', action: 'Cleaned with Dettol, applied antiseptic cream.', date: '2026-06-18' }
    ];
  });

  // Attendance checking state (for today)
  const [attendanceCheckedToday, setAttendanceCheckedToday] = useState(false);
  const [presentStudentIds, setPresentStudentIds] = useState<string[]>([]);

  // Modals / Reports generation helper states
  const [generatingReportFor, setGeneratingReportFor] = useState<Pupil | null>(null);
  const [isCallingGemini, setIsCallingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  // Gemini Form State
  const [strengthInput, setStrengthInput] = useState('');
  const [growthInput, setGrowthInput] = useState('');
  const [reportTone, setReportTone] = useState<'Encouraging & Warm' | 'Constructive & Clear' | 'Inspiring & High-energy'>('Encouraging & Warm');
  const [localLanguage, setLocalLanguage] = useState<'English' | 'Luganda' | 'Runyankole' | 'Acholi' | 'Iteso' | 'Lusoga'>('Luganda');

  // NCDC ECD score metrics form
  const [scoreSocial, setScoreSocial] = useState<1 | 2 | 3>(2);
  const [scorePhysical, setScorePhysical] = useState<1 | 2 | 3>(2);
  const [scoreLanguage, setScoreLanguage] = useState<1 | 2 | 3>(2);
  const [scoreMath, setScoreMath] = useState<1 | 2 | 3>(2);
  const [scoreHealth, setScoreHealth] = useState<1 | 2 | 3>(3);

  // New Grade options A, B, C, D, E for Literacy 1 & 2, Social Dev, Health Habits and Mathematics
  const [gradeLiteracy1, setGradeLiteracy1] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [gradeLiteracy2, setGradeLiteracy2] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [gradeSocialDevelopment, setGradeSocialDevelopment] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [gradeHealthHabits, setGradeHealthHabits] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');
  const [gradeMathematics, setGradeMathematics] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('B');

  // Custom subjects and evaluations states
  const [customSubjectsTemp, setCustomSubjectsTemp] = useState<CustomSubjectScore[]>([]);
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjScore, setNewSubjScore] = useState<string>('3'); // can be level or percentage
  const [newSubjCompetency, setNewSubjCompetency] = useState('');

  // Custom learning areas states
  const [learningAreas, setLearningAreas] = useState<{ id: string; name: string; code: string; }[]>(() => {
    const saved = localStorage.getItem('kva_learning_areas') || localStorage.getItem('sanyu_learning_areas');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'la_literacy1', name: 'LITERACY 1 (Oral & Listening)', code: 'LIT 1' },
      { id: 'la_literacy2', name: 'LITERACY 2 (Pre-Writing & Reading)', code: 'LIT 2' },
      { id: 'la_social', name: 'SOCIAL DEVELOPMENT', code: 'SOC' },
      { id: 'la_health', name: 'HEALTH HABITS', code: 'HLT' },
      { id: 'la_math', name: 'MATHEMATICS', code: 'MATH' }
    ];
  });

  const [currentLearningAreaGrades, setCurrentLearningAreaGrades] = useState<Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>>({});

  // Staff management form states
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<Staff['role']>('Class Teacher');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffNokName, setNewStaffNokName] = useState('');
  const [newStaffNokPhone, setNewStaffNokPhone] = useState('');
  const [newStaffSalary, setNewStaffSalary] = useState<number>(600000);
  const [newStaffClass, setNewStaffClass] = useState<NurseryClass | 'All'>('KG1');
  const [newStaffPhotoUrl, setNewStaffPhotoUrl] = useState('');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [showStaffExcelImport, setShowStaffExcelImport] = useState(false);
  const [staffSubTab, setStaffSubTab] = useState<'directory' | 'payroll'>('directory');
  const [feesSubTab, setFeesSubTab] = useState<'ledgers' | 'expenditures' | 'centers' | 'vendors'>('ledgers');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [firebaseSyncEnabled, setFirebaseSyncEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('kva_firebase_sync_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Flag to avoid auto-pushing when we are applying an incoming sync from server
  const isIncomingSyncRef = useRef(false);

  // Vendor state and manager form states
  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('kva_vendors') || localStorage.getItem('sanyu_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContactPerson, setNewVendorContactPerson] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [newVendorNotes, setNewVendorNotes] = useState('');
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Meals sub-tab and management states
  const [mealsSubTab, setMealsSubTab] = useState<'meals' | 'sickbay'>('meals');
  const [showMealForm, setShowMealForm] = useState(false);
  const [newMealDay, setNewMealDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [newMealTime, setNewMealTime] = useState('10:00 AM');
  const [newMealType, setNewMealType] = useState('');
  const [newMealSnack, setNewMealSnack] = useState('');
  const [editingMealIndex, setEditingMealIndex] = useState<number | null>(null);

  // Recurrent expenditure states
  const [newExpItemName, setNewExpItemName] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<Expenditure['category']>('Utilities & Rent');
  const [newExpAmount, setNewExpAmount] = useState<number>(50000);
  const [newExpRecurrence, setNewExpRecurrence] = useState<Expenditure['recurrence']>('Monthly');
  const [newExpStatus, setNewExpStatus] = useState<Expenditure['status']>('Paid');
  const [newExpVendor, setNewExpVendor] = useState('');
  const [newExpNotes, setNewExpNotes] = useState('');
  const [newExpCenter, setNewExpCenter] = useState<string>('Academic Instruction & Tuition');
  const [selectedExpCategory, setSelectedExpCategory] = useState<string>('All');
  const [expSearchQuery, setExpSearchQuery] = useState<string>('');
  const [vendorSearchQuery, setVendorSearchQuery] = useState<string>('');

  // Miscellaneous Income Form States
  const [newMiscSourceName, setNewMiscSourceName] = useState('');
  const [newMiscCategory, setNewMiscCategory] = useState<MiscellaneousIncome['category']>('Other Sales & Services');
  const [newMiscAmount, setNewMiscAmount] = useState<number>(100000);
  const [newMiscMethod, setNewMiscMethod] = useState<MiscellaneousIncome['paymentMethod']>('Cash');
  const [newMiscCenter, setNewMiscCenter] = useState<string>('Stationery & Uniforms Store');
  const [newMiscReceiptNo, setNewMiscReceiptNo] = useState('');
  const [newMiscNotes, setNewMiscNotes] = useState('');
  const [isMiscFormOpen, setIsMiscFormOpen] = useState(false);
  const [selectedCenterFilter, setSelectedCenterFilter] = useState<string | null>(null);

  // Operational Center Configuration States
  const [isManageCentersOpen, setIsManageCentersOpen] = useState(false);
  const [newCenterName, setNewCenterName] = useState('');
  const [newCenterDescription, setNewCenterDescription] = useState('');
  const [newCenterType, setNewCenterType] = useState<'Income' | 'Expenditure' | 'Dual'>('Dual');
  const [newCenterAccent, setNewCenterAccent] = useState<'amber' | 'emerald' | 'blue' | 'purple' | 'stone' | 'indigo' | 'rose' | 'yellow'>('indigo');




  // Fee payment state
  const [payingPupil, setPayingPupil] = useState<Pupil | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(100000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentInstallment['paymentMethod']>('Mobile Money');
  const [paymentCenter, setPaymentCenter] = useState<string>('Academic Instruction & Tuition');
  const [paymentReceipt, setPaymentReceipt] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Editing existing payment installment states
  const [editingInstallment, setEditingInstallment] = useState<PaymentInstallment | null>(null);
  const [editingPupilForInstallment, setEditingPupilForInstallment] = useState<Pupil | null>(null);
  const [expandedPupilId, setExpandedPupilId] = useState<string | null>(null);

  // Universal Tab Search State
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    setSearchQuery('');
  }, [activeTab]);

  const [staffViewStyle, setStaffViewStyle] = useState<'lists' | 'tiles'>(() => {
    return (localStorage.getItem('kva_staff_view_style') as 'lists' | 'tiles') || 'tiles';
  });
  useEffect(() => {
    localStorage.setItem('kva_staff_view_style', staffViewStyle);
  }, [staffViewStyle]);

  // Healthy Bay record state
  const [newSickName, setNewSickName] = useState('');
  const [newSickIssue, setNewSickIssue] = useState('');
  const [newSickAction, setNewSickAction] = useState('');
  const [editingSickbayLogId, setEditingSickbayLogId] = useState<string | null>(null);

  // School profile customization states (Logo, Name, Address)
  const [schoolLogo, setSchoolLogo] = useState<string>(() => {
    const saved = localStorage.getItem('kva_school_logo');
    if (saved !== null) {
      return saved;
    }
    const legacy = localStorage.getItem('sanyu_school_logo');
    if (legacy !== null) {
      return legacy;
    }
    return 'https://img.icons8.com/fluency/192/school.png';
  });
  const [schoolName, setSchoolName] = useState<string>(() => {
    return localStorage.getItem('kva_school_name') || localStorage.getItem('sanyu_school_name') || 'Kids Villa Academy';
  });
  const [schoolAddress, setSchoolAddress] = useState<string>(() => {
    return localStorage.getItem('kva_school_address') || localStorage.getItem('sanyu_school_address') || 'Kitemu Nsangi, Wakiso District, Uganda | Tel: +256 706 123456';
  });

  const [brandingSaveSuccess, setBrandingSaveSuccess] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Selected report card to print
  const [printedReport, setPrintedReport] = useState<ECDReport | null>(null);

  // PDF download / QR code state
  const [previewQrCode, setPreviewQrCode] = useState<string>('');

  // Bulk operation states
  const [bulkClassFilter, setBulkClassFilter] = useState<'All' | NurseryClass>('All');
  const [bulkRecordToRender, setBulkRecordToRender] = useState<{ pupil: Pupil; report: ECDReport; qrCode: string } | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; pupilName: string; active: boolean }>({
    current: 0,
    total: 0,
    pupilName: '',
    active: false
  });

  // Sharing states
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [sharedFolderSyncProgress, setSharedFolderSyncProgress] = useState<{ current: number; total: number; status: 'idle' | 'syncing' | 'completed'; destination: string }>({
    current: 0,
    total: 0,
    status: 'idle',
    destination: 'Google Drive'
  });

  // Academic System Promotion Control States
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState<boolean>(false);
  const [promoTermResetRequirements, setPromoTermResetRequirements] = useState<boolean>(true);
  const [promoTermResetAttendance, setPromoTermResetAttendance] = useState<boolean>(true);
  const [promoYearClassLevels, setPromoYearClassLevels] = useState<boolean>(true);
  const [promoYearIncrementAge, setPromoYearIncrementAge] = useState<boolean>(true);
  
  // Custom Verification State for direct QR link back
  const [verifyPupilId, setVerifyPupilId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('verifyPupilId') || params.get('pupilId');
  });

  // Sickbay guardian notification and payment state
  const [notifyingSickLog, setNotifyingSickLog] = useState<{ id: string; pupilName: string; issue: string; action: string; date: string } | null>(null);
  const [notificationChannel, setNotificationChannel] = useState<'SMS' | 'WhatsApp'>('SMS');
  const [overrideGuardianPhone, setOverrideGuardianPhone] = useState('');
  const [overrideGuardianName, setOverrideGuardianName] = useState('');
  const [treatmentFeeAmount, setTreatmentFeeAmount] = useState<number>(15000); // default 15,000 UGX
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<'MTN' | 'Airtel'>('MTN');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'prompting' | 'processing' | 'success' | 'failed'>('idle');
  const [simulatedPayerPin, setSimulatedPayerPin] = useState('');
  const [simulationStep, setSimulationStep] = useState<'details' | 'momo_prompt' | 'sent_notification'>('details');
  const [momoTxReference, setMomoTxReference] = useState('');
  const [notifiedLogIds, setNotifiedLogIds] = useState<Record<string, { channel: string; phone: string; amount?: number; provider?: string; txRef?: string; date: string }>>(() => {
    const saved = localStorage.getItem('kva_sickbay_notifications') || localStorage.getItem('sanyu_sickbay_notifications');
    return saved ? JSON.parse(saved) : {};
  });

  // Effect to automatically generate QR codes for selected preview report card
  useEffect(() => {
    if (printedReport) {
      const origin = window.location.origin;
      const url = `${origin}/?verifyPupilId=${printedReport.pupilId}`;
      QRCode.toDataURL(url, { 
        width: 150, 
        margin: 1, 
        color: { dark: '#3D2B1F', light: '#FFFFFC' } 
      })
      .then(data => setPreviewQrCode(data))
      .catch(err => console.error("Error creating preview qr code:", err));
    } else {
      setPreviewQrCode('');
    }
  }, [printedReport]);

  // Sync state back to LocalStorage on modifications
  useEffect(() => {
    localStorage.setItem('kva_school_logo', schoolLogo);
  }, [schoolLogo]);

  useEffect(() => {
    localStorage.setItem('kva_school_name', schoolName);
  }, [schoolName]);

  useEffect(() => {
    localStorage.setItem('kva_school_address', schoolAddress);
  }, [schoolAddress]);

  useEffect(() => {
    localStorage.setItem('kva_learning_areas', JSON.stringify(learningAreas));
  }, [learningAreas]);

  useEffect(() => {
    localStorage.setItem('kva_pupils', JSON.stringify(pupils));
  }, [pupils]);

  useEffect(() => {
    localStorage.setItem('kva_staff', JSON.stringify(staff));
  }, [staff]);

  useEffect(() => {
    localStorage.setItem('kva_reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('kva_attendance', JSON.stringify(attendance));
  }, [attendance]);

  useEffect(() => {
    localStorage.setItem('kva_porridge', JSON.stringify(porridgeSchedule));
  }, [porridgeSchedule]);

  useEffect(() => {
    localStorage.setItem('kva_expenditures', JSON.stringify(expenditures));
  }, [expenditures]);

  useEffect(() => {
    localStorage.setItem('kva_misc_incomes', JSON.stringify(miscIncomes));
  }, [miscIncomes]);

  useEffect(() => {
    localStorage.setItem('kva_operational_centers', JSON.stringify(operationalCenters));
  }, [operationalCenters]);

  useEffect(() => {
    localStorage.setItem('kva_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('kva_selected_term', selectedTerm);
  }, [selectedTerm]);

  useEffect(() => {
    localStorage.setItem('kva_academic_year', academicYear);
  }, [academicYear]);



  useEffect(() => {
    localStorage.setItem('kva_sickbay', JSON.stringify(sickbayLogs));
  }, [sickbayLogs]);

  useEffect(() => {
    localStorage.setItem('kva_sickbay_notifications', JSON.stringify(notifiedLogIds));
  }, [notifiedLogIds]);

  const handleGetLocalState = () => {
    return {
      kva_pupils: localStorage.getItem('kva_pupils'),
      kva_staff: localStorage.getItem('kva_staff'),
      kva_reports: localStorage.getItem('kva_reports'),
      kva_attendance: localStorage.getItem('kva_attendance'),
      kva_porridge: localStorage.getItem('kva_porridge'),
      kva_expenditures: localStorage.getItem('kva_expenditures'),
      kva_misc_incomes: localStorage.getItem('kva_misc_incomes'),
      kva_operational_centers: localStorage.getItem('kva_operational_centers'),
      kva_vendors: localStorage.getItem('kva_vendors'),
      kva_learning_areas: localStorage.getItem('kva_learning_areas'),
      kva_sickbay: localStorage.getItem('kva_sickbay'),
      kva_sickbay_notifications: localStorage.getItem('kva_sickbay_notifications'),
      kva_school_name: localStorage.getItem('kva_school_name') || schoolName,
      kva_school_address: localStorage.getItem('kva_school_address') || schoolAddress,
      kva_school_logo: localStorage.getItem('kva_school_logo') || schoolLogo,
      kva_selected_term: localStorage.getItem('kva_selected_term') || selectedTerm,
      kva_academic_year: localStorage.getItem('kva_academic_year') || academicYear,
      kva_saved_curriculums: localStorage.getItem('kva_saved_curriculums'),
      kva_dashboard_slides: localStorage.getItem('kva_dashboard_slides'),
      kva_parent_messages: localStorage.getItem('kva_parent_messages'),
      kva_auth_users: localStorage.getItem('kva_auth_users'),
      kva_payroll: localStorage.getItem('kva_payroll')
    };
  };

  const handleStateLoaded = (serverState: any) => {
    if (!serverState) return;

    // Set incoming sync flag
    isIncomingSyncRef.current = true;

    // Set all items in localStorage
    Object.entries(serverState).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        localStorage.setItem(key, value);
      }
    });

    // Re-verify and parse states safely to enforce reactive changes
    try {
      if (serverState.kva_pupils) {
        setPupils(JSON.parse(serverState.kva_pupils));
      }
      if (serverState.kva_staff) {
        setStaff(JSON.parse(serverState.kva_staff));
      }
      if (serverState.kva_reports) {
        setReports(JSON.parse(serverState.kva_reports));
      }
      if (serverState.kva_attendance) {
        setAttendance(JSON.parse(serverState.kva_attendance));
      }
      if (serverState.kva_porridge) {
        setPorridgeSchedule(JSON.parse(serverState.kva_porridge));
      }
      if (serverState.kva_expenditures) {
        setExpenditures(JSON.parse(serverState.kva_expenditures));
      }
      if (serverState.kva_misc_incomes) {
        setMiscIncomes(JSON.parse(serverState.kva_misc_incomes));
      }
      if (serverState.kva_operational_centers) {
        setOperationalCenters(JSON.parse(serverState.kva_operational_centers));
      }
      if (serverState.kva_vendors) {
        setVendors(JSON.parse(serverState.kva_vendors));
      }
      if (serverState.kva_learning_areas) {
        setLearningAreas(JSON.parse(serverState.kva_learning_areas));
      }
      if (serverState.kva_sickbay) {
        setSickbayLogs(JSON.parse(serverState.kva_sickbay));
      }
      if (serverState.kva_sickbay_notifications) {
        setNotifiedLogIds(JSON.parse(serverState.kva_sickbay_notifications));
      }
      if (serverState.kva_school_name) {
        setSchoolName(serverState.kva_school_name);
      }
      if (serverState.kva_school_address) {
        setSchoolAddress(serverState.kva_school_address);
      }
      if (serverState.kva_school_logo) {
        setSchoolLogo(serverState.kva_school_logo);
      }
      if (serverState.kva_selected_term) {
        setSelectedTerm(serverState.kva_selected_term as Term);
      }
      if (serverState.kva_academic_year) {
        setAcademicYear(serverState.kva_academic_year);
      }
    } catch (parseErr) {
      console.error("Error parsing synchronised serverside database packet:", parseErr);
    } finally {
      // Release sync flag after React rendering/propagation settles
      setTimeout(() => {
        isIncomingSyncRef.current = false;
      }, 1500);
    }
  };

  // Firebase Real-time sync configuration synchronization
  useEffect(() => {
    localStorage.setItem('kva_firebase_sync_enabled', firebaseSyncEnabled ? 'true' : 'false');
  }, [firebaseSyncEnabled]);

  // Firebase Real-time Auto-Sync modifier
  useEffect(() => {
    // If sync is disabled or we are currently loading state from the server, do not auto-save
    if (!firebaseSyncEnabled || isIncomingSyncRef.current) return;

    const timer = setTimeout(async () => {
      try {
        console.log("[Firebase Real-Time Auto-Sync] Local modifications detected. Saving state...");
        
        const localState = handleGetLocalState();
        const timestamp = new Date().toISOString();
        const updatedBy = currentUserSession?.username || 'Staff Member';

        const { savePortalStateToFirebase } = await import('./lib/firebase');
        const payload = await savePortalStateToFirebase(localState, updatedBy);

        // Update local sync timestamp to match the new server timestamp to avoid feedback loops
        localStorage.setItem('kva_local_last_sync_timestamp', payload.timestamp);
        console.log("[Firebase Real-Time Auto-Sync] State automatically pushed to Cloud Firestore successfully!");
      } catch (err) {
        console.error("[Firebase Real-Time Auto-Sync] Auto-save error:", err);
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timer);
  }, [
    firebaseSyncEnabled,
    pupils,
    staff,
    reports,
    attendance,
    porridgeSchedule,
    expenditures,
    miscIncomes,
    operationalCenters,
    vendors,
    selectedTerm,
    academicYear,
    sickbayLogs,
    currentUserSession?.username
  ]);

  // Firestore background master state listener
  useEffect(() => {
    if (!firebaseSyncEnabled) return;

    console.log("[Firebase Real-Time Sync] Active listener on master_state document...");
    const unsubscribe = onSnapshot(SYNC_DOC_REF, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data && data.state) {
          console.log(`[Firebase Real-Time Sync] Master state updated globally by ${data.updatedBy} at ${data.timestamp}. Applying to client...`);
          
          // Check if this incoming sync is newer than our current state timestamp to avoid feedback loops
          const localLastSync = localStorage.getItem('kva_local_last_sync_timestamp') || '';
          if (data.timestamp !== localLastSync) {
            localStorage.setItem('kva_local_last_sync_timestamp', data.timestamp);
            handleStateLoaded(data.state);
          }
        }
      }
    }, (err) => {
      console.error("[Firebase Real-Time Sync] Listener error:", err);
    });

    return () => unsubscribe();
  }, [firebaseSyncEnabled]);

  // Load standard attendance if checked for today
  useEffect(() => {
    const todayRecord = attendance.find(a => a.date === todayDate);
    if (todayRecord) {
      setPresentStudentIds(todayRecord.presentStudentIds);
      setAttendanceCheckedToday(true);
    } else {
      // Pre-fill with all dynamic pupils standard present state
      setPresentStudentIds(pupils.map(p => p.id));
    }
  }, [attendance, todayDate, pupils]);

  // Handlers
  const handleAddPupil = (
    newPupilData: Omit<Pupil, 'id' | 'installments' | 'requirements'>,
    initialInstallment?: {
      amount: number;
      paymentMethod: 'Bank Slip' | 'Mobile Money' | 'Cash' | 'Agent Banking' | 'Equity Bank' | 'DFCU Bank' | 'School Pay';
      receiptNo: string;
      notes?: string;
    }
  ) => {
    // Generate new unique ID
    const nextId = `P${String(pupils.length + 1).padStart(3, '0')}`;
    
    // Set default requirements for Ugandan nursery standard
    const defaultRequirements: PupilRequirement[] = [
      { name: 'Toilet Paper (2 rolls)', brought: false },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: false },
      { name: 'Broom (Sisal/Soft)', brought: false },
      { name: 'Liquid Soap (1 Liter)', brought: false },
      { name: 'Maize Flour (5kg for Porridge)', brought: false }
    ];

    const newPupilObject: Pupil = {
      ...newPupilData,
      id: nextId,
      installments: initialInstallment ? [{
        id: `I${Date.now()}`,
        amount: initialInstallment.amount,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: initialInstallment.paymentMethod,
        receiptNo: initialInstallment.receiptNo,
        notes: initialInstallment.notes || 'Initial fees deposit.',
        center: 'Academic Instruction & Tuition'
      }] : [],
      requirements: defaultRequirements,
      status: 'Active'
    };

    setPupils([...pupils, newPupilObject]);
  };

  const handleImportPupils = (importedPupils: Pupil[]) => {
    setPupils(prevPupils => {
      const merged = [...prevPupils];
      importedPupils.forEach(imported => {
        const existingIdx = merged.findIndex(p => p.id === imported.id || p.fullName.trim().toLowerCase() === imported.fullName.trim().toLowerCase());
        if (existingIdx !== -1) {
          // Update existing
          merged[existingIdx] = {
            ...merged[existingIdx],
            ...imported,
            installments: imported.installments && imported.installments.length > 0 ? imported.installments : merged[existingIdx].installments,
            requirements: imported.requirements && imported.requirements.length > 0 ? imported.requirements : merged[existingIdx].requirements
          };
        } else {
          const defaultRequirements: PupilRequirement[] = [
            { name: 'Toilet Paper (2 rolls)', brought: false },
            { name: 'Ream of Printing Paper (Rotatrim)', brought: false },
            { name: 'Broom (Sisal/Soft)', brought: false },
            { name: 'Liquid Soap (1 Liter)', brought: false },
            { name: 'Maize Flour (5kg for Porridge)', brought: false }
          ];
          const newPupil: Pupil = {
            ...imported,
            id: imported.id || `P${String(merged.length + 1).padStart(3, '0')}`,
            requirements: imported.requirements && imported.requirements.length > 0 ? imported.requirements : defaultRequirements,
            installments: imported.installments || []
          };
          merged.push(newPupil);
        }
      });
      return merged;
    });
  };

  const handleUpdatePupil = (updatedPupil: Pupil) => {
    setPupils(pupils.map(p => p.id === updatedPupil.id ? updatedPupil : p));
  };

  const handleDeletePupil = (pupilId: string) => {
    setPupils(pupils.filter(p => p.id !== pupilId));
  };

  const handleClassAssignment = (staffId: string, assignedClass: NurseryClass | 'All') => {
    setStaff(staff.map(s => s.id === staffId ? { ...s, assignedClass } : s));
  };

  const handleAddStaff = (newMember: Omit<Staff, 'id'>) => {
    const nextId = `S${Date.now().toString().slice(-3)}`;
    setStaff([...staff, { ...newMember, id: nextId }]);
  };

  const handleDeleteStaff = (staffId: string) => {
    setStaff(staff.filter(s => s.id !== staffId));
    if (editingStaffId === staffId) {
      setEditingStaffId(null);
      setIsStaffFormOpen(false);
    }
  };

  const handleUpdateStaff = (updatedMember: Staff) => {
    setStaff(staff.map(s => s.id === updatedMember.id ? updatedMember : s));
  };

  const handleSaveBranding = () => {
    localStorage.setItem('kva_school_logo', schoolLogo);
    localStorage.setItem('kva_school_name', schoolName);
    localStorage.setItem('kva_school_address', schoolAddress);
    setBrandingSaveSuccess(true);
    setTimeout(() => {
      setBrandingSaveSuccess(false);
    }, 4500);
  };

  const saveAttendanceForToday = () => {
    const existingIndex = attendance.findIndex(a => a.date === todayDate);
    if (existingIndex >= 0) {
      const updated = [...attendance];
      updated[existingIndex] = { date: todayDate, presentStudentIds };
      setAttendance(updated);
    } else {
      setAttendance([...attendance, { date: todayDate, presentStudentIds }]);
    }
    setAttendanceCheckedToday(true);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPupil) return;

    const installment: PaymentInstallment = {
      id: `I${Date.now()}`,
      amount: Number(paymentAmount),
      date: new Date().toISOString().split('T')[0],
      paymentMethod,
      center: paymentCenter,
      receiptNo: paymentReceipt || `REC-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: paymentNotes
    };

    const updatedPupil = {
      ...payingPupil,
      installments: [...payingPupil.installments, installment]
    };

    handleUpdatePupil(updatedPupil);
    setPayingPupil(null);
    setPaymentReceipt('');
    setPaymentNotes('');
    setPaymentCenter('Academic Instruction & Tuition');
  };

  const handleDeleteInstallmentList = (pupil: Pupil, installmentId: string) => {
    const updatedInstallments = pupil.installments.filter(inst => inst.id !== installmentId);
    const updatedPupil = {
      ...pupil,
      installments: updatedInstallments
    };
    handleUpdatePupil(updatedPupil);
  };

  const handleSaveEditedInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPupilForInstallment || !editingInstallment) return;

    const updatedInstallments = editingPupilForInstallment.installments.map(inst => {
      if (inst.id === editingInstallment.id) {
        return editingInstallment;
      }
      return inst;
    });

    const updatedPupil = {
      ...editingPupilForInstallment,
      installments: updatedInstallments
    };

    handleUpdatePupil(updatedPupil);
    setEditingInstallment(null);
    setEditingPupilForInstallment(null);
  };

  const handleAddExpenditure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpItemName) return;

    const newExp: Expenditure = {
      id: `EX${Date.now()}`,
      itemName: newExpItemName,
      category: newExpCategory,
      amount: Number(newExpAmount),
      recurrence: newExpRecurrence,
      dateAdded: new Date().toISOString().split('T')[0],
      status: newExpStatus,
      supplierVendor: newExpVendor || undefined,
      notes: newExpNotes || undefined,
      center: newExpCenter
    };

    setExpenditures([newExp, ...expenditures]);
    setNewExpItemName('');
    setNewExpCategory('Utilities & Rent');
    setNewExpAmount(50000);
    setNewExpRecurrence('Monthly');
    setNewExpStatus('Paid');
    setNewExpVendor('');
    setNewExpNotes('');
    setNewExpCenter(operationalCenters[0]?.name || 'Academic Instruction & Tuition');
  };

  const handleAddOperationalCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCenterName.trim()) return;

    if (operationalCenters.find(c => c.name.toLowerCase() === newCenterName.trim().toLowerCase())) {
      alert('An operational center with this name already exists.');
      return;
    }

    const nextId = 'C_CUSTOM_' + Date.now();
    const newCenter: OperationalCenter = {
      id: nextId,
      name: newCenterName.trim(),
      description: newCenterDescription.trim() || 'Custom financial operational center.',
      type: newCenterType,
      accent: newCenterAccent
    };

    setOperationalCenters(prev => [...prev, newCenter]);
    setNewCenterName('');
    setNewCenterDescription('');
    setNewCenterType('Dual');
    setNewCenterAccent('indigo');
  };

  const handleRemoveOperationalCenter = (id: string) => {
    const target = operationalCenters.find(c => c.id === id);
    if (!target) return;

    if (operationalCenters.length <= 1) {
      alert('You must have at least one operational center.');
      return;
    }

    if (window.confirm(`Are you sure you want to remove the operational center "${target.name}"? Existing posted ledger entries with this center name will remain but show as unassigned background transactions.`)) {
      setOperationalCenters(prev => prev.filter(c => c.id !== id));
      if (selectedCenterFilter === target.name) {
        setSelectedCenterFilter(null);
      }
    }
  };

  const handleDeleteExpenditure = (id: string) => {
    setExpenditures(expenditures.filter(e => e.id !== id));
  };

  const handleAddVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    if (editingVendorId) {
      // Edit Mode
      setVendors(prev => prev.map(v => v.id === editingVendorId ? {
        ...v,
        name: newVendorName.trim(),
        contactPerson: newVendorContactPerson.trim() || undefined,
        phone: newVendorPhone.trim() || undefined,
        email: newVendorEmail.trim() || undefined,
        address: newVendorAddress.trim() || undefined,
        notes: newVendorNotes.trim() || undefined
      } : v));
      setEditingVendorId(null);
    } else {
      // Add Mode
      // Check duplicate
      if (vendors.find(v => v.name.toLowerCase() === newVendorName.trim().toLowerCase())) {
        alert('A vendor with this name already exists.');
        return;
      }
      const newV: Vendor = {
        id: `V_CUSTOM_${Date.now()}`,
        name: newVendorName.trim(),
        contactPerson: newVendorContactPerson.trim() || undefined,
        phone: newVendorPhone.trim() || undefined,
        email: newVendorEmail.trim() || undefined,
        address: newVendorAddress.trim() || undefined,
        notes: newVendorNotes.trim() || undefined
      };
      setVendors(prev => [...prev, newV]);
    }

    // Reset Form
    setNewVendorName('');
    setNewVendorContactPerson('');
    setNewVendorPhone('');
    setNewVendorEmail('');
    setNewVendorAddress('');
    setNewVendorNotes('');
  };

  const handleEditVendor = (vendor: Vendor) => {
    setNewVendorName(vendor.name);
    setNewVendorContactPerson(vendor.contactPerson || '');
    setNewVendorPhone(vendor.phone || '');
    setNewVendorEmail(vendor.email || '');
    setNewVendorAddress(vendor.address || '');
    setNewVendorNotes(vendor.notes || '');
    setEditingVendorId(vendor.id);
  };

  const handleDeleteVendor = (id: string) => {
    const target = vendors.find(v => v.id === id);
    if (!target) return;
    if (window.confirm(`Are you sure you want to delete the supplier/vendor "${target.name}"?`)) {
      setVendors(prev => prev.filter(v => v.id !== id));
      if (editingVendorId === id) {
        setEditingVendorId(null);
        setNewVendorName('');
        setNewVendorContactPerson('');
        setNewVendorPhone('');
        setNewVendorEmail('');
        setNewVendorAddress('');
        setNewVendorNotes('');
      }
    }
  };

  const handlePromoteTerm = () => {
    // Determine next term: 'Term 1' -> 'Term 2' -> 'Term 3' -> 'Term 1'
    let nextT: Term = 'Term 1';
    let autoPromotedYear = false;
    let nextYr = academicYear;

    if (selectedTerm === 'Term 1') {
      nextT = 'Term 2';
    } else if (selectedTerm === 'Term 2') {
      nextT = 'Term 3';
    } else if (selectedTerm === 'Term 3') {
      nextT = 'Term 1';
      const yrNum = parseInt(academicYear, 10);
      if (!isNaN(yrNum)) {
        nextYr = String(yrNum + 1);
        setAcademicYear(nextYr);
        autoPromotedYear = true;
      }
    }

    setSelectedTerm(nextT);

    if (promoTermResetRequirements) {
      setPupils(prev => prev.map(p => ({
        ...p,
        requirements: p.requirements.map(r => ({ ...r, brought: false, dateBrought: undefined }))
      })));
    }

    if (promoTermResetAttendance) {
      setAttendanceCheckedToday(false);
      setPresentStudentIds([]);
    }

    alert(`Successfully promoted the academic term! The active system term is now ${nextT}${autoPromotedYear ? `, and the academic year has rolled over to ${nextYr}` : ''}.`);
    setIsPromotionModalOpen(false);
  };

  const handlePromoteYear = () => {
    const yrNum = parseInt(academicYear, 10);
    if (isNaN(yrNum)) {
      alert("Academic Year value is invalid.");
      return;
    }
    const nextYr = String(yrNum + 1);
    setAcademicYear(nextYr);

    if (promoYearClassLevels) {
      const nextClassMapFixed: Record<NurseryClass, NurseryClass> = {
        'KG1': 'KG2',
        'KG2': 'KG3',
        'KG3': 'Primary One',
        'Primary One': 'Primary Two',
        'Primary Two': 'Primary Three',
        'Primary Three': 'Primary Four',
        'Primary Four': 'Primary Five',
        'Primary Five': 'Primary Six',
        'Primary Six': 'Primary Seven',
        'Primary Seven': 'Primary Seven'
      };

      setPupils(prev => prev.map(p => {
        const nextClass = nextClassMapFixed[p.classLevel] || p.classLevel;
        const newAge = promoYearIncrementAge ? p.age + 1 : p.age;
        const newStatus = p.classLevel === 'Primary Seven' ? 'Completed' : p.status;

        return {
          ...p,
          classLevel: nextClass,
          age: newAge,
          status: newStatus,
          requirements: p.requirements.map(r => ({ ...r, brought: false, dateBrought: undefined })),
          installments: [] // Reset student installment slips for the new school year
        };
      }));
    } else if (promoYearIncrementAge) {
      setPupils(prev => prev.map(p => ({
        ...p,
        age: p.age + 1
      })));
    }

    alert(`Successfully rolled over system to Academic Year ${nextYr}! ${promoYearClassLevels ? 'All registered school children have been promoted to their subsequent grades.' : ''}`);
    setIsPromotionModalOpen(false);
  };

  const handleToggleExpenditureStatus = (id: string) => {
    setExpenditures(expenditures.map(e => e.id === id ? { ...e, status: e.status === 'Paid' ? 'Pending' : 'Paid' } : e));
  };

  const handleAddMiscIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMiscSourceName) return;

    const newMisc: MiscellaneousIncome = {
      id: `MI${Date.now()}`,
      sourceName: newMiscSourceName,
      category: newMiscCategory,
      amount: Number(newMiscAmount),
      dateAdded: new Date().toISOString().split('T')[0],
      paymentMethod: newMiscMethod,
      center: newMiscCenter,
      receiptNo: newMiscReceiptNo || `REV-${Math.floor(1000 + Math.random() * 9000)}`,
      notes: newMiscNotes || undefined
    };

    setMiscIncomes([newMisc, ...miscIncomes]);
    setNewMiscSourceName('');
    setNewMiscCategory('Other Sales & Services');
    setNewMiscAmount(100000);
    setNewMiscMethod('Cash');
    setNewMiscCenter(operationalCenters[0]?.name || 'Academic Instruction & Tuition');
    setNewMiscReceiptNo('');
    setNewMiscNotes('');
    setIsMiscFormOpen(false);
  };

  const handleDeleteMiscIncome = (id: string) => {
    setMiscIncomes(miscIncomes.filter(mi => mi.id !== id));
  };


  const triggerGeminiReportGen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatingReportFor) return;

    setIsCallingGemini(true);
    setGeminiError(null);

    // Formulate a beautiful summary with grades and competencies of custom learning areas to give Gemini rich context
    const customGradesList = learningAreas.map((area) => {
      const g = currentLearningAreaGrades[area.id] || 'B';
      return `- ${area.name}: Grade ${g} (${GRADE_COMPETENCIES[g]})`;
    }).join('\n');

    const accomplishmentsSummary = `
Grades and Competency Level accomplished:
${customGradesList}

Additional observations: ${strengthInput || 'Always smiles, plays beautifully with peers, shares toys, and behaves very obediently.'}`;

    try {
      const resp = await fetch('/api/gemini/generate-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pupilName: generatingReportFor.fullName,
          ageCategory: generatingReportFor.classLevel,
          gender: generatingReportFor.gender,
          accomplishments: accomplishmentsSummary,
          improvementAreas: growthInput || 'needs to keep focusing on alphabet pronunciation and joining outdoor activities.',
          tone: reportTone,
          language: localLanguage
        })
      });

      if (!resp.ok) {
        throw new Error('Server responded with an error during report card assist generation.');
      }

      const data = await resp.json();
      if (data.error) {
        throw new Error(data.error);
      }

      // Parse Gemini reply
      const gResult = data.text;

      // Extract specific components or treat the response as the full text block. 
      // We will structure a high-quality report card.
      const parsedTeacherComment = gResult;

      // Create a nice assessment report record
      const newReport: ECDReport = {
        id: `R${Date.now()}`,
        pupilId: generatingReportFor.id,
        term: selectedTerm,
        academicYear,
        socialEmotional: scoreSocial,
        physicalDevelopment: scorePhysical,
        languageCommunication: scoreLanguage,
        mathematicalPlay: scoreMath,
        healthNutrition: scoreHealth,
        literacy1: gradeLiteracy1,
        literacy2: gradeLiteracy2,
        socialDevelopment: gradeSocialDevelopment,
        healthHabits: gradeHealthHabits,
        mathematics: gradeMathematics,
        teacherComments: parsedTeacherComment,
        localTranslation: localLanguage !== 'English' ? `Report converted & auto-translated beautifully to ${localLanguage}.` : undefined,
        headTeacherComments: `Highly commendable progress in ${generatingReportFor.classLevel}. Well done and stay focused!`,
        generatedAt: new Date().toISOString(),
        customSubjects: customSubjectsTemp
      };

      // Upsert report card
      const existingReportIndex = reports.findIndex(
        r => r.pupilId === generatingReportFor.id && r.term === selectedTerm && r.academicYear === academicYear
      );

      if (existingReportIndex >= 0) {
        const revisedReports = [...reports];
        revisedReports[existingReportIndex] = newReport;
        setReports(revisedReports);
      } else {
        setReports([...reports, newReport]);
      }

      // Cleanup
      setGeneratingReportFor(null);
      setStrengthInput('');
      setGrowthInput('');
      setCustomSubjectsTemp([]);
    } catch (err: any) {
      console.error(err);
      setGeminiError(err.message || 'Could not communicate with our school assistant. Let\'s make sure settings are completed.');
    } finally {
      setIsCallingGemini(false);
    }
  };

  const handleSaveReportDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatingReportFor) return;

    const existingReport = reports.find(
      r => r.pupilId === generatingReportFor.id && r.term === selectedTerm && r.academicYear === academicYear
    );

    const newReport: ECDReport = {
      id: existingReport ? existingReport.id : `R${Date.now()}`,
      pupilId: generatingReportFor.id,
      term: selectedTerm,
      academicYear,
      socialEmotional: scoreSocial,
      physicalDevelopment: scorePhysical,
      languageCommunication: scoreLanguage,
      mathematicalPlay: scoreMath,
      healthNutrition: scoreHealth,
      literacy1: gradeLiteracy1,
      literacy2: gradeLiteracy2,
      socialDevelopment: gradeSocialDevelopment,
      healthHabits: gradeHealthHabits,
      mathematics: gradeMathematics,
      teacherComments: existingReport ? existingReport.teacherComments : `${generatingReportFor.fullName} has made wonderful strides in learning activities this term. Ready for standard progression.`,
      localTranslation: existingReport ? existingReport.localTranslation : undefined,
      headTeacherComments: existingReport ? existingReport.headTeacherComments : `Commendable effort. Keep up the high spirit!`,
      generatedAt: new Date().toISOString(),
      customSubjects: customSubjectsTemp,
      learningAreaGrades: currentLearningAreaGrades
    };

    const existingReportIndex = reports.findIndex(
      r => r.pupilId === generatingReportFor.id && r.term === selectedTerm && r.academicYear === academicYear
    );

    if (existingReportIndex >= 0) {
      const revisedReports = [...reports];
      revisedReports[existingReportIndex] = newReport;
      setReports(revisedReports);
    } else {
      setReports([...reports, newReport]);
    }

    setGeneratingReportFor(null);
    setCustomSubjectsTemp([]);
  };

  // Downloads a single student's report card as PDF
  const handleDownloadSinglePDF = async (pupil: Pupil, report: ECDReport) => {
    const element = document.getElementById('student-report-card-printable');
    if (!element) return;
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#FFFFFC'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${pupil.fullName.replace(/\s+/g, '_')}_ReportCard_${report.term.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("PDF download error:", err);
      alert("Failed to download PDF report card.");
    }
  };

  // Bulk downloads all saved report cards for the filtered class into a combined PDF
  const handleBulkPDFDownload = async () => {
    const targetPupils = pupils.filter(p => bulkClassFilter === 'All' || p.classLevel === bulkClassFilter);
    const activePupilsWithReports = targetPupils.filter(p => {
      return reports.some(r => r.pupilId === p.id && r.term === selectedTerm && r.academicYear === academicYear);
    });

    if (activePupilsWithReports.length === 0) {
      alert(`No saved report cards found for the selected filter (${bulkClassFilter}) and term! Please save some report cards first.`);
      return;
    }

    setBulkProgress({
      current: 0,
      total: activePupilsWithReports.length,
      pupilName: '',
      active: true
    });

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let isFirstPage = true;

      for (let i = 0; i < activePupilsWithReports.length; i++) {
        const pupil = activePupilsWithReports[i];
        const report = reports.find(r => r.pupilId === pupil.id && r.term === selectedTerm && r.academicYear === academicYear)!;

        setBulkProgress(prev => ({
          ...prev,
          current: i + 1,
          pupilName: pupil.fullName
        }));

        // 1. Generate QR Code
        const origin = window.location.origin;
        const url = `${origin}/?verifyPupilId=${pupil.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(url, { 
          width: 150, 
          margin: 1, 
          color: { dark: '#3D2B1F', light: '#FFFFFC' } 
        });

        // 2. Set the bulk rendering target states to update the hidden DOM division
        setBulkRecordToRender({ pupil, report, qrCode: qrCodeDataUrl });

        // 3. Give React time to flush layout and draw QR code
        await new Promise(resolve => setTimeout(resolve, 380));

        // 4. Capture
        const element = document.getElementById('bulk-pupil-report-card-capture');
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFC'
          });

          const imgData = canvas.toDataURL('image/png');
          
          if (!isFirstPage) {
            pdf.addPage();
          } else {
            isFirstPage = false;
          }

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
      }

      pdf.save(`Combined_Reports_${bulkClassFilter.replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Bulk PDF export error:", err);
      alert("Error occurred generating bulk PDF. See console list.");
    } finally {
      setBulkRecordToRender(null);
      setBulkProgress(prev => ({ ...prev, active: false }));
    }
  };

  // Bulk downloads all saved report cards as individual PDFs in a ZIP archive
  const handleBulkZIPDownload = async () => {
    const targetPupils = pupils.filter(p => bulkClassFilter === 'All' || p.classLevel === bulkClassFilter);
    const activePupilsWithReports = targetPupils.filter(p => {
      return reports.some(r => r.pupilId === p.id && r.term === selectedTerm && r.academicYear === academicYear);
    });

    if (activePupilsWithReports.length === 0) {
      alert(`No saved report cards found for the selected filter (${bulkClassFilter}) and term! Please save some report cards first.`);
      return;
    }

    setBulkProgress({
      current: 0,
      total: activePupilsWithReports.length,
      pupilName: '',
      active: true
    });

    try {
      const zip = new JSZip();

      for (let i = 0; i < activePupilsWithReports.length; i++) {
        const pupil = activePupilsWithReports[i];
        const report = reports.find(r => r.pupilId === pupil.id && r.term === selectedTerm && r.academicYear === academicYear)!;

        setBulkProgress(prev => ({
          ...prev,
          current: i + 1,
          pupilName: pupil.fullName
        }));

        // 1. Generate QR Code
        const origin = window.location.origin;
        const url = `${origin}/?verifyPupilId=${pupil.id}`;
        const qrCodeDataUrl = await QRCode.toDataURL(url, { 
          width: 150, 
          margin: 1, 
          color: { dark: '#3D2B1F', light: '#FFFFFC' } 
        });

        // 2. Set the bulk rendering target states to update the hidden DOM division
        setBulkRecordToRender({ pupil, report, qrCode: qrCodeDataUrl });

        // 3. Wait for DOM flush
        await new Promise(resolve => setTimeout(resolve, 380));

        // 4. Capture
        const element = document.getElementById('bulk-pupil-report-card-capture');
        if (element) {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#FFFFFC'
          });

          const imgData = canvas.toDataURL('image/png');
          
          const singlePdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = singlePdf.internal.pageSize.getWidth();
          const pdfHeight = singlePdf.internal.pageSize.getHeight();
          singlePdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

          const pdfBlob = singlePdf.output('blob');
          const cleanFileName = `${pupil.fullName.replace(/\s+/g, '_')}_ReportCard_${selectedTerm.replace(/\s+/g, '_')}.pdf`;
          zip.file(cleanFileName, pdfBlob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `Reports_Archive_${bulkClassFilter.replace(/\s+/g, '_')}_${selectedTerm.replace(/\s+/g, '_')}.zip`;
      link.click();
    } catch (err) {
      console.error("Bulk ZIP export error:", err);
      alert("Error occurred preparing files or generating ZIP bundle.");
    } finally {
      setBulkRecordToRender(null);
      setBulkProgress(prev => ({ ...prev, active: false }));
    }
  };

  // Simulated Cloud Sync flow
  const handleSharedFolderSync = async (destination: string) => {
    const targetPupils = pupils.filter(p => bulkClassFilter === 'All' || p.classLevel === bulkClassFilter);
    const activePupilsWithReports = targetPupils.filter(p => {
      return reports.some(r => r.pupilId === p.id && r.term === selectedTerm && r.academicYear === academicYear);
    });

    if (activePupilsWithReports.length === 0) {
      alert("No saved report cards found to sync!");
      return;
    }

    setSharedFolderSyncProgress({
      current: 0,
      total: activePupilsWithReports.length,
      status: 'syncing',
      destination
    });

    try {
      for (let i = 0; i < activePupilsWithReports.length; i++) {
        // Simulating upload processing times per card
        await new Promise(resolve => setTimeout(resolve, 500));
        setSharedFolderSyncProgress(prev => ({
          ...prev,
          current: i + 1,
          status: 'syncing',
          destination
        }));
      }
      setSharedFolderSyncProgress(prev => ({
        ...prev,
        status: 'completed'
      }));
    } catch (err) {
      console.error("Sync error:", err);
      alert("An error occurred during sync.");
      setSharedFolderSyncProgress(prev => ({ ...prev, status: 'idle', current: 0 }));
    }
  };

  // KVA Meals Schedule Managers/Handlers
  const handleSaveMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMealType.trim()) {
      alert('Please fill in the Meal or Beverage Type!');
      return;
    }

    const mealItem: PorridgeScheduleItem = {
      day: newMealDay,
      time: newMealTime || '10:00 AM',
      type: newMealType,
      snack: newMealSnack || 'None'
    };

    if (editingMealIndex !== null) {
      // Edit mode
      const updated = [...porridgeSchedule];
      updated[editingMealIndex] = mealItem;
      setPorridgeSchedule(updated);
      setEditingMealIndex(null);
    } else {
      // Add mode
      setPorridgeSchedule([...porridgeSchedule, mealItem]);
    }

    // Reset inputs
    setNewMealType('');
    setNewMealSnack('');
    setNewMealTime('10:00 AM');
    setNewMealDay('Monday');
    setShowMealForm(false);
  };

  const handleEditMealClick = (index: number) => {
    const meal = porridgeSchedule[index];
    setNewMealDay(meal.day as any);
    setNewMealTime(meal.time);
    setNewMealType(meal.type);
    setNewMealSnack(meal.snack);
    setEditingMealIndex(index);
    setShowMealForm(true);
  };

  const handleDeleteMeal = (index: number) => {
    if (confirm('Are you sure you want to delete this meal item from the schedule?')) {
      const updated = porridgeSchedule.filter((_, i) => i !== index);
      setPorridgeSchedule(updated);
      if (editingMealIndex === index) {
        setEditingMealIndex(null);
        setNewMealType('');
        setNewMealSnack('');
      } else if (editingMealIndex !== null && editingMealIndex > index) {
        setEditingMealIndex(editingMealIndex - 1);
      }
    }
  };

  const handleAddSickbayLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSickName || !newSickIssue) return;
    if (editingSickbayLogId) {
      // Edit mode
      setSickbayLogs(prev => prev.map(log => log.id === editingSickbayLogId ? {
        ...log,
        pupilName: newSickName,
        issue: newSickIssue,
        action: newSickAction || 'Placed pupil to rest, informed parent.'
      } : log));
      setEditingSickbayLogId(null);
    } else {
      // Add mode
      const log = {
        id: `S${Date.now()}`,
        pupilName: newSickName,
        issue: newSickIssue,
        action: newSickAction || 'Placed pupil to rest, informed parent.',
        date: new Date().toISOString().split('T')[0]
      };
      setSickbayLogs([log, ...sickbayLogs]);
    }
    setNewSickName('');
    setNewSickIssue('');
    setNewSickAction('');
  };

  const handleEditSickbayLog = (log: { id: string; pupilName: string; issue: string; action: string; date: string }) => {
    setNewSickName(log.pupilName);
    setNewSickIssue(log.issue);
    setNewSickAction(log.action);
    setEditingSickbayLogId(log.id);
  };

  const handleDeleteSickbayLog = (id: string) => {
    if (confirm('Are you sure you want to delete this medical incident log?')) {
      setSickbayLogs(prev => prev.filter(log => log.id !== id));
      if (editingSickbayLogId === id) {
        setEditingSickbayLogId(null);
        setNewSickName('');
        setNewSickIssue('');
        setNewSickAction('');
      }
    }
  };

  // Offline and PWA Install capability
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleOnlineStatus = () => setIsOffline(false);
    const handleOfflineStatus = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOfflineStatus);
    };
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert("Kids Villa Academy is fully responsive & installable! Look for the download direct button in your URL address bar, or use standard browser PWA adding to homescreen.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User choice outcome was: ${outcome}`);
    setDeferredPrompt(null);
  };

  const handleDownloadOfflineData = () => {
    const dataToExport = {
      schoolName: schoolName,
      exportTime: new Date().toISOString(),
      studentRegistry: pupils,
      staffDirectory: staff,
      porridgeSchedule: porridgeSchedule,
      terminalReports: reports,
      attendanceHistory: attendance,
      sickbayLogs: sickbayLogs
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", "kids_villa_academy_offline_db_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Derived dashboard quick stats
  const totalStudentsCount = pupils.length;
  const activeStudentsCount = pupils.filter(p => p.status === 'Active').length;
  const boysCount = pupils.filter(p => p.gender === 'Boy').length;
  const girlsCount = pupils.filter(p => p.gender === 'Girl').length;

  const totalFeesTarget = pupils.reduce((sum, p) => sum + p.termFeesRequired, 0);
  const totalFeesCollected = pupils.reduce((sum, p) => {
    const paid = p.installments.reduce((s, inst) => s + inst.amount, 0);
    return sum + paid;
  }, 0);
  const feesPercentage = totalFeesTarget > 0 ? Math.round((totalFeesCollected / totalFeesTarget) * 100) : 0;
  
  const totalExpenditureSum = expenditures.reduce((sum, e) => sum + e.amount, 0);
  const paidExpenditureSum = expenditures.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
  const pendingExpenditureSum = expenditures.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);
  const totalMiscIncomeCollected = miscIncomes.reduce((sum, m) => sum + m.amount, 0);
  const nurseryNetSurplus = (totalFeesCollected + totalMiscIncomeCollected) - paidExpenditureSum;

  const getCenterClasses = (accent = 'stone') => {
    switch (accent) {
      case 'amber':
        return {
          theme: 'bg-[#FDFBF7] hover:border-amber-400 border-[#E0D8CC] text-amber-800',
          badgeColor: 'border-amber-250 bg-amber-50 text-amber-900',
          dot: 'bg-amber-400'
        };
      case 'emerald':
        return {
          theme: 'bg-[#FDFBF7] hover:border-emerald-400 border-[#E0D8CC] text-emerald-800',
          badgeColor: 'border-emerald-250 bg-emerald-50 text-emerald-950',
          dot: 'bg-emerald-400'
        };
      case 'blue':
        return {
          theme: 'bg-[#FDFBF7] hover:border-blue-400 border-[#E0D8CC] text-blue-800',
          badgeColor: 'border-blue-200 bg-blue-50 text-blue-900',
          dot: 'bg-blue-400'
        };
      case 'purple':
        return {
          theme: 'bg-[#FDFBF7] hover:border-purple-400 border-[#E0D8CC] text-purple-800',
          badgeColor: 'border-purple-200 bg-purple-50 text-purple-900',
          dot: 'bg-purple-400'
        };
      case 'indigo':
        return {
          theme: 'bg-[#FDFBF7] hover:border-indigo-400 border-[#E0D8CC] text-indigo-800',
          badgeColor: 'border-indigo-200 bg-indigo-50 text-indigo-900',
          dot: 'bg-indigo-400'
        };
      case 'rose':
        return {
          theme: 'bg-[#FDFBF7] hover:border-rose-400 border-[#E0D8CC] text-rose-800',
          badgeColor: 'border-rose-200 bg-rose-50 text-rose-900',
          dot: 'bg-rose-400'
        };
      case 'yellow':
        return {
          theme: 'bg-[#FDFBF7] hover:border-yellow-400 border-[#E0D8CC] text-[#7A5A00]',
          badgeColor: 'border-yellow-200 bg-yellow-50 text-amber-950',
          dot: 'bg-yellow-400'
        };
      case 'stone':
      default:
        return {
          theme: 'bg-[#FDFBF7] hover:border-stone-400 border-[#E0D8CC] text-stone-800',
          badgeColor: 'border-stone-250 bg-stone-100 text-stone-900',
          dot: 'bg-stone-400'
        };
    }
  };

  const getCenterStats = (centerName: string) => {
    const tuitionIn = pupils.reduce((sum, p) => {
      const childCenterAmount = p.installments
        .filter(inst => {
          const cName = inst.center || 'Academic Instruction & Tuition';
          return cName === centerName;
        })
        .reduce((s, inst) => s + inst.amount, 0);
      return sum + childCenterAmount;
    }, 0);

    const miscIn = miscIncomes
      .filter(mi => mi.center === centerName)
      .reduce((sum, mi) => sum + mi.amount, 0);

    const totalIn = tuitionIn + miscIn;

    const totalOut = expenditures
      .filter(e => {
        if (e.center) {
          return e.center === centerName;
        }
        if (centerName === 'Porridge Kettle & Kitchen Supplies' && (e.category === 'Food & Kitchen Supplies' || e.category === 'Staff Lunch & Welfare')) return true;
        if (centerName === 'General Operations & Administration' && (e.category === 'Utilities & Rent' || e.category === 'Sanitation & Hygiene')) return true;
        if (centerName === 'Academic Instruction & Tuition' && e.category === 'Stationery & Printing') return true;
        if (centerName === 'School Van & Boarding Transport' && e.category === 'Fuel & Transport') return true;
        if (centerName === 'General Operations & Administration' && !['Food & Kitchen Supplies', 'Staff Lunch & Welfare', 'Utilities & Rent', 'Sanitation & Hygiene', 'Stationery & Printing', 'Fuel & Transport'].includes(e.category)) return true;
        return false;
      })
      .reduce((sum, e) => sum + e.amount, 0);

    const netSurplus = totalIn - totalOut;

    return { tuitionIn, miscIn, totalIn, totalOut, netSurplus };
  };

  const totalBroomsBrought = pupils.filter(p => p.requirements.find(r => r.name === 'Broom (Sisal/Soft)' && r.brought)).length;

  const currentUjiSchedule = porridgeSchedule.find(p => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = days[new Date().getDay()];
    return p.day === todayName;
  }) || porridgeSchedule[0]; // fallback to Monday

  const handleLoginSuccess = (session: UserSession) => {
    setCurrentUserSession(session);
    localStorage.setItem('kva_active_session', JSON.stringify(session));
  };

  const handleSignOut = () => {
    setShowSignOutConfirm(true);
  };

  const confirmSignOut = () => {
    setCurrentUserSession(null);
    localStorage.removeItem('kva_active_session');
    setShowSignOutConfirm(false);
  };

  if (!currentUserSession) {
    return <SystemAuth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F5F5F4] text-stone-900 antialiased font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0F172A] border-b md:border-b-0 md:border-r border-slate-800 flex flex-col justify-between shrink-0 text-slate-300 font-sans">
        <div>
          {/* School Identity */}
          <div className="p-6 pb-2 flex items-center gap-3">
            {schoolLogo ? (
              <img 
                src={schoolLogo} 
                alt="School Logo" 
                className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-slate-700" 
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                {schoolName ? schoolName.charAt(0) : 'K'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-black tracking-tight text-white truncate">{schoolName}</h1>
              <span className="text-[9px] text-[#22C55E] uppercase tracking-widest font-extrabold block truncate">
                {schoolAddress.split(',')[0]}
              </span>
            </div>
          </div>

          <div className="px-6 py-2">
            <div className="h-px bg-slate-800 w-full my-1"></div>
          </div>

          {/* Navigation Items */}
          <nav className="px-3 space-y-1">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'dashboard' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Dashboard
            </button>



             <button
              id="tab-registry"
              onClick={() => setActiveTab('registry')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'registry'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <GraduationCap className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'registry' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Learners
            </button>

            <button
              id="tab-assessments"
              onClick={() => setActiveTab('assessments')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'assessments'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <FileText className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'assessments' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              EXAMS
            </button>

            <button
              id="tab-fees"
              onClick={() => setActiveTab('fees')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'fees'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Coins className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'fees' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Finance
            </button>

            <button
              id="tab-meals"
              onClick={() => setActiveTab('meals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'meals'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Soup className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'meals' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              KVA Meals & Health
            </button>

            <button
              id="tab-staff"
              onClick={() => setActiveTab('staff')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'staff'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Users className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'staff' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Staff
            </button>

            <button
              id="tab-timetables"
              onClick={() => setActiveTab('timetables')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'timetables'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Clock className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'timetables' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Time tables
            </button>

            <button
              id="tab-shuttle"
              onClick={() => setActiveTab('shuttle')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'shuttle'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Bus className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'shuttle' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              School Van
            </button>

            <button
              id="tab-assets"
              onClick={() => setActiveTab('assets')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'assets'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Package className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'assets' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              School Assets
            </button>

            <button
              id="tab-idcards"
              onClick={() => setActiveTab('idcards')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'idcards'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <CreditCard className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'idcards' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Identity Cards
            </button>

            <button
              id="tab-predictions"
              onClick={() => setActiveTab('predictions')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'predictions'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'predictions' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Kids Villa ECD AI Insights
            </button>

            <button
              id="tab-curriculum"
              onClick={() => setActiveTab('curriculum')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'curriculum'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <BookOpen className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'curriculum' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              AI NCDC Curriculum Planner
            </button>

            <button
              id="tab-messages"
              onClick={() => setActiveTab('messages')}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'messages'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'messages' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                Kids-Parent Connect
              </div>
              {unreadMessageCount > 0 && (
                <span className="bg-sky-400 text-slate-900 rounded-full text-[8.5px] font-black px-1.5 py-0.5 animate-pulse shrink-0">
                  {unreadMessageCount} new
                </span>
              )}
            </button>

            <button
              id="tab-role-matrix"
              onClick={() => setActiveTab('role-matrix')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'role-matrix'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Lock className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'role-matrix' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Permissions Matrix
            </button>

            <button
              id="tab-database"
              onClick={() => setActiveTab('database')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-150 cursor-pointer group ${
                activeTab === 'database'
                  ? 'bg-slate-800 text-sky-400 border-l-4 border-sky-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <Database className={`w-4 h-4 shrink-0 transition-colors ${activeTab === 'database' ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
              Database ERD Schema
            </button>
          </nav>
        </div>

        {/* Academy Contacts Pinned Sidebar */}
        <div className="px-4 pb-0 pt-2">
          <div className="bg-slate-800/65 border border-slate-700/40 p-3.5 rounded-2xl text-[11px] text-slate-300 space-y-2 font-normal">
            <div className="flex items-center gap-1.5 font-extrabold uppercase text-[9px] tracking-wider text-sky-400">
              <Phone className="w-3 h-3 text-sky-400" />
              <span>Academy Contacts</span>
            </div>
            <div className="space-y-1 font-semibold text-[10px] font-mono">
              <div className="flex justify-between items-center text-slate-300">
                <span>Call Mob:</span>
                <span className="text-white select-all font-bold">+256782967294</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>WhatsApp:</span>
                <span className="text-emerald-400 select-all font-bold">+256703209254</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Term Indicator Banner */}
        <div className="p-4 pb-1">
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-slate-750 p-4 rounded-2xl text-white text-xs space-y-1 shadow-md font-semibold">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-extrabold text-sky-400">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>{selectedTerm}, {academicYear} Academic</span>
              </div>
            </div>
            <p className="opacity-90 font-medium text-slate-300">Kids Villa Portal</p>
            <div className="text-[10px] opacity-75 pt-2 border-t border-slate-800 flex items-center justify-between gap-1">
              <span className="text-slate-400">Tr. Florence & Patience</span>
              <button
                onClick={() => setIsPromotionModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[9px] px-2 py-1 rounded-sm uppercase tracking-wider transition-all shadow-xs hover:shadow-amber-500/20 flex items-center gap-0.5 cursor-pointer"
                title="Promote term/year of school"
                type="button"
              >
                <span>Promote ⚙</span>
              </button>
            </div>
          </div>
        </div>

        {/* Offline & App Installation Support */}
        <div className="px-4 pb-4">
          <div className="bg-slate-800/50 border border-slate-800/80 p-4 rounded-2xl text-[11px] text-slate-300 space-y-2.5 font-semibold">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[9px] tracking-wider text-slate-400">Offline Cache</span>
              {isOffline ? (
                <span className="flex items-center gap-1 text-sky-450 font-bold bg-sky-500/10 px-2 py-0.5 rounded-full animate-pulse transition-all">
                  <WifiOff className="w-3.5 h-3.5 animate-pulse text-sky-450" /> offline
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#22C55E] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full transition-all">
                  <Wifi className="w-3.5 h-3.5 text-[#22C55E]" /> Live Sync
                </span>
              )}
            </div>
            
            <p className="text-slate-400 font-medium leading-tight text-[10px]">
              Ready for standalone use. Work is auto-cached locally.
            </p>

            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <button
                onClick={handleInstallApp}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white py-1.5 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Install Web App (PWA)
              </button>

              <button
                onClick={handleDownloadOfflineData}
                className="w-full bg-slate-800 hover:bg-slate-755 text-slate-200 border border-slate-700 py-1.5 px-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                Download JSON Ledger
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Logged-In User Profile & Sign Out Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center font-black text-sky-400 text-xs shadow-xs uppercase">
              {currentUserSession?.username.slice(0, 2) || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[9px] bg-slate-800 text-sky-400 px-2 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wider">
                {currentUserSession?.role || "Staff"}
              </span>
              <p className="text-[11px] font-black text-white truncate mt-1">
                {currentUserSession?.avatarSeed || currentUserSession?.username}
              </p>
              <p className="text-[9.5px] text-slate-400 truncate font-mono">
                {currentUserSession?.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSignOut}
            className="w-full mt-3 bg-red-950/30 hover:bg-red-950/60 text-red-400 hover:text-red-350 py-1.5 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all cursor-pointer border border-red-900/40 text-[10px] uppercase tracking-wider"
            title="Securely terminate active session"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F5F5F4]">
        
        {/* Header Block */}
        <header className="h-20 bg-white border-b border-stone-200/80 px-6 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none block mb-0.5">
              {schoolName} • Kitemu Nsangi System
            </span>
            <h2 className="text-lg font-black tracking-tight text-stone-900">
              {activeTab === 'dashboard' && "Morning Supervision Overview"}
              {activeTab === 'messages' && "Kids Villa Parent-Teacher Connect"}
              {activeTab === 'registry' && "Learners Desk"}
              {activeTab === 'assessments' && "Uganda ECD Exams & Assessments"}
              {activeTab === 'fees' && "School Finance & Financial Ledger"}
              {activeTab === 'meals' && "KVA Meals & Healthy Bay Log"}
              {activeTab === 'staff' && "Staff Directory"}
              {activeTab === 'timetables' && "School Time tables"}
              {activeTab === 'shuttle' && "School Van Route & Passenger Management"}
              {activeTab === 'assets' && "School Assets, Material & Library Directory"}
              {activeTab === 'idcards' && "Student & Staff Branded ID Cards Dispatch"}
              {activeTab === 'predictions' && "Kids Villa ECD Predictive Analytics"}
              {activeTab === 'role-matrix' && "Granular Role Permissions matrix guard"}
              {activeTab === 'database' && "Relational Schema and Mobile Money APIs sandbox"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time Universal Filter bar */}
            <div className="relative w-44 md:w-60">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-stone-400" />
              <input
                id="universal-top-search"
                type="text"
                placeholder="Real-time filter current tab..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs bg-stone-100 hover:bg-stone-150/80 border border-stone-200 rounded-full focus:outline-hidden focus:bg-white focus:border-emerald-500 transition-all font-semibold text-stone-800"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Shared URL Synchronizer Refresh Button */}
            <button
              onClick={() => setShowSyncModal(true)}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-150/80 text-indigo-850 hover:text-indigo-950 border border-indigo-200 rounded-2xl flex items-center gap-1.5 text-[10px] font-extrabold shadow-2xs transition-all cursor-pointer group"
              title="Synchronize database changes with other teachers on shared URLs"
              id="btn-sync-shared-url-master"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-180 transition-all duration-500 shrink-0" />
              <span>Sync Portal</span>
            </button>

            {/* Offline indicator badge */}
            <div className="flex items-center gap-2">
              {isOffline ? (
                <div className="bg-sky-50 text-sky-850 border border-sky-300 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-extrabold shadow-sm animate-fadeIn">
                  <WifiOff className="w-3.5 h-3.5 animate-pulse text-sky-600" />
                  <span>Offline Active</span>
                </div>
              ) : (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-250 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-extrabold shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Portal Connected</span>
                </div>
              )}
            </div>

            {/* Quick date display */}
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-[9px] text-stone-400 font-black uppercase tracking-wider">Active Operations</span>
              <span className="text-xs font-bold text-stone-800 font-mono">18th June 2026 (Thursday)</span>
            </div>
            
            {/* Interactive User Info & Sign Out Button */}
            <div className="flex items-center gap-2">
              <div 
                className="hidden md:flex flex-col text-right mr-1"
              >
                <span className="text-[9px] text-stone-500 font-bold block leading-none">{currentUserSession?.role}</span>
                <span className="text-xs font-bold text-stone-900 leading-tight block truncate max-w-[120px] mt-0.5" title={currentUserSession?.avatarSeed || currentUserSession?.username}>
                  {currentUserSession?.avatarSeed || currentUserSession?.username}
                </span>
              </div>
              <div 
                className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center font-black text-xs text-sky-400 border border-slate-700 shadow-sm uppercase shrink-0"
                title={`${currentUserSession?.avatarSeed || currentUserSession?.username} (${currentUserSession?.role})`}
              >
                {currentUserSession?.username.slice(0, 2) || "US"}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center p-2 rounded-full text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 transition-all cursor-pointer border border-red-200"
                title="Sign Out of Kids Villa Academy"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Scroll Area */}
        <div className="p-6 space-y-8 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {/* TAB 1: DASHBOARD HOME */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Classroom Interactive Slide Highlights Carousel */}
              <ClassroomPhotoSlider />
              
              {/* Daily Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stat 1: Class Attendance bar */}
                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">School Attendance Today</h3>
                  <p className="text-4xl font-extrabold text-[#3D2B1F]">
                    {presentStudentIds.length} <span className="text-lg font-normal text-[#7D6B5D]">/ {totalStudentsCount} Present</span>
                  </p>
                  
                  {/* Progress indicator */}
                  <div className="mt-4 h-2 w-full bg-[#F2EDE4] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#6B8E23] transition-all duration-300" 
                      style={{ width: `${(presentStudentIds.length / totalStudentsCount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2.5">
                    <span className="text-[10px] font-bold text-[#6B8E23]">Attendance Score: {Math.round((presentStudentIds.length / totalStudentsCount) * 100)}%</span>
                    <button 
                      onClick={() => setActiveTab('meals')}
                      className="text-[10px] text-[#8C5A3C] font-bold underline hover:text-[#5A3E2B]"
                    >
                      Update Attendance Sheet
                    </button>
                  </div>
                </div>

                {/* Stat 2: Fees metrics */}
                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Fees Collection (UGX)</h3>
                  <p className="text-3xl font-black text-[#3D2B1F]">
                    {totalFeesCollected.toLocaleString()} <span className="text-xs font-bold text-[#7D6B5D]">UGX</span>
                  </p>
                  <p className="text-xs text-[#8C5A3C] mt-2 font-semibold">
                    {feesPercentage}% of the current term target collected (Target {totalFeesTarget.toLocaleString()} UGX)
                  </p>
                </div>

                {/* Stat 3: Daily meal schedule display */}
                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Today's KVA Meals</h3>
                  <p className="text-2xl font-extrabold text-[#3D2B1F] leading-tight">
                    {currentUjiSchedule.type}
                  </p>
                  <p className="text-xs text-[#6B8E23] mt-2 font-medium flex items-center gap-1">
                    <Soup className="w-3.5 h-3.5" /> Snack accompaniment: {currentUjiSchedule.snack}
                  </p>
                </div>

              </div>

              {/* Attendance quick toggle desk (Uganda Nursery supervision standard) */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pb-2 border-b border-[#F2EDE4]">
                  <div>
                    <h3 className="font-bold text-[#5A3E2B] text-base flex items-center gap-1.5">
                      <CheckCircle className="w-5 h-5 text-[#6B8E23]" /> Daily Morning Circle Attendance Register
                    </h3>
                    <p className="text-xs text-[#7D6B5D]">Mark present pupils for daily attendance and wellness tracking.</p>
                  </div>
                  {attendanceCheckedToday ? (
                    <span className="bg-[#E8F1D7] text-[#6B8E23] text-xs px-3 py-1 rounded-full font-bold">
                      ✓ Attendance Saved & Logged Successfully
                    </span>
                  ) : (
                    <span className="bg-[#F9ECE4] text-[#8C5A3C] text-xs px-3 py-1 rounded-full font-bold">
                      ● Register Pending Submission
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {pupils.filter(p => !searchQuery || p.fullName.toLowerCase().includes(searchQuery.toLowerCase())).map((pupil) => {
                    const isPresent = presentStudentIds.includes(pupil.id);
                    return (
                      <button
                        key={pupil.id}
                        id={`attendance-box-${pupil.id}`}
                        onClick={() => {
                          if (isPresent) {
                            setPresentStudentIds(presentStudentIds.filter(id => id !== pupil.id));
                          } else {
                            setPresentStudentIds([...presentStudentIds, pupil.id]);
                          }
                          setAttendanceCheckedToday(false); // require save trigger
                        }}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isPresent 
                            ? 'bg-[#E8F1D7] border-[#6B8E23] text-[#3D2B1F]' 
                            : 'bg-white border-[#E0D8CC] text-[#7D6B5D]'
                        }`}
                      >
                        <span className="text-xs font-bold truncate">{pupil.fullName.split(' ')[0]}</span>
                        <span className="text-[9px] opacity-75 mt-1">{pupil.classLevel}</span>
                        <span className={`text-[9px] font-bold mt-2.5 text-right ${isPresent ? 'text-[#6B8E23]' : 'text-gray-400'}`}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="save-attendance-btn"
                    onClick={saveAttendanceForToday}
                    className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-5 py-2 rounded-full font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm Register Submission
                  </button>
                </div>
              </div>

              {/* Lower Section: Class Divisions & Parent Notices */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Side: Class distribution list table */}
                <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden flex flex-col justify-between">
                  <div className="px-6 py-4 border-b border-[#F2EDE4] flex justify-between items-center bg-[#FDFBF7]">
                    <h3 className="font-bold text-[#5A3E2B]">School Class Distribution</h3>
                    <span 
                      onClick={() => setActiveTab('registry')}
                      className="text-xs text-[#8C5A3C] font-bold underline cursor-pointer hover:text-[#5A3E2B]"
                    >
                      Enter Registry List
                    </span>
                  </div>

                  <div className="p-6 max-h-[380px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="text-xs uppercase text-[#7D6B5D] font-bold border-b border-[#F2EDE4] sticky top-0 bg-white z-10">
                        <tr>
                          <th className="pb-3">Class Level</th>
                          <th className="pb-3 text-center">Enrolled</th>
                          <th className="pb-3 text-center">UNEPI Crad Certified</th>
                          <th className="pb-3 text-center font-semibold text-stone-500">Brooms Delivered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2EDE4] text-sm text-[#3D2B1F]">
                        {([
                          { id: 'KG1', label: 'KG1 (3-4 Yrs)' },
                          { id: 'KG2', label: 'KG2 (4-5 Yrs)' },
                          { id: 'KG3', label: 'KG3 (5-6 Yrs)' },
                          { id: 'Primary One', label: 'Primary One (P.1)' },
                          { id: 'Primary Two', label: 'Primary Two (P.2)' },
                          { id: 'Primary Three', label: 'Primary Three (P.3)' },
                          { id: 'Primary Four', label: 'Primary Four (P.4)' },
                          { id: 'Primary Five', label: 'Primary Five (P.5)' },
                          { id: 'Primary Six', label: 'Primary Six (P.6)' },
                          { id: 'Primary Seven', label: 'Primary Seven (P.7)' }
                        ] as const).map((cl) => (
                          <tr key={cl.id} className="hover:bg-neutral-50/55 transition-colors">
                            <td className="py-2.5 font-semibold text-xs">{cl.label}</td>
                            <td className="py-2.5 text-center font-mono text-xs font-bold text-slate-700">
                              {pupils.filter(p => p.classLevel === cl.id).length}
                            </td>
                            <td className="py-2.5 text-center font-bold text-xs text-[#6B8E23]">
                              {pupils.filter(p => p.classLevel === cl.id && p.immunized).length}
                            </td>
                            <td className="py-2.5 text-center text-xs text-[#7D6B5D] font-mono">
                              {pupils.filter(p => p.classLevel === cl.id && p.requirements.find(r => r.name === 'Broom (Sisal/Soft)' && r.brought)).length}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-[#F2EDE4] p-4 text-xs font-bold text-[#7D6B5D] text-center shrink-0 border-t border-[#E0D8CC]">
                    Total Registered School Enrollment: <span className="text-[#3D2B1F]">{pupils.length} Boys and Girls</span>
                  </div>
                </div>

                {/* Right Side: Notices & Parent Bulletins */}
                <div className="lg:col-span-4 bg-[#F2EDE4] rounded-3xl p-6 flex flex-col gap-4">
                  <h3 className="font-bold text-[#5A3E2B] text-base">Tr. Florence's Notice Board</h3>

                  <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-[#8C5A3C] rounded-full"></div>
                      <span className="text-[9px] font-bold text-[#8C5A3C] uppercase tracking-wider">Parent Reminder</span>
                    </div>
                    <p className="text-xs font-bold mb-1">Rotatrim & Broom Checklist</p>
                    <p className="text-[11px] text-[#7D6B5D] leading-relaxed">
                      Please check student requirement lists. Some KG1 students are yet to provide Maize Flour for porridge porridge meals.
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] shadow-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-[#6B8E23] rounded-full"></div>
                      <span className="text-[9px] font-bold text-[#6B8E23] uppercase tracking-wider font-extrabold">Ministry of Health</span>
                    </div>
                    <p className="text-xs font-bold mb-1">Polio Immunization check</p>
                    <p className="text-[11px] text-[#7D6B5D] leading-relaxed">
                      LCI Chairman requested us to prepare all UNEPI health cards on file for routine check-up on Friday morning.
                    </p>
                  </div>

                  {/* Academy Contacts Dashboard Block */}
                  <div className="mt-auto bg-[#1E293B] p-4.5 rounded-2xl text-white space-y-2.5 border border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-sky-400" />
                      <span className="text-[10px] font-black uppercase text-sky-300 tracking-wider">Academy Contacts</span>
                    </div>
                    <div className="space-y-1.5 text-xs font-semibold">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400 font-medium">📞 Call Mobile:</span>
                        <a href="tel:+256782967294" className="font-mono text-white text-[11.5px] hover:text-sky-400 transition-colors bg-slate-900/60 px-2 py-0.5 rounded border border-slate-850 font-bold">+256782967294</a>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 font-medium">💬 WhatsApp:</span>
                        <a href="https://wa.me/256703209254" target="_blank" rel="noreferrer" className="font-mono text-emerald-400 text-[11.5px] hover:text-emerald-300 transition-colors bg-slate-900/60 px-2 py-0.5 rounded border border-slate-850 font-bold">+256703209254</a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: STUDENY REGISTRY */}
          {activeTab === 'registry' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-[#7D6B5D] mb-1 font-bold uppercase tracking-wider">Ugandan Nursery Admission & Basic Profiles</p>
                <p className="text-sm text-[#3D2B1F]">Register children, inspect parent credentials, and check material deliveries status in real-time.</p>
              </div>

              <StudentRegistry 
                pupils={pupils} 
                onAddPupil={handleAddPupil} 
                onImportPupils={handleImportPupils}
                onUpdatePupil={handleUpdatePupil} 
                onDeletePupil={handleDeletePupil} 
                globalSearchTerm={searchQuery}
              />
            </div>
          )}

          {/* TAB 3: ASSESSMENTS (Uganda standard framework with Gemini comments) */}
          {activeTab === 'assessments' && (() => {
            const displayedPupils = pupils.filter(p => {
              const matchesClass = bulkClassFilter === 'All' || p.classLevel === bulkClassFilter;
              const matchesSearch = !searchQuery || p.fullName.toLowerCase().includes(searchQuery.toLowerCase());
              return matchesClass && matchesSearch;
            });
            return (
              <div className="space-y-6">
              
              {/* Introduction area */}
              <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                <h3 className="font-bold text-[#5A3E2B] text-lg mb-2">National NCDC Early Childhood Assessment Framework</h3>
                <p className="text-xs text-[#7D6B5D] leading-relaxed">
                  The government of Uganda evaluates early learners in 5 vital learning domains as outlined in the ECD Learning Framework. We score with levels: 
                  <span className="font-bold text-[#3D2B1F] ml-1">1 = Emerging progression (needs focus), 2 = Achieving standard, and 3 = Excelling.</span>
                </p>
              </div>

              {/* School Branding & Logo Customizer Block */}
              <div id="school-branding-block" className="bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0D8CC]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#E8F1D7] text-[#6B8E23] rounded-xl">
                      <School className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#5A3E2B] text-sm">School Branding & Logo Customizer</h4>
                      <p className="text-[11px] text-[#7D6B5D]">Upload and save your school logo to print directly on learner report cards</p>
                    </div>
                  </div>
                </div>

                {brandingSaveSuccess && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-bounce-short" id="branding-saved-alert">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>✓ Success! The school logo and branding details have been saved and applied into the system.</span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* school logo preview */}
                  <div className="md:col-span-3 flex flex-col items-center justify-center border border-dashed border-[#E0D8CC] rounded-2xl p-4 bg-[#FDFBF7] relative min-h-[140px] text-center">
                    {schoolLogo ? (
                      <div className="relative group">
                        <img src={schoolLogo} alt="School Logo" className="max-h-24 max-w-full rounded-lg object-contain shadow-sm" />
                        <button 
                          onClick={() => setSchoolLogo('')} 
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-sm"
                          title="Remove Logo"
                          type="button"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Image className="w-8 h-8 text-[#7D6B5D]/40 mb-2" />
                        <span className="text-[10px] font-black uppercase text-[#7D6B5D]">No Logo Configured</span>
                        <span className="text-[8px] text-[#7D6B5D]/75 mt-0.5">Using Standard Name</span>
                      </div>
                    )}
                  </div>

                  {/* Form field inputs */}
                  <div className="md:col-span-9 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-[#5A3E2B] mb-1">School Name</label>
                        <input 
                          type="text"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#6B8E23]"
                          placeholder="e.g. Kids Villa Academy"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-[#5A3E2B] mb-1">School Address & Contacts</label>
                        <input 
                          type="text"
                          value={schoolAddress}
                          onChange={(e) => setSchoolAddress(e.target.value)}
                          className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-[#FFFFFC] text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#6B8E23]"
                          placeholder="e.g. Kitemu Nsangi, Wakiso District, Uganda | Tel: +256 706 123456"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <label className="bg-[#6B8E23] text-white hover:bg-[#5C7D1E] px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all">
                        <Upload className="w-3.5 h-3.5" />
                        Upload Logo File
                        <input 
                          type="file" 
                          id="school-logo-input-field"
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 240;
                                  const MAX_HEIGHT = 240;
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
                                      // Compress to PNG to preserve transparency
                                      const compressedDataUrl = canvas.toDataURL('image/png');
                                      setSchoolLogo(compressedDataUrl);
                                      localStorage.setItem('kva_school_logo', compressedDataUrl);
                                      setBrandingSaveSuccess(true);
                                      setTimeout(() => setBrandingSaveSuccess(false), 4500);
                                    } else {
                                      const rawDataUrl = event.target?.result as string;
                                      setSchoolLogo(rawDataUrl);
                                      localStorage.setItem('kva_school_logo', rawDataUrl);
                                      setBrandingSaveSuccess(true);
                                      setTimeout(() => setBrandingSaveSuccess(false), 4500);
                                    }
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            }
                          }} 
                        />
                      </label>
                      
                      <button
                        type="button"
                        onClick={handleSaveBranding}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm uppercase tracking-wider"
                      >
                        <Check className="w-4 h-4 text-emerald-300" /> Save & Apply Branding Settings
                      </button>

                      {/* Preset sample logos */}
                      <div className="flex items-center gap-1.5 ml-auto text-[10px] text-[#7D6B5D] font-bold">
                        <span>Use Sample Badge:</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const badgeUrl = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=60';
                            setSchoolLogo(badgeUrl);
                            localStorage.setItem('kva_school_logo', badgeUrl);
                            setBrandingSaveSuccess(true);
                            setTimeout(() => setBrandingSaveSuccess(false), 4550);
                          }}
                          className="px-2 py-1 rounded bg-[#F2EDE4] hover:bg-[#E0D8CC] transition-all text-[#5A3E2B] cursor-pointer"
                        >
                          Schooled Kids
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            const badgeUrl = 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d28?w=120&auto=format&fit=crop&q=60';
                            setSchoolLogo(badgeUrl);
                            localStorage.setItem('kva_school_logo', badgeUrl);
                            setBrandingSaveSuccess(true);
                            setTimeout(() => setBrandingSaveSuccess(false), 4550);
                          }}
                          className="px-2 py-1 rounded bg-[#F2EDE4] hover:bg-[#E0D8CC] transition-all text-[#5A3E2B] cursor-pointer"
                        >
                          Academy Books
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Learning Areas Configuration Manager */}
              <div id="learning-areas-customizer" className="bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E0D8CC]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#E8F1D7] text-[#6B8E23] rounded-xl">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-[#5A3E2B] text-sm">Learning Area Configurators (Grades A - E)</h4>
                      <p className="text-[11px] text-[#7D6B5D]">Remove preset subjects or create customized learning areas matching your specific syllabus</p>
                    </div>
                  </div>
                </div>

                {/* Current Learning Areas Badges */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#5A3E2B] block tracking-wider">Active Learning Areas ({learningAreas.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {learningAreas.map((area) => (
                      <div key={area.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDFBF7] text-xs text-[#3D2B1F] border border-[#E0D8CC]/75 rounded-xl font-medium shadow-2xs">
                        <span className="font-bold text-[#6B8E23] uppercase font-mono">{area.code}:</span>
                        <span>{area.name}</span>
                        <button 
                          type="button"
                          onClick={() => {
                            const updated = learningAreas.filter(a => a.id !== area.id);
                            setLearningAreas(updated);
                          }}
                          className="text-red-500 hover:text-red-700 ml-1 rounded-sm hover:bg-red-50 p-0.5 cursor-pointer"
                          title={`Delete ${area.name}`}
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {learningAreas.length === 0 && (
                      <span className="text-xs text-[#7D6B5D] italic">No active learning areas! Create some below to enable grade assessment cards.</span>
                    )}
                  </div>
                </div>

                {/* New learning area form */}
                <div className="bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0D8CC]/50 space-y-3">
                  <span className="text-[9px] font-black uppercase text-[#8C5A3C] block tracking-wide">Create Custom Learning Domain</span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                    <div className="sm:col-span-7">
                      <label className="text-[9px] font-bold text-[#5A3E2B] uppercase block mb-1">Learning Domain Name</label>
                      <input 
                        type="text" 
                        id="new-la-name"
                        placeholder="e.g. French Language & Pronunciation" 
                        className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F] focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="text-[9px] font-bold text-[#5A3E2B] uppercase block mb-1">Short Code</label>
                      <input 
                        type="text" 
                        id="new-la-code"
                        placeholder="e.g. FRE" 
                        className="w-full text-xs font-bold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F] focus:outline-none uppercase"
                      />
                    </div>
                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          const nameInput = document.getElementById('new-la-name') as HTMLInputElement | null;
                          const codeInput = document.getElementById('new-la-code') as HTMLInputElement | null;
                          if (nameInput && codeInput) {
                            const nameValue = nameInput.value.trim();
                            const codeValue = codeInput.value.trim().toUpperCase();
                            if (nameValue && codeValue) {
                              const newArea = {
                                id: `la_${Date.now()}`,
                                name: nameValue,
                                code: codeValue
                              };
                              setLearningAreas([...learningAreas, newArea]);
                              nameInput.value = '';
                              codeInput.value = '';
                            } else {
                              alert('Please fill in both the Name and Short Code fields.');
                            }
                          }
                        }}
                        className="w-full py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-2xs transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Domain
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Class Selector / Bulk Actions and Indicators Panel */}
              <div className="bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-4 shadow-sm text-left">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-[#8C5A3C] tracking-wide">Select Class to Manage</label>
                    <div className="flex items-center gap-2">
                      <select 
                        value={bulkClassFilter} 
                        onChange={(e) => setBulkClassFilter(e.target.value as any)}
                        className="px-4 py-2 text-xs font-bold border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F] focus:outline-none focus:ring-1 focus:ring-[#8C5A3C]"
                      >
                        <option value="All">All Classes Combined</option>
                        <option value="KG1">KG1 Only</option>
                        <option value="KG2">KG2 Only</option>
                        <option value="KG3">KG3 Only</option>
                        <option value="Primary One">Primary One (P.1)</option>
                        <option value="Primary Two">Primary Two (P.2)</option>
                        <option value="Primary Three">Primary Three (P.3)</option>
                        <option value="Primary Four">Primary Four (P.4)</option>
                        <option value="Primary Five">Primary Five (P.5)</option>
                        <option value="Primary Six">Primary Six (P.6)</option>
                        <option value="Primary Seven">Primary Seven (P.7)</option>
                      </select>
                      <span className="text-xs text-[#7D6B5D] font-medium font-sans">
                        ({displayedPupils.length} pupils registered)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5 font-sans">
                    <button 
                      onClick={handleBulkPDFDownload}
                      disabled={bulkProgress.active}
                      className="bg-[#6B8E23] hover:bg-[#58751d] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 inline-flex transition-all"
                      title="Download Combined PDF containing report cards of all students in this class"
                      type="button"
                    >
                      <Printer className="w-3.5 h-3.5" /> Combined PDF
                    </button>
                    
                    <button 
                      onClick={handleBulkZIPDownload}
                      disabled={bulkProgress.active}
                      className="bg-[#8C5A3C] hover:bg-[#724830] text-white px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 inline-flex transition-all"
                      title="Download a ZIP archive containing individual PDF report cards of each student"
                      type="button"
                    >
                      <Download className="w-3.5 h-3.5" /> ZIP of PDFs
                    </button>

                    <button 
                      onClick={() => {
                        const hasAnySaved = pupils
                          .filter(p => bulkClassFilter === 'All' || p.classLevel === bulkClassFilter)
                          .some(p => reports.some(r => r.pupilId === p.id && r.term === selectedTerm && r.academicYear === academicYear));
                        if (!hasAnySaved) {
                          alert("No saved report cards found for this class & term to share!");
                          return;
                        }
                        setIsShareModalOpen(true);
                      }}
                      disabled={bulkProgress.active}
                      className="border border-[#E0D8CC] hover:bg-[#FDFBF7] text-[#5A3E2B] px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 inline-flex transition-all"
                      title="Share links or PDFs of this class to WhatsApp clusters or Shared Folders"
                      type="button"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#5A3E2B]" /> WhatsApp / Export
                    </button>
                  </div>
                </div>

                {/* Active progress indicator for PDF generation */}
                {bulkProgress.active && (
                  <div className="bg-[#FDFBF7] border border-[#E0D8CC] p-4 rounded-2xl space-y-2 animate-pulse">
                    <div className="flex items-center justify-between text-xs text-[#3D2B1F]">
                      <span className="font-extrabold flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 text-[#6B8E23] animate-spin" />
                        Bulk Generating PDF report cards...
                      </span>
                      <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                        {bulkProgress.current} / {bulkProgress.total} Complete
                      </span>
                    </div>
                    <span className="block text-[11px] text-[#7D6B5D] italic">
                      Processing learner: <strong className="text-[#3D2B1F] font-bold">{bulkProgress.pupilName}</strong>
                    </span>
                    <div className="w-full bg-[#EAE4D9] h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#6B8E23] h-full transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid of student reports */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-[#F2EDE4] p-3 rounded-2xl border border-[#E0D8CC]">
                  <span className="text-xs font-bold text-[#3D2B1F]">Registered pupils in active lists ({displayedPupils.length})</span>
                  <span className="text-[10px] text-[#7D6B5D] font-mono">Generates using standard Server-run Gemini-3.5-Flash Model</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedPupils.map((pupil) => {
                    const report = reports.find(
                      r => r.pupilId === pupil.id && r.term === selectedTerm && r.academicYear === academicYear
                    );

                    return (
                      <div key={pupil.id} className="bg-white p-6 rounded-3xl border border-[#E0D8CC] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-black text-[#3D2B1F]">{pupil.fullName}</h4>
                              <span className="text-[10pt] text-[#7D6B5D] font-semibold">{pupil.classLevel} ({pupil.age} Years)</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              report ? 'bg-[#E8F1D7] text-[#6B8E23]' : 'bg-amber-50 text-[#8C5A3C]'
                            }`}>
                              {report ? 'Report Saved' : 'No Report Yet'}
                            </span>
                          </div>

                          {report ? (
                            <div className="space-y-3 bg-[#FDFBF7] p-4 rounded-2xl border border-[#E0D8CC]/65 text-xs mb-4">
                              <div className="flex flex-wrap gap-1.5 font-mono text-[9px] mt-1.5 justify-center">
                                {(() => {
                                  const renderBadge = (label: string, gradeStr: string, titleStr: string) => {
                                    let cls = 'bg-slate-50 text-slate-700 border-slate-200';
                                    if (gradeStr === 'A' || gradeStr === 'B') cls = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                                    else if (gradeStr === 'C') cls = 'bg-blue-50 text-blue-700 border-blue-200';
                                    else if (gradeStr === 'D') cls = 'bg-amber-50 text-amber-700 border-amber-200';
                                    else if (gradeStr === 'E') cls = 'bg-rose-50 text-rose-700 border-rose-200';
                                    return (
                                      <div key={label} className={`px-2 py-1 rounded-lg border ${cls} text-center min-w-[45px]`} title={titleStr}>
                                        <span className="block text-[7px] opacity-75 font-bold uppercase truncate">{label}</span>
                                        <span className="font-extrabold text-[11px]">{gradeStr}</span>
                                      </div>
                                    );
                                  };

                                  return (
                                    <>
                                      {learningAreas.map((area) => {
                                        let val: 'A' | 'B' | 'C' | 'D' | 'E' = 'B';
                                        if (report.learningAreaGrades && report.learningAreaGrades[area.id]) {
                                          val = report.learningAreaGrades[area.id];
                                        } else {
                                          // check fallback
                                          if (area.id === 'la_literacy1') val = report.literacy1 || 'B';
                                          else if (area.id === 'la_literacy2') val = report.literacy2 || 'B';
                                          else if (area.id === 'la_social') val = report.socialDevelopment || 'B';
                                          else if (area.id === 'la_health') val = report.healthHabits || 'B';
                                          else if (area.id === 'la_math') val = report.mathematics || 'B';
                                        }
                                        return renderBadge(area.code, val, area.name);
                                      })}
                                    </>
                                  );
                                })()}
                              </div>

                              <div>
                                <span className="font-bold text-[#5A3E2B] block text-[9px] uppercase">Teacher feedback (Assisted)</span>
                                <p className="text-[#3D2B1F] line-clamp-2 italic leading-relaxed text-[11px]">
                                  "{report.teacherComments}"
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="py-6 text-center text-[#7D6B5D] text-xs border border-dashed border-[#E0D8CC] rounded-2xl bg-[#FDFBF7] mb-4">
                              Fill comments to formulate this terminal progress card.
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            id={`write-report-btn-${pupil.id}`}
                            onClick={() => {
                              setGeneratingReportFor(pupil);
                              // preset scores if report exists
                              const gradesMap: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'> = {};
                              learningAreas.forEach(area => {
                                if (report && report.learningAreaGrades && report.learningAreaGrades[area.id]) {
                                  gradesMap[area.id] = report.learningAreaGrades[area.id];
                                } else if (report) {
                                  if (area.id === 'la_literacy1') gradesMap[area.id] = report.literacy1 || 'B';
                                  else if (area.id === 'la_literacy2') gradesMap[area.id] = report.literacy2 || 'B';
                                  else if (area.id === 'la_social') gradesMap[area.id] = report.socialDevelopment || 'B';
                                  else if (area.id === 'la_health') gradesMap[area.id] = report.healthHabits || 'B';
                                  else if (area.id === 'la_math') gradesMap[area.id] = report.mathematics || 'B';
                                  else gradesMap[area.id] = 'B';
                                } else {
                                  gradesMap[area.id] = 'B';
                                }
                              });
                              setCurrentLearningAreaGrades(gradesMap);

                              if (report) {
                                setScoreSocial(report.socialEmotional || 2);
                                setScorePhysical(report.physicalDevelopment || 2);
                                setScoreLanguage(report.languageCommunication || 2);
                                setScoreMath(report.mathematicalPlay || 2);
                                setScoreHealth(report.healthNutrition || 3);
                                setGradeLiteracy1(report.literacy1 || 'B');
                                setGradeLiteracy2(report.literacy2 || 'B');
                                setGradeSocialDevelopment(report.socialDevelopment || 'B');
                                setGradeHealthHabits(report.healthHabits || 'B');
                                setGradeMathematics(report.mathematics || 'B');
                                setCustomSubjectsTemp(report.customSubjects || []);
                              } else {
                                setScoreSocial(2);
                                setScorePhysical(2);
                                setScoreLanguage(2);
                                setScoreMath(2);
                                setScoreHealth(2);
                                setGradeLiteracy1('B');
                                setGradeLiteracy2('B');
                                setGradeSocialDevelopment('B');
                                setGradeHealthHabits('B');
                                setGradeMathematics('B');
                                setCustomSubjectsTemp([]);
                              }
                              setNewSubjName('');
                              setNewSubjScore('3');
                              setNewSubjCompetency('');
                            }}
                            className="flex-1 bg-white hover:bg-[#F2EDE4] text-[#3D2B1F] border border-[#E0D8CC] font-bold text-xs py-2 px-3 rounded-full flex items-center justify-center gap-1 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-[#6B8E23]" /> 
                            {report ? 'Update Report' : 'Write Termly Card'}
                          </button>
                          
                          {report && (
                            <button
                              id={`print-report-btn-${pupil.id}`}
                              onClick={() => setPrintedReport(report)}
                              className="bg-[#6B8E23] hover:bg-[#58751d] text-white p-2 rounded-full transition-colors cursor-pointer"
                              title="Print / View Report Card"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Form Modal using Gemini Assist */}
              {generatingReportFor && (
                <div id="assessment-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full p-6 shadow-xl border border-[#E0D8CC] max-h-[90vh] overflow-y-auto text-[#3D2B1F]">
                    
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E0D8CC]">
                      <h4 className="text-base font-extrabold text-[#5A3E2B] flex items-center gap-2">
                        <Sparkles className="text-[#6B8E23]" /> NCDC Evaluation Form — {generatingReportFor.fullName}
                      </h4>
                      <button onClick={() => setGeneratingReportFor(null)} className="p-1 hover:bg-[#F2EDE4] rounded-lg">
                        <XCircle className="w-5 h-5 text-[#7D6B5D]" />
                      </button>
                    </div>

                    <form onSubmit={triggerGeminiReportGen} className="space-y-5">
                      
                      {/* Core Grade-Based Learning Areas Section */}
                      <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] space-y-4">
                        <div className="flex items-center gap-1.5 text-[#5A3E2B]">
                          <BookOpen className="w-4 h-4 text-[#6B8E23] shrink-0" />
                          <h5 id="grade-based-header" className="text-xs font-extrabold uppercase tracking-wider text-[#5A3E2B]">
                            Core Learning Areas (Graded A - E with Competencies)
                          </h5>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {learningAreas.map((area, index) => {
                            const curGrade = currentLearningAreaGrades[area.id] || 'B';
                            return (
                              <div key={area.id} className="bg-[#FDFBF7] p-3 rounded-xl border border-[#E0D8CC]/60 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-black uppercase text-[#5A3E2B] truncate pr-2">
                                    {index + 1}. {area.name}
                                  </label>
                                  <select 
                                    id={`grade-select-${area.id}`}
                                    value={curGrade} 
                                    onChange={(e) => {
                                      const updatedGrade = e.target.value as 'A' | 'B' | 'C' | 'D' | 'E';
                                      setCurrentLearningAreaGrades(prev => ({
                                        ...prev,
                                        [area.id]: updatedGrade
                                      }));

                                      // Maintain synchronization with legacy fields to ensure backwards-compatibility
                                      if (area.id === 'la_literacy1') setGradeLiteracy1(updatedGrade);
                                      else if (area.id === 'la_literacy2') setGradeLiteracy2(updatedGrade);
                                      else if (area.id === 'la_social') setGradeSocialDevelopment(updatedGrade);
                                      else if (area.id === 'la_health') setGradeHealthHabits(updatedGrade);
                                      else if (area.id === 'la_math') setGradeMathematics(updatedGrade);
                                    }}
                                    className="text-xs font-bold px-2.5 py-1 border border-[#E0D8CC] rounded-lg bg-white text-[#6B8E23] shrink-0 font-mono"
                                  >
                                    <option value="A">Grade A (Excellent)</option>
                                    <option value="B">Grade B (Very Good)</option>
                                    <option value="C">Grade C (Good)</option>
                                    <option value="D">Grade D (Developing)</option>
                                    <option value="E">Grade E (Emerging)</option>
                                  </select>
                                </div>
                                <p className="text-[10px] text-[#7D6B5D] italic font-medium leading-normal bg-white p-2 rounded-md border border-[#E0D8CC]/40">
                                  {GRADE_COMPETENCIES[curGrade]}
                                </p>
                              </div>
                            );
                          })}
                          {learningAreas.length === 0 && (
                            <div className="col-span-2 text-center py-6 text-[#7D6B5D] text-xs italic bg-[#FDFBF7] rounded-xl border border-dashed border-[#E0D8CC]">
                              No active Custom Learning Areas! Create some in the builder above to assign grades.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Optional NCDC Basic Skill levels */}
                      <details className="bg-[#F2EDE4]/30 p-3 rounded-xl border border-[#E0D8CC]/50 text-xs">
                        <summary className="font-bold text-[#7D6B5D] cursor-pointer hover:text-[#5A3E2B] select-none">
                          Show/Hide NCDC Basic Skills Levels (Emerging=1, Achieving=2, Excelling=3)
                        </summary>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3">
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-[#7D6B5D] mb-1">Social-Emotional</label>
                            <select 
                              id="score-social"
                              value={scoreSocial} 
                              onChange={(e) => setScoreSocial(Number(e.target.value) as any)}
                              className="w-full text-xs font-semibold px-2 py-1 border border-[#E0D8CC] rounded-md bg-white text-[#3D2B1F]"
                            >
                              <option value="1">1 - Emerging</option>
                              <option value="2">2 - Achieving</option>
                              <option value="3">3 - Excelling</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-[#7D6B5D] mb-1">Physical</label>
                            <select 
                              id="score-physical"
                              value={scorePhysical} 
                              onChange={(e) => setScorePhysical(Number(e.target.value) as any)}
                              className="w-full text-xs font-semibold px-2 py-1 border border-[#E0D8CC] rounded-md bg-white text-[#3D2B1F]"
                            >
                              <option value="1">1 - Emerging</option>
                              <option value="2">2 - Achieving</option>
                              <option value="3">3 - Excelling</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-[#7D6B5D] mb-1">Language</label>
                            <select 
                              id="score-language"
                              value={scoreLanguage} 
                              onChange={(e) => setScoreLanguage(Number(e.target.value) as any)}
                              className="w-full text-xs font-semibold px-2 py-1 border border-[#E0D8CC] rounded-md bg-white text-[#3D2B1F]"
                            >
                              <option value="1">1 - Emerging</option>
                              <option value="2">2 - Achieving</option>
                              <option value="3">3 - Excelling</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-[#7D6B5D] mb-1">Math Play</label>
                            <select 
                              id="score-math"
                              value={scoreMath} 
                              onChange={(e) => setScoreMath(Number(e.target.value) as any)}
                              className="w-full text-xs font-semibold px-2 py-1 border border-[#E0D8CC] rounded-md bg-white text-[#3D2B1F]"
                            >
                              <option value="1">1 - Emerging</option>
                              <option value="2">2 - Achieving</option>
                              <option value="3">3 - Excelling</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-[#7D6B5D] mb-1">Health & Hygiene</label>
                            <select 
                              id="score-health"
                              value={scoreHealth} 
                              onChange={(e) => setScoreHealth(Number(e.target.value) as any)}
                              className="w-full text-xs font-semibold px-2 py-1 border border-[#E0D8CC] rounded-md bg-white text-[#3D2B1F]"
                            >
                              <option value="1">1 - Emerging</option>
                              <option value="2">2 - Achieving</option>
                              <option value="3">3 - Excelling</option>
                            </select>
                          </div>
                        </div>
                      </details>

                      {/* Custom Subjects / Assessments Section */}
                      <div className="bg-white p-4 rounded-2xl border border-[#E0D8CC] space-y-4">
                        <div className="flex items-center gap-1.5 text-[#8C5A3C]">
                          <Award className="w-4 h-4 text-[#8C5A3C] shrink-0" />
                          <h5 className="text-xs font-bold uppercase tracking-wider">Custom Subjects, Scores & Competencies</h5>
                        </div>
                        
                        {/* List of currently added custom subjects */}
                        {customSubjectsTemp.length > 0 ? (
                          <div className="space-y-2">
                            {customSubjectsTemp.map((subj, index) => (
                              <div key={index} className="flex items-center justify-between bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E0D8CC]/60 text-xs">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#3D2B1F]">{subj.subjectName}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#E8F1D7] text-[#6B8E23] font-bold text-[10px]">
                                      {subj.score}
                                    </span>
                                  </div>
                                  <p className="text-[#7D6B5D] text-[11px] mt-1 font-medium">{subj.competency}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomSubjectsTemp(customSubjectsTemp.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors ml-2 cursor-pointer"
                                  title="Remove custom assessment"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#7D6B5D] italic py-2">No custom assessment subjects added yet. Add school-specific subjects like Swimming, Music, French or Luganda below!</p>
                        )}

                        {/* Control panel to draft and attach a new custom subject */}
                        <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E0D8CC]/40 space-y-3">
                          <p className="text-[10px] font-bold text-[#5A3E2B] uppercase">Add Custom Assessment Module</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <label className="block text-[9px] font-bold text-[#7D6B5D] uppercase mb-1">Subject / Skill Name</label>
                              <input
                                type="text"
                                value={newSubjName}
                                onChange={(e) => setNewSubjName(e.target.value)}
                                placeholder="e.g. Swimming, French, Art"
                                className="w-full text-xs px-2.5 py-1.5 border border-[#E0D8CC] rounded-lg bg-white text-[#3D2B1F]"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#7D6B5D] uppercase mb-1">Score / Accomplishment Rating</label>
                              <select
                                value={newSubjScore}
                                onChange={(e) => setNewSubjScore(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 border border-[#E0D8CC] rounded-lg bg-white text-[#3D2B1F]"
                              >
                                <option value="3 - Excelling">3 - Excelling</option>
                                <option value="2 - Achieving">2 - Achieving</option>
                                <option value="1 - Emerging">1 - Emerging</option>
                                <option value="A (Outstanding)">A (Outstanding)</option>
                                <option value="B (Very Good)">B (Very Good)</option>
                                <option value="C (Pass)">C (Pass)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] font-bold text-[#7D6B5D] uppercase mb-1">Specific Competency / Remark</label>
                              <input
                                type="text"
                                value={newSubjCompetency}
                                onChange={(e) => setNewSubjCompetency(e.target.value)}
                                placeholder="e.g. Float and paddle limbs coordinates"
                                className="w-full text-xs px-2.5 py-1.5 border border-[#E0D8CC] rounded-lg bg-white text-[#3D2B1F]"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!newSubjName) {
                                  alert('Please type a key Subject Name!');
                                  return;
                                }
                                const added: CustomSubjectScore = {
                                  subjectName: newSubjName,
                                  score: newSubjScore,
                                  competency: newSubjCompetency || 'Demonstrated very satisfactory progress.'
                                };
                                setCustomSubjectsTemp([...customSubjectsTemp, added]);
                                setNewSubjName('');
                                setNewSubjCompetency('');
                              }}
                              className="px-3.5 py-1.5 bg-[#6B8E23] text-white text-[10px] font-bold rounded-full flex items-center gap-1 hover:bg-[#58751d] cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" /> Attach Custom Subject
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Gemini Generator section */}
                      <div className="bg-[#F2EDE4]/60 p-4 rounded-2xl border border-[#E0D8CC] space-y-4">
                        <div className="flex items-center gap-1 text-[#6B8E23]">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <h5 className="text-xs font-black uppercase tracking-wider">Gemini-Powered Report Comment Generator</h5>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#7D6B5D] mb-1">Observation Strengths / Accomplishments</label>
                            <textarea 
                              id="strength-input"
                              value={strengthInput}
                              onChange={(e) => setStrengthInput(e.target.value)}
                              placeholder="e.g., Exceedingly helpful during tidy-up tidy-up time. Sings traditional songs beautifully and keeps clothes extremely clean."
                              className="w-full h-18 text-xs p-2 rounded-lg bg-white border border-[#E0D8CC] text-[#3D2B1F]"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#7D6B5D] mb-1">Areas Needing Encouragement / Growth</label>
                            <textarea 
                              id="growth-input"
                              value={growthInput}
                              onChange={(e) => setGrowthInput(e.target.value)}
                              placeholder="e.g., Needs encouragement while eating vegetable porridge, and practicing counting numbers 1-10."
                              className="w-full h-18 text-xs p-2 rounded-lg bg-white border border-[#E0D8CC] text-[#3D2B1F]"
                            />
                          </div>
                        </div>

                        {/* Tone & Translation options */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#7D6B5D] mb-1">Comment Vibe & Tone</label>
                            <select 
                              id="report-tone"
                              value={reportTone}
                              onChange={(e) => setReportTone(e.target.value as any)}
                              className="w-full text-xs px-2 py-1.5 border border-[#E0D8CC] rounded-md bg-white"
                            >
                              <option value="Encouraging & Warm">Encouraging & Warm</option>
                              <option value="Constructive & Clear">Constructive & Clear</option>
                              <option value="Inspiring & High-energy">Inspiring & High-energy</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold uppercase text-[#7D6B5D] mb-1">Translate translation options</label>
                            <select 
                              id="local-language"
                              value={localLanguage}
                              onChange={(e) => setLocalLanguage(e.target.value as any)}
                              className="w-full text-xs px-2 py-1.5 border border-[#E0D8CC] rounded-md bg-white"
                            >
                              <option value="English">English Only</option>
                              <option value="Luganda">Luganda (Central / South)</option>
                              <option value="Runyankole">Runyankole-Rukiga (West)</option>
                              <option value="Acholi">Acholi (North)</option>
                              <option value="Iteso">Iteso (East)</option>
                              <option value="Lusoga">Lusoga (East)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Error block */}
                      {geminiError && (
                        <div className="bg-amber-50 text-[#8C5A3C] p-3 rounded-xl border border-amber-250 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{geminiError}</span>
                        </div>
                      )}

                      <div className="flex justify-end gap-2.5 pt-4 border-t border-[#E0D8CC]">
                        <button
                          type="button"
                          onClick={() => setGeneratingReportFor(null)}
                          className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-[#F2EDE4] cursor-pointer"
                        >
                          Dismiss Form
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleSaveReportDirectly}
                          className="px-4 py-2 bg-[#8C5A3C] hover:bg-[#734a31] text-white font-bold rounded-full text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          Save Report Directly
                        </button>

                        <button
                          type="submit"
                          id="submit-gen-report"
                          disabled={isCallingGemini}
                          className="px-5 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold rounded-full text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isCallingGemini ? (
                            <span>Calling Gemini...</span>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5" /> AI Comment & Save
                            </>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </div>
              )}

              {/* PRINT PREVIEW DIALOG PORTRAIT */}
              {printedReport && (
                <div id="print-preview-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-gray-300 max-h-[92vh] overflow-y-auto text-[#3D2B1F]">
                    
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#E0D8CC] no-print">
                      <span className="text-xs font-bold text-[#6B8E23] uppercase">Kids Villa Academy Report Card</span>
                      <div className="flex gap-2 font-sans">
                        {(() => {
                          const pupilObj = pupils.find(p => p.id === printedReport.pupilId);
                          return pupilObj ? (
                            <button 
                              onClick={() => handleDownloadSinglePDF(pupilObj, printedReport)}
                              className="bg-[#8C5A3C] hover:bg-[#724830] text-white px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1 cursor-pointer transition-all"
                              type="button"
                              id="btn-single-pdf-download"
                            >
                              <Download className="w-3" /> Download PDF
                            </button>
                          ) : null;
                        })()}
                        <button 
                          onClick={() => window.print()}
                          className="bg-[#6B8E23] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer"
                          type="button"
                        >
                          <Printer className="w-3 h-3" /> Print Card
                        </button>
                        <button 
                          onClick={() => setPrintedReport(null)}
                          className="border border-[#E0D8CC] text-[#7D6B5D] px-3.5 py-1.5 rounded-full text-xs font-bold"
                          type="button"
                        >
                          Close Card
                        </button>
                      </div>
                    </div>

                    {/* Report Card content section suitable for printing / taking a screenshot */}
                    <div id="student-report-card-printable" className="p-6 border-4 border-[#3D2B1F] rounded-2xl bg-[#FFFFFC] text-[#3D2B1F] space-y-5">
                      
                      {/* Header block of school */}
                      <div className="flex flex-col items-center text-center pb-4 border-b-2 border-double border-[#3D2B1F] space-y-2">
                        {schoolLogo && (
                          <img 
                            src={schoolLogo} 
                            alt="School Logo" 
                            className="h-16 max-w-full object-contain mb-1" 
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <div>
                          <h4 className="text-xl font-black uppercase text-[#3D2B1F] leading-none tracking-tight">
                            {schoolName}
                          </h4>
                          <p className="text-[10px] font-bold text-[#7D6B5D] mt-1">
                            {schoolAddress}
                          </p>
                        </div>
                        <span className="inline-block bg-[#F2EDE4] text-[#3D2B1F] text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest mt-2 border border-[#E0D8CC]">
                          Official Pupil Evaluation Statement
                        </span>
                      </div>

                      {/* Bio grid with learner photo */}
                      {(() => {
                        const pupilObj = pupils.find(p => p.id === printedReport.pupilId);
                        if (!pupilObj) return null;
                        return (
                          <div className="flex flex-col sm:flex-row gap-4 bg-[#F2EDE4]/35 p-3.5 rounded-xl border border-[#E0D8CC] items-center">
                            {/* Learner photo */}
                            <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#3D2B1F] bg-[#F2EDE4] flex items-center justify-center shadow-inner">
                              {pupilObj.photoUrl ? (
                                <img 
                                  src={pupilObj.photoUrl} 
                                  alt={pupilObj.fullName} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <span className="text-xl font-black text-[#5A3E2B] uppercase text-center block">
                                  {pupilObj.fullName.charAt(0)}
                                </span>
                              )}
                            </div>
                            {/* Biodata info */}
                            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs w-full">
                              <div>
                                <p className="text-[#7D6B5D] font-bold text-[10px] uppercase">Pupil Full Name:</p>
                                <p className="font-extrabold text-[#3D2B1F] text-sm uppercase">{pupilObj.fullName}</p>
                              </div>
                              <div>
                                <p className="text-[#7D6B5D] font-bold text-[10px] uppercase">Nursery Class Assigned:</p>
                                <p className="font-extrabold text-[#3D2B1F] text-sm">{pupilObj.classLevel}</p>
                              </div>
                              <div>
                                <p className="text-[#7D6B5D] font-bold text-[10px] uppercase">Term & Academic Year:</p>
                                <p className="font-bold text-[#3D2B1F]">{printedReport.term}, {printedReport.academicYear}</p>
                              </div>
                              <div>
                                <p className="text-[#7D6B5D] font-bold text-[10px] uppercase">UNEPI Immunization status:</p>
                                <p className="font-bold text-[#6B8E23]">✓ Certified Complete</p>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Competence table */}
                      <div className="space-y-2">
                        <span className="text-xs font-black uppercase text-[#8C5A3C] tracking-wide block">Academic & Progression Assessment Statements (Grades A - E)</span>
                        
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-[#3D2B1F] bg-[#F2EDE4] font-bold">
                              <th className="py-2.5 px-2 w-[35%]">Core Learning Area</th>
                              <th className="py-2.5 px-2 text-center w-[15%]">Grade</th>
                              <th className="py-2.5 px-2 text-left w-[50%]">Descriptive Competency</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E0D8CC]">
                             {(() => {
                               const subjectRows = learningAreas.map((area, idx) => {
                                 let val: 'A' | 'B' | 'C' | 'D' | 'E' = 'B';
                                 if (printedReport.learningAreaGrades && printedReport.learningAreaGrades[area.id]) {
                                   val = printedReport.learningAreaGrades[area.id];
                                 } else {
                                   if (area.id === 'la_literacy1') val = printedReport.literacy1 || 'B';
                                   else if (area.id === 'la_literacy2') val = printedReport.literacy2 || 'B';
                                   else if (area.id === 'la_social') val = printedReport.socialDevelopment || 'B';
                                   else if (area.id === 'la_health') val = printedReport.healthHabits || 'B';
                                   else if (area.id === 'la_math') val = printedReport.mathematics || 'B';
                                 }
                                 return {
                                   label: `${idx + 1}. ${area.name}`,
                                   val,
                                   desc: GRADE_COMPETENCIES[val]
                                 };
                               });

                               return (
                                 <>
                                   {subjectRows.map((row, idx) => (
                                     <tr key={idx} className="hover:bg-amber-50/5">
                                       <td className="py-2.5 px-2 font-black text-[#5A3E2B]">{row.label}</td>
                                       <td className="py-2.5 text-center font-extrabold bg-slate-50 font-mono text-sm text-[#6B8E23]">
                                         {row.val}
                                       </td>
                                       <td className="py-2.5 px-2 text-[#3D2B1F] leading-tight text-[11px] italic">
                                         {row.desc}
                                       </td>
                                     </tr>
                                   ))}
                                 </>
                               );
                             })()}

                             {/* Render custom subjects, scores, and competencies seamlessly */}
                             {printedReport.customSubjects && printedReport.customSubjects.map((subj, index) => (
                               <tr key={`custom-${index}`} className="bg-amber-50/15">
                                 <td className="py-2.5 px-2 font-bold text-[#3D2B1F]">
                                   {learningAreas.length + 1 + index}. {subj.subjectName}
                                 </td>
                                 <td className="py-2 text-center font-black bg-[#E8F1D7]/35 font-mono text-[#6B8E23] text-xs">
                                   {subj.score}
                                 </td>
                                 <td className="py-2.5 px-2 text-[#7D6B5D] text-[11px] leading-normal font-medium pl-4">
                                   {subj.competency}
                                 </td>
                               </tr>
                             ))}
                          </tbody>
                        </table>
                      </div>

                      {/* AI generated comment */}
                      <div className="space-y-2 pt-2 border-t border-[#3D2B1F]">
                        <span className="text-xs font-black uppercase text-[#3D2B1F]">Class Teacher comments</span>
                        <p className="text-xs text-[#3D2B1F] leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#E0D8CC]">
                          {printedReport.teacherComments}
                        </p>
                      </div>

                      {/* Ugandan local terms translation */}
                      {printedReport.localTranslation && (
                        <div className="text-[10px] text-[#7D6B5D] italic">
                          * {printedReport.localTranslation} Translating help is on file for parent conferences.
                        </div>
                      )}

                      {/* Head teacher message & physical signatures block */}
                      <div className="pt-3 border-t-2 border-[#3D2B1F] grid grid-cols-2 gap-4 text-xs text-left">
                        <div className="space-y-1">
                          <span className="font-bold text-[#7D6B5D]">Class Teacher signature:</span>
                          <p className="font-mono text-[10px] italic">Apio Martha, Tr.</p>
                          <div className="h-px bg-gray-400 w-32 mt-3"></div>
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-[#7D6B5D]">Head Teacher's evaluation:</span>
                          <p className="font-bold text-[#3D2B1F] leading-tight">{printedReport.headTeacherComments || "Excellent discipline and solid academic groundwork."}</p>
                          <div className="h-px bg-gray-400 w-32 mt-3"></div>
                        </div>
                      </div>

                      {/* Digital Verification Footer with dynamic QR Code */}
                      <div className="pt-3 border-t border-dashed border-[#E0D8CC] flex items-center justify-between gap-4 no-print select-none">
                        <div className="space-y-1 text-left">
                          <span className="block text-[8px] font-black text-[#6B8E23] uppercase tracking-wider">NCDC Digital Verification Portal</span>
                          <p className="text-[10px] text-[#7D6B5D] leading-tight max-w-[340px]">
                            This report card contains a unique verification system. Scan the code to access this child's fully integrated, certified profile.
                          </p>
                        </div>
                        {previewQrCode ? (
                          <div className="flex flex-col items-center shrink-0">
                            <img src={previewQrCode} alt="Verification QR Code" className="w-16 h-16 border border-[#E0D8CC] p-1 bg-white rounded-lg shadow-2xs" />
                            <span className="text-[6px] font-mono font-bold text-gray-400 mt-1 uppercase">VERIFIED LINK</span>
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-[#FDFBF7] border border-dashed border-[#E0D8CC] rounded-lg flex items-center justify-center shrink-0">
                            <Loader2 className="w-4 h-4 text-[#6B8E23] animate-spin" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              )}

              </div>
            );
          })()}

          {/* TAB 4: SCHOOL FEES AND ACCOUNTS */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              
              {/* Financial stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Collected Term Income</h3>
                  <p className="text-3xl font-extrabold text-[#6B8E23]">
                    {totalFeesCollected.toLocaleString()} <span className="text-xs font-normal">UGX</span>
                  </p>
                  <p className="text-[11px] text-[#7D6B5D] mt-2">Target: {totalFeesTarget.toLocaleString()} UGX ({feesPercentage}%)</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Paid Expenditures</h3>
                  <p className="text-3xl font-extrabold text-[#8C5A3C]">
                    {paidExpenditureSum.toLocaleString()} <span className="text-xs font-normal">UGX</span>
                  </p>
                  <p className="text-[11px] text-[#7D6B5D] mt-2">Active cost items: {expenditures.length}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Pending Obligations</h3>
                  <p className="text-3xl font-extrabold text-[#8C5A3C]">
                    {pendingExpenditureSum.toLocaleString()} <span className="text-xs font-normal">UGX</span>
                  </p>
                  <p className="text-[11px] text-[#7D6B5D] mt-2">Outstanding cost arrears to be cleared.</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                  <h3 className="text-[#7D6B5D] text-xs font-black uppercase tracking-wider mb-2">Net Treasury Surplus</h3>
                  <p className={`text-3xl font-extrabold ${nurseryNetSurplus >= 0 ? 'text-[#6B8E23]' : 'text-red-500'}`}>
                    {nurseryNetSurplus.toLocaleString()} <span className="text-xs font-normal">UGX</span>
                  </p>
                  <p className="text-[11px] text-[#7D6B5D] mt-2">Income minus paid expenditures</p>
                </div>

              </div>

              {/* Sub-navigation Tabs for Fees & Budget */}
              <div className="flex flex-wrap border-b border-stone-200 gap-6 pb-2">
                <button
                  onClick={() => setFeesSubTab('ledgers')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
                    feesSubTab === 'ledgers'
                      ? 'border-amber-500 text-stone-900 font-black'
                      : 'border-transparent text-[#7D6B5D] hover:text-stone-800'
                  }`}
                >
                  <Coins className="w-4 h-4 text-amber-500" />
                  Learners Tuition Ledgers
                </button>
                <button
                  onClick={() => setFeesSubTab('expenditures')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
                    feesSubTab === 'expenditures'
                      ? 'border-amber-500 text-stone-900 font-black'
                      : 'border-transparent text-[#7D6B5D] hover:text-stone-800'
                  }`}
                >
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Recurrent Expenditures Logbook
                </button>
                <button
                  onClick={() => setFeesSubTab('centers')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
                    feesSubTab === 'centers'
                      ? 'border-amber-500 text-stone-900 font-black'
                      : 'border-transparent text-[#7D6B5D] hover:text-stone-800'
                  }`}
                >
                  <Building className="w-4 h-4 text-[#8C5A3C]" />
                  Operational Centers Analytics
                </button>
                <button
                  onClick={() => setFeesSubTab('vendors')}
                  className={`pb-2.5 text-xs uppercase tracking-wider font-extrabold transition-all border-b-2 px-1 cursor-pointer flex items-center gap-2 ${
                    feesSubTab === 'vendors'
                      ? 'border-amber-500 text-stone-900 font-black'
                      : 'border-transparent text-[#7D6B5D] hover:text-stone-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  Suppliers & Vendors Contacts
                </button>
              </div>

              {feesSubTab === 'ledgers' && (
                /* Pupils Ledger entries */
                <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#F2EDE4] bg-[#FDFBF7]">
                    <h3 className="font-bold text-[#5A3E2B]">Nursery Terminal Ledgers list</h3>
                    <p className="text-xs text-[#7D6B5D]">Add payments and print logs per family.</p>
                  </div>

                  <div className="divide-y divide-[#F2EDE4]">
                    {pupils.filter(p => !searchQuery || p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || p.guardianName.toLowerCase().includes(searchQuery.toLowerCase())).map((pupil) => {
                      const totalPaid = pupil.installments.reduce((sum, inst) => sum + inst.amount, 0);
                      const remainingBalance = pupil.termFeesRequired - totalPaid;

                      return (
                        <div key={pupil.id} className="p-6 flex flex-col gap-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="space-y-1">
                              <h4 className="font-black text-[#3D2B1F] text-base">{pupil.fullName}</h4>
                              <div className="flex flex-wrap gap-2 text-xs text-[#7D6B5D]">
                                <span className="font-bold text-[#5A3E2B]">{pupil.classLevel}</span>
                                <span>•</span>
                                <span>Parent: {pupil.guardianName}</span>
                                <span>•</span>
                                <span className="font-mono">{pupil.guardianPhone}</span>
                              </div>
                            </div>

                            {/* Financial progression details */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-6 text-sm">
                              <div>
                                <span className="text-xs text-[#7D6B5D] block font-semibold sm:text-right">Required Fees:</span>
                                <span className="font-mono font-bold text-[#3D2B1F] block sm:text-right">{pupil.termFeesRequired.toLocaleString()} UGX</span>
                              </div>

                              <div>
                                <span className="text-xs text-[#7D6B5D] block font-semibold sm:text-right">Total Deposited:</span>
                                <span className="font-mono font-extrabold text-[#6B8E23] block sm:text-right">{totalPaid.toLocaleString()} UGX</span>
                              </div>

                              <div>
                                <span className="text-xs text-[#7D6B5D] block font-semibold sm:text-right">Outstanding deficit:</span>
                                <span className={`font-mono font-black block sm:text-right ${
                                  remainingBalance > 0 ? 'text-[#8C5A3C]' : 'text-[#6B8E23]'
                                }`}>
                                  {remainingBalance > 0 ? `${remainingBalance.toLocaleString()} UGX` : 'Fully cleared ✓'}
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  id={`open-pay-btn-${pupil.id}`}
                                  onClick={() => setPayingPupil(pupil)}
                                  className="bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold text-xs py-2 px-3.5 rounded-full transition-colors cursor-pointer"
                                >
                                  Add Deposit Installment
                                </button>
                                <button
                                  id={`toggle-history-btn-${pupil.id}`}
                                  onClick={() => setExpandedPupilId(expandedPupilId === pupil.id ? null : pupil.id)}
                                  className="border border-[#E0D8CC] hover:bg-stone-50 text-[#7D6B5D] font-bold text-xs py-2 px-3.5 rounded-full transition-all cursor-pointer"
                                >
                                  {expandedPupilId === pupil.id ? 'Hide Payments' : `View Payments (${pupil.installments.length})`}
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Expanded payments log */}
                          {expandedPupilId === pupil.id && (
                            <div className="mt-2 bg-[#FDFBF7] border border-[#E0D8CC] p-4 rounded-2xl space-y-3 animate-fadeIn">
                              <div className="flex justify-between items-center pb-2 border-b border-[#E0D8CC]">
                                <span className="text-[10px] uppercase font-bold text-[#8C5A3C]">Detailed Installation History</span>
                                <span className="text-[10px] text-gray-500 font-bold">{pupil.installments.length} Transactions Recorded</span>
                              </div>
                              
                              {pupil.installments.length === 0 ? (
                                <p className="text-xs italic text-[#7D6B5D] py-2">No payment installments found for this student. Click 'Add Deposit Installment' to create one.</p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-xs text-left">
                                    <thead>
                                      <tr className="border-b border-[#E0D8CC] text-[#7D6B5D]">
                                        <th className="py-2 px-2">Date</th>
                                        <th className="py-2 px-2">Receipt No</th>
                                        <th className="py-2 px-2">Center / Channel</th>
                                        <th className="py-2 px-2">Notes</th>
                                        <th className="py-2 px-2 text-right">Amount</th>
                                        <th className="py-2 px-2 text-center w-36">Actions</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                      {pupil.installments.map((inst) => (
                                        <tr key={inst.id} className="hover:bg-[#F2EDE4]/30">
                                          <td className="py-2 px-2 font-mono text-[11px] text-[#3D2B1F]">{inst.date}</td>
                                          <td className="py-2 px-2 font-mono text-[11px] font-bold text-gray-500">{inst.receiptNo}</td>
                                          <td className="py-2 px-2 text-stone-700">
                                            <span className="block font-bold text-[10px]">{inst.center || 'General Tuition'}</span>
                                            <span className="block text-[10px] text-gray-400 font-semibold">{inst.paymentMethod}</span>
                                          </td>
                                          <td className="py-2 px-2 text-[#7D6B5D] max-w-[150px] truncate" title={inst.notes}>{inst.notes || '—'}</td>
                                          <td className="py-2 px-2 font-bold text-[#6B8E23] text-right">{inst.amount.toLocaleString()} UGX</td>
                                          <td className="py-2 px-2">
                                            <div className="flex gap-2 justify-center">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setEditingInstallment(inst);
                                                  setEditingPupilForInstallment(pupil);
                                                }}
                                                className="p-1 px-2.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors cursor-pointer flex items-center gap-1"
                                                title="Edit Deposit Payment"
                                              >
                                                <Edit className="w-3.5 h-3.5" /> Edit
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (confirm(`Are you sure you want to delete payment ${inst.receiptNo} of ${inst.amount.toLocaleString()} UGX?`)) {
                                                    handleDeleteInstallmentList(pupil, inst.id);
                                                  }
                                                }}
                                                className="p-1 px-2.5 text-[10px] font-bold bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer flex items-center gap-1"
                                                title="Delete Deposit Payment"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" /> Del
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {feesSubTab === 'expenditures' && (
                /* Recurrent Expenditures logbook */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: Form Card */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4">
                    <div>
                      <h4 className="text-base font-extrabold text-stone-900">Record Recurrent Expenditure</h4>
                      <p className="text-xs text-[#7D6B5D]">Track repetitive costs, supplier accounts & due dates.</p>
                    </div>

                    <form onSubmit={handleAddExpenditure} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Cost Item / Description *</label>
                        <input
                          id="exp-item-name"
                          type="text"
                          required
                          placeholder="e.g. Sugar, NWSC Prepaid, Millet Flour"
                          value={newExpItemName}
                          onChange={(e) => setNewExpItemName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Category *</label>
                          <select
                            id="exp-category"
                            value={newExpCategory}
                            onChange={(e) => setNewExpCategory(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-medium"
                          >
                            <option value="Food & Kitchen Supplies">Food & Kitchen</option>
                            <option value="Utilities & Rent">Utilities & Rent</option>
                            <option value="Stationery & Printing">Stationery & Printing</option>
                            <option value="Staff Lunch & Welfare">Staff Welfare</option>
                            <option value="Repairs & Maintenance">Repairs & Mainten.</option>
                            <option value="Sanitation & Hygiene">Sanitation/Hygiene</option>
                            <option value="Fuel & Transport">Fuel & Transport</option>
                            <option value="Others">Others</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Recurrence *</label>
                          <select
                            id="exp-recurrence"
                            value={newExpRecurrence}
                            onChange={(e) => setNewExpRecurrence(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-bold text-[#8C5A3C]"
                          >
                            <option value="Weekly">Weekly Cycle</option>
                            <option value="Monthly">Monthly Cycle</option>
                            <option value="Termly">Termly Cycle</option>
                            <option value="One-time">One-time / Ad-hoc</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Amount (UGX) *</label>
                          <input
                            id="exp-amount"
                            type="number"
                            required
                            min="1000"
                            step="5000"
                            value={newExpAmount}
                            onChange={(e) => setNewExpAmount(Number(e.target.value))}
                            className="w-full text-xs font-bold p-2.5 border border-[#E0D8CC] rounded-xl bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Payment Status *</label>
                          <select
                            id="exp-status"
                            value={newExpStatus}
                            onChange={(e) => setNewExpStatus(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-bold"
                          >
                            <option value="Paid">Cleared / Paid ✓</option>
                            <option value="Pending">Pending payment</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Supplier / Vendor Contact</label>
                        <select
                          id="exp-vendor"
                          value={newExpVendor}
                          onChange={(e) => setNewExpVendor(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-semibold text-stone-800"
                        >
                          <option value="">-- Select Registered Vendor (Optional) --</option>
                          {vendors.map(v => (
                            <option key={v.id} value={v.name}>
                              {v.name} {v.phone ? `(${v.phone})` : ''}
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-[#7D6B5D] mt-1 space-x-1">
                          <span>Not listed? Register contacts in the</span>
                          <button
                            type="button"
                            onClick={() => setFeesSubTab('vendors')}
                            className="text-indigo-600 font-extrabold hover:underline"
                          >
                            Vendors Tab
                          </button>
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Allocated Operation Center *</label>
                        <select
                          id="exp-center"
                          value={newExpCenter}
                          onChange={(e) => setNewExpCenter(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-bold text-slate-800"
                        >
                          {operationalCenters
                            .filter(c => c.type === 'Expenditure' || c.type === 'Dual')
                            .map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Internal Memo Notes</label>
                        <textarea
                          id="exp-notes"
                          rows={2}
                          placeholder="Supporting details, reference numbers..."
                          value={newExpNotes}
                          onChange={(e) => setNewExpNotes(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        id="submit-exp-btn"
                        className="w-full bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Record Cost Log & Schedule Outflow
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Ledger List & Distribution */}
                  <div className="lg:col-span-8 space-y-6 animate-fadeInSmooth">
                    
                    {/* Filter controls */}
                    <div className="bg-white rounded-3xl border border-[#E0D8CC] p-4">
                      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                        
                        {/* Search Bar */}
                        <div className="relative w-full md:w-64">
                          <input
                            type="text"
                            placeholder="Search description/vendor..."
                            value={expSearchQuery}
                            onChange={(e) => setExpSearchQuery(e.target.value)}
                            className="w-full pl-8 pr-4 py-2 text-xs border border-[#E0D8CC] rounded-xl focus:outline-none"
                          />
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#7D6B5D]" />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex flex-wrap gap-1.5 justify-end w-full md:w-auto">
                          {['All', 'Utilities & Rent', 'Food & Kitchen Supplies', 'Stationery & Printing', 'Staff Lunch & Welfare'].map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setSelectedExpCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                selectedExpCategory === cat
                                  ? 'bg-slate-800 border-slate-800 text-amber-400 font-extrabold'
                                  : 'bg-white border-stone-200 text-[#7D6B5D] hover:bg-stone-100'
                              }`}
                            >
                              {cat === 'Food & Kitchen Supplies' ? 'Food & Kitchen' : cat === 'Utilities & Rent' ? 'Utilities' : cat === 'Stationery & Printing' ? 'Stationery' : cat === 'Staff Lunch & Welfare' ? 'Welfare' : cat}
                            </button>
                          ))}
                        </div>

                      </div>
                    </div>

                    {/* Expenditures entries list */}
                    <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#F2EDE4] bg-[#FDFBF7] flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-stone-900">Registered Recurrent Expenses</h4>
                          <p className="text-xs text-[#7D6B5D]">Track cost occurrence and change cleared states.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg">
                            Total: {totalExpenditureSum.toLocaleString()} UGX
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-[#F2EDE4]">
                        {(() => {
                          const filtered = expenditures.filter(exp => {
                            const matchCat = selectedExpCategory === 'All' || exp.category === selectedExpCategory;
                            const matchSearch = (expSearchQuery === '' 
                              || exp.itemName.toLowerCase().includes(expSearchQuery.toLowerCase())
                              || (exp.supplierVendor && exp.supplierVendor.toLowerCase().includes(expSearchQuery.toLowerCase())))
                              && (!searchQuery
                              || exp.itemName.toLowerCase().includes(searchQuery.toLowerCase())
                              || (exp.supplierVendor && exp.supplierVendor.toLowerCase().includes(searchQuery.toLowerCase())));
                            return matchCat && matchSearch;
                          });

                          if (filtered.length === 0) {
                            return (
                              <div className="p-8 text-center text-xs text-[#7D6B5D]">
                                No expenditure logs matched the search criteria. Try modifying your filters.
                              </div>
                            );
                          }

                          return filtered.map((exp) => (
                            <div key={exp.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/50 transition-colors">
                              
                              {/* Left detail side */}
                              <div className="space-y-1 md:max-w-md text-left">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-stone-900 text-sm">{exp.itemName}</span>
                                  <span className="bg-stone-100 text-[#7D6B5D] font-bold text-[9px] px-2 py-0.5 rounded-lg border border-stone-200">
                                    {exp.category}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7D6B5D]">
                                  <span>Logged: <span className="font-mono">{exp.dateAdded}</span></span>
                                  {exp.supplierVendor && (
                                    <>
                                      <span>•</span>
                                      <span>Vendor: <span className="font-bold text-stone-700">{exp.supplierVendor}</span></span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                                    <Clock className="w-3 h-3 text-amber-500" /> {exp.recurrence}
                                  </span>
                                </div>
                                {exp.notes && <p className="text-[11px] text-stone-500 italic mt-1 bg-stone-50 p-2 rounded-lg border border-stone-100">{exp.notes}</p>}
                              </div>

                              {/* Right interactive cost side */}
                              <div className="flex items-center justify-between md:justify-end gap-4 min-w-[200px]">
                                <div className="text-left md:text-right">
                                  <span className="block text-sm font-extrabold font-mono text-[#3D2B1F]">
                                    {exp.amount.toLocaleString()} UGX
                                  </span>
                                  <span className="text-[10px] text-[#7D6B5D] block">Cost Outflow</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Toggle Status badge button */}
                                  <button
                                    onClick={() => handleToggleExpenditureStatus(exp.id)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider uppercase transition-all shadow-3xs cursor-pointer ${
                                      exp.status === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                        : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-[#F2EDE4] animate-pulse'
                                    }`}
                                    title="Click to toggle status"
                                  >
                                    {exp.status === 'Paid' ? 'Paid ✓' : 'Pay Due ⚠'}
                                  </button>

                                  <button
                                    onClick={() => handleDeleteExpenditure(exp.id)}
                                    className="p-2 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                    title="Delete Cost Record"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Cost Distribution Bento Summary Progress Bar List */}
                    <div className="bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4">
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm text-left">Budget Allocation Projections</h4>
                        <p className="text-xs text-[#7D6B5D] text-left">Aggregated costs of recurrent allocations by operational category.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { name: 'Utilities & Rent', color: 'bg-blue-500' },
                          { name: 'Food & Kitchen Supplies', color: 'bg-emerald-500' },
                          { name: 'Stationery & Printing', color: 'bg-purple-500' },
                          { name: 'Staff Lunch & Welfare', color: 'bg-pink-500' },
                          { name: 'Sanitation & Hygiene', color: 'bg-teal-500' },
                          { name: 'Others', color: 'bg-amber-500' }
                        ].map(c => {
                          const totalCatVal = expenditures
                            .filter(e => e.category === c.name || (c.name === 'Others' && !['Utilities & Rent', 'Food & Kitchen Supplies', 'Stationery & Printing', 'Staff Lunch & Welfare', 'Sanitation & Hygiene'].includes(e.category)))
                            .reduce((sum, e) => sum + e.amount, 0);
                          const percentage = totalExpenditureSum > 0 ? Math.round((totalCatVal / totalExpenditureSum) * 100) : 0;

                          return (
                            <div key={c.name} className="space-y-1.5 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/50">
                              <div className="flex justify-between items-center text-xs font-bold text-stone-700">
                                <span>{c.name === 'Food & Kitchen Supplies' ? 'Food & Kitchen' : c.name}</span>
                                <span>{totalCatVal.toLocaleString()} UGX ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                                <div className={`h-full ${c.color} rounded-full`} style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {feesSubTab === 'centers' && (
                /* Operational Income and Expenditure Centers Dashboard */
                <div className="space-y-8 animate-fadeIn">
                  
                  {/* Top bar with quick instructions */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-[#E0D8CC]">
                    <div>
                      <h4 className="text-base font-black text-[#5A3E2B]">KVA Departmental Operational Centers</h4>
                      <p className="text-xs text-[#7D6B5D] mt-0.5">Segment nursery school direct parent payments, sweaters/meals sales, and recurrent cost outlays by operational cost centers.</p>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        onClick={() => {
                          setIsManageCentersOpen(prev => !prev);
                          setIsMiscFormOpen(false);
                        }}
                        className="bg-white hover:bg-stone-50 text-[#8C5A3C] border border-[#8C5A3C] font-black text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Settings className="w-4 h-4" />
                        {isManageCentersOpen ? 'Hide Configuration' : 'Configure Centers'}
                      </button>
                      <button
                        onClick={() => {
                          setNewMiscCenter(operationalCenters[0]?.name || 'Academic Instruction & Tuition');
                          setIsMiscFormOpen(prev => !prev);
                          setIsManageCentersOpen(false);
                        }}
                        className="bg-[#8C5A3C] hover:bg-[#72482f] text-white font-black text-xs py-2.5 px-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        {isMiscFormOpen ? 'Hide Revenue Form' : 'Record Auxiliary Revenue'}
                      </button>
                    </div>
                  </div>

                  {/* Manage Operational Centers panel */}
                  {isManageCentersOpen && (
                    <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] shadow-xs animate-slideDown">
                      <div className="flex justify-between items-center pb-3 border-b border-[#F2EDE4] mb-4">
                        <div>
                          <h5 className="font-extrabold text-base text-[#5A3E2B] flex items-center gap-2">
                             <Settings className="w-5 h-5 text-amber-600" />
                             Operational Centers Configurator
                          </h5>
                          <p className="text-[11px] text-[#7D6B5D] mt-0.5">Add new departmental centers or deallocate optional custom channels.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsManageCentersOpen(false)}
                          className="text-[#7D6B5D] hover:text-stone-900 border border-[#F2EDE4] p-1.5 rounded-xl bg-stone-50 cursor-pointer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Side: Create form */}
                        <form onSubmit={handleAddOperationalCenter} className="lg:col-span-5 bg-[#FDFBF7] p-5 rounded-2xl border border-[#F2EDE4] space-y-4">
                          <h6 className="font-bold text-xs text-[#5A3E2B] uppercase tracking-wider">Create New Operational Center</h6>
                          
                          <div>
                            <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Center Title *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Teacher Welfare & Tea Cupboard"
                              value={newCenterName}
                              onChange={(e) => setNewCenterName(e.target.value)}
                              className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Flow / Budget Type *</label>
                            <select
                              value={newCenterType}
                              onChange={(e) => setNewCenterType(e.target.value as any)}
                              className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white text-stone-800 font-bold"
                            >
                              <option value="Dual">Dual Activity (Accepts both Income & Expenditure)</option>
                              <option value="Income">Income-Only (e.g. Donation Fund, Snack Stall)</option>
                              <option value="Expenditure">Expenditure-Only (e.g. Cook Wages, Toy Chest)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Color Accent / Theme Palette</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                              {(['amber', 'emerald', 'blue', 'purple', 'stone', 'indigo', 'rose', 'yellow'] as const).map(color => (
                                <button
                                  key={color}
                                  type="button"
                                  onClick={() => setNewCenterAccent(color)}
                                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer relative ${
                                    color === 'amber' ? 'bg-amber-400 border-amber-250' :
                                    color === 'emerald' ? 'bg-emerald-400 border-emerald-250' :
                                    color === 'blue' ? 'bg-blue-400 border-blue-200' :
                                    color === 'purple' ? 'bg-purple-400 border-purple-200' :
                                    color === 'stone' ? 'bg-stone-500 border-stone-400' :
                                    color === 'indigo' ? 'bg-indigo-500 border-indigo-400' :
                                    color === 'rose' ? 'bg-rose-500 border-rose-400' :
                                    'bg-yellow-400 border-yellow-350'
                                  } ${newCenterAccent === color ? 'ring-2 ring-[#8C5A3C] scale-110 shadow-sm' : 'hover:scale-105'}`}
                                  title={color}
                                >
                                  {newCenterAccent === color && (
                                    <span className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-black font-sans">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Summary Description *</label>
                            <textarea
                              rows={2}
                              required
                              placeholder="e.g. Operational funds assigned strictly to classroom toy replenishment, play sandbox upkeep..."
                              value={newCenterDescription}
                              onChange={(e) => setNewCenterDescription(e.target.value)}
                              className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white resize-none text-slate-800"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-[#8C5A3C] hover:bg-[#72482f] text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                          >
                            Compile & Save Custom Center
                          </button>
                        </form>

                        {/* Right Side: active list and statistics overview with remove option */}
                        <div className="lg:col-span-7 space-y-4">
                          <h6 className="font-bold text-xs text-[#5A3E2B] uppercase tracking-wider">Active Departmental Channels ({operationalCenters.length})</h6>
                          
                          <div className="divide-y divide-[#F2EDE4] max-h-96 overflow-y-auto border border-[#E0D8CC] rounded-2xl bg-white p-4 space-y-3">
                            {operationalCenters.map((center) => {
                              const stats = getCenterStats(center.name);
                              const isSystemDefault = ['C1', 'C2', 'C3', 'C4', 'C5'].includes(center.id);
                              return (
                                <div key={center.id} className="flex justify-between items-start gap-4 pt-3 first:pt-0">
                                  <div className="space-y-1 bg-white">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className={`w-2.5 h-2.5 rounded-full ${
                                        center.accent === 'amber' ? 'bg-amber-400' :
                                        center.accent === 'emerald' ? 'bg-emerald-400' :
                                        center.accent === 'blue' ? 'bg-blue-400' :
                                        center.accent === 'purple' ? 'bg-purple-400' :
                                        center.accent === 'stone' ? 'bg-stone-500' :
                                        center.accent === 'indigo' ? 'bg-indigo-500' :
                                        center.accent === 'rose' ? 'bg-rose-500' :
                                        'bg-yellow-400'
                                      }`} />
                                      <span className="font-extrabold text-xs text-[#3D2B1F]">{center.name}</span>
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                        center.type === 'Dual' ? 'border-[#E0D8CC] bg-stone-50 text-stone-700' :
                                        center.type === 'Income' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                                        'border-amber-250 bg-amber-50 text-amber-850'
                                      }`}>
                                        {center.type}
                                      </span>
                                      {isSystemDefault && (
                                        <span className="text-[9px] font-bold bg-stone-100 text-[#7D6B5D] px-1.5 rounded-full border border-stone-200">System Core</span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-[#7D6B5D] leading-relaxed max-w-md">{center.description}</p>
                                    <div className="text-[9.5px] text-[#8C5A3C] font-semibold font-mono space-x-2">
                                      <span>Inflows: {stats.totalIn.toLocaleString()} UGX</span>
                                      <span>•</span>
                                      <span>Outflows: {stats.totalOut.toLocaleString()} UGX</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOperationalCenter(center.id)}
                                      className="text-stone-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg border border-transparent hover:border-red-100 transition-colors cursor-pointer"
                                      title={isSystemDefault ? "Remove from live allocations" : "Delete custom center"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Inline Miscellaneous Income form */}
                  {isMiscFormOpen && (
                    <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] shadow-sm max-w-2xl animate-slideDown">
                      <div className="flex justify-between items-center pb-3 border-b border-[#F2EDE4] mb-4">
                        <h5 className="font-bold text-[#5A3E2B]">Record Direct Center Deposit Receipt (Auxiliary Cash Receipt)</h5>
                        <button
                          type="button"
                          onClick={() => setIsMiscFormOpen(false)}
                          className="text-[#7D6B5D] hover:text-stone-900 cursor-pointer"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>

                      <form onSubmit={handleAddMiscIncome} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Receipt Source / Depositor details *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Sweaters sales to Senior Parent, Donation for building materials, field trips contributions"
                            value={newMiscSourceName}
                            onChange={(e) => setNewMiscSourceName(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Classification Category *</label>
                          <select
                            value={newMiscCategory}
                            onChange={(e) => setNewMiscCategory(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-semibold text-stone-700"
                          >
                            <option value="Uniform Sales">Uniform Sales & Sweaters</option>
                            <option value="Transport Fare">Transport Commuter Fare</option>
                            <option value="Donations & Grants">Donations & Alumni Grants</option>
                            <option value="Stationery Sales">Stationery & Book Sales</option>
                            <option value="Other Sales & Services">Other Sales & Services</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Allocated operational Center *</label>
                          <select
                            value={newMiscCenter}
                            onChange={(e) => setNewMiscCenter(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-semibold text-[#8C5A3C]"
                          >
                            {operationalCenters
                              .filter(c => c.type === 'Income' || c.type === 'Dual')
                              .map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))
                            }
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Revenue Deposited (UGX) *</label>
                          <input
                            type="number"
                            required
                            min="1000"
                            step="5000"
                            value={newMiscAmount}
                            onChange={(e) => setNewMiscAmount(Number(e.target.value))}
                            className="w-full text-xs font-bold p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Payment Channel *</label>
                          <select
                            value={newMiscMethod}
                            onChange={(e) => setNewMiscMethod(e.target.value as any)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-semibold text-stone-700"
                          >
                            <option value="Cash">Cash at Admin Desk</option>
                            <option value="Mobile Money">MTN/Airtel Wallet Deposit</option>
                            <option value="Bank Deposit">Direct Stanbic Bank Slip</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Receipt Number Reference</label>
                          <input
                            type="text"
                            placeholder="e.g. MM-REV-8490 (auto-generated if blank)"
                            value={newMiscReceiptNo}
                            onChange={(e) => setNewMiscReceiptNo(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 font-mono"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Memo Notes / Contextual Details</label>
                          <textarea
                            rows={2}
                            placeholder="Describe any other parameters, parent names, or inventory counts..."
                            value={newMiscNotes}
                            onChange={(e) => setNewMiscNotes(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-stone-50 resize-none text-slate-800"
                          />
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsMiscFormOpen(false)}
                            className="text-xs font-bold text-[#7D6B5D] hover:text-stone-900 border border-stone-200 py-2 px-4 rounded-xl cursor-pointer bg-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold text-xs py-2 px-5 rounded-xl cursor-pointer"
                          >
                            Save Direct Revenue Record
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Operational Centers Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {operationalCenters.map(center => {
                      const stats = getCenterStats(center.name);
                      const isFilteringThis = selectedCenterFilter === center.name;
                      const classes = getCenterClasses(center.accent);

                      return (
                        <div
                          key={center.id}
                          onClick={() => {
                            setSelectedCenterFilter(prev => prev === center.name ? null : center.name);
                          }}
                          className={`p-6 rounded-3xl border transition-all cursor-pointer relative group flex flex-col justify-between h-full ${
                            isFilteringThis 
                              ? 'ring-2 ring-amber-500 border-amber-500 scale-[1.02] shadow-md bg-stone-50/90'
                              : 'bg-white shadow-xs'
                          } ${classes.theme}`}
                        >
                          <div className="space-y-4">
                            {/* Card Header */}
                            <div className="flex justify-between items-start gap-2">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${classes.badgeColor}`}>
                                {center.type} Center
                              </span>
                              
                              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                {stats.netSurplus >= 0 ? (
                                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#6B8E23] bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    Surplus
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-[11px] font-extrabold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 rounded-full">
                                    <TrendingDown className="w-3.5 h-3.5" />
                                    Deficit
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Center Title */}
                            <div>
                              <h5 className="font-extrabold text-sm text-[#3D2B1F] group-hover:text-[#5A3E2B] leading-tight flex items-center gap-2">
                                <Building className="w-4 h-4 text-stone-500 whitespace-nowrap shrink-0" />
                                <span className="truncate">{center.name}</span>
                              </h5>
                              <p className="text-[11px] text-[#7D6B5D] mt-1.5 leading-snug">{center.description}</p>
                            </div>

                            <div className="border-t border-dashed border-[#E0D8CC] pt-3 mt-1 space-y-2.5">
                              {/* Income breakout */}
                              <div className="flex justify-between items-end text-xs">
                                <div>
                                  <span className="text-[#7D6B5D] text-[10px] uppercase font-bold block">Assigned Inflows:</span>
                                  <span className="font-extrabold text-[#3D2B1F] block font-mono">
                                    {stats.totalIn.toLocaleString()} <span className="text-[9px] font-normal">UGX</span>
                                  </span>
                                </div>
                                <div className="text-right text-[10px] text-[#7D6B5D] leading-tight font-medium font-mono">
                                  <div>School Fees: {stats.tuitionIn.toLocaleString()}</div>
                                  <div>Aux Revenue: {stats.miscIn.toLocaleString()}</div>
                                </div>
                              </div>

                              {/* Expenditure readout */}
                              <div className="flex justify-between items-center text-xs">
                                <div>
                                  <span className="text-[#7D6B5D] text-[10px] uppercase font-bold block">Assigned Outflows:</span>
                                  <span className="font-bold text-[#8C5A3C] block font-mono">
                                    {stats.totalOut.toLocaleString()} <span className="text-[9px] font-normal">UGX</span>
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[#7D6B5D] text-[10px] uppercase font-bold block">Net Operational Bal:</span>
                                  <span className={`font-black font-mono block text-sm ${stats.netSurplus >= 0 ? 'text-[#6B8E23]' : 'text-red-500'}`}>
                                    {stats.netSurplus >= 0 ? '+' : ''}{stats.netSurplus.toLocaleString()} UGX
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 mt-4 border-t border-stone-100 flex justify-between items-center gap-2">
                            <span className="text-[10px] font-bold text-amber-800">
                              {isFilteringThis ? '✕ Focused Center (Click to clear)' : '☉ Click to focus ledger'}
                            </span>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setNewMiscCenter(center.name);
                                setNewMiscSourceName('');
                                setIsMiscFormOpen(prev => !prev);
                                setIsManageCentersOpen(false);
                              }}
                              className="bg-white hover:bg-[#8C5A3C] hover:text-white border border-stone-350 text-stone-700 font-extrabold text-[10px] py-1 px-2.5 rounded-lg transition-all cursor-pointer shadow-xs"
                            >
                              Record Revenue
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Unified transaction ledger sorted and filtered by selectedCenter */}
                  <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-[#F2EDE4] bg-[#FDFBF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-extrabold text-[#5A3E2B] flex items-center gap-2">
                          <Building className="w-4 h-4 text-amber-600" />
                          Consolidated Departmental Ledger
                        </h4>
                        <p className="text-xs text-[#7D6B5D] mt-0.5">
                          {selectedCenterFilter 
                            ? `Displaying all logged receipts & costs for: "${selectedCenterFilter}"` 
                            : 'All operational receipts & recurrent expenditures combined below.'
                          }
                        </p>
                      </div>

                      {selectedCenterFilter && (
                        <button
                          onClick={() => setSelectedCenterFilter(null)}
                          className="bg-[#E0D8CC] hover:bg-[#c9bfae] text-[#5A3E2B] font-bold text-[10px] py-1.5 px-3 rounded-full transition-colors self-start sm:self-center cursor-pointer"
                        >
                          Clear Filter (Show All Centers)
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-[#F2EDE4]">
                      {/* Construct list of combined transactions */}
                      {(() => {
                        const feeTxs: any[] = [];
                        pupils.forEach(p => {
                          p.installments.forEach(inst => {
                            const instCenter = inst.center || 'Academic Instruction & Tuition';
                            feeTxs.push({
                              id: inst.id,
                              type: 'Tuition Deposit',
                              description: `Tuition Installment receipt — Pupil: ${p.fullName} (${p.classLevel})`,
                              amount: inst.amount,
                              date: inst.date,
                              method: inst.paymentMethod,
                              refNo: inst.receiptNo,
                              center: instCenter,
                              flow: 'Inflow',
                              raw: inst,
                              pupil: p
                            });
                          });
                        });

                        const miscInTxs = miscIncomes.map(mi => ({
                          id: mi.id,
                          type: 'Auxiliary Revenue',
                          description: `${mi.sourceName} [${mi.category}]`,
                          amount: mi.amount,
                          date: mi.dateAdded,
                          method: mi.paymentMethod,
                          refNo: mi.receiptNo,
                          center: mi.center,
                          flow: 'Inflow',
                          raw: mi
                        }));

                        const expTxs = expenditures.map(e => {
                          let eCenter = e.center || 'General Operations & Administration';
                          if (!e.center) {
                            if (e.category === 'Food & Kitchen Supplies' || e.category === 'Staff Lunch & Welfare') {
                              eCenter = 'Porridge Kettle & Kitchen Supplies';
                            } else if (e.category === 'Stationery & Printing') {
                              eCenter = 'Academic Instruction & Tuition';
                            } else if (e.category === 'Fuel & Transport') {
                              eCenter = 'School Van & Boarding Transport';
                            }
                          }

                          return {
                            id: e.id,
                            type: 'Expenditure Cost',
                            description: `${e.itemName} [${e.recurrence}]`,
                            amount: e.amount,
                            date: e.dateAdded,
                            method: 'Cash / Bank Transfer',
                            refNo: e.status === 'Paid' ? 'Cleared ✓' : 'Due/Arrears ⚠',
                            center: eCenter,
                            flow: 'Outflow',
                            status: e.status,
                            raw: e
                          };
                        });

                        // Combine & filter
                        let allTxs = [...feeTxs, ...miscInTxs, ...expTxs];
                        if (selectedCenterFilter) {
                          allTxs = allTxs.filter(tx => tx.center === selectedCenterFilter);
                        }

                        // Sort by date (newest first)
                        allTxs.sort((a,b) => b.date.localeCompare(a.date));

                        if (allTxs.length === 0) {
                          return (
                            <div className="p-12 text-center text-[#7D6B5D] text-xs">
                              <Building className="w-8 h-8 mx-auto text-[#7D6B5D] opacity-40 mb-2.5" />
                              No transactions recorded under this operational center yet.
                            </div>
                          );
                        }

                        return (
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-stone-50 border-b border-[#E0D8CC] text-[#7D6B5D] uppercase tracking-wider text-[10px] font-black">
                                <tr>
                                  <th className="px-6 py-3.5">Posting Date</th>
                                  <th className="px-6 py-3.5">Particulars / Trans Description</th>
                                  <th className="px-6 py-3.5">Assigned Center</th>
                                  <th className="px-6 py-3.5 text-center">Inflow / Outflow</th>
                                  <th className="px-6 py-3.5">Reference Id</th>
                                  <th className="px-6 py-3.5 text-right">Amount (UGX)</th>
                                  <th className="px-6 py-3.5 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F2EDE4]">
                                {allTxs.map((tx) => {
                                  const isInflow = tx.flow === 'Inflow';
                                  return (
                                    <tr key={`${tx.id}-${tx.type}`} className="hover:bg-amber-50/10 transition-all">
                                      <td className="px-6 py-4 font-mono font-medium text-[#3D2B1F] whitespace-nowrap">{tx.date}</td>
                                      <td className="px-6 py-4">
                                        <div className="font-extrabold text-[#3D2B1F]">{tx.description}</div>
                                        <div className="text-[10px] text-[#7D6B5D] font-bold">{tx.type}</div>
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-extrabold text-[10px] bg-stone-100 text-stone-700 py-1 px-2.5 rounded-full border border-stone-200">
                                          {tx.center}
                                        </span>
                                      </td>
                                      <td className="px-6 py-4 text-center whitespace-nowrap">
                                        {isInflow ? (
                                          <span className="text-[9px] font-black uppercase text-[#6B8E23] bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full">
                                            + INCOME IN
                                          </span>
                                        ) : (
                                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 border rounded-full ${
                                            tx.status === 'Paid' 
                                              ? 'text-[#8C5A3C] bg-amber-50 border-amber-200' 
                                              : 'text-red-600 bg-red-50 border-red-200'
                                          }`}>
                                            - OUTLAY COST {tx.status === 'Pending' ? '(Arrears)' : ''}
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-bold text-stone-700">{tx.method}</div>
                                        <div className="font-mono text-[9px] text-[#7D6B5D]">{tx.refNo}</div>
                                      </td>
                                      <td className={`px-6 py-4 text-right font-mono font-black whitespace-nowrap text-xs ${
                                        isInflow ? 'text-[#6B8E23]' : 'text-stone-700'
                                      }`}>
                                        {isInflow ? '+' : '-'}{tx.amount.toLocaleString()} <span className="font-normal text-[9px]">UGX</span>
                                      </td>
                                      <td className="px-6 py-4 text-right whitespace-nowrap">
                                        {tx.type === 'Auxiliary Revenue' && (
                                          <button
                                            type="button"
                                            id={`del-misc-${tx.id}`}
                                            onClick={() => handleDeleteMiscIncome(tx.id)}
                                            className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                                          >
                                            Delete Receipt
                                          </button>
                                        )}
                                        {tx.type === 'Expenditure Cost' && (
                                          <button
                                            type="button"
                                            id={`del-exp-${tx.id}`}
                                            onClick={() => handleDeleteExpenditure(tx.id)}
                                            className="text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
                                          >
                                            Delete Cost Record
                                          </button>
                                        )}
                                        {tx.type === 'Tuition Deposit' && (
                                          <span className="text-[#7D6B5D] font-bold text-[9px]">Pupil Ledger Row</span>
                                        )}
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                </div>
              )}

              {feesSubTab === 'vendors' && (
                /* Suppliers and Vendors Management Panel */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn text-left">
                  
                  {/* Left Column: Register/Edit Vendor Form */}
                  <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4 shadow-3xs">
                    <div className="border-b border-[#F2EDE4] pb-3">
                      <h4 className="text-base font-extrabold text-[#5A3E2B] flex items-center gap-1.5">
                        {editingVendorId ? (
                          <>
                            <Edit className="w-4.5 h-4.5 text-amber-600" />
                            <span>Modify Vendor Details</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-4.5 h-4.5 text-indigo-600" />
                            <span>Register New Vendor</span>
                          </>
                        )}
                      </h4>
                      <p className="text-[11px] text-[#7D6B5D] mt-1 space-y-2">
                        <span>{editingVendorId 
                          ? "Amend contact person, telephone number, and physical store details for this business."
                          : "Save vendor profiles to assign them directly to classroom, shuttle, or kitchen expenses."}</span>
                      </p>
                    </div>

                    <form onSubmit={handleAddVendor} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Company / Business Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Kitemu Millers & Traders"
                          value={newVendorName}
                          onChange={(e) => setNewVendorName(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Contact Person Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Haji Bukenya Swaib"
                          value={newVendorContactPerson}
                          onChange={(e) => setNewVendorContactPerson(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Phone Number</label>
                          <input
                            type="text"
                            placeholder="e.g. +256 772 990112"
                            value={newVendorPhone}
                            onChange={(e) => setNewVendorPhone(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none font-mono font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Email Address</label>
                          <input
                            type="email"
                            placeholder="e.g. sales@kitemu.ug"
                            value={newVendorEmail}
                            onChange={(e) => setNewVendorEmail(e.target.value)}
                            className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Business Store Address</label>
                        <input
                          type="text"
                          placeholder="e.g. Masaka Road, Kitemu Trading Center"
                          value={newVendorAddress}
                          onChange={(e) => setNewVendorAddress(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1 tracking-wider">Partnership Notes & Terms</label>
                        <textarea
                          rows={3}
                          placeholder="Payment term cycles, bank accounts, or specialty rates details..."
                          value={newVendorNotes}
                          onChange={(e) => setNewVendorNotes(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white resize-none focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2.5 pb-1">
                        <button
                          type="submit"
                          className={`flex-1 text-white py-3 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all ${
                            editingVendorId 
                              ? 'bg-amber-600 hover:bg-amber-700' 
                              : 'bg-[#6B8E23] hover:bg-[#58751d]'
                          }`}
                        >
                          {editingVendorId ? 'Update Vendor Card' : 'Register business Partner'}
                        </button>
                        
                        {editingVendorId && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVendorId(null);
                              setNewVendorName('');
                              setNewVendorContactPerson('');
                              setNewVendorPhone('');
                              setNewVendorEmail('');
                              setNewVendorAddress('');
                              setNewVendorNotes('');
                            }}
                            className="bg-[#F5F5F4] hover:bg-[#EAE6DF] text-stone-700 font-bold text-xs px-4 py-3 rounded-xl border border-[#E0D8CC] cursor-pointer transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Suppliers Registry List */}
                  <div className="lg:col-span-8 space-y-6">
                    
                    {/* Filter Card / Search */}
                    <div className="bg-white rounded-3xl border border-[#E0D8CC] p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="w-full sm:w-80 relative">
                        <input
                          type="text"
                          placeholder="Search partners by name, contacts, phone..."
                          value={vendorSearchQuery}
                          onChange={(e) => setVendorSearchQuery(e.target.value)}
                          className="w-full text-xs pl-8 pr-4 py-2.5 bg-[#FDFBF7] border border-[#E0D8CC] rounded-xl focus:outline-none text-[#3D2B1F]"
                        />
                        <span className="absolute left-3 top-3 text-stone-400">🔍</span>
                      </div>

                      <div className="text-right whitespace-nowrap">
                        <span className="text-xs text-[#7D6B5D] font-bold">Total Registered Suppliers: </span>
                        <span className="text-sm font-black text-indigo-700">{vendors.length} Vendors</span>
                      </div>
                    </div>

                    {/* Vendors List Display */}
                    <div className="space-y-4">
                      {vendors.filter(v => {
                        const q = vendorSearchQuery.toLowerCase();
                        return (
                          v.name.toLowerCase().includes(q) ||
                          (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
                          (v.phone && v.phone.toLowerCase().includes(q)) ||
                          (v.address && v.address.toLowerCase().includes(q))
                        );
                      }).length === 0 ? (
                        <div className="bg-white rounded-3xl border border-[#E0D8CC] p-12 text-center text-[#7D6B5D] text-xs">
                          <Users className="w-10 h-10 mx-auto text-indigo-300 opacity-60 mb-3" />
                          No registered suppliers match your active search terms.
                        </div>
                      ) : (
                        vendors.filter(v => {
                          const q = vendorSearchQuery.toLowerCase();
                          return (
                            v.name.toLowerCase().includes(q) ||
                            (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
                            (v.phone && v.phone.toLowerCase().includes(q)) ||
                            (v.address && v.address.toLowerCase().includes(q))
                          );
                        }).map((v) => {
                          // Calculate total spent with this vendor
                          const relevantExps = expenditures.filter(e => e.supplierVendor?.toLowerCase() === v.name.toLowerCase());
                          const totalVendorSpent = relevantExps.reduce((sum, e) => sum + e.amount, 0);
                          const clearedSpent = relevantExps.filter(e => e.status === 'Paid').reduce((sum, e) => sum + e.amount, 0);
                          const pendingSpent = relevantExps.filter(e => e.status === 'Pending').reduce((sum, e) => sum + e.amount, 0);

                          return (
                            <div key={v.id} className="bg-white rounded-3xl border border-[#E0D8CC] p-5 hover:border-indigo-400/50 transition-all shadow-3xs flex flex-col md:flex-row gap-5 justify-between">
                              
                              {/* Left Info side */}
                              <div className="space-y-3 tflex-1">
                                <div className="flex items-start gap-3">
                                  {/* Vendor avatar logo */}
                                  <div className="w-10 h-10 rounded-2xl bg-[#FDFBF7] border border-[#E0D8CC] flex items-center justify-center shrink-0">
                                    <span className="text-[#8C5A3C] font-black text-xs">
                                      {v.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-extrabold text-stone-900">{v.name}</h4>
                                    {v.contactPerson && (
                                      <p className="text-xs text-[#7D6B5D] font-extrabold mt-0.5 flex items-center gap-1">
                                        👤 Representative Contact: <span className="text-indigo-700">{v.contactPerson}</span>
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Contact Details Badges */}
                                <div className="flex flex-wrap gap-2 text-[10.5px]">
                                  {v.phone && (
                                    <span className="bg-[#FFFDF9] text-stone-700 border border-[#F2EDE4] rounded-lg px-2.5 py-1 font-mono flex items-center gap-1.5 shadow-3xs">
                                      📞 {v.phone}
                                    </span>
                                  )}
                                  {v.email && (
                                    <span className="bg-[#FFFDF9] text-stone-700 border border-[#F2EDE4] rounded-lg px-2.5 py-1 font-mono flex items-center gap-1.5 shadow-3xs">
                                      ✉ {v.email}
                                    </span>
                                  )}
                                  {v.address && (
                                    <span className="bg-stone-50 text-stone-600 border border-[#E0D8CC] rounded-lg px-2.5 py-1 flex items-center gap-1.5 shadow-3xs">
                                      📍 {v.address}
                                    </span>
                                  )}
                                </div>

                                {v.notes && (
                                  <p className="text-xs text-stone-600 italic bg-stone-50/50 py-2 px-3 rounded-xl border border-[#F2EDE4]/70 max-w-xl">
                                    {v.notes}
                                  </p>
                                )}
                              </div>

                              {/* Right financial + actions side */}
                              <div className="flex flex-row md:flex-col justify-between items-end md:text-right border-t md:border-t-0 border-[#F2EDE4] pt-3 md:pt-0 gap-3 md:min-w-[190px]">
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-black tracking-wider uppercase text-slate-500">Expenditure Logs</span>
                                  <span className="block text-xs font-extrabold text-[#3D2B1F] font-mono">
                                    {totalVendorSpent.toLocaleString()} UGX Total
                                  </span>
                                  <div className="flex items-center gap-1 text-[9.5px]">
                                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">
                                      {clearedSpent.toLocaleString()} Paid
                                    </span>
                                    {pendingSpent > 0 && (
                                      <span className="text-rose-700 font-bold bg-rose-50 px-1 py-0.5 rounded border border-rose-100 animate-pulse">
                                        {pendingSpent.toLocaleString()} Due
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => handleEditVendor(v)}
                                    title="Edit Vendor profiles & Contacts"
                                    className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow-3xs"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteVendor(v.id)}
                                    title="Exclusion of partner"
                                    className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg border border-rose-200 text-[10px] transition-all cursor-pointer shadow-3xs"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                </div>
              )}

              {/* Payment Receipt Modal */}
              {payingPupil && (
                <div id="payment-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#E0D8CC]">
                    
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E0D8CC]">
                      <h4 className="text-base font-extrabold text-[#5A3E2B] flex items-center gap-2">
                        <Coins className="text-[#6B8E23]" /> Add Deposit Receipt for {payingPupil.fullName}
                      </h4>
                      <button onClick={() => setPayingPupil(null)} className="p-1 hover:bg-[#F2EDE4] rounded-lg">
                        <XCircle className="w-5 h-5 text-[#7D6B5D]" />
                      </button>
                    </div>

                    <form onSubmit={handleAddPayment} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Installment Amount (UGX) *</label>
                        <input 
                          id="payment-amount"
                          type="number"
                          step="5000"
                          min="5000"
                          required
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="w-full text-sm font-bold text-[#3D2B1F] p-2 border border-[#E0D8CC] rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Payment Method Channel *</label>
                        <select 
                          id="payment-method"
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white font-semibold"
                        >
                          <option value="Mobile Money">Mobile Money (Airtel / MTN MoMo Pay)</option>
                          <option value="Bank Slip">Stanbic or Centenary Bank Slip</option>
                          <option value="Cash">Cash at Administration Desk</option>
                          <option value="Agent Banking">Agent Banking (Equity Duuka, CenteAgent)</option>
                          <option value="Equity Bank">Equity Bank (Direct Branch / Agent Deposit)</option>
                          <option value="DFCU Bank">DFCU Bank (Direct Branch / Agent Deposit)</option>
                          <option value="School Pay">School Pay (Electronic SchoolPay Code)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Receipt reference Number</label>
                        <input 
                          id="payment-receipt"
                          type="text"
                          required
                          placeholder="e.g. MM-2026-0831"
                          value={paymentReceipt}
                          onChange={(e) => setPaymentReceipt(e.target.value)}
                          className="w-full text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Allocate to Treasury Center *</label>
                        <select 
                          id="payment-center"
                          value={paymentCenter}
                          onChange={(e) => setPaymentCenter(e.target.value)}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-lg bg-white font-bold text-stone-800"
                        >
                          {operationalCenters
                            .filter(c => c.type === 'Income' || c.type === 'Dual')
                            .map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Notes / Banking details</label>
                        <textarea 
                          id="payment-notes"
                          placeholder="Write auxiliary notes such as bank teller name or depositor name"
                          value={paymentNotes}
                          onChange={(e) => setPaymentNotes(e.target.value)}
                          className="w-full h-18 text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8CC]">
                        <button
                          type="button"
                          onClick={() => setPayingPupil(null)}
                          className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-[#F2EDE4]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          id="save-payment-btn"
                          className="px-5 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                        >
                          Acknowledge & Record Deposit
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Edit Payment Installment Modal */}
              {editingInstallment && editingPupilForInstallment && (
                <div id="edit-payment-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-xl border border-[#E0D8CC]">
                    
                    <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#E0D8CC]">
                      <h4 className="text-base font-extrabold text-[#5A3E2B] flex items-center gap-2">
                        <Edit className="text-amber-500 w-5 h-5" /> Edit Deposit Receipt for {editingPupilForInstallment.fullName}
                      </h4>
                      <button onClick={() => { setEditingInstallment(null); setEditingPupilForInstallment(null); }} className="p-1 hover:bg-[#F2EDE4] rounded-lg">
                        <XCircle className="w-5 h-5 text-[#7D6B5D]" />
                      </button>
                    </div>

                    <form onSubmit={handleSaveEditedInstallment} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Installment Amount (UGX) *</label>
                        <input 
                          id="edit-payment-amount"
                          type="number"
                          step="5000"
                          min="0"
                          required
                          value={editingInstallment.amount}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, amount: Number(e.target.value) })}
                          className="w-full text-sm font-bold text-[#3D2B1F] p-2 border border-[#E0D8CC] rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Payment Method Channel *</label>
                        <select 
                          id="edit-payment-method"
                          value={editingInstallment.paymentMethod}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, paymentMethod: e.target.value as any })}
                          className="w-full text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white font-semibold"
                        >
                          <option value="Mobile Money">Mobile Money (Airtel / MTN MoMo Pay)</option>
                          <option value="Bank Slip">Stanbic or Centenary Bank Slip</option>
                          <option value="Cash">Cash at Administration Desk</option>
                          <option value="Agent Banking">Agent Banking (Equity Duuka, CenteAgent)</option>
                          <option value="Equity Bank">Equity Bank (Direct Branch / Agent Deposit)</option>
                          <option value="DFCU Bank">DFCU Bank (Direct Branch / Agent Deposit)</option>
                          <option value="School Pay">School Pay (Electronic SchoolPay Code)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Receipt reference Number *</label>
                        <input 
                          id="edit-payment-receipt"
                          type="text"
                          required
                          placeholder="e.g. MM-2026-0831"
                          value={editingInstallment.receiptNo}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, receiptNo: e.target.value })}
                          className="w-full text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Payment Date *</label>
                        <input 
                          id="edit-payment-date"
                          type="date"
                          required
                          value={editingInstallment.date}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, date: e.target.value })}
                          className="w-full text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Allocate to Treasury Center *</label>
                        <select 
                          id="edit-payment-center"
                          value={editingInstallment.center}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, center: e.target.value })}
                          className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-lg bg-white font-bold text-stone-800"
                        >
                          {operationalCenters
                            .filter(c => c.type === 'Income' || c.type === 'Dual')
                            .map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))
                          }
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#7D6B5D] uppercase mb-1">Notes / Banking details</label>
                        <textarea 
                          id="edit-payment-notes"
                          placeholder="Write auxiliary notes such as bank teller name or depositor name"
                          value={editingInstallment.notes || ''}
                          onChange={(e) => setEditingInstallment({ ...editingInstallment, notes: e.target.value })}
                          className="w-full h-18 text-xs p-2 border border-[#E0D8CC] rounded-lg bg-white"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-[#E0D8CC]">
                        <button
                          type="button"
                          onClick={() => { setEditingInstallment(null); setEditingPupilForInstallment(null); }}
                          className="px-4 py-2 border border-[#E0D8CC] rounded-full text-xs text-[#7D6B5D] hover:bg-[#F2EDE4]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          id="edit-save-payment-btn"
                          className="px-5 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-bold rounded-full text-xs transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 5: KVA MEALS AND HEALTHY BAY */}
          {activeTab === 'meals' && (
            <div className="space-y-6">
              
              {/* Nested Sub-Tab Navigation */}
              <div className="flex border-b border-[#E0D8CC] gap-2 pt-1 pb-px">
                <button
                  id="btn-subtab-meals"
                  type="button"
                  onClick={() => setMealsSubTab('meals')}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    mealsSubTab === 'meals'
                      ? 'border-[#8C5A3C] text-[#5A3E2B]'
                      : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
                  }`}
                >
                  🍲 KVA Meals Schedule
                </button>
                <button
                  id="btn-subtab-sickbay"
                  type="button"
                  onClick={() => setMealsSubTab('sickbay')}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    mealsSubTab === 'sickbay'
                      ? 'border-[#8C5A3C] text-[#5A3E2B]'
                      : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
                  }`}
                >
                  🏥 Healthy Bay & Sickbay Log
                </button>
              </div>

              {mealsSubTab === 'meals' ? (
                /* MEALS SCHEDULE MANAGEMENT */
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* BENTO STAT BARS for KVA Meals */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <Soup className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Total Scheduled Meals</span>
                        <span className="text-xl font-black text-[#3D2B1F]">{porridgeSchedule.length} Items</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-sky-50 rounded-xl text-sky-600">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Unique Food Options</span>
                        <span className="text-xl font-black text-[#3D2B1F]">
                          {new Set(porridgeSchedule.map(p => p.type.toLowerCase())).size} Varieties
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <Apple className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Accompaniment Snacks</span>
                        <span className="text-xl font-black text-[#3D2B1F]">
                          {new Set(porridgeSchedule.filter(p => p.snack && p.snack.toLowerCase() !== 'none').map(p => p.snack.toLowerCase())).size} Types
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* MEALS BENTO CONTAINER */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Weekly list table */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="px-6 py-4 border-b border-[#F2EDE4] bg-[#FDFBF7] flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-[#5A3E2B] flex items-center gap-1.5">
                              <Soup className="w-5 h-5 text-[#8C5A3C]" /> KVA Weekly Meals Schedule
                            </h3>
                            <p className="text-xs text-[#7D6B5D]">Configure morning breakfast beverages, nursery lunch menus, and snack rotations.</p>
                          </div>
                          <span className="bg-[#8C5A3C] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-black">
                            Nutrition & Welfare
                          </span>
                        </div>

                        <div className="p-6 space-y-4">
                          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                            {porridgeSchedule.length === 0 ? (
                              <div className="text-center py-12 bg-[#FDFBF7] rounded-3xl border border-dashed border-[#E0D8CC]">
                                <Soup className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 font-bold">No meals configured in the schedule.</p>
                              </div>
                            ) : (
                              porridgeSchedule.map((meal, idx) => (
                                <div key={idx} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-sky-200 transition-colors text-left">
                                  <div className="flex items-center gap-4 w-full">
                                    <div className="bg-[#F2EDE4] text-[#5A3E2B] text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl min-w-[110px] text-center border border-[#E0D8CC]">
                                      {meal.day}
                                    </div>
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono text-stone-500 font-extrabold bg-[#E0D8CC]/30 px-2 py-0.5 rounded-md">{meal.time}</span>
                                      </div>
                                      <span className="block text-sm font-black text-[#5A3E2B] tracking-tight mt-1">{meal.type}</span>
                                      {meal.snack && meal.snack.toLowerCase() !== 'none' && (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#6B8E23] bg-[#E8F1D7] px-2 py-0.5 rounded-full mt-1.5 border border-[#D5E6B8]">
                                          🍌 Support Snack: {meal.snack}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex gap-2 shrink-0 self-end sm:self-center">
                                    <button
                                      type="button"
                                      onClick={() => handleEditMealClick(idx)}
                                      className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl transition-colors border border-amber-200 cursor-pointer"
                                      title="Edit Meal"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteMeal(idx)}
                                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                                      title="Delete Meal"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#F2EDE4] p-4 text-xs font-bold text-[#7D6B5D] text-center rounded-b-3xl">
                        * All meals are audited for nutritional quality in compliance with Uganda National ECD policy guidelines.
                      </div>
                    </div>

                    {/* Right Column: Add / Edit Meal Form */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4 text-left">
                        <div className="border-b border-[#F2EDE4] pb-3">
                          <h3 className="font-extrabold text-[#5A3E2B] text-sm uppercase tracking-wider flex items-center gap-1.5">
                            <Plus className="w-4 h-4 text-[#8C5A3C]" /> {editingMealIndex !== null ? 'Modify KVA Meal' : 'Add KVA Meal'}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">Define days, times, and beverage/meal types with direct snacks.</p>
                        </div>

                        <form onSubmit={handleSaveMeal} className="space-y-4 text-left">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Day of Week</label>
                            <select
                              value={newMealDay}
                              onChange={(e) => setNewMealDay(e.target.value as any)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C] font-semibold text-stone-800"
                            >
                              <option value="Monday">Monday</option>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                              <option value="Thursday">Thursday</option>
                              <option value="Friday">Friday</option>
                              <option value="Saturday">Saturday</option>
                              <option value="Sunday">Sunday</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Serving Time</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 10:00 AM or 12:30 PM"
                              value={newMealTime}
                              onChange={(e) => setNewMealTime(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Meal / Beverage Type</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Soya Porridge, Milk Porridge, Posho & Beans"
                              value={newMealType}
                              onChange={(e) => setNewMealType(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Snack Accompaniment</label>
                            <input
                              type="text"
                              placeholder="e.g. Bananas, Pancakes (Kabalagala), or None"
                              value={newMealSnack}
                              onChange={(e) => setNewMealSnack(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="submit"
                              className="flex-1 bg-[#8C5A3C] hover:bg-[#72482e] text-white py-3 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-colors mt-2"
                            >
                              {editingMealIndex !== null ? 'Update Meal Item' : 'Add Meal to Schedule'}
                            </button>
                            {editingMealIndex !== null && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMealIndex(null);
                                  setNewMealType('');
                                  setNewMealSnack('');
                                  setNewMealDay('Monday');
                                  setNewMealTime('10:00 AM');
                                }}
                                className="bg-[#F5F5F4] hover:bg-stone-200 text-stone-700 font-bold text-xs px-4 py-3 rounded-xl border border-[#E0D8CC] mt-2 cursor-pointer transition-colors"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-3xl space-y-2 text-left">
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest block">DIET & HEALTH PRACTICE</span>
                        <p className="text-[11px] leading-normal font-semibold">
                          Nutrition is critical to early cognitive development. Ensure seasonal fresh fruits (watermelon or banana slices) are distributed during morning snack.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* SICKBAY INCIDENT LOGS */
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Healthy Bay Metric Banner Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-red-50 rounded-xl text-red-500">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Total Recorded Incidents</span>
                        <span className="text-xl font-black text-[#3D2B1F]">{sickbayLogs.length} Cases</span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                        <Check className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Parents Dispatched info</span>
                        <span className="text-xl font-black text-[#3D2B1F]">
                          {sickbayLogs.filter(log => !!notifiedLogIds[log.id]).length} Notified
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E0D8CC] flex items-center gap-4 shadow-3xs">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold text-[#7D6B5D] uppercase tracking-wider">Unfinished action alerts</span>
                        <span className="text-xl font-black text-[#3D2B1F]">
                          {sickbayLogs.filter(log => !notifiedLogIds[log.id]).length} Pending Notify
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Sickbay logs panel */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Side: Healthy Bay & Sickbay Log */}
                    <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden flex flex-col justify-between">
                      <div>
                        <div className="px-6 py-4 border-b border-[#F2EDE4] bg-[#FDFBF7] flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-[#5A3E2B] flex items-center gap-1.5">
                              <Heart className="w-5 h-5 text-[#8C5A3C]" /> Healthy Bay & Sickbay Log
                            </h3>
                            <p className="text-xs text-[#7D6B5D]">Track child temperature checks, playground injuries, and medication logs.</p>
                          </div>
                          <span className="bg-[#8C5A3C] text-white text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-black">
                            Active Monitoring
                          </span>
                        </div>

                        <div className="p-6 space-y-4">
                          {/* Sickbay logs display list */}
                          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                            {sickbayLogs.length === 0 ? (
                              <div className="text-center py-12 bg-[#FDFBF7] rounded-3xl border border-dashed border-[#E0D8CC]">
                                <Heart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 font-bold">No active sickbay incidents registered today.</p>
                              </div>
                            ) : (
                              sickbayLogs.filter(log => !searchQuery || log.pupilName.toLowerCase().includes(searchQuery.toLowerCase()) || log.issue.toLowerCase().includes(searchQuery.toLowerCase()) || log.action.toLowerCase().includes(searchQuery.toLowerCase())).map((log) => {
                                const hasNotification = !!notifiedLogIds[log.id];
                                const notificationInfo = notifiedLogIds[log.id];
                                const matchedPupil = pupils.find(p => p.fullName.toLowerCase() === log.pupilName.toLowerCase());

                                return (
                                  <div key={log.id} className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#E0D8CC]/80 text-xs space-y-3 text-left hover:border-sky-200 transition-colors">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="text-sm font-black text-[#5A3E2B] tracking-tight">{log.pupilName}</span>
                                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{log.date}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleEditSickbayLog(log)}
                                          className="p-1 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-extrabold rounded-lg border border-amber-200 text-[9.5px] transition-colors cursor-pointer flex items-center gap-0.5"
                                          title="Edit Incident"
                                        >
                                          <Edit className="w-2.5 h-2.5" /> Edit
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteSickbayLog(log.id)}
                                          className="p-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold rounded-lg border border-rose-200 text-[9.5px] transition-colors cursor-pointer flex items-center gap-0.5"
                                          title="Delete Incident"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" /> Del
                                        </button>
                                        <span className="bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 text-[10px] font-bold hidden sm:inline-block">
                                          ECD Medical Support
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-white/70 p-3 rounded-xl border border-[#F2EDE4]">
                                      <div>
                                        <span className="block text-[9px] font-black text-[#7D6B5D] uppercase tracking-wider">Symptoms / Complaint</span>
                                        <p className="text-slate-800 font-bold mt-0.5">{log.issue}</p>
                                      </div>
                                      <div>
                                        <span className="block text-[9px] font-black text-[#7D6B5D] uppercase tracking-wider">Action Administered</span>
                                        <p className="text-[#6B8E23] font-black mt-0.5">{log.action}</p>
                                      </div>
                                    </div>

                                    {/* Notification state badges and Notify Guardian CTA */}
                                    <div className="pt-2 border-t border-dashed border-[#E0D8CC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                      {hasNotification ? (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 text-[9.5px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
                                            <Check className="w-2.5 h-2.5" /> Dispatched via {notificationInfo?.channel} ({notificationInfo?.phone})
                                          </span>
                                          {notificationInfo?.amount && (
                                            <span className="block text-[9.5px] text-[#6B8E23] font-bold font-mono">
                                              ✓ Paid {notificationInfo.amount.toLocaleString()} UGX via {notificationInfo.provider} MoMo (Ref: {notificationInfo.txRef})
                                            </span>
                                          )}
                                        </div>
                                      ) : (
                                        <span className="text-[10px] text-[#7D6B5D] italic">
                                          {matchedPupil ? `Guardian Contact: ${matchedPupil.guardianPhone} (${matchedPupil.guardianName})` : "Guardian contact unmapped"}
                                        </span>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setNotifyingSickLog(log);
                                          setOverrideGuardianName(matchedPupil ? matchedPupil.guardianName : '');
                                          setOverrideGuardianPhone(matchedPupil ? matchedPupil.guardianPhone : '');
                                          setMobileMoneyNumber(matchedPupil ? matchedPupil.guardianPhone : '');
                                          setTreatmentFeeAmount(15000);
                                          setPaymentStatus('idle');
                                          setSimulatedPayerPin('');
                                          setMobileMoneyProvider('MTN');
                                          setSimulationStep('details');
                                        }}
                                        className={`px-4 py-1.5 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                          hasNotification 
                                            ? 'border border-[#E0D8CC] text-[#7D6B5D] hover:bg-[#F2EDE4]/30' 
                                            : 'bg-[#6B8E23] hover:bg-[#58751d] text-white shadow-3xs'
                                        }`}
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        {hasNotification ? 'Notify Again / Update' : 'Notify Guardian'}
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#F2EDE4] p-4 text-xs font-bold text-[#7D6B5D] text-center rounded-b-3xl">
                        * The school healthy bay practices strict Uganda MOH guidance on kids hygiene and safety.
                      </div>
                    </div>

                    {/* Right Side: Log Incident Form */}
                    <div className="lg:col-span-4 space-y-6">
                      <div className="bg-white rounded-3xl border border-[#E0D8CC] p-6 space-y-4">
                        <div className="border-b border-[#F2EDE4] pb-3">
                          <h3 className="font-extrabold text-[#5A3E2B] text-sm uppercase tracking-wider flex items-center gap-1.5">
                            {editingSickbayLogId ? (
                              <>
                                <Edit className="w-4 h-4 text-amber-600" /> Modify Medical Incident
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 text-[#8C5A3C]" /> Record Medical Incident
                              </>
                            )}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {editingSickbayLogId 
                              ? "Edit the registered values below to update the child's active medical details."
                              : "Log immediate health complaints to generate real-time parent alerts."}
                          </p>
                        </div>

                        {/* Add / Edit log form */}
                        <form onSubmit={handleAddSickbayLog} className="space-y-4 text-left">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Pupil Full Name</label>
                            <input 
                              id="sick-name"
                              type="text" 
                              required
                              placeholder="e.g. Babirye Shifra" 
                              value={newSickName}
                              onChange={(e) => setNewSickName(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Symptoms / Injury Complaint</label>
                            <input 
                              id="sick-issue"
                              type="text" 
                              required
                              placeholder="e.g. Slight fever or playground scrape" 
                              value={newSickIssue}
                              onChange={(e) => setNewSickIssue(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-[#7D6B5D] tracking-wider">Action Initiated by Caregiver</label>
                            <textarea 
                              id="sick-action"
                              required
                              rows={3}
                              placeholder="e.g. Temp took 37.9C. Administered wet towel compress and Panadol syrup." 
                              value={newSickAction}
                              onChange={(e) => setNewSickAction(e.target.value)}
                              className="w-full p-3 border border-[#E0D8CC] rounded-xl text-xs bg-[#FDFBF7] focus:outline-none focus:border-[#8C5A3C]"
                            />
                          </div>

                          <div className="flex gap-2.5">
                            <button 
                              type="submit"
                              id="submit-sick-log"
                              className={`flex-1 text-white py-3 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-colors mt-2 ${
                                editingSickbayLogId 
                                  ? 'bg-amber-600 hover:bg-amber-700' 
                                  : 'bg-[#8C5A3C] hover:bg-[#72482e]'
                              }`}
                            >
                              {editingSickbayLogId ? 'Update Incident Details' : 'Register Medical Incident Form'}
                            </button>
                            {editingSickbayLogId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSickbayLogId(null);
                                  setNewSickName('');
                                  setNewSickIssue('');
                                  setNewSickAction('');
                                }}
                                className="bg-[#F5F5F4] hover:bg-stone-200 text-stone-700 font-bold text-xs px-4 py-3 rounded-xl border border-[#E0D8CC] mt-2 cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </form>
                      </div>

                      {/* Healthy Bay Advisory Card */}
                      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-2 text-left">
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block">EMERGENCY PROTOCOL</span>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          For spikes in fever (above 38.5°C) or severe playground fractures, immediately contact **KVA Principal caregiver** and the emergency clinic hotline *+256-782-XXXXXX*.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 6: STAFF MEMBERS DIRECTORY */}
          {activeTab === 'staff' && (
            <div className="space-y-6 animate-fade-in" id="staff-editor-anchor">
              {showStaffExcelImport && (
                <ExcelImporter 
                  type="staff"
                  onImportCompleted={(importedStaffList) => {
                    const nextStaffList = [...staff];
                    importedStaffList.forEach((s, ix) => {
                      const nextId = `S_IMP_${Date.now()}_${ix}`;
                      nextStaffList.push({ ...s, id: nextId });
                    });
                    setStaff(nextStaffList);
                  }}
                  onClose={() => setShowStaffExcelImport(false)}
                />
              )}
              
              {/* Nested Sub-Tab Navigation */}
              <div className="flex border-b border-[#E0D8CC] gap-2 pt-1 pb-px">
                <button
                  id="btn-subtab-directory"
                  type="button"
                  onClick={() => setStaffSubTab('directory')}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                    staffSubTab === 'directory'
                      ? 'border-[#8C5A3C] text-[#5A3E2B]'
                      : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
                  }`}
                >
                  🏫 Staff Directory
                </button>
                <button
                  id="btn-subtab-payroll"
                  type="button"
                  onClick={() => setStaffSubTab('payroll')}
                  className={`px-5 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    staffSubTab === 'payroll'
                      ? 'border-[#8C5A3C] text-[#5A3E2B]'
                      : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
                  }`}
                >
                  💰 Interactive Payroll Ledger & Pay Slips
                </button>
              </div>

              {staffSubTab === 'directory' ? (
                <>
                  <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-bold text-[#5A3E2B] text-lg mb-1">Nursery Administrative Staff & Caretakers</h3>
                  <p className="text-xs text-[#7D6B5D] leading-relaxed">
                    Our classroom sizes are guarded under specialized Early Childhood Caretakers. Salaries are paid termly using local school budget frameworks.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1 border border-[#E0D8CC] p-1 rounded-2xl bg-[#FAF8F5] shrink-0" id="staff-view-mode-selector">
                    <button
                      type="button"
                      id="staff-view-lists-btn"
                      title="Lists View"
                      onClick={() => setStaffViewStyle('lists')}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        staffViewStyle === 'lists'
                          ? 'bg-white text-[#6B8E23] border border-[#E0D8CC]/70 shadow-xs scale-102'
                          : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
                      }`}
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      id="staff-view-tiles-btn"
                      title="Tiles View"
                      onClick={() => setStaffViewStyle('tiles')}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                        staffViewStyle === 'tiles'
                          ? 'bg-white text-[#6B8E23] border border-[#E0D8CC]/70 shadow-xs scale-102'
                          : 'text-[#7D6B5D] hover:text-[#3D2B1F]'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowStaffExcelImport(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-full flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-sky-400" /> Import via Excel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      // reset fields
                      setNewStaffName('');
                      setNewStaffPhone('');
                      setNewStaffSalary(600000);
                      setNewStaffRole('Class Teacher');
                      setNewStaffClass('KG1');
                      setNewStaffPhotoUrl('');
                      setEditingStaffId(null);
                      setIsStaffFormOpen(!isStaffFormOpen);
                    }}
                    className="px-4 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold text-xs rounded-full flex items-center gap-1 cursor-pointer transition-all shrink-0 shadow-2xs"
                  >
                    {isStaffFormOpen && !editingStaffId ? '✕ Close Form' : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Register Staff Member
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Dynamic Add/Edit Staff Form Container */}
              {isStaffFormOpen && (
                <div id="add-staff-form-block" className="bg-[#FDFBF7] p-5 rounded-3xl border border-[#E0D8CC] space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center pb-2.5 border-b border-[#E0D8CC]/60">
                    <span className="text-xs font-black uppercase tracking-wide text-[#8C5A3C] block">
                      {editingStaffId ? `Edit Staff Member Details (ID: ${editingStaffId})` : 'Administrative Staff Registration Form'}
                    </span>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsStaffFormOpen(false);
                        setEditingStaffId(null);
                      }}
                      className="text-xs text-[#7D6B5D] hover:text-[#3D2B1F]"
                    >
                      Close [x]
                    </button>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* full name */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Kakooza Ronald" 
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    />
                  </div>

                  {/* Phone contact */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Phone Contact</label>
                    <input 
                      type="text" 
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      placeholder="e.g. +256 702 991122" 
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    />
                  </div>

                  {/* Next of Kin Name */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Next of Kin Name</label>
                    <input 
                      type="text" 
                      value={newStaffNokName}
                      onChange={(e) => setNewStaffNokName(e.target.value)}
                      placeholder="e.g. Mukasa David (Brother)" 
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    />
                  </div>

                  {/* Next of Kin Contact */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Next of Kin Contact</label>
                    <input 
                      type="text" 
                      value={newStaffNokPhone}
                      onChange={(e) => setNewStaffNokPhone(e.target.value)}
                      placeholder="e.g. +256 752 885544" 
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    />
                  </div>

                  {/* Standard Salary */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Standard Salary (UGX)</label>
                    <input 
                      type="number" 
                      value={newStaffSalary}
                      onChange={(e) => setNewStaffSalary(Number(e.target.value))}
                      placeholder="600000" 
                      className="w-full text-xs font-bold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    />
                  </div>

                  {/* Role */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Administrative Role</label>
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                    >
                      <option value="Head Teacher">Head Teacher</option>
                      <option value="Class Teacher">Class Teacher</option>
                      <option value="Nursery Caretaker">Nursery Caretaker</option>
                      <option value="Cook">Cook / Porter</option>
                      <option value="Security Officer">Security Officer</option>
                    </select>
                  </div>

                  {/* Assigned Class */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Initial Class Assignment</label>
                    <select
                      value={newStaffClass}
                      onChange={(e) => setNewStaffClass(e.target.value as any)}
                      className="w-full text-xs font-semibold px-3 py-2 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
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
                      <option value="All">All Classes (Full School)</option>
                    </select>
                  </div>

                  {/* Photo details */}
                  <div className="md:col-span-4">
                    <label className="text-[10px] font-black text-[#5A3E2B] uppercase block mb-1">Staff headshot file / URL</label>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={newStaffPhotoUrl}
                        onChange={(e) => setNewStaffPhotoUrl(e.target.value)}
                        placeholder="Paste web link, or upload below..." 
                        className="w-full text-[11px] px-3 py-1.5 border border-[#E0D8CC] rounded-xl bg-white text-[#3D2B1F]"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNewStaffPhotoUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="text-[10px] text-[#7D6B5D] w-full file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-[10px] file:font-semibold file:bg-[#E8F1D7] file:text-[#6B8E23] hover:file:bg-[#d8e0c6] cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Form actions */}
                <div className="flex gap-2.5 pt-3 justify-end items-center">
                  {newStaffPhotoUrl && (
                    <div className="flex items-center gap-1.5 border border-[#E0D8CC] bg-white rounded-xl p-1.5 text-[10px]">
                      <img src={newStaffPhotoUrl} alt="Preview Thumbnail" className="w-6 h-6 rounded-lg object-cover" />
                      <span className="text-[#6B8E23] font-bold font-mono">Photo Attachment Ready ✓</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!newStaffName.trim()) {
                        alert('Please fill in the staff complete name.');
                        return;
                      }
                      
                      const staffData = {
                        fullName: newStaffName,
                        role: newStaffRole,
                        phone: newStaffPhone || '+256',
                        nextOfKinName: newStaffNokName || undefined,
                        nextOfKinPhone: newStaffNokPhone || undefined,
                        salaryUGX: newStaffSalary || 600000,
                        assignedClass: newStaffClass,
                        photoUrl: newStaffPhotoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&h=250&q=80'
                      };

                      if (editingStaffId) {
                        handleUpdateStaff({
                          id: editingStaffId,
                          ...staffData
                        });
                      } else {
                        handleAddStaff(staffData);
                      }

                      // reset states
                      setNewStaffName('');
                      setNewStaffPhone('');
                      setNewStaffNokName('');
                      setNewStaffNokPhone('');
                      setNewStaffSalary(600000);
                      setNewStaffRole('Class Teacher');
                      setNewStaffClass('KG1');
                      setNewStaffPhotoUrl('');
                      setEditingStaffId(null);
                      setIsStaffFormOpen(false);
                    }}
                    className="px-4 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold text-xs rounded-xl shadow-2xs cursor-pointer transition-all"
                  >
                    {editingStaffId ? 'Save Changes' : 'Confirm & Register'}
                  </button>
                </div>
              </div>
              )}

              {staffViewStyle === 'tiles' ? (
                /* Staff Grid list */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staff.filter(s => !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()) || (s.assignedClass && s.assignedClass.toLowerCase().includes(searchQuery.toLowerCase()))).map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        {/* Top row with image */}
                        <div className="flex gap-4 items-start">
                          {member.photoUrl ? (
                            <img 
                              src={member.photoUrl} 
                              alt={member.fullName} 
                              className="w-14 h-14 rounded-2xl object-cover bg-[#FDFBF7] border border-[#E0D8CC] shrink-0 shadow-2xs" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-[#E8F1D7] text-[#6B8E23] flex items-center justify-center font-extrabold text-lg shrink-0 border border-[#E0D8CC] shadow-2xs">
                              {member.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-extrabold text-[#3D2B1F] text-sm truncate">{member.fullName}</h4>
                              <span className="text-[9px] font-mono font-bold bg-[#F2EDE4] text-[#3D2B1F] px-1.5 py-0.5 rounded-full shrink-0 ml-1">
                                {member.id}
                              </span>
                            </div>
                            <span className="text-xs text-[#6B8E23] font-bold block uppercase tracking-wider">{member.role}</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-xs bg-[#FDFBF7] p-3.5 rounded-2xl border border-[#E0D8CC] mt-4">
                          <div className="flex justify-between">
                            <span className="text-[#7D6B5D] font-bold">Assigned Class:</span>
                            <span className="font-bold text-[#5A3E2B]">
                              {member.assignedClass || 'None'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#7D6B5D] font-bold">Phone Contact:</span>
                            <span className="font-mono font-bold text-[#3D2B1F]">{member.phone}</span>
                          </div>
                          {member.nextOfKinName && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[#7D6B5D] font-bold">Next of Kin (NOK):</span>
                                <span className="font-bold text-[#3D2B1F] truncate max-w-[120px]">{member.nextOfKinName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#7D6B5D] font-bold">NOK Contact:</span>
                                <span className="font-mono font-bold text-[#3D2B1F]">{member.nextOfKinPhone || 'N/A'}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between">
                            <span className="text-[#7D6B5D] font-bold">Standard Salary:</span>
                            <span className="font-bold text-[#8C5A3C]">{member.salaryUGX.toLocaleString()} UGX</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4 pt-3 border-t border-[#E0D8CC]/50">
                        {/* Class change quick triggers */}
                        <div className="space-y-1 bg-white">
                          <span className="text-[9px] font-bold text-[#7D6B5D] uppercase tracking-wider block">Modify Supervision Range:</span>
                          <div className="flex flex-wrap gap-1">
                            {(['KG1', 'KG2', 'KG3', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven', 'All'] as const).map((lvl) => (
                              <button
                                key={lvl}
                                id={`assign-${member.id}-${lvl.replace(/\s+/g, '-')}`}
                                onClick={() => handleClassAssignment(member.id, lvl)}
                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                                  member.assignedClass === lvl
                                    ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                                    : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                                }`}
                              >
                                {lvl === 'All' ? 'All' : lvl.replace('Primary ', 'P.')}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Edit & Delete actions */}
                        <div className="flex justify-between items-center pt-2 gap-2 border-t border-[#E0D8CC]/40">
                          <button
                            type="button"
                            onClick={() => {
                              setNewStaffName(member.fullName);
                              setNewStaffRole(member.role);
                              setNewStaffPhone(member.phone);
                              setNewStaffNokName(member.nextOfKinName || '');
                              setNewStaffNokPhone(member.nextOfKinPhone || '');
                              setNewStaffSalary(member.salaryUGX);
                              setNewStaffClass(member.assignedClass || 'KG1');
                              setNewStaffPhotoUrl(member.photoUrl || '');
                              setEditingStaffId(member.id);
                              setIsStaffFormOpen(true);
                              // Scroll to form smoothly
                              setTimeout(() => {
                                document.getElementById('staff-editor-anchor')?.scrollIntoView({ behavior: 'smooth' });
                              }, 50);
                            }}
                            className="text-[10px] font-semibold text-[#3D2B1F] bg-white hover:bg-[#F2EDE4] px-2.5 py-1.5 border border-[#E0D8CC] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit className="w-3 h-3 text-[#6B8E23]" /> Edit Profile
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete and dismiss ${member.fullName} from the active staff directory?`)) {
                                handleDeleteStaff(member.id);
                              }
                            }}
                            className="text-[10px] font-semibold text-red-500 bg-white hover:text-white hover:bg-red-500 px-2.5 py-1.5 border border-red-200 hover:border-red-500 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" /> Delete Staff Member
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Staff Tabular/Row Lists style */
                <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden shadow-2xs animate-fade-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#E0D8CC] text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider">
                          <th className="py-4 px-6">Staff Member</th>
                          <th className="py-4 px-4">Role / Title</th>
                          <th className="py-4 px-4">Supervision (Assigned Class)</th>
                          <th className="py-4 px-4">Phone Number</th>
                          <th className="py-4 px-4">Next of Kin Contact</th>
                          <th className="py-4 px-4">Monthly Salary</th>
                          <th className="py-4 px-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2EDE4]/80 text-xs text-[#3D2B1F]">
                        {staff.filter(s => !searchQuery || s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase()) || (s.assignedClass && s.assignedClass.toLowerCase().includes(searchQuery.toLowerCase()))).map((member) => (
                          <tr key={member.id} className="hover:bg-[#FAF8F5]/40 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="shrink-0 w-9 h-9 rounded-xl overflow-hidden border border-[#E0D8CC] bg-[#F2EDE4] flex items-center justify-center shadow-3xs">
                                  {member.photoUrl ? (
                                    <img src={member.photoUrl} alt={member.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <div className="w-full h-full rounded-2xl bg-[#E8F1D7] text-[#6B8E23] flex items-center justify-center font-extrabold text-xs">
                                      {member.fullName.charAt(0)}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className="font-bold text-[#3D2B1F] block">{member.fullName}</span>
                                  <span className="text-[9px] font-mono font-bold bg-[#F2EDE4] text-[#7D6B5D] px-1.5 py-0.1 rounded-full">{member.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-xs text-[#6B8E23] font-bold uppercase tracking-wider">{member.role}</span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="space-y-1.5">
                                <span className="font-black text-[#5A3E2B] text-xs underline decoration-[#6B8E23] decoration-2 underline-offset-2 block mb-1">
                                  {member.assignedClass || 'None'}
                                </span>
                                <div className="flex flex-wrap gap-1 max-w-[280px]">
                                  {(['KG1', 'KG2', 'KG3', 'Primary One', 'Primary Two', 'Primary Three', 'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven', 'All'] as const).map((lvl) => (
                                    <button
                                      key={lvl}
                                      onClick={() => handleClassAssignment(member.id, lvl)}
                                      className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border transition-all cursor-pointer ${
                                        member.assignedClass === lvl
                                          ? 'bg-[#6B8E23] text-white border-[#6B8E23]'
                                          : 'bg-white text-[#7D6B5D] border-[#E0D8CC] hover:bg-[#F2EDE4]'
                                      }`}
                                    >
                                      {lvl === 'All' ? 'All' : lvl.replace('Primary ', 'P.')}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-[#3D2B1F]">
                              {member.phone}
                            </td>
                            <td className="py-4 px-4">
                              {member.nextOfKinName ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold text-[#3D2B1F]">{member.nextOfKinName}</p>
                                  <p className="text-[#7D6B5D] font-mono text-[10px]">{member.nextOfKinPhone || 'N/A'}</p>
                                </div>
                              ) : (
                                <span className="text-[10px] text-[#7D6B5D] italic">None</span>
                              )}
                            </td>
                            <td className="py-4 px-4 font-bold text-[#8C5A3C]">
                              {member.salaryUGX.toLocaleString()} UGX
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewStaffName(member.fullName);
                                    setNewStaffRole(member.role);
                                    setNewStaffPhone(member.phone);
                                    setNewStaffNokName(member.nextOfKinName || '');
                                    setNewStaffNokPhone(member.nextOfKinPhone || '');
                                    setNewStaffSalary(member.salaryUGX);
                                    setNewStaffClass(member.assignedClass || 'KG1');
                                    setNewStaffPhotoUrl(member.photoUrl || '');
                                    setEditingStaffId(member.id);
                                    setIsStaffFormOpen(true);
                                    setTimeout(() => {
                                      document.getElementById('staff-editor-anchor')?.scrollIntoView({ behavior: 'smooth' });
                                    }, 50);
                                  }}
                                  className="p-1 px-2.5 text-sky-700 bg-sky-50 lg:bg-sky-50/50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer border border-sky-100 flex items-center gap-1 text-[10px] font-black"
                                >
                                  <Edit className="h-3 w-3" /> Edit Profile
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to permanently delete and dismiss ${member.fullName}?`)) {
                                      handleDeleteStaff(member.id);
                                    }
                                  }}
                                  className="p-1 px-2.5 text-rose-600 bg-rose-50 lg:bg-rose-50/50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 cursor-pointer flex items-center gap-1 text-[10px] font-black"
                                >
                                  <Trash2 className="h-3 w-3" /> Dismiss
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
                </>
              ) : (
                <TeachersPayroll staff={staff} />
              )}

            </div>
          )}

          {/* TAB: KIDS-PARENT CONNECT MESSAGES */}
          {activeTab === 'messages' && (
            <ParentCommunication 
              pupils={pupils} 
              onNotificationCountChange={(count) => setUnreadMessageCount(count)} 
            />
          )}

          {/* TAB 7: TIMETABLES */}
          {activeTab === 'timetables' && (
            <AcademicTimetable />
          )}

          {/* TAB 8: SHUTTLE & ASSETS SECTIONS */}
          {activeTab === 'shuttle' && (
            <InfrastructureAux pupils={pupils} onUpdatePupil={handleUpdatePupil} mode="shuttle" globalSearchTerm={searchQuery} />
          )}

          {activeTab === 'assets' && (
            <InfrastructureAux pupils={pupils} onUpdatePupil={handleUpdatePupil} mode="assets" globalSearchTerm={searchQuery} />
          )}

          {activeTab === 'idcards' && (
            <IdentityCardGenerator
              pupils={pupils}
              staff={staff}
              schoolName={schoolName}
              schoolLogo={schoolLogo}
              schoolAddress={schoolAddress}
              onUpdatePupil={handleUpdatePupil}
              onUpdateStaff={handleUpdateStaff}
            />
          )}

          {/* TAB 10: AI PREDICTIONS */}
          {activeTab === 'predictions' && (
            <ECDInsightsAI />
          )}

          {/* TAB 14: AI NCDC CURRICULUM GENERATOR */}
          {activeTab === 'curriculum' && (
            <ECDCurriculumAI />
          )}

          {/* TAB 11: ROLE-MATRIX */}
          {activeTab === 'role-matrix' && (
            <RoleMatrix />
          )}

          {/* TAB 12: DATABASE SCHEMA & SANDBOX */}
          {activeTab === 'database' && (
            <DatabaseSchemaViewer pupils={pupils} staff={staff} />
          )}

        </div>

        {/* DIGITAL SCAN VERIFICATION ROUTE/OVERLAY SCREEN */}
        {verifyPupilId && (() => {
          const verifiedPupil = pupils.find(p => p.id === verifyPupilId);
          const verifiedReports = reports.filter(r => r.pupilId === verifyPupilId);
          
          return (
            <div className="fixed inset-0 z-50 bg-[#FFFFFC] overflow-y-auto text-[#3D2B1F] flex flex-col items-center">
              {/* Official Ugandan Ministry / School Branded Header */}
              <div className="w-full max-w-2xl bg-amber-50/15 border-b-4 border-double border-[#3D2B1F] p-6 text-center space-y-2 mt-4">
                {schoolLogo && (
                  <img src={schoolLogo} alt="School Logo" className="h-16 mx-auto object-contain mb-1" referrerPolicy="no-referrer" />
                )}
                <h1 className="text-2xl font-black uppercase text-[#3D2B1F] leading-none tracking-tight">{schoolName}</h1>
                <p className="text-xs text-[#7D6B5D] font-bold">{schoolAddress}</p>
                
                <div className="inline-flex items-center gap-1.5 bg-[#E8F1D7] text-[#6B8E23] text-[9.5px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest mt-2 border border-[#6B8E23]/20 shadow-3xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6B8E23] animate-ping" />
                  Official Certified Digital Profile
                </div>
              </div>

              <div className="w-full max-w-2xl p-6 space-y-6">
                {/* Learner Info */}
                {verifiedPupil ? (
                  <div className="bg-white border-2 border-[#3D2B1F] rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-[#3D2B1F] bg-slate-100 flex items-center justify-center">
                        {verifiedPupil.photoUrl ? (
                          <img src={verifiedPupil.photoUrl} alt={verifiedPupil.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-3xl font-black text-[#5A3E2B] uppercase">{verifiedPupil.fullName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <h2 className="text-xl font-extrabold text-[#3D2B1F]">{verifiedPupil.fullName}</h2>
                        <p className="text-xs font-bold text-[#7D6B5D] uppercase tracking-wider">{verifiedPupil.classLevel} Nursery Learner</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-xs">
                          <span className="px-2 py-0.5 bg-[#F2EDE4] text-[#3D2B1F] font-bold rounded-md">ID: {verifiedPupil.id}</span>
                          <span className="font-semibold text-slate-500">Age: {verifiedPupil.age} | {verifiedPupil.gender}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#EAE4D9] text-xs text-left">
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#7D6B5D]">Guardian Name</span>
                        <p className="font-extrabold text-[#3D2B1F] text-sm">{verifiedPupil.parentName || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#7D6B5D]">Guardian Contact</span>
                        <p className="font-mono text-[#3D2B1F]">{verifiedPupil.parentPhone || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#7D6B5D]">Ugandan NIN Number</span>
                        <p className="font-mono font-bold text-[#3D2B1F] uppercase">{verifiedPupil.ninNumber || "N/A"}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-black text-[#7D6B5D]">Immunization</span>
                        <p className="font-bold text-[#6B8E23]">✓ Verified Fully Completed</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 text-red-700 p-5 rounded-2xl border border-red-200 text-center font-bold">
                    Pupil record not found or has been removed.
                  </div>
                )}

                {/* Display Stored Report evaluation history */}
                <div className="space-y-4 text-left">
                  <h3 className="text-xs font-black uppercase text-[#8C5A3C] tracking-wide">Academic Progression Statement Registry</h3>
                  
                  {verifiedReports.length > 0 ? (
                    <div className="space-y-4">
                      {verifiedReports.map((r, itemIdx) => (
                        <div key={r.id || itemIdx} className="bg-white border border-[#E0D8CC] rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-[#E0D8CC]">
                            <span className="font-extrabold text-sm text-[#3D2B1F]">{r.term} ({r.academicYear})</span>
                            <span className="text-[10px] font-mono text-[#6B8E23] font-bold bg-[#E8F1D7] px-2 py-0.5 rounded-md uppercase">Certified True Copy</span>
                          </div>

                          <div className="space-y-2 text-xs">
                            <p className="font-bold text-[#7D6B5D] uppercase text-[9px] tracking-wider mb-1">Learning Domain Scores</p>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[10px]">
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Lit I</span>
                                <span className="text-sm font-black text-[#6B8E23] mt-1">{r.literacy1 || 'B'}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Lit II</span>
                                <span className="text-sm font-black text-[#6B8E23] mt-1">{r.literacy2 || 'B'}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Social</span>
                                <span className="text-sm font-black text-[#6B8E23] mt-1">{r.socialDevelopment || 'B'}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Health</span>
                                <span className="text-sm font-black text-[#6B8E23] mt-1">{r.healthHabits || 'B'}</span>
                              </div>
                              <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
                                <span className="text-slate-400 font-bold uppercase text-[8px]">Math</span>
                                <span className="text-sm font-black text-[#6B8E23] mt-1">{r.mathematics || 'B'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-left">
                            <span className="text-[#7D6B5D] font-bold">Class Teacher Evaluation:</span>
                            <p className="bg-[#FDFBF7] p-2.5 rounded-xl border border-[#E0D8CC]/60 leading-relaxed italic text-gray-700">"{r.teacherComments}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-amber-50/40 p-6 rounded-2xl border border-dashed border-[#E0D8CC] text-center text-xs text-[#7D6B5D]">
                      No academic records or evaluation history saved for this learner in the selected term.
                    </div>
                  )}
                </div>

                {/* Bottom close action */}
                <div className="pt-6 border-t border-[#E0D8CC] flex justify-center">
                  <button 
                    onClick={() => {
                      // Clear query params and close
                      const newUrl = window.location.pathname;
                      window.history.pushState({}, '', newUrl);
                      setVerifyPupilId(null);
                    }}
                    className="bg-[#3D2B1F] text-white px-6 py-2.5 rounded-xl text-xs font-black shadow-sm cursor-pointer"
                  >
                    Back to Academic Console
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* SHARE AND EXPORT CENTER OVERLAY MODAL */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-300 text-left text-[#3D2B1F] space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-[#E0D8CC]">
                <h3 className="text-sm font-black uppercase text-[#8C5A3C]">Class-Wide Share & Export</h3>
                <button 
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setSharedFolderSyncProgress(prev => ({ ...prev, status: 'idle', current: 0 }));
                  }}
                  className="text-gray-400 hover:text-gray-600 font-extrabold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#7D6B5D] leading-relaxed">
                Easily broadcast student electronic profile links, or dispatch compiled PDFs directly to parents via designated channels, local shared storage folders, or WhatsApp.
              </p>

              <div className="space-y-3 font-sans">
                <div>
                  <span className="block text-[10px] font-black uppercase text-[#8C5A3C] tracking-wide mb-1">Method 1: Direct WhatsApp Broadcaster</span>
                  <button 
                    onClick={() => {
                      // Generating template message
                      const activePupilsList = pupils.filter(p => bulkClassFilter === 'All' || p.classLevel === bulkClassFilter);
                      const textBody = `Hello Parents, here are the certified digital report cards and profiles for ${bulkClassFilter === 'All' ? 'Our Students' : bulkClassFilter} class. %0A%0A` + 
                        activePupilsList.map(p => `• *${p.fullName}*: ${window.location.origin}/?verifyPupilId=${p.id}`).join('%0A');
                      const whatsappUrl = `https://api.whatsapp.com/send?text=${textBody}`;
                      window.open(whatsappUrl, '_blank');
                      alert("WhatsApp Group Broadcaster launched in new tab successfully!");
                    }}
                    className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white p-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 11.966.01c3.179.001 6.17 1.24 8.419 3.496 2.248 2.256 3.483 5.252 3.48 8.431-.004 6.613-5.338 11.953-11.91 11.953-2.007-.001-3.98-.512-5.741-1.488L0 24zm6.59-4.859c1.72.1.1 1.724 1.144.331 1.836 1.09 3.962 1.666 6.14 1.667 5.8 0 10.51-4.708 10.513-10.49.001-2.8-.1-1.087-2.072-2.075-1.97-2.074-4.593-3.216-7.394-3.217-5.802 0-10.514 4.71-10.517 10.492-.001 2.11.55 4.18 1.597 5.979l-.2.724-.52 1.897 1.948-.51.782-.245" />
                    </svg>
                    Broadcast to WhatsApp Group Link
                  </button>
                </div>

                <div className="h-px bg-gray-200 my-2"></div>

                <div>
                  <span className="block text-[10px] font-black uppercase text-[#8C5A3C] tracking-wide mb-1.5">Method 2: Sync to Shared Folders (Google Drive, Dropbox, Local Storage)</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-[#5A3E2B]">
                    <button 
                      onClick={() => handleSharedFolderSync("Google Drive / Shared Drives")}
                      className="p-2.5 bg-[#FAF8F5] border border-[#E0D8CC] hover:bg-slate-50 rounded-xl cursor-pointer text-center text-[11px]"
                      type="button"
                    >
                      Sync to Google Drive
                    </button>
                    <button 
                      onClick={() => handleSharedFolderSync("Dropbox Classroom Folder")}
                      className="p-2.5 bg-[#FAF8F5] border border-[#E0D8CC] hover:bg-slate-50 rounded-xl cursor-pointer text-center text-[11px]"
                      type="button"
                    >
                      Sync to Dropbox
                    </button>
                  </div>
                </div>
              </div>

              {/* Active syncing progress */}
              {sharedFolderSyncProgress.status === 'syncing' && (
                <div className="bg-[#FAF8F5] border border-[#E0D8CC] p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs text-[#3D2B1F]">
                    <span className="font-extrabold flex items-center gap-1.5">
                      <Loader2 className="w-4 h-4 text-[#6B8E23] animate-spin" />
                      Syncing to {sharedFolderSyncProgress.destination}...
                    </span>
                    <span className="font-mono text-xs font-bold">{sharedFolderSyncProgress.current} / {sharedFolderSyncProgress.total}</span>
                  </div>
                  <div className="w-full bg-[#EAE4D9] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#6B8E23] h-full transition-all duration-300"
                      style={{ width: `${(sharedFolderSyncProgress.current / sharedFolderSyncProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {sharedFolderSyncProgress.status === 'completed' && (
                <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl border border-emerald-200 text-xs font-bold text-center">
                  ✓ All certified student report cards synced successfully to Cloud directory!
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button 
                  onClick={() => {
                    setIsShareModalOpen(false);
                    setSharedFolderSyncProgress(prev => ({ ...prev, status: 'idle', current: 0 }));
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-[#3D2B1F] px-4 py-2 rounded-xl text-xs font-extrabold cursor-pointer"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ACADEMIC SYSTEM PROMOTION & ROLL-OVER MODAL */}
        {isPromotionModalOpen && (() => {
          // Determine next target term
          let nextTermSuggestion: Term = 'Term 2';
          if (selectedTerm === 'Term 1') nextTermSuggestion = 'Term 2';
          else if (selectedTerm === 'Term 2') nextTermSuggestion = 'Term 3';
          else if (selectedTerm === 'Term 3') nextTermSuggestion = 'Term 1';

          const yearInt = parseInt(academicYear, 10);
          const nextYearValue = isNaN(yearInt) ? '2027' : String(yearInt + 1);

          return (
            <div id="promotion-center-modal" className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-[#FFFFFE] rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-stone-200 text-left text-[#3D2B1F] flex flex-col max-h-[92vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-start pb-4 border-b border-[#F2EDE4]">
                  <div>
                    <h3 className="text-lg font-black text-[#5A3E2B] flex items-center gap-2">
                      <span className="p-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm">🍁</span>
                      <span>Academic Promotion & Roll-Over Center</span>
                    </h3>
                    <p className="text-xs text-[#7D6B5D] mt-1">
                      Advance the academic timeline, promote student grades, and prepare school registers for the upcoming period.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsPromotionModalOpen(false)}
                    className="text-stone-400 hover:text-stone-600 font-extrabold text-sm cursor-pointer p-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Body Content */}
                <div className="py-6 space-y-8 font-sans">
                  
                  {/* Option Block 1: Term Promotion */}
                  <div className="bg-gradient-to-r from-sky-50/50 to-[#FAF8F5] border border-sky-100/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-sky-100 text-sky-700 rounded-xl font-bold text-sm shrink-0">
                        📆
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-850">Section A: Roll-Over Academic Term</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">
                          Move the active school timeline to the subsequent term. This changes the academic reporting, attendance sheets, and curriculum planners context.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/95 border border-sky-100/50 p-4 rounded-xl">
                      <div>
                        <span className="block text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider text-left">Current Active Term</span>
                        <span className="text-base font-black text-rose-600 font-mono text-left">{selectedTerm}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider text-left">Target Term After Roll-Over</span>
                        <span className="text-base font-black text-emerald-600 font-mono flex items-center gap-1.5 justify-start text-left">
                          {nextTermSuggestion}
                          {selectedTerm === 'Term 3' && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 uppercase font-bold py-0.5 px-1.5 rounded border border-amber-200">
                              + New Year
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Checkbox settings */}
                    <div className="space-y-2.5 pl-1.5 text-xs text-left">
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-stone-700 select-none">
                        <input 
                          type="checkbox"
                          checked={promoTermResetRequirements}
                          onChange={(e) => setPromoTermResetRequirements(e.target.checked)}
                          className="w-4 h-4 accent-[#6B8E23] cursor-pointer"
                        />
                        <span>Reset requirements checklist for all pupils (start fresh for next term)</span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-stone-700 select-none">
                        <input 
                          type="checkbox"
                          checked={promoTermResetAttendance}
                          onChange={(e) => setPromoTermResetAttendance(e.target.checked)}
                          className="w-4 h-4 accent-[#6B8E23] cursor-pointer"
                        />
                        <span>Clear today's student attendance rolls (reset state)</span>
                      </label>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          const conf = window.confirm(`Are you absolutely sure you want to promote the school system from ${selectedTerm} to ${nextTermSuggestion}?`);
                          if (conf) handlePromoteTerm();
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-3xs transition-all flex items-center gap-1.5"
                        type="button"
                      >
                        ⚡ Advance System Term to {nextTermSuggestion}
                      </button>
                    </div>
                  </div>

                  {/* Option Block 2: Academic Year Promotion */}
                  <div className="bg-gradient-to-r from-amber-50/40 to-[#FAF8F5] border border-amber-100 rounded-2xl p-5 space-y-4 text-left">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-xl font-bold text-sm shrink-0">
                        🎓
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-[#5A3E2B]">Section B: Promobilize Academic Year & Pupil Grades</h4>
                        <p className="text-[11px] text-[#7D6B5D] leading-normal">
                          Trigger end-of-year class promotions! All pupils in KG1 progress to KG2, KG3 advances to Primary One, and student ages increase automatically.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/95 border border-amber-100 p-4 rounded-xl">
                      <div>
                        <span className="block text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider text-left">Current Academic Year</span>
                        <span className="text-base font-black text-rose-600 font-mono text-left">{academicYear} Core</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#7D6B5D] uppercase font-black tracking-wider text-left">Next Target Year</span>
                        <span className="text-base font-black text-emerald-600 font-mono text-left">{nextYearValue} Academic</span>
                      </div>
                    </div>

                    {/* Checkbox settings */}
                    <div className="space-y-2.5 pl-1.5 text-xs text-left">
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-stone-700 select-none">
                        <input 
                          type="checkbox"
                          checked={promoYearClassLevels}
                          onChange={(e) => setPromoYearClassLevels(e.target.checked)}
                          className="w-4 h-4 accent-[#6B8E23] cursor-pointer"
                        />
                        <span className="leading-tight">
                          Auto-promote all enrolled pupils to the next subsequent grade (Middle, Top, Primary etc.)
                        </span>
                      </label>
                      <label className="flex items-center gap-2.5 cursor-pointer font-semibold text-stone-700 select-none">
                        <input 
                          type="checkbox"
                          checked={promoYearIncrementAge}
                          onChange={(e) => setPromoYearIncrementAge(e.target.checked)}
                          className="w-4 h-4 accent-[#6B8E23] cursor-pointer"
                        />
                        <span>Increment age of all active student profiles by +1 Year</span>
                      </label>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          const conf = window.confirm(`DANGER COMPLIANCE WARNING: You are rolling over the primary academic registry from ${academicYear} to ${nextYearValue}. This will promote all nursery class rosters. Are you ready to initialize the new Year?`);
                          if (conf) handlePromoteYear();
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl cursor-pointer shadow-3xs transition-all flex items-center gap-1.5"
                        type="button"
                      >
                        🚀 Initialize & Promobilize to Year {nextYearValue}
                      </button>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="pt-4 border-t border-[#F2EDE4] flex justify-end">
                  <button 
                    onClick={() => setIsPromotionModalOpen(false)}
                    className="bg-[#F5F5F4] hover:bg-[#EAE6DF] text-stone-700 font-extrabold text-xs px-5 py-3 rounded-xl border border-stone-200 cursor-pointer shadow-3xs hover:scale-102 transition-all"
                    type="button"
                  >
                    Close Control Panel
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* SICKBAY GUARDIAN NOTIFICATION & MOMO PAYMENT MODAL */}
        {notifyingSickLog && (() => {
          const matchedPupil = pupils.find(p => p.fullName.toLowerCase() === notifyingSickLog.pupilName.toLowerCase());
          
          return (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-gray-300 text-left text-[#3D2B1F] flex flex-col">
                
                {/* Header branding */}
                <div className="bg-[#FAF8F5] p-5 border-b border-[#E0D8CC] flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 bg-[#E8F1D7] text-[#6B8E23] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      <Heart className="w-3 h-3 text-[#6B8E23]" /> Medical dispatch & payment
                    </div>
                    <h3 className="text-base font-black uppercase text-[#8C5A3C] tracking-tight">
                      Alert Guardian: {notifyingSickLog.pupilName}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setNotifyingSickLog(null)}
                    className="text-gray-400 hover:text-gray-600 font-extrabold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Main panel content scrollable */}
                <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
                  
                  {/* Step 1: Configuration Details screen */}
                  {simulationStep === 'details' && (
                    <div className="space-y-5 animate-fade-in">
                      <div className="p-4 bg-amber-50/20 rounded-2xl border border-dashed border-[#E0D8CC] grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
                        <div>
                          <span className="block text-[10px] text-slate-500 font-semibold uppercase">Incident</span>
                          <p className="font-extrabold text-[#3D2B1F] mt-0.5">{notifyingSickLog.issue}</p>
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-500 font-semibold uppercase">Carer First-aid Action</span>
                          <p className="font-extrabold mt-0.5 text-[#3D2B1F]">{notifyingSickLog.action}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        
                        {/* Guardian Contacts */}
                        <div className="space-y-3.5">
                          <h4 className="text-xs font-black uppercase text-[#8C5A3C] tracking-wide pb-1 border-b border-gray-100">
                            1. Recipient Particulars
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guardian Name</label>
                              <input 
                                type="text"
                                required
                                value={overrideGuardianName}
                                onChange={(e) => setOverrideGuardianName(e.target.value)}
                                placeholder="Guardian Full Name"
                                className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Guardian Contact Phone</label>
                              <input 
                                type="text"
                                required
                                value={overrideGuardianPhone}
                                onChange={(e) => setOverrideGuardianPhone(e.target.value)}
                                placeholder="e.g., +256772123456"
                                className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-mono font-bold"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Notification Channel</label>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <button
                                  type="button"
                                  onClick={() => setNotificationChannel('SMS')}
                                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    notificationChannel === 'SMS' 
                                      ? 'bg-[#3D2B1F] text-white border-[#3D2B1F]' 
                                      : 'bg-slate-50 text-gray-500 border-gray-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <Smartphone className="w-3.5 h-3.5" /> SMS Network
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setNotificationChannel('WhatsApp')}
                                  className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                    notificationChannel === 'WhatsApp' 
                                      ? 'bg-[#25D366] text-white border-[#25D366]' 
                                      : 'bg-slate-50 text-gray-500 border-gray-200 hover:bg-slate-100'
                                  }`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Web
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Payment / Billing Info */}
                        <div className="space-y-3.5">
                          <h4 className="text-xs font-black uppercase text-[#8C5A3C] tracking-wide pb-1 border-b border-gray-100 flex items-center justify-between">
                            <span>2. Mobile Money Emergency Bill</span>
                            <span className="text-[9px] text-[#6B8E23] font-bold lowercase">MTN & Airtel MoMo API</span>
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Billing Amount (UGX)</label>
                              <select
                                value={treatmentFeeAmount}
                                onChange={(e) => setTreatmentFeeAmount(Number(e.target.value))}
                                className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-bold"
                              >
                                <option value="0">No fee (Skip payment trigger)</option>
                                <option value="5000">5,000 UGX (Minor medicine - Panadol/Syrup)</option>
                                <option value="15000">15,000 UGX (Standard Assessment & Medical Care)</option>
                                <option value="30000">30,000 UGX (Clinical First Aid + Dressing bandage)</option>
                                <option value="50000">50,000 UGX (Emergency clinic referral transport deposit)</option>
                              </select>
                            </div>

                            {treatmentFeeAmount > 0 && (
                              <>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Mobile money network provider</label>
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    <button
                                      type="button"
                                      onClick={() => setMobileMoneyProvider('MTN')}
                                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                                        mobileMoneyProvider === 'MTN' 
                                          ? 'border-amber-400 bg-amber-50/40 font-black text-[#5A3E2B]' 
                                          : 'bg-slate-50 text-gray-400 border-gray-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {mobileMoneyProvider === 'MTN' && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-bl-md" />
                                      )}
                                      <span className="text-xs font-black">MTN MoMo</span>
                                      <span className="text-[8.5px] font-normal">Push SLA Prompt</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setMobileMoneyProvider('Airtel')}
                                      className={`p-2.5 rounded-xl border font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative overflow-hidden ${
                                        mobileMoneyProvider === 'Airtel' 
                                          ? 'border-red-400 bg-red-50/40 font-black text-red-900' 
                                          : 'bg-slate-50 text-gray-400 border-gray-200 hover:bg-slate-100'
                                      }`}
                                    >
                                      {mobileMoneyProvider === 'Airtel' && (
                                        <div className="absolute top-0 right-0 w-3 h-3 bg-red-400 rounded-bl-md" />
                                      )}
                                      <span className="text-xs font-black text-red-600">Airtel Money</span>
                                      <span className="text-[8.5px] font-normal text-slate-500">Push SLA Prompt</span>
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Emergency Payment Number</label>
                                  <input 
                                    type="text"
                                    value={mobileMoneyNumber}
                                    onChange={(e) => setMobileMoneyNumber(e.target.value)}
                                    placeholder="e.g. +256 772 123456"
                                    className="w-full text-xs p-2.5 border border-[#E0D8CC] rounded-xl bg-white font-mono font-extrabold"
                                  />
                                  <span className="text-[9px] text-slate-400">Defaults to Guardian's telephone. Used to trigger the instant payment popup.</span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* Footer Actions */}
                      <div className="pt-4 border-t border-[#EAE4D9] flex justify-end gap-3 text-xs font-bold font-sans">
                        <button
                          type="button"
                          onClick={() => setNotifyingSickLog(null)}
                          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!overrideGuardianPhone || !overrideGuardianName) {
                              alert("Please specify guardian name and phone number.");
                              return;
                            }
                            if (treatmentFeeAmount > 0) {
                              if (!mobileMoneyNumber) {
                                alert("Please state a valid registered mobile money number.");
                                return;
                              }
                              // Transition to the USSD pin prompt simulator scene
                              setMomoTxReference(`MP-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`);
                              setSimulationStep('momo_prompt');
                              setPaymentStatus('prompting');
                            } else {
                              // Directly showcase sent notification screen
                              setSimulationStep('sent_notification');
                            }
                          }}
                          className="px-5 py-2.5 bg-[#6B8E23] hover:bg-[#58751d] text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="w-4 h-4" />
                          {treatmentFeeAmount > 0 ? "Dispatch Alert & Bill Parent" : "Dispatch Free SMS Alert"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Interactive MoMo USSD Prompt Overlay */}
                  {simulationStep === 'momo_prompt' && (
                    <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-fade-in text-center">
                      <div className="w-16 h-16 bg-[#FDFBF7] rounded-full border border-[#E0D8CC] flex items-center justify-center animate-bounce">
                        <CreditCard className="w-7 h-7 text-[#8C5A3C]" />
                      </div>
                      
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-sm font-black text-[#3D2B1F]">
                          Mobile Payment Gateway Sandbox
                        </h4>
                        <p className="text-xs text-[#7D6B5D]">
                          We have pushed an interactive callback overlay screen to payer's device <span className="font-mono text-[#3D2B1F] font-bold">{mobileMoneyNumber}</span>. Please authorize it below to simulate the bank clearance.
                        </p>
                      </div>

                      {/* Simulated phone screen USSD interface */}
                      <div className="w-72 bg-[#1A1A1A] text-emerald-400 p-5 rounded-3xl border-4 border-gray-600 shadow-xl font-mono text-[11px] text-left space-y-4 relative leading-relaxed">
                        
                        {/* Dynamic Provider Banner */}
                        <div className="border-b border-emerald-400/20 pb-2 flex justify-between text-[10px] text-emerald-300 font-bold uppercase tracking-wider">
                          <span>{mobileMoneyProvider === 'MTN' ? '■ MTN MoMo Pay' : '■ Airtel Money'}</span>
                          <span className="animate-pulse">● SECURE</span>
                        </div>

                        {paymentStatus === 'prompting' && (
                          <div className="space-y-4">
                            <p className="text-[#FFFFFC]">
                              Nursery-Sickbay Billing:<br />
                              Pay <span className="font-bold underline">{treatmentFeeAmount.toLocaleString()} UGX</span> to Kids Villa Academy & Medical Centre?<br /><br />
                              1. Authorize (Enter 5-digit PIN with any digits)<br />
                              2. Cancel transaction
                            </p>

                            <div className="space-y-2 pt-2 border-t border-[#333]">
                              <label className="block text-[10px] text-emerald-300 font-bold uppercase">Enter PIN:</label>
                              <input 
                                type="password"
                                maxLength={5}
                                value={simulatedPayerPin}
                                onChange={(e) => setSimulatedPayerPin(e.target.value)}
                                placeholder="● ● ● ● ●"
                                className="w-full bg-black border border-emerald-500/30 rounded-md p-1.5 text-center tracking-widest text-[#FFFFFC] text-sm focus:outline-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPaymentStatus('failed');
                                  setSimulationStep('details');
                                }}
                                className="bg-red-950/40 hover:bg-red-950/70 text-red-400 p-2 rounded-lg border border-red-900/30 cursor-pointer text-center font-bold"
                              >
                                Cancel (2)
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (!simulatedPayerPin) {
                                    alert("Please state a MoMo PIN code.");
                                    return;
                                  }
                                  setPaymentStatus('processing');
                                  // Wait for processing delay to simulate telecom clearance
                                  setTimeout(() => {
                                    setPaymentStatus('success');
                                    setSimulationStep('sent_notification');
                                  }, 1500);
                                }}
                                className="bg-emerald-950/40 hover:bg-emerald-950/70 text-emerald-400 p-2 rounded-lg border border-emerald-900/30 cursor-pointer text-center font-bold"
                              >
                                Send PIN (1)
                              </button>
                            </div>
                          </div>
                        )}

                        {paymentStatus === 'processing' && (
                          <div className="py-6 flex flex-col items-center justify-center space-y-3">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                            <p className="text-center animate-pulse">
                              Transmitting PIN code...<br />
                              Connecting to {mobileMoneyProvider} API Gateways...
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                        UGANDA TELECOM SIMULATOR v4.1
                      </p>
                    </div>
                  )}

                  {/* Step 3: Sent Notification Output Scene */}
                  {simulationStep === 'sent_notification' && (
                    <div className="space-y-6 animate-fade-in">
                      
                      <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 flex items-start gap-3">
                        <div className="bg-emerald-500 text-white p-1 rounded-full shrink-0">
                          <Check className="w-4 h-4" />
                        </div>
                        <div className="text-xs text-left">
                          <span className="font-bold text-sm block mb-1">Simulated Transmission Successful!</span>
                          The parent alert has been packed and dispatched correctly on the network channel. All transaction logs and mobile money receipts have been certified.
                        </div>
                      </div>

                      {/* Phone App Mock UI */}
                      <div className="max-w-md mx-auto bg-stone-100 rounded-3xl border border-stone-300 overflow-hidden shadow-md">
                        {/* Device Info Header */}
                        <div className="bg-stone-800 text-white px-4 py-2 flex justify-between items-center text-[10px]">
                          <span className="font-bold font-mono">15:54</span>
                          <span className="flex items-center gap-1">
                            <span className="h-2.5 w-4 bg-white/30 relative inline-block rounded-xs"><span className="absolute left-0 top-0 bottom-0 w-3/4 bg-white" /></span>
                            <span className="font-bold uppercase font-mono text-[9px]">{notificationChannel === 'WhatsApp' ? 'WhatsApp Business' : 'UTL / MTN Carrier'}</span>
                          </span>
                        </div>

                        {/* App Chat Screen */}
                        <div className="p-4 space-y-4 bg-emerald-50/20 min-h-[180px]">
                          <div className="text-center">
                            <span className="inline-block bg-stone-200 text-stone-600 px-3 py-1 rounded-full text-[9px] font-bold font-mono">
                              TODAY • LOCAL DISPATCH GATEWAY
                            </span>
                          </div>

                          <div className="flex flex-col space-y-2">
                            {/* Message Bubble */}
                            <div className={`p-3 max-w-[85%] rounded-2xl text-xs text-left border ${
                              notificationChannel === 'WhatsApp'
                                ? 'bg-[#DCF8C6] border-[#DCF8C6] self-end rounded-tr-none'
                                : 'bg-white border-gray-100 self-start rounded-tl-none'
                            }`}>
                              <p className="font-semibold text-slate-500 text-[10px] uppercase mb-1">
                                {notificationChannel === 'WhatsApp' ? 'KVA ECD NURSERY' : 'KVA Nursery Alert'}
                              </p>
                              <p className="text-[#3D2B1F] leading-relaxed">
                                Dear {overrideGuardianName}, this is KVA Nursery School notifying you that your child <strong>{notifyingSickLog.pupilName}</strong> was admitted to our Healthy Bay today at {notifyingSickLog.date} due to: <strong>{notifyingSickLog.issue}</strong>. 
                              </p>
                              <p className="text-[#3D2B1F] mt-1 italic">
                                Action taken: "{notifyingSickLog.action}".
                              </p>
                              <p className="text-[10.5px] text-[#8C5A3C] font-semibold mt-1">
                                {treatmentFeeAmount > 0 
                                  ? `Medical treatment assessment fee is settled at ${treatmentFeeAmount.toLocaleString()} UGX.` 
                                  : "Please inspect child's home card for feedback."}
                              </p>
                              <span className="block text-[8px] text-right text-gray-400 mt-1 font-mono">
                                15:54 Dispatched
                              </span>
                            </div>

                            {/* Mobile Money confirmation bubble (from gateway) if billed */}
                            {treatmentFeeAmount > 0 && (
                              <div className="p-3 max-w-[85%] bg-stone-800 text-[#FDFBF7] self-start rounded-2xl rounded-tl-none border border-stone-800 text-[11px] font-mono leading-relaxed space-y-1.5">
                                <p className="font-extrabold text-[10px] text-amber-400">
                                  {mobileMoneyProvider === 'MTN' ? 'MTN MoMo Confirmation' : 'Airtel Money Alert'}
                                </p>
                                <p>
                                  Yello! UGX {treatmentFeeAmount.toLocaleString()} paid to Kids Villa Academy & Medical Centre.
                                </p>
                                <p>
                                  Balance: UGX {Math.floor(100000 + Math.random() * 500000).toLocaleString()}<br />
                                  TransRef: <span className="font-bold underline text-amber-300">{momoTxReference}</span><br />
                                  Date: 2026-06-18
                                </p>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>

                      {/* Confirm and Store */}
                      <div className="pt-4 border-t border-[#EAE4D9] flex justify-end font-sans">
                        <button
                          type="button"
                          onClick={() => {
                            // Update our notified logs list state
                            setNotifiedLogIds(prev => ({
                              ...prev,
                              [notifyingSickLog.id]: {
                                channel: notificationChannel,
                                phone: overrideGuardianPhone,
                                amount: treatmentFeeAmount > 0 ? treatmentFeeAmount : undefined,
                                provider: treatmentFeeAmount > 0 ? mobileMoneyProvider : undefined,
                                txRef: treatmentFeeAmount > 0 ? momoTxReference : undefined,
                                date: new Date().toISOString().split('T')[0]
                              }
                            }));
                            setNotifyingSickLog(null);
                          }}
                          className="px-6 py-2.5 bg-[#3D2B1F] text-white rounded-xl text-xs font-black shadow-xs cursor-pointer hover:bg-[#5A3E2B]"
                        >
                          Save Transaction logs & Close
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </div>
          );
        })()}

        {/* HIDDEN BULK RENDERER FOR ACCURATE CANVAS CAPTURE */}
        {bulkRecordToRender && (
          <div className="fixed -left-[9999px] -top-[9999px] overflow-hidden no-print">
            <div 
              id="bulk-pupil-report-card-capture" 
              className="p-8 border-4 border-[#3D2B1F] rounded-2xl bg-[#FFFFFC] text-[#3D2B1F] space-y-5"
              style={{ width: '800px', minHeight: '1130px' }} // Locked portrait proportion for gorgeous 2x render
            >
              {/* Header block */}
              <div className="flex flex-col items-center text-center pb-4 border-b-2 border-double border-[#3D2B1F] space-y-2">
                {schoolLogo && (
                  <img 
                    src={schoolLogo} 
                    alt="School Logo" 
                    className="h-16 max-w-full object-contain mb-1" 
                    referrerPolicy="no-referrer"
                  />
                )}
                <div>
                  <h4 className="text-2xl font-black uppercase text-[#3D2B1F] leading-none tracking-tight">
                    {schoolName}
                  </h4>
                  <p className="text-xs font-bold text-[#7D6B5D] mt-1">
                    {schoolAddress}
                  </p>
                </div>
                <span className="inline-block bg-[#F2EDE4] text-[#3D2B1F] text-[9.5px] font-black px-4 py-1 rounded-full uppercase tracking-widest mt-2 border border-[#E0D8CC]">
                  Official Pupil Evaluation Statement
                </span>
              </div>

              {/* Bio Block */}
              <div className="flex gap-4 bg-[#F2EDE4]/35 p-3.5 rounded-xl border border-[#E0D8CC] items-center text-left">
                <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 border-[#3D2B1F] bg-[#F2EDE4] flex items-center justify-center shadow-inner">
                  {bulkRecordToRender.pupil.photoUrl ? (
                    <img 
                      src={bulkRecordToRender.pupil.photoUrl} 
                      alt={bulkRecordToRender.pupil.fullName} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-xl font-black text-[#5A3E2B] uppercase text-center block">
                      {bulkRecordToRender.pupil.fullName.charAt(0)}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 flex-1 text-xs">
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#7D6B5D] block">Learner Full Name</span>
                    <p className="font-extrabold text-[#3D2B1F] text-sm leading-none h-4 flex items-center uppercase">{bulkRecordToRender.pupil.fullName}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#7D6B5D] block">Class Level</span>
                    <p className="font-extrabold text-[#3D2B1F] text-sm">{bulkRecordToRender.pupil.classLevel}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#7D6B5D] block">Age & Gender</span>
                    <p className="font-extrabold text-[#3D2B1F]">{bulkRecordToRender.pupil.age} Years | {bulkRecordToRender.pupil.gender}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase text-[#7D6B5D] block">Evaluation Period</span>
                    <p className="font-bold text-[#3D2B1F]">{bulkRecordToRender.report.term}, {bulkRecordToRender.report.academicYear}</p>
                  </div>
                </div>
              </div>

              {/* Competency Table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#3D2B1F] text-[#5A3E2B] text-[10px] font-black uppercase">
                    <th className="py-2 px-2">Learning Area Assessment Domain</th>
                    <th className="py-2 text-center w-16">Grade</th>
                    <th className="py-2 px-2">NCDC Progression Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E0D8CC]">
                  {learningAreas.map((area, idx) => {
                    let val: 'A' | 'B' | 'C' | 'D' | 'E' = 'B';
                    if (bulkRecordToRender.report.learningAreaGrades && bulkRecordToRender.report.learningAreaGrades[area.id]) {
                      val = bulkRecordToRender.report.learningAreaGrades[area.id];
                    } else {
                      if (area.id === 'la_literacy1') val = bulkRecordToRender.report.literacy1 || 'B';
                      else if (area.id === 'la_literacy2') val = bulkRecordToRender.report.literacy2 || 'B';
                      else if (area.id === 'la_social') val = bulkRecordToRender.report.socialDevelopment || 'B';
                      else if (area.id === 'la_health') val = bulkRecordToRender.report.healthHabits || 'B';
                      else if (area.id === 'la_math') val = bulkRecordToRender.report.mathematics || 'B';
                    }
                    return (
                      <tr key={area.id} className="hover:bg-amber-50/5">
                        <td className="py-2.5 px-2 font-black text-[#5A3E2B]">{idx + 1}. {area.name}</td>
                        <td className="py-2.5 text-center font-extrabold bg-slate-50 font-mono text-sm text-[#6B8E23]">
                          {val}
                        </td>
                        <td className="py-2.5 px-2 text-[#3D2B1F] leading-tight text-[11px] italic">
                          {GRADE_COMPETENCIES[val]}
                        </td>
                      </tr>
                    );
                  })}

                  {bulkRecordToRender.report.customSubjects && bulkRecordToRender.report.customSubjects.map((subj, index) => (
                    <tr key={`custom-${index}`} className="bg-amber-50/15">
                      <td className="py-2.5 px-2 font-bold text-[#3D2B1F]">
                        {learningAreas.length + 1 + index}. {subj.subjectName}
                      </td>
                      <td className="py-2 text-center font-black bg-[#E8F1D7]/35 font-mono text-[#6B8E23] text-xs">
                        {subj.score}
                      </td>
                      <td className="py-2.5 px-2 text-[#7D6B5D] text-[11px] leading-normal font-medium pl-4">
                        {subj.competency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Class Teacher comments */}
              <div className="space-y-2 pt-2 border-t border-[#3D2B1F] text-left">
                <span className="text-xs font-black uppercase text-[#3D2B1F]">Class Teacher comments</span>
                <p className="text-xs text-[#3D2B1F] leading-relaxed bg-[#FDFBF7] p-3 rounded-lg border border-[#E0D8CC] whitespace-normal italic">
                  {bulkRecordToRender.report.teacherComments}
                </p>
              </div>

              {/* Local translation */}
              {bulkRecordToRender.report.localTranslation && (
                <div className="text-[10px] text-[#7D6B5D] italic text-left">
                  * {bulkRecordToRender.report.localTranslation} Translating help is on file for parent conferences.
                </div>
              )}

              {/* Signatures */}
              <div className="pt-3 border-t-2 border-[#3D2B1F] grid grid-cols-2 gap-4 text-xs text-left">
                <div className="space-y-1">
                  <span className="font-bold text-[#7D6B5D]">Class Teacher signature:</span>
                  <p className="font-mono text-[10px] italic">Apio Martha, Tr.</p>
                  <div className="h-px bg-gray-400 w-32 mt-3"></div>
                </div>
                <div className="space-y-1">
                  <span className="font-bold text-[#7D6B5D]">Head Teacher's evaluation:</span>
                  <p className="font-bold text-[#3D2B1F] leading-tight">
                    {bulkRecordToRender.report.headTeacherComments || "Excellent discipline and solid academic groundwork."}
                  </p>
                  <div className="h-px bg-gray-400 w-32 mt-3"></div>
                </div>
              </div>

              {/* QR Code */}
              <div className="pt-3 border-t border-dashed border-[#E0D8CC] flex items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <span className="block text-[8px] font-black text-[#6B8E23] uppercase tracking-wider">NCDC Digital Verification Portal</span>
                  <p className="text-[10px] text-[#7D6B5D] leading-tight max-w-[340px]">
                    This report card contains a unique verification system. Scan the code to access this child's fully integrated, certified profile.
                  </p>
                </div>
                {bulkRecordToRender.qrCode && (
                  <div className="flex flex-col items-center shrink-0">
                    <img src={bulkRecordToRender.qrCode} alt="Verification QR Code" className="w-16 h-16 border border-[#E0D8CC] p-1 bg-white rounded-lg" />
                    <span className="text-[6px] font-mono font-bold text-gray-400 mt-1 uppercase">VERIFIED LINK</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* State-Based Non-blocking Sign Out Confirmation Dialog */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in" id="signout-confirmation-modal">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-stone-200 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-stone-950">Sign Out of Portal?</h3>
              <p className="text-xs text-stone-600 leading-normal">Are you sure you want to sign out of the Kids Villa Academy Portal? You will need your passkey to log back in.</p>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-black rounded-2xl transition-all cursor-pointer border border-stone-200 uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSignOut}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-2xl transition-all cursor-pointer shadow-sm uppercase tracking-wider"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shared URL Synchronization Portal Modal */}
      <SyncedPortalHub
        isOpen={showSyncModal}
        currentUsername={currentUserSession?.username || 'Staff Member'}
        onGetLocalState={handleGetLocalState}
        onStateLoaded={handleStateLoaded}
        firebaseSyncEnabled={firebaseSyncEnabled}
        onToggleFirebaseSync={setFirebaseSyncEnabled}
        onClose={() => setShowSyncModal(false)}
      />

    </div>
  );
}
