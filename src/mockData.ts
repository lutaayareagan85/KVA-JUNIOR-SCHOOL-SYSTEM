import { Pupil, Staff, PorridgeScheduleItem, ECDReport, AttendanceRecord, Expenditure, MiscellaneousIncome, OperationalCenter, Vendor } from './types';

export const INITIAL_PUPILS: Pupil[] = [
  {
    id: 'P001',
    fullName: 'Babirye Shifra',
    classLevel: 'KG1',
    age: 3,
    gender: 'Girl',
    guardianName: 'Ssewankambo David',
    guardianPhone: '+256 702 445588',
    guardianEmail: 'd.ssewankambo@gmail.com',
    homeVillage: 'Kyanja',
    homeDistrict: 'Kampala',
    immunized: true,
    termFeesRequired: 400000,
    installments: [
      {
        id: 'I001',
        amount: 250000,
        date: '2026-05-15',
        paymentMethod: 'Bank Slip',
        receiptNo: 'RCB-2026-4011',
        notes: 'First installment paid at Centenary Bank.'
      }
    ],
    requirements: [
      { name: 'Toilet Paper (2 rolls)', brought: true, dateBrought: '2026-05-18' },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: true, dateBrought: '2026-05-18' },
      { name: 'Broom (Sisal/Soft)', brought: false },
      { name: 'Liquid Soap (1 Liter)', brought: true, dateBrought: '2026-05-20' },
      { name: 'Maize Flour (5kg for Porridge)', brought: false }
    ],
    status: 'Active',
    enrollmentDate: '2026-01-10',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80',
    shuttleJourneys: [
      {
        id: 'SJ-001',
        routeName: 'Kabalagala - Muyenga - Makindye',
        driverName: 'Uncle Moses',
        shuttleVanNo: 'UBC-401A',
        pickupTime: '07:15 AM',
        dropoffTime: '04:30 PM',
        status: 'Active',
        costPerTermUGX: 180000
      }
    ]
  },
  {
    id: 'P002',
    fullName: 'Kato Ivan Wasswa',
    classLevel: 'KG1',
    age: 3,
    gender: 'Boy',
    guardianName: 'Nakato Mary',
    guardianPhone: '+256 772 112233',
    guardianEmail: 'marynakato@yahoo.com',
    homeVillage: 'Kireka',
    homeDistrict: 'Wakiso',
    immunized: true,
    termFeesRequired: 400000,
    installments: [
      {
        id: 'I002',
        amount: 400000,
        date: '2026-05-10',
        paymentMethod: 'Mobile Money',
        receiptNo: 'MTN-MM-8832',
        notes: 'Paid in full via MTN MoMo Pay.'
      }
    ],
    requirements: [
      { name: 'Toilet Paper (2 rolls)', brought: true, dateBrought: '2026-05-10' },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: true, dateBrought: '2026-05-10' },
      { name: 'Broom (Sisal/Soft)', brought: true, dateBrought: '2026-05-10' },
      { name: 'Liquid Soap (1 Liter)', brought: true, dateBrought: '2026-05-10' },
      { name: 'Maize Flour (5kg for Porridge)', brought: true, dateBrought: '2026-05-12' }
    ],
    status: 'Active',
    enrollmentDate: '2026-01-12',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80',
    shuttleJourneys: [
      {
        id: 'SJ-002',
        routeName: 'Ntinda - Kiwatule - Bukoto',
        driverName: 'Uncle Robert',
        shuttleVanNo: 'UBC-928K',
        pickupTime: '07:45 AM',
        dropoffTime: '05:00 PM',
        status: 'Active',
        costPerTermUGX: 200000
      }
    ]
  },
  {
    id: 'P003',
    fullName: 'Mugisha Emmanuel Ronald',
    classLevel: 'KG3',
    age: 5,
    gender: 'Boy',
    guardianName: 'Tumusiime Grace',
    guardianPhone: '+256 752 908070',
    guardianEmail: 'gtumusiime@gmail.com',
    homeVillage: 'Najjera',
    homeDistrict: 'Wakiso',
    immunized: true,
    termFeesRequired: 450000,
    installments: [
      {
        id: 'I003',
        amount: 300000,
        date: '2026-05-12',
        paymentMethod: 'Bank Slip',
        receiptNo: 'STAN-44332',
        notes: 'Paid at Stanbic Bank.'
      }
    ],
    requirements: [
      { name: 'Toilet Paper (2 rolls)', brought: true, dateBrought: '2026-05-12' },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: true, dateBrought: '2026-05-12' },
      { name: 'Broom (Sisal/Soft)', brought: true, dateBrought: '2026-05-15' },
      { name: 'Liquid Soap (1 Liter)', brought: false },
      { name: 'Maize Flour (5kg for Porridge)', brought: false }
    ],
    status: 'Active',
    enrollmentDate: '2025-01-15',
    photoUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'P004',
    fullName: 'Akello Juliet Apio',
    classLevel: 'KG2',
    age: 4,
    gender: 'Girl',
    guardianName: 'Okello Moses',
    guardianPhone: '+256 781 445566',
    guardianEmail: 'mokello@corp.co.ug',
    homeVillage: 'Ntinda',
    homeDistrict: 'Kampala',
    immunized: true,
    termFeesRequired: 420000,
    installments: [],
    requirements: [
      { name: 'Toilet Paper (2 rolls)', brought: false },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: false },
      { name: 'Broom (Sisal/Soft)', brought: false },
      { name: 'Liquid Soap (1 Liter)', brought: false },
      { name: 'Maize Flour (5kg for Porridge)', brought: false }
    ],
    status: 'Active',
    enrollmentDate: '2025-05-20',
    photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80'
  },
  {
    id: 'P005',
    fullName: 'Chelangat Brenda',
    classLevel: 'KG3',
    age: 5,
    gender: 'Girl',
    guardianName: 'Cherotich Alfred',
    guardianPhone: '+256 701 556677',
    homeVillage: 'Naalya',
    homeDistrict: 'Kampala',
    immunized: true,
    termFeesRequired: 450000,
    installments: [
      {
        id: 'I004',
        amount: 450000,
        date: '2026-05-11',
        paymentMethod: 'Agent Banking',
        receiptNo: 'EQB-99812',
        notes: 'Paid fully through Equity Bank Agent.'
      }
    ],
    requirements: [
      { name: 'Toilet Paper (2 rolls)', brought: true, dateBrought: '2026-05-11' },
      { name: 'Ream of Printing Paper (Rotatrim)', brought: true, dateBrought: '2026-05-11' },
      { name: 'Broom (Sisal/Soft)', brought: true, dateBrought: '2026-05-11' },
      { name: 'Liquid Soap (1 Liter)', brought: true, dateBrought: '2026-05-11' },
      { name: 'Maize Flour (5kg for Porridge)', brought: true, dateBrought: '2026-05-11' }
    ],
    status: 'Active',
    enrollmentDate: '2025-01-20',
    photoUrl: 'https://images.unsplash.com/photo-1514161911277-41d7d296ae22?auto=format&fit=crop&w=150&h=150&q=80'
  }
];

export const INITIAL_STAFF: Staff[] = [
  { id: 'S001', fullName: 'Namatovu Florence', role: 'Head Teacher', phone: '+256 772 304050', salaryUGX: 1200000, assignedClass: 'All', photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&h=250&q=80' },
  { id: 'S002', fullName: 'Atwine Patience', role: 'Class Teacher', phone: '+256 703 668822', salaryUGX: 800000, assignedClass: 'KG1', photoUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=250&h=250&q=80' },
  { id: 'S003', fullName: 'Apio Martha', role: 'Class Teacher', phone: '+256 782 119955', salaryUGX: 800000, assignedClass: 'KG2', photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&h=250&q=80' },
  { id: 'S004', fullName: 'Okurut Daniel', role: 'Class Teacher', phone: '+256 754 332211', salaryUGX: 850000, assignedClass: 'KG3', photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&h=250&q=80' },
  { id: 'S005', fullName: 'Nakitende Proscovia', role: 'Nursery Caretaker', phone: '+256 701 440022', salaryUGX: 500000, assignedClass: 'KG1', photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&h=250&q=80' },
  { id: 'S006', fullName: 'Auma Joyce', role: 'Cook', phone: '+256 775 558833', salaryUGX: 450000, assignedClass: 'All', photoUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=250&h=250&q=80' }
];

export const PORRIDGE_SCHEDULE: PorridgeScheduleItem[] = [
  { day: 'Monday', time: '10:00 AM', type: 'Milk Porridge (Maize)', snack: 'Bananas' },
  { day: 'Tuesday', time: '10:00 AM', type: 'Soya Porridge', snack: 'Pancakes (Kabalagala)' },
  { day: 'Wednesday', time: '10:00 AM', type: 'Millet Porridge (Uji)', snack: 'Slice of Watermelon' },
  { day: 'Thursday', time: '10:00 AM', type: 'Cocoa Porridge', snack: 'Biscuits' },
  { day: 'Friday', time: '10:00 AM', type: 'Lemon Maize Porridge', snack: 'Apple slice / Sweet Potatoes' }
];

export const INITIAL_REPORTS: ECDReport[] = [
  {
    id: 'R001',
    pupilId: 'P001',
    term: 'Term 1',
    academicYear: '2026',
    socialEmotional: 2,
    physicalDevelopment: 2,
    languageCommunication: 3,
    mathematicalPlay: 2,
    healthNutrition: 3,
    literacy1: 'A',
    literacy2: 'B',
    socialDevelopment: 'A',
    healthHabits: 'A',
    mathematics: 'B',
    teacherComments: 'Shifra is a lovely young girl who speaks exceptionally well. She is adjusting beautifully, loves language games and is very clean.',
    localTranslation: 'Shifra mwana muwulize nnyo era ayogera bulungi ddala. Bulayimu ne banne buyitirivu era mwana muyonjo.',
    headTeacherComments: 'A solid and promising start for Shifra in KG1. Keep up the enthusiasm!',
    generatedAt: '2026-05-10T11:00:00.000Z',
    customSubjects: [
      { subjectName: 'Phonics & Sound Imitation', score: 3, competency: 'Demonstrates outstanding acoustic tracing and mimicry of vowel clusters.' },
      { subjectName: 'Clay Modelling & Textures', score: 2, competency: 'Understands basic structural balance with play clay under minimal caregiver guidance.' }
    ]
  },
  {
    id: 'R002',
    pupilId: 'P002',
    term: 'Term 1',
    academicYear: '2026',
    socialEmotional: 3,
    physicalDevelopment: 3,
    languageCommunication: 2,
    mathematicalPlay: 3,
    healthNutrition: 3,
    literacy1: 'B',
    literacy2: 'C',
    socialDevelopment: 'A',
    healthHabits: 'A',
    mathematics: 'A',
    teacherComments: 'Ivan Ivan Kato participates in every single mathematical play with immense concentration. He shares toys quickly and has excellent control in physical outdoor games.',
    localTranslation: 'Kato amanyi nnyo okubala era ne mu mizannyo gy’obwongo akola nnyo. Ayagala bumbula era asaasanya eby’okuzannyisa ne banne.',
    headTeacherComments: 'Excellent social-emotional progress! Kato is an absolute joy to have in KG1.',
    generatedAt: '2026-05-11T14:30:00.000Z',
    customSubjects: [
      { subjectName: 'Mathematical Block Sorting', score: 3, competency: 'Sorts octagonal and hexagonal wooden blocks exceptionally quickly.' },
      { subjectName: 'Rhythmic Gross Motor Jumping', score: 3, competency: 'Performs balance beam hopping with high agility and smiling confidence.' }
    ]
  }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { date: '2026-06-15', presentStudentIds: ['P001', 'P002', 'P003', 'P005'] },
  { date: '2026-06-16', presentStudentIds: ['P001', 'P002', 'P003', 'P004', 'P005'] },
  { date: '2026-06-17', presentStudentIds: ['P002', 'P003', 'P005'] }
];

export const INITIAL_EXPENDITURES: Expenditure[] = [
  {
    id: 'E001',
    itemName: 'Sugar (50kg Bag for Porridge)',
    category: 'Food & Kitchen Supplies',
    amount: 180000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-02',
    status: 'Paid',
    supplierVendor: 'Nakasero Whole Market',
    notes: 'Premium grain brown sugar for nutritious porridge sweetness.',
    center: 'Porridge Kettle & Kitchen Supplies'
  },
  {
    id: 'E002',
    itemName: 'Millet & Maize Flour (Monthly School Porridge Supply)',
    category: 'Food & Kitchen Supplies',
    amount: 240000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-05',
    status: 'Paid',
    supplierVendor: 'Kitemu Millers & Traders',
    notes: 'Ground millet mixed with fortified corn flour.',
    center: 'Porridge Kettle & Kitchen Supplies'
  },
  {
    id: 'E003',
    itemName: 'Prepaid Umeme Power Tokens (300 units)',
    category: 'Utilities & Rent',
    amount: 150000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-12',
    status: 'Paid',
    supplierVendor: 'Umeme Ltd Uganda',
    notes: 'Provides lighting for classrooms & power for baby rest bays.',
    center: 'General Operations & Administration'
  },
  {
    id: 'E004',
    itemName: 'Firewood Bundle (Fuel for Boiling Morning Porridge)',
    category: 'Food & Kitchen Supplies',
    amount: 120000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-10',
    status: 'Paid',
    supplierVendor: 'Kampala Wood Distributors Ltd',
    notes: 'Delivered securely to the outdoor kitchen store.',
    center: 'Porridge Kettle & Kitchen Supplies'
  },
  {
    id: 'E005',
    itemName: 'Reams of Rotatrim A4 Printing Paper (6 Box Carton)',
    category: 'Stationery & Printing',
    amount: 95000,
    recurrence: 'Termly',
    dateAdded: '2026-05-20',
    status: 'Paid',
    supplierVendor: 'Arua Stationeries Ltd',
    notes: 'Essential for duplicating Exams and assessments.',
    center: 'Academic Instruction & Tuition'
  },
  {
    id: 'E006',
    itemName: 'Staff Morning Tea, Bread & Milk (Monthly Allocation)',
    category: 'Staff Lunch & Welfare',
    amount: 140000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-01',
    status: 'Paid',
    supplierVendor: 'Kitemu Bakeries & Supermarket',
    notes: 'Supports Tr. Florence, Tr. Patience, and caretakers on morning duties.',
    center: 'General Operations & Administration'
  },
  {
    id: 'E007',
    itemName: 'NWSC Prepaid Water Token (12,000 Liters)',
    category: 'Utilities & Rent',
    amount: 80000,
    recurrence: 'Monthly',
    dateAdded: '2026-06-15',
    status: 'Pending',
    supplierVendor: 'National Water & Sewerage Corp',
    notes: 'To keep clean toilets, sanitizers & handwashing bays supplied.',
    center: 'General Operations & Administration'
  },
  {
    id: 'E008',
    itemName: 'High-Concentration Omo & Liquid Hand Soap Can',
    category: 'Sanitation & Hygiene',
    amount: 45000,
    recurrence: 'Weekly',
    dateAdded: '2026-06-16',
    status: 'Pending',
    supplierVendor: 'Mukwano Industries Supplier',
    notes: 'Essential weekly hygiene replenishment.',
    center: 'General Operations & Administration'
  },
  {
    id: 'E009',
    itemName: 'Fuel for Nursery Van Route Run (Weekly Allocation)',
    category: 'Fuel & Transport',
    amount: 140000,
    recurrence: 'Weekly',
    dateAdded: '2026-06-14',
    status: 'Paid',
    supplierVendor: 'Shell Uganda Kitemu Service Bay',
    notes: 'Fuel allocated for picking up toddlers from surrounding villages.',
    center: 'School Van & Boarding Transport'
  },
  {
    id: 'E010',
    itemName: 'Procuring 15 KVA Branded Sweaters',
    category: 'Others',
    amount: 220000,
    recurrence: 'One-time',
    dateAdded: '2026-06-08',
    status: 'Paid',
    supplierVendor: 'Mukono Knitters & Tailors',
    notes: 'KVA Crested wool sweaters for uniform stock replenishment.',
    center: 'Stationery & Uniforms Store'
  }
];

export const INITIAL_MISC_INCOME: MiscellaneousIncome[] = [
  {
    id: 'MI001',
    sourceName: 'School Uniform & Sweaters Sales (5 Sets)',
    category: 'Uniform Sales',
    amount: 350000,
    dateAdded: '2026-06-10',
    paymentMethod: 'Cash',
    receiptNo: 'UNIF-2026-102',
    center: 'Stationery & Uniforms Store',
    notes: 'Sold to new KG1 parents on Wednesday admission.'
  },
  {
    id: 'MI002',
    sourceName: 'Donor Contribution for Special Needs Braille & Toy Kits',
    category: 'Donations & Grants',
    amount: 500000,
    dateAdded: '2026-06-12',
    paymentMethod: 'Bank Deposit',
    receiptNo: 'DON-KVA-889',
    center: 'Academic Instruction & Tuition',
    notes: 'Contributed by loving alumni toward our playroom setup.'
  },
  {
    id: 'MI003',
    sourceName: 'Weekly School Van Transport Fare Commutations - Wk2',
    category: 'Transport Fare',
    amount: 260000,
    dateAdded: '2026-06-15',
    paymentMethod: 'Mobile Money',
    receiptNo: 'MM-TXN-9022',
    center: 'School Van & Boarding Transport',
    notes: 'Aggregated mobile payments from parents on the Kitemu/Fika-Salama routes.'
  }
];

export const INITIAL_OPERATIONAL_CENTERS: OperationalCenter[] = [
  {
    id: 'C1',
    name: 'Academic Instruction & Tuition',
    description: 'Main classroom teaching, report card assessments, printing NCDC curriculum booklets, classroom kits.',
    type: 'Dual',
    accent: 'amber'
  },
  {
    id: 'C2',
    name: 'Porridge Kettle & Kitchen Supplies',
    description: 'Daily morning millet porridge feeds for toddlers, sugar sacks, boiling wood fuel bundles, cook wages.',
    type: 'Dual',
    accent: 'emerald'
  },
  {
    id: 'C3',
    name: 'School Van & Boarding Transport',
    description: 'Nursery school van driver routes, shell petrol fuel replenishment, mechanical service, tire repairs.',
    type: 'Dual',
    accent: 'blue'
  },
  {
    id: 'C4',
    name: 'Stationery & Uniforms Store',
    description: 'Branded school sweets, exercise writing books sales, uniform stitching, required items reserve.',
    type: 'Dual',
    accent: 'purple'
  },
  {
    id: 'C5',
    name: 'General Operations & Administration',
    description: 'Prepaid Umeme power tokens, NWSC clean water taps, building maintenance and caretaker allowances.',
    type: 'Dual',
    accent: 'stone'
  }
];

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'V001',
    name: 'Nakasero Whole Market',
    contactPerson: 'Faridah Nakintu',
    phone: '+256 701 445588',
    email: 'info@nakaseromarket.co.ug',
    address: 'Market Square Rd, Kampala, Uganda',
    notes: 'Primary supplier for agricultural produce, fresh food, and porridge additions.'
  },
  {
    id: 'V002',
    name: 'Kitemu Millers & Traders',
    contactPerson: 'Haji Bukenya Swaib',
    phone: '+256 772 990112',
    email: 'orders@kitemumillers.ug',
    address: 'Masaka Road, Kitemu, Uganda',
    notes: 'Supplier of premium ground maize and nutritious millet porridge flours.'
  },
  {
    id: 'V003',
    name: 'Umeme Ltd Uganda',
    contactPerson: 'Umeme Care Center',
    phone: '+256 312 360600',
    email: 'callcentre@umeme.co.ug',
    address: 'Lugogo Bypass, Kampala, Uganda',
    notes: 'National grid power provider. Registered tokens and electricity accounts.'
  },
  {
    id: 'V004',
    name: 'Kampala Wood Distributors Ltd',
    contactPerson: 'Ronald Mukasa',
    phone: '+256 754 112233',
    email: 'sales@kampalawood.ug',
    address: 'Industrial Area, Kampala, Uganda',
    notes: 'Wood logs and energy pellets for clean kitchen boiling furnaces.'
  },
  {
    id: 'V005',
    name: 'Arua Stationeries Ltd',
    contactPerson: 'Arap Moi Emmanuel',
    phone: '+256 781 556677',
    email: 'arua.stationeries@gmail.com',
    address: 'Adumi Road, Arua, Uganda',
    notes: 'Supplier for termly exercise writing books, crayons, pencils, and printing materials.'
  },
  {
    id: 'V006',
    name: 'Kitemu Bakeries & Supermarket',
    contactPerson: 'Nalongo Sanyu',
    phone: '+256 704 883311',
    email: 'sales@kitemubakeries.ug',
    address: 'Kitemu Trading Center, Uganda',
    notes: 'Bakery supplier of snacks, cakes, and quick kitchen condiments.'
  },
  {
    id: 'V007',
    name: 'National Water & Sewerage Corp',
    contactPerson: 'NWSC Care Unit',
    phone: '+256 800 200977',
    email: 'customerservice@nwsc.co.ug',
    address: 'Jinja Road, Kampala, Uganda',
    notes: 'State company supplying clean piped water for kitchen and sanitation use.'
  },
  {
    id: 'V008',
    name: 'Mukwano Industries Supplier',
    contactPerson: 'Deepak Patel',
    phone: '+256 414 313313',
    email: 'sales@mukwano.com',
    address: 'Mukwano Road, Kampala, Uganda',
    notes: 'Bulk washing liquid soap, sanitizers, and detergents for hygienic rest areas.'
  },
  {
    id: 'V009',
    name: 'Shell Uganda Kitemu Service Bay',
    contactPerson: 'Mugabe Robert',
    phone: '+256 312 210120',
    email: 'kitemu@vivoenergy.com',
    address: 'Masaka Road, Kitemu, Uganda',
    notes: 'Fuel card provider & maintenance garage for the school shuttle van.'
  },
  {
    id: 'V010',
    name: 'Mukono Knitters & Tailors',
    contactPerson: 'Sister Mary Florence',
    phone: '+256 775 448899',
    email: 'mukonoknitters@gmail.com',
    address: 'Kayunga Road, Mukono, Uganda',
    notes: 'Makers of custom branded high-contrast school sweaters, uniforms, and sports kit.'
  }
];


