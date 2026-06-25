export type NurseryClass = 'KG1' | 'KG2' | 'KG3' | 'Primary One' | 'Primary Two' | 'Primary Three' | 'Primary Four' | 'Primary Five' | 'Primary Six' | 'Primary Seven';
export type Term = 'Term 1' | 'Term 2' | 'Term 3';
export type RequirementItemName = 'Toilet Paper (2 rolls)' | 'Ream of Printing Paper (Rotatrim)' | 'Broom (Sisal/Soft)' | 'Liquid Soap (1 Liter)' | 'Maize Flour (5kg for Porridge)';

export interface PupilRequirement {
  name: RequirementItemName;
  brought: boolean;
  dateBrought?: string;
}

export interface PaymentInstallment {
  id: string;
  amount: number; // in UGX
  date: string;
  paymentMethod: 'Bank Slip' | 'Mobile Money' | 'Cash' | 'Agent Banking' | 'Equity Bank' | 'DFCU Bank' | 'School Pay';
  receiptNo: string;
  notes?: string;
  center?: string; // Financial Center (e.g. 'Academic Instruction & Tuition', 'Porridge Kettle & Kitchen Supplies')
}

export interface ShuttleJourney {
  id: string;
  routeName: string; // e.g. "Kitemu - Nsangi - Wakiso" or "Kabalagala - Muyenga"
  driverName: string; // e.g. "Uncle Moses"
  shuttleVanNo: string; // e.g. "UBC-401A"
  pickupTime: string; // e.g. "07:15 AM"
  dropoffTime: string; // e.g. "04:30 PM"
  status: 'Active' | 'Suspended' | 'Completed';
  costPerTermUGX: number; // e.g. 150000
}

export interface Pupil {
  id: string;
  fullName: string;
  classLevel: NurseryClass;
  age: number;
  gender: 'Boy' | 'Girl';
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  homeVillage: string;
  homeDistrict: string;
  immunized: boolean;
  termFeesRequired: number; // e.g., 450000 UGX
  installments: PaymentInstallment[];
  requirements: PupilRequirement[];
  status: 'Active' | 'Suspended' | 'Completed';
  enrollmentDate: string;
  photoUrl?: string; // Learner photo
  shuttleJourneys?: ShuttleJourney[];
  nextOfKinName?: string;
  nextOfKinPhone?: string;
}

export interface CustomSubjectScore {
  subjectName: string;
  score: number | string; // score rating e.g., 90%, or level 1, 2, 3
  competency: string; // descriptive evaluation phrase
}

export interface ECDReport {
  id: string;
  pupilId: string;
  term: Term;
  academicYear: string;
  // Scores for standard Uganda ECD Learning Areas: 1 (Emerging), 2 (Achieving), 3 (Excelling)
  socialEmotional?: 1 | 2 | 3;
  physicalDevelopment?: 1 | 2 | 3;
  languageCommunication?: 1 | 2 | 3;
  mathematicalPlay?: 1 | 2 | 3;
  healthNutrition?: 1 | 2 | 3;
  
  // New Learning Areas with grades A, B, C, D, and E
  literacy1?: 'A' | 'B' | 'C' | 'D' | 'E';
  literacy2?: 'A' | 'B' | 'C' | 'D' | 'E';
  socialDevelopment?: 'A' | 'B' | 'C' | 'D' | 'E';
  healthHabits?: 'A' | 'B' | 'C' | 'D' | 'E';
  mathematics?: 'A' | 'B' | 'C' | 'D' | 'E';
  // Teacher and management notes
  teacherComments: string;
  localTranslation?: string;
  headTeacherComments: string;
  generatedAt?: string;
  customSubjects?: CustomSubjectScore[]; // Customizable subjects with scores and competencies
  learningAreaGrades?: Record<string, 'A' | 'B' | 'C' | 'D' | 'E'>;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  presentStudentIds: string[]; // List of pupilIds who were present
}

export interface Staff {
  id: string;
  fullName: string;
  role: 'Head Teacher' | 'Class Teacher' | 'Nursery Caretaker' | 'Cook' | 'Security Officer';
  phone: string;
  assignedClass?: NurseryClass | 'All';
  salaryUGX: number;
  photoUrl?: string;
  nextOfKinName?: string;
  nextOfKinPhone?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  month: string; // e.g., "June 2026"
  baseSalary: number; // in UGX
  allowances: number; // allowances, overtimes
  deductions: number; // NSSF, salary advances, local tax
  netPay: number; // baseSalary + allowances - deductions
  status: 'Paid' | 'Unpaid' | 'Processing';
  paymentDate?: string;
  paymentMethod?: 'Mobile Money' | 'Cash' | 'Bank Transfer' | 'Agent Banking';
  receiptNo?: string;
  notes?: string;
}

export interface PorridgeScheduleItem {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  type: string; // e.g. "Milk Porridge", "Millet Porridge"
  snack: string; // e.g. "Bananas", "Pancakes (Kabalagala)", "Sweet Potatoes"
  time: string; // e.g. "10:00 AM"
}

export interface Expenditure {
  id: string;
  itemName: string;
  category: 'Utilities & Rent' | 'Food & Kitchen Supplies' | 'Stationery & Printing' | 'Staff Lunch & Welfare' | 'Repairs & Maintenance' | 'Sanitation & Hygiene' | 'Fuel & Transport' | 'Others';
  amount: number; // in UGX
  recurrence: 'Weekly' | 'Monthly' | 'Termly' | 'One-time';
  dateAdded: string; // YYYY-MM-DD
  status: 'Paid' | 'Pending';
  supplierVendor?: string;
  notes?: string;
  center?: string; // Mapped Center (e.g. 'Academic Instruction & Tuition', 'Porridge Kettle & Kitchen Supplies')
}

export interface MiscellaneousIncome {
  id: string;
  sourceName: string; // e.g. "School Uniform Sales", "Special Events Entry Fee"
  category: 'Uniform Sales' | 'Transport Fare' | 'Donations & Grants' | 'Stationery Sales' | 'Other Sales & Services';
  amount: number; // in UGX
  dateAdded: string; // YYYY-MM-DD
  paymentMethod: 'Bank Deposit' | 'Mobile Money' | 'Cash';
  receiptNo: string;
  center: string; // e.g. "Stationery & Uniforms Store"
  notes?: string;
}

export interface OperationalCenter {
  id: string;
  name: string;
  description: string;
  type: 'Income' | 'Expenditure' | 'Dual';
  accent?: 'amber' | 'emerald' | 'blue' | 'purple' | 'stone' | 'indigo' | 'rose' | 'yellow';
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}


