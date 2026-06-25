import React, { useState, useRef } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  CheckCircle,
  Clock,
  Info 
} from 'lucide-react';
import { Pupil, NurseryClass } from '../types';

interface CSVImporterProps {
  onImportCompleted: (importedData: Pupil[]) => void;
  onClose: () => void;
}

export function CSVImporter({ onImportCompleted, onClose }: CSVImporterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<Pupil[]>([]);
  const [validationAlerts, setValidationAlerts] = useState<string[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download a highly-compatible CSV template
  const downloadTemplate = () => {
    const headers = [
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

    const sampleRows = [
      [
        "Muwanguzi Ronald",
        "KG2",
        "4",
        "Boy",
        "Katooko Josephine",
        "+256701554433",
        "josephine@gmail.com",
        "Kitemu",
        "Wakiso",
        "450000"
      ],
      [
        "Nangonzi Martha",
        "Primary One",
        "6",
        "Girl",
        "Lutaaya Reagan",
        "+256782967294",
        "lreagan@gmail.com",
        "Nsangi",
        "Wakiso",
        "500000"
      ]
    ];

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...sampleRows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(","))].join("\r\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "KVA_Bulk_Learners_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safe CSV string parsing
  const parseCSVString = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[charIndex(i)];
      const nextChar = text[charIndex(i + 1)];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // Skip double quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentValue.trim());
        currentValue = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // Skip \n
        }
        row.push(currentValue.trim());
        if (row.some(val => val !== '')) {
          result.push(row);
        }
        row = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }

    // Push last row if exists
    if (currentValue !== '' || row.length > 0) {
      row.push(currentValue.trim());
      if (row.some(val => val !== '')) {
        result.push(row);
      }
    }

    function charIndex(index: number) {
      return index;
    }

    return result;
  };

  const processFile = (file: File) => {
    setErrorText(null);
    setValidationAlerts([]);
    setParsedRows([]);

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorText("Kindly upload a proper comma-separated value file (.csv extension only).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) {
          setErrorText("Could not read uploaded CSV file data streams.");
          return;
        }

        const lines = parseCSVString(text);
        if (lines.length < 2) {
          setErrorText("The selected CSV file does not contain a header or data rows.");
          return;
        }

        const rawHeaders = lines[0].map(h => h.trim().toLowerCase());
        const dataLines = lines.slice(1);

        const findColIndex = (aliases: string[]): number => {
          return rawHeaders.findIndex(header => aliases.includes(header));
        };

        const nameIdx = findColIndex(['full name', 'fullname', 'name', 'learner name', 'student name', 'learner', 'student']);
        const classIdx = findColIndex(['class level', 'classlevel', 'class', 'nursery class', 'year', 'level']);
        const ageIdx = findColIndex(['age', 'years', 'yrs']);
        const genderIdx = findColIndex(['gender', 'sex', 'gen']);
        const gNameIdx = findColIndex(['guardian name', 'guardian', 'parent name', 'parent', 'guardianname']);
        const gPhoneIdx = findColIndex(['guardian phone', 'phone', 'contact', 'telephone', 'guardian contact', 'parent phone']);
        const gEmailIdx = findColIndex(['guardian email', 'email', 'parent email', 'guardianemail']);
        const villageIdx = findColIndex(['home village', 'village', 'residence', 'address', 'area']);
        const districtIdx = findColIndex(['home district', 'district', 'town', 'city']);
        const feesIdx = findColIndex(['term fees required ugx', 'fees required', 'term fees', 'fees', 'amount required', 'tuition']);

        if (nameIdx === -1) {
          setErrorText("CSV must contain a 'Full Name' heading column so learners can be registered.");
          return;
        }

        const standardClasses: NurseryClass[] = [
          'KG1', 'KG2', 'KG3', 
          'Primary One', 'Primary Two', 'Primary Three', 
          'Primary Four', 'Primary Five', 'Primary Six', 'Primary Seven'
        ];

        const tempAlerts: string[] = [];
        const pupilsToImport: Pupil[] = [];

        dataLines.forEach((row, index) => {
          const rowNum = index + 2; // index is 0-based, row 1 is headers

          // Grab values
          const fullName = row[nameIdx] || '';
          if (!fullName.trim()) {
            tempAlerts.push(`Row ${rowNum}: Missing 'Full Name' (Ignored row)`);
            return;
          }

          let rawClass = classIdx !== -1 ? row[classIdx] : 'KG1';
          let classLevel: NurseryClass = 'KG1';
          const matchedClass = standardClasses.find(c => c.toLowerCase() === String(rawClass).trim().toLowerCase());
          
          if (matchedClass) {
            classLevel = matchedClass;
          } else {
            const rawStr = String(rawClass).toLowerCase();
            if (rawStr.includes('baby') || rawStr.includes('kg1') || rawStr.includes('nursery')) {
              classLevel = 'KG1';
              tempAlerts.push(`Row ${rowNum}: Unrecognized class "${rawClass}", mapped to KG1`);
            } else if (rawStr.includes('middle') || rawStr.includes('kg2') || rawStr.includes('primary baby')) {
              classLevel = 'KG2';
              tempAlerts.push(`Row ${rowNum}: Unrecognized class "${rawClass}", mapped to KG2`);
            } else if (rawStr.includes('top') || rawStr.includes('kg3')) {
              classLevel = 'KG3';
              tempAlerts.push(`Row ${rowNum}: Unrecognized class "${rawClass}", mapped to KG3`);
            } else if (rawStr.includes('one') || rawStr.includes('p1') || rawStr.includes('p.1')) {
              classLevel = 'Primary One';
            } else if (rawStr.includes('two') || rawStr.includes('p2') || rawStr.includes('p.2')) {
              classLevel = 'Primary Two';
            } else if (rawStr.includes('three') || rawStr.includes('p3') || rawStr.includes('p.3')) {
              classLevel = 'Primary Three';
            } else if (rawStr.includes('four') || rawStr.includes('p4') || rawStr.includes('p.4')) {
              classLevel = 'Primary Four';
            } else if (rawStr.includes('five') || rawStr.includes('p5') || rawStr.includes('p.5')) {
              classLevel = 'Primary Five';
            } else if (rawStr.includes('six') || rawStr.includes('p6') || rawStr.includes('p.6')) {
              classLevel = 'Primary Six';
            } else if (rawStr.includes('seven') || rawStr.includes('p7') || rawStr.includes('p.7')) {
              classLevel = 'Primary Seven';
            } else {
              classLevel = 'KG1';
              tempAlerts.push(`Row ${rowNum}: Defaulted class level to KG1 from empty/unknown`);
            }
          }

          const rawAge = ageIdx !== -1 ? row[ageIdx] : '4';
          const age = isNaN(Number(rawAge)) ? 4 : Number(rawAge);

          let rawGender = genderIdx !== -1 ? String(row[genderIdx]).trim().toLowerCase() : '';
          const gender: 'Boy' | 'Girl' = (rawGender.startsWith('g') || rawGender.includes('female') || rawGender.includes('girl')) ? 'Girl' : 'Boy';

          const guardianName = gNameIdx !== -1 ? row[gNameIdx] : 'Guardian';
          const guardianPhone = gPhoneIdx !== -1 ? String(row[gPhoneIdx]).trim() : '+256700000000';
          const guardianEmail = gEmailIdx !== -1 ? row[gEmailIdx] : '';

          const homeVillage = villageIdx !== -1 ? row[villageIdx] : 'Kitemu';
          const homeDistrict = districtIdx !== -1 ? row[districtIdx] : 'Wakiso';

          const rawFees = feesIdx !== -1 ? row[feesIdx] : '';
          const cleanedFees = rawFees.replace(/[^0-9]/g, '');
          const termFeesRequired = isNaN(Number(cleanedFees)) || !cleanedFees ? 450000 : Number(cleanedFees);

          pupilsToImport.push({
            id: `P_CSV_${index}_${Date.now()}`,
            fullName: String(fullName).trim(),
            classLevel,
            age,
            gender,
            guardianName: String(guardianName || 'Guardian').trim(),
            guardianPhone: String(guardianPhone || '+256').trim(),
            guardianEmail: String(guardianEmail || '').trim(),
            homeVillage: String(homeVillage || 'Kitemu').trim(),
            homeDistrict: String(homeDistrict || 'Wakiso').trim(),
            immunized: true,
            termFeesRequired,
            installments: [],
            requirements: [], // Filled dynamically in main registry
            status: 'Active',
            enrollmentDate: new Date().toISOString().split('T')[0]
          });
        });

        if (pupilsToImport.length === 0) {
          setErrorText("Could not find any usable student records in this CSV file.");
          return;
        }

        setParsedRows(pupilsToImport);
        setValidationAlerts(tempAlerts);

      } catch (err: any) {
        setErrorText(`Error encountered while parsing: ${err?.message || err}`);
      }
    };

    reader.readAsText(file);
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-subtle flex items-center justify-center p-4 z-50 animate-fadeIn animate-duration-150" id="kva-csv-importer-modal">
      <div className="bg-white rounded-3xl border border-sky-100 shadow-2xl max-w-2xl w-full p-6 md:p-8 relative max-h-[90vh] overflow-y-auto flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-50 mb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#3D2B1F]">
                Bulk Student CSV Importer
              </h3>
              <p className="text-[11px] text-[#7D6B5D] uppercase mt-0.5 tracking-wider font-bold">
                Kids Villa Academy Automated Registration
              </p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClose} 
            className="p-1 px-2.5 hover:bg-slate-100 rounded-lg text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
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
            <h4 className="text-lg font-extrabold text-slate-900">Bulk Registration Succeeded!</h4>
            <p className="text-sm text-stone-500 max-w-sm leading-relaxed">
              Successfully injected <b>{parsedRows.length}</b> new student records into the school register. Welcome to the villa family!
            </p>
          </div>
        ) : parsedRows.length === 0 ? (
          /* UPLOAD & BRIEFING SCREEN */
          <div className="space-y-4">
            
            {/* Template Card Info Alert */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-800">Need the Correct Format?</p>
                <p className="text-[11px] text-[#7D6B5D] leading-relaxed">
                  To avoid formatting errors, download our standardized CSV layout. Columns are auto-mapped regardless of order, provided header titles match standard headings.
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-[10px] font-extrabold text-slate-800 shadow-3xs cursor-pointer mt-1"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                  Download Learners CSV Template (.csv)
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
                dragActive ? 'border-indigo-500 bg-indigo-50/30' : 'border-stone-200 hover:border-slate-500 bg-stone-50/50'
              }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".csv" 
                onChange={handleFileChange}
                className="hidden" 
              />
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shadow-3xs">
                <Upload className="w-6 h-6 animate-pulse text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900">Drag & drop your .csv format list here</p>
                <p className="text-[11px] text-stone-500 mt-1">or click to choose CSV file from local computer folders</p>
              </div>
              <span className="text-[9px] bg-slate-800 text-slate-100 px-3 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
                CSV STRUCTURE MAPPER
              </span>
            </div>

            {errorText && (
              <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorText}</span>
              </div>
            )}

            {/* Column Guide table */}
            <div className="pt-2">
              <span className="text-[10px] font-black uppercase text-[#3D2B1F] block mb-2">Supported Headers (Order Independent):</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-[#7D6B5D] leading-relaxed">
                <div className="bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                  <span className="font-bold text-slate-800">Full Name</span> - Student names (required)
                </div>
                <div className="bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                  <span className="font-bold text-slate-800">Class Level</span> - e.g. KG1, KG2, KG3, Primary One etc
                </div>
                <div className="bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                  <span className="font-bold text-slate-800">Age</span> - Number of years
                </div>
                <div className="bg-stone-50/70 p-2 rounded-xl border border-stone-100">
                  <span className="font-bold text-slate-800">Guardian Contact</span> - Phone prefix (e.g. +256703209254)
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* PREVIEW AND MAP MATCH CONFIRMATION SCREEN */
          <div className="space-y-4">
            
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-start gap-2 text-[11px] leading-relaxed">
              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Please Verify Parsed Data:</span>
                <p className="mt-0.5 text-stone-600">
                  Below is a visual projection of the students ready for bulk injection. Ensure classes, ages, and phone contacts have been mapped appropriately.
                </p>
              </div>
            </div>

            {validationAlerts.length > 0 && (
              <div className="bg-stone-100 p-3 rounded-xl max-h-24 overflow-y-auto space-y-1 text-[9.5px] font-mono text-stone-600 shrink-0">
                <p className="font-bold text-slate-800 uppercase text-[8.5px]">Formatting Alignments Made:</p>
                {validationAlerts.map((alert, index) => (
                  <div key={index} className="flex gap-1 items-center">
                    <span className="w-1 h-1 rounded-full bg-orange-500 shrink-0"></span>
                    <span>{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Preview Grid Table */}
            <div className="border border-stone-250 rounded-2xl overflow-hidden shrink-0 max-h-56 overflow-y-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead className="bg-[#FAF8F5] text-[#3D2B1F] border-b border-stone-250 font-bold sticky top-0 z-10">
                  <tr>
                    <th className="p-2.5">Learner Name</th>
                    <th className="p-2.5">Class level</th>
                    <th className="p-2.5">Age/Gender</th>
                    <th className="p-2.5">Guardian Contact</th>
                    <th className="p-2.5 text-right">Term Fees Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {parsedRows.map((pupil, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/20">
                      <td className="p-2.5 font-semibold text-slate-900">{pupil.fullName}</td>
                      <td className="p-2.5">
                        <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded font-bold text-[9px]">
                          {pupil.classLevel}
                        </span>
                      </td>
                      <td className="p-2.5 font-medium">{pupil.age} yrs / {pupil.gender}</td>
                      <td className="p-2.5 font-mono text-[10px]">{pupil.guardianPhone}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-slate-800">
                        {pupil.termFeesRequired.toLocaleString()} UGX
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Option to clear draft and select another csv */}
            <div className="flex justify-between items-center bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs shrink-0">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="text-stone-600 font-semibold">Loaded <b>{parsedRows.length}</b> ready records</span>
              </div>
              <button 
                type="button" 
                onClick={() => {
                  setParsedRows([]);
                  setValidationAlerts([]);
                }}
                className="text-red-600 hover:text-red-700 font-bold hover:underline cursor-pointer"
              >
                Clear and Pick New File
              </button>
            </div>
            
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 pt-4 border-t border-sky-50 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-[#7D6B5D] bg-[#F2EDE4] hover:bg-[#E0D8CC] rounded-full cursor-pointer transition-all"
          >
            {isSuccess ? "Close Status Screen" : "Dismiss"}
          </button>
          
          {parsedRows.length > 0 && !isSuccess && (
            <button
              type="button"
              onClick={handleImportApprove}
              className="px-6 py-2 text-xs font-bold bg-indigo-950 hover:bg-slate-900 text-white rounded-full flex items-center gap-1.5 cursor-pointer shadow-md transition-all animate-pulse"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Incorporate {parsedRows.length} Pupils to Database
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
