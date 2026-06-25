import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Check, 
  X, 
  AlertTriangle, 
  HelpCircle,
  Users,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';
import { Pupil, Staff, NurseryClass } from '../types';

interface ExcelImporterProps {
  type: 'pupils' | 'staff';
  onImportCompleted: (importedData: any[]) => void;
  onClose: () => void;
}

export function ExcelImporter({ type, onImportCompleted, onClose }: ExcelImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    let headers: string[] = [];
    let sampleData: any[] = [];
    let filename = '';

    if (type === 'pupils') {
      headers = [
        "Full Name", 
        "Class Level", 
        "Age", 
        "Gender", 
        "Guardian Name", 
        "Guardian Phone", 
        "Guardian Email", 
        "Home Village", 
        "Home District", 
        "Term Fees Required UGX"
      ];
      sampleData = [
        {
          "Full Name": "Ssenyonga Derrick",
          "Class Level": "Top Class",
          "Age": 5,
          "Gender": "Boy",
          "Guardian Name": "Nakamya Beatrice",
          "Guardian Phone": "+256 701 554433",
          "Guardian Email": "beatrice@gmail.com",
          "Home Village": "Kitemu",
          "Home District": "Wakiso",
          "Term Fees Required UGX": 450000
        },
        {
          "Full Name": "Namubiru Patricia",
          "Class Level": "KG1",
          "Age": 3,
          "Gender": "Girl",
          "Guardian Name": "Katende Patrick",
          "Guardian Phone": "+256 772 112233",
          "Guardian Email": "",
          "Home Village": "Nsangi",
          "Home District": "Wakiso",
          "Term Fees Required UGX": 400000
        }
      ];
      filename = "KVA_Learners_Import_Template.xlsx";
    } else {
      headers = [
        "Full Name", 
        "Role", 
        "Phone Contact", 
        "Assigned Class", 
        "Salary UGX", 
        "Next of Kin Name", 
        "Next of Kin Contact"
      ];
      sampleData = [
        {
          "Full Name": "Nakitto Florence",
          "Role": "Class Teacher",
          "Phone Contact": "+256 755 889900",
          "Assigned Class": "Middle Class",
          "Salary UGX": 650000,
          "Next of Kin Name": "Musoke John (Husband)",
          "Next of Kin Contact": "+256 702 445566"
        },
        {
          "Full Name": "Kigozi Samuel",
          "Role": "Security Officer",
          "Phone Contact": "+256 782 554477",
          "Assigned Class": "All",
          "Salary UGX": 450000,
          "Next of Kin Name": "Kigozi Ruth (Sister)",
          "Next of Kin Contact": "+256 752 334455"
        }
      ];
      filename = "KVA_Staff_Import_Template.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, type === 'pupils' ? "Learners" : "Staff Directory");
    XLSX.writeFile(workbook, filename);
  };

  const processFile = (file: File) => {
    setErrorText(null);
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    // Simple extension backup check
    const isSpreadsheet = file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv');

    if (!validTypes.includes(file.type) && !isSpreadsheet) {
      setErrorText("Kindly upload a proper spreadsheet file (.xlsx, .xls, or .csv extension only).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          setErrorText("Could not read uploaded worksheet files data streams.");
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Parse into row JSON objects
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (rawJson.length === 0) {
          setErrorText("The selected spreadsheet does not contain any data rows.");
          return;
        }

        // Auto map columns
        const sampleRow = rawJson[0];
        const headers = Object.keys(sampleRow);
        setPreviewColumns(headers);

        // Map and validate rows based on import structure
        const validated = rawJson.map((row: any, index) => {
          if (type === 'pupils') {
            // Locate columns case insensitively
            const findVal = (keys: string[]) => {
              const matchedKey = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
              return matchedKey ? row[matchedKey] : '';
            };

            const fullName = findVal(['full name', 'fullname', 'name', 'learner name', 'student name']) || '';
            let rawClass = findVal(['class level', 'classlevel', 'class', 'nursery class', 'year']) || 'KG1';
            
            // Validate NurseryClass type
            let classLevel: NurseryClass = 'KG1';
            const standardClasses: NurseryClass[] = [
              'KG1', 'KG2', 'KG3', 
              'Primary One', 'Primary Two', 'Primary Three', 
              'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'
            ];
            
            const matchedClass = standardClasses.find(c => c.toLowerCase() === String(rawClass).trim().toLowerCase());
            if (matchedClass) {
              classLevel = matchedClass;
            } else {
              // Simple fallback conversions
              const rawStr = String(rawClass).toLowerCase();
              if (rawStr.includes('baby') || rawStr.includes('kg1')) classLevel = 'KG1';
              else if (rawStr.includes('middle') || rawStr.includes('kg2')) classLevel = 'KG2';
              else if (rawStr.includes('top') || rawStr.includes('kg3')) classLevel = 'KG3';
              else if (rawStr.includes('one') || rawStr.includes('p1')) classLevel = 'Primary One';
              else if (rawStr.includes('two') || rawStr.includes('p2')) classLevel = 'Primary Two';
              else if (rawStr.includes('three') || rawStr.includes('p3')) classLevel = 'Primary Three';
            }

            const rawAge = findVal(['age', 'years']) || 3;
            const age = isNaN(Number(rawAge)) ? 3 : Number(rawAge);

            let rawGender = String(findVal(['gender', 'sex'])).trim().toLowerCase();
            const gender: 'Boy' | 'Girl' = (rawGender.startsWith('g') || rawGender.includes('female')) ? 'Girl' : 'Boy';

            const guardianName = findVal(['guardian name', 'guardian', 'parent name', 'parent']) || 'Guardian';
            const guardianPhone = String(findVal(['guardian phone', 'phone', 'contact', 'telephone', 'guardian contact'])) || '+256';
            const guardianEmail = findVal(['guardian email', 'email', 'parent email']) || '';
            const homeVillage = findVal(['home village', 'village', 'residence']) || 'Kitemu';
            const homeDistrict = findVal(['home district', 'district', 'town']) || 'Wakiso';
            
            const rawFees = findVal(['term fees required ugx', 'fees required', 'term fees', 'fees', 'amount required']);
            const termFeesRequired = isNaN(Number(rawFees)) || !rawFees ? 400000 : Number(rawFees);

            // Additional details if provided
            const nextOfKinName = findVal(['next of kin name', 'next of kin', 'nok name']) || '';
            const nextOfKinPhone = findVal(['next of kin contact', 'nok phone', 'nok contact']) || '';

            const rawStatus = String(findVal(['status', 'state', 'enrollment status'])).trim().toLowerCase();
            const status = (rawStatus === 'suspended' || rawStatus === 'completed') ? (rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1) as 'Active' | 'Suspended' | 'Completed') : 'Active';

            const rawEnrollment = String(findVal(['enrollment date', 'enrollmentdate', 'date enrolled', 'registered date'])).trim();
            const enrollmentDate = (rawEnrollment && rawEnrollment !== 'undefined' && rawEnrollment !== '') ? rawEnrollment : new Date().toISOString().split('T')[0];

            const customId = findVal(['id', 'pupil id', 'student id', 'learner id']);
            const id = customId ? String(customId).trim() : `P_IMPORT_${index}_${Date.now()}`;

            return {
              id,
              fullName: String(fullName).trim(),
              classLevel,
              age,
              gender,
              guardianName: String(guardianName).trim(),
              guardianPhone: String(guardianPhone).trim(),
              guardianEmail: String(guardianEmail).trim(),
              homeVillage: String(homeVillage).trim(),
              homeDistrict: String(homeDistrict).trim(),
              immunized: true,
              termFeesRequired,
              installments: [],
              requirements: [], // will get standard default list upon saving
              status,
              enrollmentDate,
              nextOfKinName: String(nextOfKinName).trim(),
              nextOfKinPhone: String(nextOfKinPhone).trim()
            } as any;

          } else {
            // MAPPING FOR STAFF DIRECTORY
            const findVal = (keys: string[]) => {
              const matchedKey = Object.keys(row).find(k => keys.includes(k.trim().toLowerCase()));
              return matchedKey ? row[matchedKey] : '';
            };

            const fullName = findVal(['full name', 'fullname', 'name', 'staff name', 'employee name']) || '';
            
            let rawRole = String(findVal(['role', 'job title', 'job', 'position'])).trim().toLowerCase();
            let role: Staff['role'] = 'Class Teacher';
            if (rawRole.includes('head')) role = 'Head Teacher';
            else if (rawRole.includes('caretaker') || rawRole.includes('matron')) role = 'Nursery Caretaker';
            else if (rawRole.includes('cook')) role = 'Cook';
            else if (rawRole.includes('security')) role = 'Security Officer';

            const phone = String(findVal(['phone contact', 'phone', 'contact phone', 'tel', 'telephone'])) || '+256';
            
            let rawClass = findVal(['assigned class', 'class', 'classroom', 'classlevel']) || 'All';
            let assignedClass: NurseryClass | 'All' = 'All';
            const standardClasses = [
              'KG1', 'KG2', 'KG3', 
              'Primary One', 'Primary Two', 'Primary Three', 
              'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'
            ];
            const matchedClass = standardClasses.find(c => c.toLowerCase() === String(rawClass).trim().toLowerCase());
            if (matchedClass) assignedClass = matchedClass as NurseryClass;

            const rawSalary = findVal(['salary ugx', 'salary', 'base salary', 'pay']);
            const salaryUGX = isNaN(Number(rawSalary)) || !rawSalary ? 600000 : Number(rawSalary);

            const nextOfKinName = findVal(['next of kin name', 'nok name']) || '';
            const nextOfKinPhone = findVal(['next of kin contact', 'nok phone']) || '';

            return {
              id: `S_IMPORT_${index}_${Date.now()}`,
              fullName: String(fullName).trim(),
              role,
              phone: String(phone).trim(),
              assignedClass,
              salaryUGX,
              nextOfKinName: String(nextOfKinName).trim(),
              nextOfKinPhone: String(nextOfKinPhone).trim()
            } as any;
          }
        });

        // Filter out records without names
        const validRows = validated.filter(r => r.fullName !== '');
        
        if (validRows.length === 0) {
          setErrorText("None of the excel records had a valid 'Full Name' content.");
          return;
        }

        setParsedRows(validRows);

      } catch (err: any) {
        setErrorText(`Error triggered while parsing excel sheet: ${err?.message || err}`);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleImportApprove = () => {
    if (parsedRows.length === 0) return;
    onImportCompleted(parsedRows);
    setIsSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-subtle flex items-center justify-center p-4 z-50 animate-fadeIn" id="kva-excel-importer-modal">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-50 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-black">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#3D2B1F]">
                Import {type === 'pupils' ? 'Learners' : 'Staff'} via Excel / CSV
              </h3>
              <p className="text-[11px] text-[#7D6B5D] uppercase mt-0.5 tracking-wider font-bold">
                Kids Villa Academy Management System
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-1 px-2.5 hover:bg-slate-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* SUCCESS SCREEN */
          <div className="text-center py-10 my-auto flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
              <Check className="w-8 h-8 font-bold" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">Import Successful!</h4>
            <p className="text-xs text-stone-500 max-w-sm leading-relaxed">
              Successfully injected <b>{parsedRows.length}</b> new {type === 'pupils' ? 'pupil' : 'working staff'} records directly into database ledger securely. Welcome aboard!
            </p>
          </div>
        ) : parsedRows.length === 0 ? (
          /* UPLOAD & BRIEFING SCREEN */
          <div className="space-y-4">
            
            {/* Template Card Info Alert */}
            <div className="p-4 bg-sky-55/40 rounded-2xl border border-sky-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">Use our customized spreadsheet structure for quick error-free mapping</p>
                <p className="text-[11px] text-[#7D6B5D] leading-relaxed">
                  Make sure column names correspond directly. We dynamically sanitize class columns (like <i>"KG1"</i> or <i>"KG3"</i>) and contact phones.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E0D8CC] hover:bg-stone-55 text-[10px] font-extrabold text-slate-900 shadow-3xs cursor-pointer mt-1"
                >
                  <Download className="w-3.5 h-3.5 text-sky-600" />
                  Download Dynamic {type === 'pupils' ? 'Learners' : 'Staff'} Template (.xlsx)
                </button>
              </div>
            </div>

            {/* Drag Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 relative ${
                dragActive ? 'border-sky-500 bg-sky-50' : 'border-[#E0D8CC] hover:border-slate-500 bg-stone-50/50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange}
                className="hidden" 
              />
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-550 shadow-3xs">
                <Upload className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Drag & drop your Excel or .csv sheet here</p>
                <p className="text-[11px] text-stone-500 mt-1">or click to browse local computer workspace files</p>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
                EXCEL SHEET MAPPING
              </span>
            </div>

            {errorText && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {/* Manual Instructions Table */}
            <div className="pt-2">
              <span className="text-[10px] font-black uppercase text-[#3D2B1F] block mb-2">Required Excel Column Mapping:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#7D6B5D] leading-relaxed">
                {type === 'pupils' ? (
                  <>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Full Name:</b> Student first and last name (required).
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Class Level:</b> e.g. KG1/KG2/KG3.
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Age & Gender:</b> Number and Male/Female or Girl/Boy.
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Guardian Phone:</b> Parent or kin SMS contact details.
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Full Name:</b> Educator or Caretaker Name (required).
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Role:</b> e.g. Class Teacher, Cook, Security.
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Phone Contact:</b> Primary contact details.
                    </div>
                    <div className="bg-[#FAF8F5] p-2 rounded-xl border border-stone-100">
                      <b>• Salary UGX:</b> Base monthly or termly allowance.
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* PREVIEW TABLE AND CONFIRMATION SCREEN */
          <div className="space-y-4 max-h-[50vh] flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Validate Parsed Rows Preview Ready
                </h4>
                <p className="text-[10px] text-stone-500">
                  Review matched column mappings parsed from first worksheet sheet below.
                </p>
              </div>
              <span className="bg-orange-100 text-orange-850 px-2.5 py-1 rounded-full text-[10.5px] font-black uppercase">
                {parsedRows.length} Record(s) Matches
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-stone-200 divide-y divide-stone-100 flex-1 max-h-[300px]">
              <table className="w-full text-left text-[11px] font-medium text-stone-700 min-w-[500px]">
                <thead className="bg-[#FDFBF7] text-stone-600 font-extrabold text-[10px] uppercase border-b border-stone-200">
                  <tr>
                    <th className="px-3.5 py-2">Full Name</th>
                    {type === 'pupils' ? (
                      <>
                        <th className="px-3.5 py-2">Class Level</th>
                        <th className="px-3.5 py-2">Age/Gender</th>
                        <th className="px-3.5 py-2">Guardian Contact</th>
                      </>
                    ) : (
                      <>
                        <th className="px-3.5 py-2">assigned Role / Class</th>
                        <th className="px-3.5 py-2">salary (UGX)</th>
                        <th className="px-3.5 py-2">Contact</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {parsedRows.slice(0, 15).map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/55">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{row.fullName}</td>
                      {type === 'pupils' ? (
                        <>
                          <td className="px-3.5 py-2.5">
                            <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {row.classLevel}
                            </span>
                          </td>
                          <td className="px-3.5 py-2.5 capitalize">{row.age} Yrs / {row.gender}</td>
                          <td className="px-3.5 py-2.5 font-mono text-stone-600 text-[10px]">{row.guardianPhone}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-3.5 py-2.5">
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[10px]">
                              {row.role}
                            </span>
                            <span className="text-stone-400 ml-1.5 text-[9.5px]">({row.assignedClass})</span>
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-stone-900 font-semibold">
                            {Number(row.salaryUGX).toLocaleString()} UGX
                          </td>
                          <td className="px-3.5 py-2.5 font-mono text-stone-600 text-[10px]">{row.phone}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>

              {parsedRows.length > 15 && (
                <div className="text-center py-2 bg-slate-50 text-[10.5px] text-stone-500 font-bold">
                  And {parsedRows.length - 15} more records to be imported dynamically...
                </div>
              )}
            </div>

            <div className="flex gap-2.5 pt-4 border-t border-sky-50 shrink-0">
              <button
                type="button"
                onClick={() => setParsedRows([])}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 hover:bg-stone-55 text-xs text-stone-700 font-semibold cursor-pointer"
              >
                ← Import a Different File
              </button>
              <button
                type="button"
                onClick={handleImportApprove}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black uppercase tracking-wider shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" /> Approve and Import
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
