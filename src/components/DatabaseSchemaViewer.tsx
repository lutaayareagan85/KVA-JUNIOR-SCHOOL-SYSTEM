import React, { useState } from 'react';
import { Database, GitFork, BookOpen, Send, CheckCircle, Code, Layers, Download } from 'lucide-react';
import { Pupil, Staff } from '../types';

interface DatabaseSchemaViewerProps {
  pupils: Pupil[];
  staff: Staff[];
}

interface SchemaTable {
  name: string;
  description: string;
  fields: { name: string; type: string; constraints: string; sample: string }[];
}

const DATABASE_SCHEMA: SchemaTable[] = [
  {
    name: 'schools',
    description: 'Multi-campus branches directory under the national pre-school framework',
    fields: [
      { name: 'id', type: 'VARCHAR(100)', constraints: 'PRIMARY KEY', sample: 'SCH-KLA01' },
      { name: 'branch_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', sample: 'Central Kampala Pre-School' },
      { name: 'district', type: 'VARCHAR(100)', constraints: 'NOT NULL', sample: 'Kampala' },
      { name: 'district_branch_code', type: 'VARCHAR(20)', constraints: 'UNIQUE', sample: 'UGA-KLA-CENT' },
    ]
  },
  {
    name: 'pupils',
    description: 'Student core identities, basic bio, UNEPI health Complete tags and active levels',
    fields: [
      { name: 'id', type: 'VARCHAR(20)', constraints: 'PRIMARY KEY', sample: 'P001' },
      { name: 'full_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', sample: 'Babirye Shifra' },
      { name: 'class_level', type: 'VARCHAR(50)', constraints: 'CHECK(KG1/KG2/KG3)', sample: 'KG1' },
      { name: 'gender', type: 'VARCHAR(10)', constraints: 'CHECK(Boy/Girl)', sample: 'Girl' },
      { name: 'guardian_name', type: 'VARCHAR(255)', constraints: 'NOT NULL', sample: 'Mukasa Ronald' },
      { name: 'guardian_phone', type: 'VARCHAR(30)', constraints: 'NOT NULL', sample: '+256 702 445588' },
      { name: 'immunized_certified', type: 'BOOLEAN', constraints: 'DEFAULT FALSE', sample: 'TRUE' },
      { name: 'branch_id', type: 'VARCHAR(100)', constraints: 'REFERENCES schools(id)', sample: 'SCH-KLA01' }
    ]
  },
  {
    name: 'ecd_progress_cards',
    description: 'NCDC terminal milestones evaluation sheets',
    fields: [
      { name: 'id', type: 'VARCHAR(50)', constraints: 'PRIMARY KEY', sample: 'R283910' },
      { name: 'pupil_id', type: 'VARCHAR(20)', constraints: 'REFERENCES pupils(id)', sample: 'P001' },
      { name: 'term', type: 'VARCHAR(20)', constraints: 'CHECK(Term 1/2/3)', sample: 'Term 2' },
      { name: 'social_emotional', type: 'INTEGER', constraints: 'CHECK(1-3)', sample: '2' },
      { name: 'physical_motor', type: 'INTEGER', constraints: 'CHECK(1-3)', sample: '3' },
      { name: 'language_sounds', type: 'INTEGER', constraints: 'CHECK(1-3)', sample: '2' },
      { name: 'mathematical_play', type: 'INTEGER', constraints: 'CHECK(1-3)', sample: '3' },
      { name: 'health_hygiene', type: 'INTEGER', constraints: 'CHECK(1-3)', sample: '2' },
      { name: 'ai_comments', type: 'TEXT', constraints: 'NULLABLE (Gemini Output)', sample: 'Shifra participates warmly...' }
    ]
  },
  {
    name: 'finance_ledger',
    description: 'Double-entry tracking school tuition receipts and MM transactions in UGX',
    fields: [
      { name: 'id', type: 'VARCHAR(50)', constraints: 'PRIMARY KEY', sample: 'REC-29312' },
      { name: 'pupil_id', type: 'VARCHAR(20)', constraints: 'REFERENCES pupils(id)', sample: 'P001' },
      { name: 'amount_ugx', type: 'BIGINT', constraints: 'CHECK(>= 0)', sample: '250000' },
      { name: 'payment_method', type: 'VARCHAR(50)', constraints: 'CHECK(MM/Bank/Cash)', sample: 'Mobile Money' },
      { name: 'momo_transaction_id', type: 'VARCHAR(100)', constraints: 'NULLABLE', sample: 'TX-MTN-9382103' }
    ]
  }
];

const API_ROUTES = [
  {
    method: 'POST',
    path: '/api/gemini/generate-comment',
    description: 'Send child accomplishments and growth sectors to generate warm, localized school report comments.',
    parameters: {
      pupilName: 'string (Required)',
      accomplishments: 'string',
      improvementAreas: 'string',
      tone: '"Encouraging & Warm" | "Constructive & Clear"',
      language: '"English" | "Luganda" | "Runyankole" | "Acholi" | "Iteso" | "Lusoga"'
    },
    sampleResponse: {
      text: '"Sserwadda is excelling in rhythmic games. Katandika okutegeera ennimi zaffe bulungi..."'
    }
  },
  {
    method: 'POST',
    path: '/api/momo/push-payment',
    description: 'Simulates pushing an instant USSD overlay trigger to parents Airtel/MTN Uganda line for fees collection.',
    parameters: {
      pupilId: 'string (Required)',
      phoneNumber: 'string (e.g. +256772...)',
      amountUGX: 'integer'
    },
    sampleResponse: {
      transactionId: 'TX-MTN-3910398',
      status: 'USSD overlay triggered success, waiting for PIN approval.'
    }
  },
  {
    method: 'POST',
    path: '/api/sms/send-notice',
    description: 'Publish bulk SMS warning to parent concerning unpaid balances or immunization checks routine.',
    parameters: {
      guardianPhone: 'string',
      message: 'string (max 160 chars)'
    },
    sampleResponse: {
      status: 'delivered',
      smsCount: 1,
      costUGX: 25
    }
  }
];

export function DatabaseSchemaViewer({ pupils, staff }: DatabaseSchemaViewerProps) {
  const [activeTab, setActiveTab] = useState<'erd' | 'schema' | 'api'>('erd');
  const [selectedTable, setSelectedTable] = useState<string>('pupils');
  
  // API Docs Test parameters
  const [testPhoneNumber, setTestPhoneNumber] = useState('+256 772 889900');
  const [testAmount, setTestAmount] = useState('150000');
  const [apiResponseText, setApiResponseText] = useState<string | null>(null);
  const [apiTriggering, setApiTriggering] = useState(false);

  const handleTriggerTestAPI = () => {
    setApiTriggering(true);
    setApiResponseText(null);
    setTimeout(() => {
      setApiTriggering(false);
      setApiResponseText(JSON.stringify({
        status: 'SUCCESS',
        transactionId: `TX-MOMO-${Math.floor(100000 + Math.random() * 900000)}`,
        momoStatus: 'Instant push receipt printed. Parent approved transaction on Uganda USSD gateway.',
        feesUpdatedUGX: Number(testAmount),
        localTime: new Date().toISOString()
      }, null, 2));
    }, 1200);
  };

  // CSV Emitter utilities
  const escapeCSVValue = (val: any): string => {
    if (val === undefined || val === null) return '';
    let str = String(val);
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const triggerDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPupilsCSV = () => {
    if (!pupils || pupils.length === 0) {
      alert("No pupil data available to export.");
      return;
    }
    const headers = ['ID', 'Full Name', 'Class Level', 'Age', 'Gender', 'Guardian Name', 'Guardian Phone', 'Home Village', 'Home District', 'Immunized', 'Term Fees Required', 'Status', 'Enrollment Date'];
    const rows = pupils.map(p => [
      p.id,
      p.fullName,
      p.classLevel,
      p.age,
      p.gender,
      p.guardianName,
      p.guardianPhone,
      p.homeVillage,
      p.homeDistrict,
      p.immunized ? 'Yes' : 'No',
      p.termFeesRequired,
      p.status,
      p.enrollmentDate
    ]);

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(r => r.map(escapeCSVValue).join(','))
    ].join('\n');

    triggerDownload(csvContent, 'nursery_pupil_registry.csv');
  };

  const downloadStaffCSV = () => {
    if (!staff || staff.length === 0) {
      alert("No staff data available to export.");
      return;
    }
    const headers = ['ID', 'Full Name', 'Role', 'Phone', 'Assigned Class', 'Salary (UGX)'];
    const rows = staff.map(s => [
      s.id,
      s.fullName,
      s.role,
      s.phone,
      s.assignedClass || 'All',
      s.salaryUGX
    ]);

    const csvContent = [
      headers.map(escapeCSVValue).join(','),
      ...rows.map(r => r.map(escapeCSVValue).join(','))
    ].join('\n');

    triggerDownload(csvContent, 'nursery_staff_directory.csv');
  };

  const downloadCombinedCSV = () => {
    let lines: string[] = [];
    
    // Title Block
    lines.push('UGANDAN SCHOOL ECD REGISTRY REPORT');
    lines.push(`Generated On,${new Date().toISOString().split('T')[0]}`);
    lines.push('');

    // Pupils Section
    lines.push('--- LEARNERS ---');
    const pupilHeaders = ['ID', 'Full Name', 'Class Level', 'Age', 'Gender', 'Guardian Name', 'Guardian Phone', 'Home Village', 'Home District', 'Immunized', 'Term Fees Required', 'Status', 'Enrollment Date'];
    lines.push(pupilHeaders.map(escapeCSVValue).join(','));
    if (pupils && pupils.length > 0) {
      pupils.forEach(p => {
        const row = [
          p.id,
          p.fullName,
          p.classLevel,
          p.age,
          p.gender,
          p.guardianName,
          p.guardianPhone,
          p.homeVillage,
          p.homeDistrict,
          p.immunized ? 'Yes' : 'No',
          p.termFeesRequired,
          p.status,
          p.enrollmentDate
        ];
        lines.push(row.map(escapeCSVValue).join(','));
      });
    } else {
      lines.push('No pupil data records available');
    }

    lines.push('');
    lines.push('');

    // Staff Section
    lines.push('--- STAFF DIRECTORY ---');
    const staffHeaders = ['ID', 'Full Name', 'Role', 'Phone', 'Assigned Class', 'Salary (UGX)'];
    lines.push(staffHeaders.map(escapeCSVValue).join(','));
    if (staff && staff.length > 0) {
      staff.forEach(s => {
        const row = [
          s.id,
          s.fullName,
          s.role,
          s.phone,
          s.assignedClass || 'All',
          s.salaryUGX
        ];
        lines.push(row.map(escapeCSVValue).join(','));
      });
    } else {
      lines.push('No staff data records available');
    }

    triggerDownload(lines.join('\n'), 'school_combined_registry.csv');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Selector Menu tabs */}
      <div className="flex border-b border-[#E0D8CC]">
        <button
          onClick={() => setActiveTab('erd')}
          className={`px-6 py-3 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'erd'
              ? 'border-[#6B8E23] text-[#3D2B1F]'
              : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
          }`}
        >
          <GitFork className="w-4 h-4 text-[#6B8E23]" /> Interactive ERD Layout
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`px-6 py-3 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'schema'
              ? 'border-[#6B8E23] text-[#3D2B1F]'
              : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
          }`}
        >
          <Database className="w-4 h-4 text-[#6B8E23]" /> Comprehensive Schema
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-6 py-3 font-bold text-sm tracking-tight flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'api'
              ? 'border-[#6B8E23] text-[#3D2B1F]'
              : 'border-transparent text-[#7D6B5D] hover:text-[#3D2B1F]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#6B8E23]" /> REST API Documentation
        </button>
      </div>

      {/* CSV Export & Audit Card */}
      <div className="bg-white p-5 rounded-3xl border border-[#E0D8CC] flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#E8F1D7] text-[#6B8E23] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Download className="w-3.5 h-3.5 animate-pulse" /> EMIS Manual Compliance Export
          </div>
          <h4 className="font-extrabold text-[#3D2B1F] text-sm">Download Pupil & Staff Registry records</h4>
          <p className="text-xs text-[#7D6B5D] leading-relaxed">
            Generate offline spreadsheets in standard RFC-4180 CSV format for local ministry audit registers and school record keeping.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            id="download_combined_csv"
            type="button"
            onClick={downloadCombinedCSV}
            className="px-4 py-2.5 bg-[#3D2B1F] hover:bg-[#5A3E2B] text-[#FFFFFC] rounded-xl text-xs font-black shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Combined Registry (CSV)
          </button>
          <button
            id="download_pupils_csv"
            type="button"
            onClick={downloadPupilsCSV}
            className="px-4 py-2.5 bg-white border border-[#E0D8CC] text-[#3D2B1F] hover:bg-stone-50 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#6B8E23]" /> Pupils Only (CSV)
          </button>
          <button
            id="download_staff_csv"
            type="button"
            onClick={downloadStaffCSV}
            className="px-4 py-2.5 bg-white border border-[#E0D8CC] text-[#3D2B1F] hover:bg-stone-50 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#8C5A3C]" /> Staff Only (CSV)
          </button>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE ERD */}
      {activeTab === 'erd' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-2">
            <h4 className="font-extrabold text-[#5A3E2B] text-base">Entity Relationship Model (PostgreSQL structure)</h4>
            <p className="text-xs text-[#7D6B5D] leading-relaxed">
              This interactive diagram represents relationships between campuses, pupils, medical tracking logs, and tuition transactions logs. Hover / inspect lines below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center p-6 bg-[#F2EDE4]/40 rounded-3xl border border-[#E0D8CC] relative min-h-[400px]">
            
            {/* Box 1: Schools Table */}
            <div className="md:col-span-3 bg-white p-4 rounded-2xl border-2 border-[#3D2B1F] shadow-xs relative">
              <span className="absolute -top-3 left-4 bg-[#3D2B1F] text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase">
                Table: schools
              </span>
              <div className="mt-1 space-y-1 text-[11px] font-mono select-none">
                <p className="font-bold text-[#8C5A3C]">🔑 id [PK, VARCHAR]</p>
                <p>• branch_name [VARCHAR]</p>
                <p>• district [VARCHAR]</p>
                <div className="h-px bg-gray-200 my-1"></div>
                <p className="text-gray-400 font-sans text-[10px]">1-to-many lookup on pupils</p>
              </div>
            </div>

            {/* Visual connector line SVG */}
            <div className="hidden md:flex md:col-span-1 justify-center">
              <span className="text-[#3D2B1F] font-bold text-sm font-mono tracking-wider animate-pulse font-bold">──➜</span>
            </div>

            {/* Box 2: Pupils Table */}
            <div className="md:col-span-4 bg-white p-5 rounded-2xl border-2 border-[#6B8E23] shadow-md relative">
              <span className="absolute -top-3 left-4 bg-[#6B8E23] text-white font-mono text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Table: pupils
              </span>
              <div className="mt-1 space-y-1.5 text-[11px] font-mono">
                <p className="font-bold text-[#8C5A3C]">🔑 id [PK, VARCHAR]</p>
                <p className="text-blue-600">🔗 branch_id [FK, REFERENCES schools]</p>
                <p>• full_name [VARCHAR]</p>
                <p>• class_level [VARCHAR]</p>
                <p>• guardian_phone [VARCHAR]</p>
                <p>• immunized_certified [BOOLEAN]</p>
              </div>
            </div>

            {/* Splitting connectors */}
            <div className="hidden md:flex md:col-span-1 flex-col gap-16 justify-center text-center">
              <span className="text-[#3D2B1F] font-black text-xs font-mono">──➜ Ledger</span>
              <span className="text-[#3D2B1F] font-black text-xs font-mono">──➜ Progress</span>
            </div>

            {/* Right stack options */}
            <div className="md:col-span-3 space-y-6">
              
              {/* Box 3: Finance Ledger Table */}
              <div className="bg-white p-3.1 rounded-xl border border-[#3D2B1F]/60 relative">
                <span className="absolute -top-2.5 left-3 bg-[#8C5A3C] text-white font-mono text-[8px] px-2 rounded-full font-bold">
                  finance_ledger
                </span>
                <div className="text-[10px] font-mono mt-1 space-y-1">
                  <p className="font-bold">🔑 id [PK]</p>
                  <p className="text-blue-600">🔗 pupil_id [FK]</p>
                  <p>• amount_ugx [BIGINT]</p>
                </div>
              </div>

              {/* Box 4: Progress Cards */}
              <div className="bg-white p-3.1 rounded-xl border border-[#3D2B1F]/60 relative">
                <span className="absolute -top-2.5 left-3 bg-[#6B8E23] text-white font-mono text-[8px] px-2 rounded-full font-bold">
                  ecd_progress_cards
                </span>
                <div className="text-[10px] font-mono mt-1 space-y-1">
                  <p className="font-bold">🔑 id [PK]</p>
                  <p className="text-blue-600">🔗 pupil_id [FK]</p>
                  <p className="text-purple-600">• score_domains [1-3]</p>
                  <p className="text-amber-700">• ai_comments [TEXT]</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW 2: SCHEMA EXPLORER TABLE */}
      {activeTab === 'schema' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left panel: List tables */}
          <div className="md:col-span-4 bg-white p-4 rounded-3xl border border-[#E0D8CC] h-fit space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-[#7D6B5D] tracking-wide block mb-2 px-1">PostgreSQL Tables</span>
            {DATABASE_SCHEMA.map(table => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  selectedTable === table.name
                    ? 'bg-[#E8F1D7] border-[#6B8E23] text-[#3D2B1F]'
                    : 'bg-white border-transparent text-[#7D6B5D] hover:bg-[#F2EDE4]/50 hover:text-[#3D2B1F]'
                }`}
              >
                <span>{table.name}</span>
                <span className="font-mono opacity-60">({table.fields.length} Columns)</span>
              </button>
            ))}
          </div>

          {/* Right panel: Table Schema specifications */}
          <div className="md:col-span-8 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden">
            {(() => {
              const tableObj = DATABASE_SCHEMA.find(t => t.name === selectedTable);
              if (!tableObj) return null;
              return (
                <div>
                  <div className="p-6 border-b border-[#F2EDE4] bg-[#FDFBF7]">
                    <h3 className="font-extrabold text-[#3D2B1F] text-base">Table Structure: <span className="font-mono text-[#6B8E23]">{tableObj.name}</span></h3>
                    <p className="text-xs text-[#7D6B5D] mt-1">{tableObj.description}</p>
                  </div>

                  <div className="p-6">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#E0D8CC] text-[#7D6B5D] font-bold">
                          <th className="py-2">Field Code</th>
                          <th className="py-2 font-mono">Data Type</th>
                          <th className="py-2">Constraints</th>
                          <th className="py-2 text-right">Row Sample</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E0D8CC]/60 font-mono">
                        {tableObj.fields.map(field => (
                          <tr key={field.name} className="hover:bg-slate-50/50">
                            <td className="py-2.5 font-bold text-[#3D2B1F]">{field.name}</td>
                            <td className="py-2.5 text-blue-600">{field.type}</td>
                            <td className="py-2.5 text-[#8C5A3C] font-semibold">{field.constraints}</td>
                            <td className="py-2.5 text-right font-semibold text-gray-500">{field.sample}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* VIEW 3: API ROUTES & SIMULATION PLAYGROUND */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] space-y-4">
            <h4 className="font-extrabold text-[#5A3E2B] text-base">School Management API documentation</h4>
            <p className="text-xs text-[#7D6B5D] leading-relaxed">
              These endpoint controllers link SMS service gateways, Airtel/MTN mobile wallets, and Gemini models. Authentic tokens are injected on server operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* API Endpoint selection */}
            <div className="lg:col-span-7 space-y-4">
              {API_ROUTES.map(route => (
                <div key={route.path} className="bg-white p-5 rounded-2xl border border-[#E0D8CC] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#6B8E23] text-white px-2 py-0.5 rounded-md font-mono text-[9px] font-bold">
                      {route.method}
                    </span>
                    <span className="font-mono text-xs font-black text-[#3D2B1F]">{route.path}</span>
                  </div>
                  <p className="text-xs text-[#7D6B5D] leading-relaxed font-semibold">{route.description}</p>
                  
                  <div className="bg-[#F2EDE4]/30 p-3.5 rounded-lg border border-[#E0D8CC]/55">
                    <span className="text-[9px] font-bold text-[#8C5A3C] uppercase block mb-1">Body JSON properties:</span>
                    <pre className="text-[10px] font-mono text-[#3D2B1F] overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(route.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>

            {/* MOMO Testing Sandbox Simulator */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden p-6 h-fit space-y-4">
              <div className="flex items-center gap-1.5 text-[#8C5A3C]">
                <Code className="w-5 h-5" />
                <h4 className="font-extrabold text-xs uppercase tracking-wider">MoMo API Simulation Sandbox</h4>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Parent wallet contact *</label>
                  <input
                    type="text"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="w-full text-xs p-2 bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg font-mono text-[#3D2B1F]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#7D6B5D] uppercase mb-1">Charge Amount (UGX) *</label>
                  <input
                    type="number"
                    value={testAmount}
                    onChange={(e) => setTestAmount(e.target.value)}
                    className="w-full text-xs p-2 bg-[#FDFBF7] border border-[#E0D8CC] rounded-lg font-mono text-[#3D2B1F] font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTriggerTestAPI}
                  disabled={apiTriggering}
                  className="w-full bg-[#6B8E23] hover:bg-[#58751d] text-white py-2 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {apiTriggering ? 'Executing Sandbox PUSH query...' : 'Initiate MoMo Push overlay'}
                </button>

                {apiResponseText && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <span className="text-[9px] font-bold text-[#6B8E23] block uppercase">HTTP Response 200 OK:</span>
                    <pre className="text-[10px] font-mono p-3 bg-neutral-900 text-green-400 rounded-lg overflow-x-auto whitespace-pre">
                      {apiResponseText}
                    </pre>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
