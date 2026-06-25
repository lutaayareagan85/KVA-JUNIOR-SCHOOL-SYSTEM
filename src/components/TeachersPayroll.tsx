import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  Search, 
  Plus, 
  Download, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Printer, 
  Smartphone, 
  Building, 
  FileText, 
  Calculator, 
  Calendar,
  UserCheck,
  AlertCircle,
  TrendingUp,
  CreditCard,
  User
} from 'lucide-react';
import { Staff, PayrollRecord } from '../types';

interface TeachersPayrollProps {
  staff: Staff[];
}

export function TeachersPayroll({ staff }: TeachersPayrollProps) {
  // Use persistent storage for payroll history
  const [records, setRecords] = useState<PayrollRecord[]>(() => {
    const saved = localStorage.getItem('kva_payroll') || localStorage.getItem('sanyu_payroll');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse payroll, using defaults', e);
      }
    }
    
    // Default initial mock database records for prev months
    const mockRecords: PayrollRecord[] = [];
    const months = ['April 2026', 'May 2026'];
    
    months.forEach((month, idx) => {
      staff.forEach((m, sIdx) => {
        const allowance = idx === 1 ? (sIdx % 3 === 0 ? 50000 : 0) : 0;
        const deduction = idx === 1 ? (sIdx % 4 === 0 ? 30000 : 0) : 0;
        const netPay = m.salaryUGX + allowance - deduction;
        
        mockRecords.push({
          id: `PAY-${month.substring(0, 3).toUpperCase()}-${m.id}`,
          staffId: m.id,
          staffName: m.fullName,
          role: m.role,
          month: month,
          baseSalary: m.salaryUGX,
          allowances: allowance,
          deductions: deduction,
          netPay: netPay,
          status: 'Paid',
          paymentDate: `2026-0${idx + 4}-28`,
          paymentMethod: sIdx % 2 === 0 ? 'Mobile Money' : 'Bank Transfer',
          receiptNo: `TXN-${100000 + idx * 500 + sIdx}`,
          notes: 'Regular salary disbursement'
        });
      });
    });

    // Also some pending items for current month (June 2026) to make it ready to operate
    staff.forEach((m, sIdx) => {
      const isPaid = sIdx < 2; // say 2 are already paid, others unpaid
      mockRecords.push({
        id: `PAY-JUN-${m.id}`,
        staffId: m.id,
        staffName: m.fullName,
        role: m.role,
        month: 'June 2026',
        baseSalary: m.salaryUGX,
        allowances: 0,
        deductions: 0,
        netPay: m.salaryUGX,
        status: isPaid ? 'Paid' : 'Unpaid',
        paymentDate: isPaid ? '2026-06-18' : undefined,
        paymentMethod: isPaid ? (sIdx === 0 ? 'Mobile Money' : 'Bank Transfer') : undefined,
        receiptNo: isPaid ? `TXN-20038${sIdx}` : undefined,
        notes: isPaid ? 'Termly baseline disbursal' : undefined
      });
    });

    return mockRecords;
  });

  // Keep localStorage sync'd
  useEffect(() => {
    localStorage.setItem('kva_payroll', JSON.stringify(records));
  }, [records]);

  // Filters & State variables
  const [filterMonth, setFilterMonth] = useState<string>('June 2026');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create / Run custom payroll generator states
  const [generationMonth, setGenerationMonth] = useState<string>('July 2026');
  const [showGenModal, setShowGenModal] = useState<boolean>(false);
  
  // Pay action state context
  const [payingRecord, setPayingRecord] = useState<PayrollRecord | null>(null);
  const [payMethod, setPayMethod] = useState<'Mobile Money' | 'Cash' | 'Bank Transfer' | 'Agent Banking'>('Mobile Money');
  const [payReceiptNo, setPayReceiptNo] = useState<string>('');
  const [payNotes, setPayNotes] = useState<string>('');

  // Selected record for PDF/Invoice slips printable simulation
  const [viewingSlip, setViewingSlip] = useState<PayrollRecord | null>(null);

  // Edit allowances / deductions state inline
  const [editingFinRecordId, setEditingFinRecordId] = useState<string | null>(null);
  const [tempAllowance, setTempAllowance] = useState<number>(0);
  const [tempDeduction, setTempDeduction] = useState<number>(0);

  // List of unique months represented in database
  const availableMonths = Array.from(new Set(records.map(r => r.month)));
  if (!availableMonths.includes('June 2026')) availableMonths.push('June 2026');
  if (!availableMonths.includes('July 2026')) availableMonths.push('July 2026');

  // Trigger automatic generation check: if we updated staff count, are there missing payroll entries for June?
  const handleAutoSyncLedger = () => {
    let added = 0;
    const updatedRecords = [...records];
    
    // Cycle check for June 2026
    staff.forEach(s => {
      const hasRecord = updatedRecords.some(r => r.staffId === s.id && r.month === 'June 2026');
      if (!hasRecord) {
        updatedRecords.push({
          id: `PAY-JUN-${s.id}-${Date.now()}`,
          staffId: s.id,
          staffName: s.fullName,
          role: s.role,
          month: 'June 2026',
          baseSalary: s.salaryUGX,
          allowances: 0,
          deductions: 0,
          netPay: s.salaryUGX,
          status: 'Unpaid'
        });
        added++;
      }
    });

    if (added > 0) {
      setRecords(updatedRecords);
      alert(`Synchronized payroll! Added ${added} newly registered staff members to the running June 2026 ledger.`);
    }
  };

  // Generate a brand new custom Month ledger
  const handleGenerateNewMonthLedger = (targetMonth: string) => {
    // Check if duplicate
    const alreadyExists = records.some(r => r.month === targetMonth);
    if (alreadyExists) {
      alert(`Ledger for ${targetMonth} already exists in records. You can manage individual salaries below.`);
      return;
    }

    if (staff.length === 0) {
      alert("No staff members are registered in Kids Villa database. Please register staff members first!");
      return;
    }

    const newLedgerItems: PayrollRecord[] = staff.map(s => ({
      id: `PAY-${targetMonth.replace(/\s+/g, '-').toUpperCase()}-${s.id}`,
      staffId: s.id,
      staffName: s.fullName,
      role: s.role,
      month: targetMonth,
      baseSalary: s.salaryUGX,
      allowances: 0,
      deductions: 0,
      netPay: s.salaryUGX,
      status: 'Unpaid'
    }));

    setRecords([...records, ...newLedgerItems]);
    setFilterMonth(targetMonth);
    setShowGenModal(false);
    alert(`Successfully generated blank salary ledger for ${targetMonth} (${staff.length} staff records initialized).`);
  };

  // Process a payout disburse
  const submitSalaryPayment = () => {
    if (!payingRecord) return;
    
    const updated = records.map(r => {
      if (r.id === payingRecord.id) {
        return {
          ...r,
          status: 'Paid' as const,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: payMethod,
          receiptNo: payReceiptNo || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
          notes: payNotes || 'Disbursed from central treasury'
        };
      }
      return r;
    });

    setRecords(updated);
    setPayingRecord(null);
    setPayReceiptNo('');
    setPayNotes('');
    alert(`Salary successfully paid to ${payingRecord.staffName}`);
  };

  // Quick payout of ALL unpaid staff in current filter
  const runBulkDisbursal = () => {
    const visibleUnpaid = filteredRecords.filter(r => r.status === 'Unpaid');
    if (visibleUnpaid.length === 0) {
      alert("There are no unpaid staff members in the current filter criteria.");
      return;
    }

    if (!window.confirm(`Disburse payments to ALL ${visibleUnpaid.length} outstanding staff/workers in this ledger?`)) {
      return;
    }

    const updated = records.map(r => {
      const match = visibleUnpaid.find(vu => vu.id === r.id);
      if (match) {
        return {
          ...r,
          status: 'Paid' as const,
          paymentDate: new Date().toISOString().split('T')[0],
          paymentMethod: 'Mobile Money' as const,
          receiptNo: `MOM-LN-${Math.floor(2000000 + Math.random() * 8000000)}`,
          notes: 'Bulk automated mobile clearance'
        };
      }
      return r;
    });

    setRecords(updated);
    alert(`Bulk mobile payout finalized! ${visibleUnpaid.length} individuals marked as fully disbursed.`);
  };

  // Save modified dynamic adjustments
  const handleSaveAdjustments = (recId: string) => {
    const updated = records.map(r => {
      if (r.id === recId) {
        const net = r.baseSalary + tempAllowance - tempDeduction;
        return {
          ...r,
          allowances: tempAllowance,
          deductions: tempDeduction,
          netPay: net
        };
      }
      return r;
    });
    setRecords(updated);
    setEditingFinRecordId(null);
  };

  // Delete a payroll ledger line
  const handleDeletePayrollLine = (recId: string) => {
    if (window.confirm("Are you sure you want to delete this specific payroll ledger line entry?")) {
      setRecords(records.filter(r => r.id !== recId));
    }
  };

  // CSV Emitter helper
  const handleExportPayrollCSV = () => {
    const csvHeaders = [
      'Payroll ID', 'Staff ID', 'Full Name', 'Role', 'Operating Month', 
      'Base Salary (UGX)', 'Allowances (UGX)', 'Deductions (UGX)', 'Net Take-Home (UGX)', 
      'Payout Status', 'Payment Date', 'Payment Channel', 'Reference ID', 'Notes'
    ];

    const csvRows = filteredRecords.map(r => [
      r.id,
      r.staffId,
      r.staffName,
      r.role,
      r.month,
      r.baseSalary,
      r.allowances,
      r.deductions,
      r.netPay,
      r.status,
      r.paymentDate || 'N/A',
      r.paymentMethod || 'N/A',
      r.receiptNo || 'N/A',
      r.notes || 'N/A'
    ]);

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(escapeCSV).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kids_Villa_Staff_Payroll_${filterMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dynamic filter queries
  const filteredRecords = records.filter(r => {
    const matchesMonth = filterMonth === 'All' || r.month === filterMonth;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesSearch = r.staffName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMonth && matchesStatus && matchesSearch;
  });

  // Calculate high-level statistics for filtered selection & active ledger
  const activeMonthLedger = records.filter(r => r.month === filterMonth);
  const totalBaseSalaries = activeMonthLedger.reduce((sum, r) => sum + r.baseSalary, 0);
  const totalAllowances = activeMonthLedger.reduce((sum, r) => sum + r.allowances, 0);
  const totalDeductions = activeMonthLedger.reduce((sum, r) => sum + r.deductions, 0);
  const netPayrollTakehome = totalBaseSalaries + totalAllowances - totalDeductions;

  const totalPaidSum = activeMonthLedger.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.netPay, 0);
  const outstandingBacklog = activeMonthLedger.filter(r => r.status === 'Unpaid').reduce((sum, r) => sum + r.netPay, 0);
  const staffPaidCount = activeMonthLedger.filter(r => r.status === 'Paid').length;
  const totalInMonthCount = activeMonthLedger.length;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E0D8CC]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-[#8C5A3C] uppercase tracking-wider">Active Monthly Budget</span>
            <span className="p-1 px-2 rounded-md bg-[#FAF0E6] text-[9px] font-bold text-[#8C5A3C]">
              {filterMonth}
            </span>
          </div>
          <div className="text-xl font-extrabold text-[#3D2B1F] tracking-tight">
            UGX {netPayrollTakehome.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#7D6B5D] mt-1 flex items-center gap-1">
            <Calculator className="w-3" /> Base: {totalBaseSalaries.toLocaleString()} | +{totalAllowances.toLocaleString()} allowances
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E0D8CC]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-[#6B8E23] uppercase tracking-wider">Paid / Disbursed Amount</span>
            <span className="p-1 px-2 rounded-md bg-[#E8F1D7] text-[10px] font-black text-[#6B8E23]">
              {totalInMonthCount > 0 ? Math.round((staffPaidCount / totalInMonthCount) * 100) : 0}% Done
            </span>
          </div>
          <div className="text-xl font-extrabold text-[#6B8E23] tracking-tight">
            UGX {totalPaidSum.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#7D6B5D] mt-1">
            Cleared for <strong className="font-extrabold text-[#3D2B1F]">{staffPaidCount} of {totalInMonthCount}</strong> caregivers
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E0D8CC]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-red-600 uppercase tracking-wider">Outstanding Liabilities</span>
            <span className="p-1.5 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
              <AlertCircle className="w-3 h-3 text-red-600" />
            </span>
          </div>
          <div className="text-xl font-extrabold text-red-600 tracking-tight">
            UGX {outstandingBacklog.toLocaleString()}
          </div>
          <div className="text-[10px] text-[#7D6B5D] mt-1">
            Pending treasury authorization
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#FAF8F5] p-5 rounded-3xl border border-[#E0D8CC]">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-black text-[#5A3E2B] uppercase tracking-wider">Registered Personnel</span>
            <span className="p-1 px-1.5 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">EMIS Sync</span>
          </div>
          <div className="text-xl font-extrabold text-[#3D2B1F]">
            {staff.length} Active Staff
          </div>
          <div className="text-[10px] mt-1 text-[#7D6B5D] flex items-center justify-between">
            <span>Directly managed roles</span>
            <button
              id="sync-payroll-btn"
              type="button"
              onClick={handleAutoSyncLedger}
              className="text-[9px] text-[#8C5A3C] font-black underline hover:text-[#3D2B1F] cursor-pointer"
            >
              Verify Ledger
            </button>
          </div>
        </div>

      </div>

      {/* Control Panel: Search & Batch Activities */}
      <div className="bg-white p-5 rounded-3xl border border-[#E0D8CC] space-y-4">
        
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter 1 */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#5A3E2B] uppercase tracking-wider block">Payroll Ledger Month</label>
              <select
                id="payroll-month-filter"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs rounded-xl focus:ring-1 focus:ring-[#8C5A3C] outline-hidden font-extrabold"
              >
                <option value="All">All Months</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Filter 2 */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[#5A3E2B] uppercase tracking-wider block">Payment Status</label>
              <select
                id="payroll-status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs rounded-xl focus:ring-1 focus:ring-[#8C5A3C] outline-hidden font-extrabold"
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Unpaid">Unpaid / Termly Pending</option>
                <option value="Processing">Processing / Audited</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="space-y-1 min-w-[200px]">
              <label className="text-[9px] font-bold text-[#5A3E2B] uppercase tracking-wider block">Search Personnel</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="payroll-search-input"
                  type="text"
                  placeholder="Search name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#8C5A3C] text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {/* Generate Month Button */}
            <button
              id="show-gen-modal-btn"
              type="button"
              onClick={() => setShowGenModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#8C5A3C] to-[#5A3E2B] text-white font-extrabold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-md transition-all pt-2.5"
            >
              <Plus className="w-3.5 h-3.5" /> Generate Month Ledger
            </button>

            {/* Bulk Mobile Pay */}
            <button
              id="bulk-disburse-btn"
              type="button"
              onClick={runBulkDisbursal}
              className="px-4 py-2 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold text-xs rounded-full flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all pt-2.5"
            >
              <Coins className="w-3.5 h-3.5" /> Mobile Money Bulk Pay
            </button>

            {/* Export CSV */}
            <button
              id="export-payroll-csv-btn"
              type="button"
              onClick={handleExportPayrollCSV}
              className="px-4 py-2 bg-white border border-[#E0D8CC] text-[#3D2B1F] hover:bg-stone-50 font-extrabold text-xs rounded-full flex items-center gap-2 cursor-pointer transition-all pt-2.5"
            >
              <Download className="w-3.5 h-3.5 text-[#8C5A3C]" /> Export CSV Report
            </button>
          </div>

        </div>

      </div>

      {/* Main Ledger Database Table */}
      <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden shadow-xs">
        <div className="px-6 py-4.5 bg-[#FAF8F5] border-b border-[#E0D8CC] flex justify-between items-center">
          <div>
            <h4 className="font-extrabold text-sm text-[#3D2B1F]">Primary Staff Financial Register</h4>
            <p className="text-[11px] text-[#7D6B5D]">Showing {filteredRecords.length} records in {filterMonth} database context</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#8C5A3C]">Uganda MoES Compliant</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5]/60 border-b border-[#E0D8CC]/80 text-[10px] font-bold text-[#8C5A3C] uppercase tracking-wider">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Base Salary</th>
                <th className="py-3 px-4">Allowances</th>
                <th className="py-3 px-4">Deductions</th>
                <th className="py-3 px-4">Net Take-home</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Receipt & Cash Slip</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EDE4]/80 text-xs text-[#3D2B1F]">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#7D6B5D] italic">
                    No matching staff payroll entries found. Try running "Generate Month Ledger" or adjusting search filter query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const isEditingAt = editingFinRecordId === r.id;
                  
                  return (
                    <tr key={r.id} className="hover:bg-[#FAF8F5]/30 transition-all">
                      
                      {/* Name & Role */}
                      <td className="py-4.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#FAF0E6] text-[#8C5A3C] flex items-center justify-center font-extrabold text-xs shrink-0">
                            {r.staffName.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold block text-[#3D2B1F]">{r.staffName}</span>
                            <span className="text-[10px] text-[#7D6B5D] uppercase tracking-wide block">{r.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Base salary */}
                      <td className="py-4.5 px-4 font-mono font-medium text-stone-600">
                        UGX {r.baseSalary.toLocaleString()}
                      </td>

                      {/* Allowances */}
                      <td className="py-4.5 px-4">
                        {isEditingAt ? (
                          <input
                            type="number"
                            value={tempAllowance}
                            onChange={(e) => setTempAllowance(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-white border border-[#E0D8CC] rounded text-stone-800 text-xs font-bold"
                          />
                        ) : (
                          <span className={`${r.allowances > 0 ? 'text-[#6B8E23] font-bold' : 'text-stone-400'}`}>
                            +{r.allowances.toLocaleString()} UGX
                          </span>
                        )}
                      </td>

                      {/* Deductions */}
                      <td className="py-4.5 px-4">
                        {isEditingAt ? (
                          <input
                            type="number"
                            value={tempDeduction}
                            onChange={(e) => setTempDeduction(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-white border border-[#E0D8CC] rounded text-stone-800 text-xs font-bold"
                          />
                        ) : (
                          <span className={`${r.deductions > 0 ? 'text-red-500 font-bold' : 'text-stone-400'}`}>
                            -{r.deductions.toLocaleString()} UGX
                          </span>
                        )}
                      </td>

                      {/* Net takehome */}
                      <td className="py-4.5 px-4 font-black text-[#5A3E2B] font-sans">
                        UGX {r.netPay.toLocaleString()}
                      </td>

                      {/* Status */}
                      <td className="py-4.5 px-4">
                        {r.status === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 bg-[#E8F1D7] text-[#6B8E23] text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" /> Fully Cleared
                          </span>
                        ) : r.status === 'Processing' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                            <Clock className="w-3 h-3" /> Auditing
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                            🚨 Unpaid
                          </span>
                        )}
                      </td>

                      {/* Audit Slip View */}
                      <td className="py-4.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingSlip(r)}
                          className="px-2.5 py-1.5 bg-[#FAF8F5] hover:bg-[#F2EDE4] text-[#8C5A3C] font-extrabold text-[10px] border border-[#E0D8CC] rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <FileText className="w-3 h-3 text-[#5A3E2B]" /> Pay Slip ...
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {isEditingAt ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleSaveAdjustments(r.id)}
                                className="px-2 py-1 bg-[#6B8E23] text-white rounded font-bold text-[10px] cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingFinRecordId(null)}
                                className="px-2 py-1 bg-stone-100 text-stone-700 rounded text-[10px]"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingFinRecordId(r.id);
                                  setTempAllowance(r.allowances);
                                  setTempDeduction(r.deductions);
                                }}
                                className="px-2 py-1 text-[#8C5A3C] hover:bg-amber-50 rounded text-[10px] font-bold"
                              >
                                Adjust +/-
                              </button>

                              {r.status === 'Unpaid' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPayingRecord(r);
                                    setPayReceiptNo(`MOP-${Math.floor(100000 + Math.random() * 900000)}`);
                                  }}
                                  className="px-3 py-1 bg-[#6B8E23] hover:bg-[#58751d] text-white font-extrabold text-[10px] rounded-lg transition-all cursor-pointer shadow-2xs"
                                >
                                  Disburse Pay
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeletePayrollLine(r.id)}
                                className="p-1 text-stone-400 hover:text-red-500 rounded transition-all cursor-pointer"
                                title="Remove payout line"
                              >
                                ✕
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footnote */}
        <div className="bg-[#FAF8F5] p-3 text-center text-[10px] text-[#7D6B5D] border-t border-[#E0D8CC]/60 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>⚠️ <strong>Auditor Notice:</strong> Standard PAYE (Pay As You Earn) and NSSF 5% employee contributions are calculated per statutory school schedules.</span>
          <span>KVA EMIS ID: <strong>UG-ECD-99382</strong></span>
        </div>
      </div>

      {/* MODAL 1: NEW MONTH LEDGER GENERATION */}
      {showGenModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] max-w-md w-full space-y-4 shadow-xl animate-fade-in">
            <div className="border-b border-[#F2EDE4] pb-3">
              <h3 className="font-extrabold text-lg text-[#3D2B1F] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8C5A3C]" /> Create New Monthly Payroll
              </h3>
              <p className="text-xs text-[#7D6B5D]">Initialize salary lines for all registered team members for the selected cycle.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase text-[#5A3E2B] block mb-1">Target Operating Month</label>
                <select
                  id="new-ledger-month-select"
                  value={generationMonth}
                  onChange={(e) => setGenerationMonth(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs font-bold rounded-xl focus:ring-1 focus:ring-[#8C5A3C] outline-hidden"
                >
                  <option value="June 2026">June 2026</option>
                  <option value="July 2026">July 2026</option>
                  <option value="August 2026">August 2026</option>
                  <option value="September 2026">September 2026</option>
                  <option value="October 2026">October 2026</option>
                  <option value="November 2026">November 2026</option>
                  <option value="December 2026">December 2026</option>
                </select>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Automatic Baseline Setup</span>
                <p className="text-[11px] text-[#7D6B5D] leading-relaxed">
                  This action will load all <strong className="text-stone-800">{staff.length} registered personnel</strong> with their current profile salary, setting allowances and deductions to 0. You can modify allowances before final disbursals.
                </p>
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handleGenerateNewMonthLedger(generationMonth)}
                className="px-4 py-2 bg-[#8C5A3C] hover:bg-[#5A3E2B] text-white font-extrabold text-xs rounded-xl"
              >
                Confirm & Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DISBURSE SALARY DISBURSAL FORM */}
      {payingRecord && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] max-w-md w-full space-y-4 shadow-xl animate-fade-in">
            <div className="border-b border-[#F2EDE4] pb-3">
              <h3 className="font-extrabold text-lg text-[#3D2B1F] flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#6B8E23]" /> Disburse Staff Salary
              </h3>
              <p className="text-xs text-[#7D6B5D]">Authorized clearance of monthly paycheck to staff records.</p>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FAF8F5] rounded-xl text-xs space-y-1 border border-[#E0D8CC]/60">
                <div className="flex justify-between font-bold">
                  <span>Payee:</span>
                  <span className="text-[#3D2B1F]">{payingRecord.staffName} ({payingRecord.role})</span>
                </div>
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span className="font-mono">UGX {payingRecord.baseSalary.toLocaleString()}</span>
                </div>
                {payingRecord.allowances > 0 && (
                  <div className="flex justify-between text-[#6B8E23]">
                    <span>Allowances:</span>
                    <span className="font-mono">+{payingRecord.allowances.toLocaleString()} UGX</span>
                  </div>
                )}
                {payingRecord.deductions > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Deductions:</span>
                    <span className="font-mono">-{payingRecord.deductions.toLocaleString()} UGX</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-[#E0D8CC]/60 pt-1.5 font-black text-sm text-[#8C5A3C]">
                  <span>Total Disbursable Net:</span>
                  <span className="font-mono text-[#5A3E2B]">UGX {payingRecord.netPay.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#5A3E2B] block mb-1">Disbursal Channel / Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Mobile Money', icon: Smartphone, label: 'Airtel/MTN MM' },
                    { id: 'Bank Transfer', icon: Building, label: 'Centenary/Stanbic' },
                    { id: 'Cash', icon: Coins, label: 'Petty Cash' },
                    { id: 'Agent Banking', icon: CreditCard, label: 'Equity Agent' }
                  ].map((method) => {
                    const IconComp = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPayMethod(method.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left flex items-center gap-2 transition-all ${
                          payMethod === method.id 
                            ? 'bg-[#EAF2D8] border-[#6B8E23] text-[#4F6B17]' 
                            : 'bg-white border-[#E0D8CC] hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <IconComp className="w-4 h-4 text-stone-600" />
                        {method.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#5A3E2B] block mb-1">Receipt, Voucher or Reference #</label>
                <input
                  id="pay-txn-id"
                  type="text"
                  placeholder="e.g. MTN-993829-CLK"
                  value={payReceiptNo}
                  onChange={(e) => setPayReceiptNo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs font-bold rounded-xl focus:ring-1 focus:ring-[#8C5A3C] outline-hidden"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-[#5A3E2B] block mb-1">Administrative Notes</label>
                <textarea
                  id="pay-notes"
                  rows={2}
                  placeholder="Attach notes about arrears or bonus rationale..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FDFBF7] border border-[#E0D8CC] text-[#3D2B1F] text-xs font-medium rounded-xl focus:ring-1 focus:ring-[#8C5A3C] outline-hidden"
                />
              </div>

            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPayingRecord(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSalaryPayment}
                className="px-4 py-2 bg-[#6B8E23] hover:bg-[#516C1A] text-white font-extrabold text-xs rounded-xl"
              >
                Disburse Funds Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE / PRINTABLE PAY SLIP VIEW */}
      {viewingSlip && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl border border-[#E0D8CC] max-w-lg w-full space-y-4 shadow-xl animate-fade-in">
            
            {/* Payslip body container for clean layouts */}
            <div id="printable-slip-body" className="p-6 bg-[#FAF8F5] rounded-3xl border border-[#E0D8CC]/80 text-[#3D2B1F] space-y-6">
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-[#E0D8CC]/60 pb-4">
                <div>
                  <h3 className="font-extrabold text-xs text-[#8C5A3C] tracking-widest uppercase">Kids Villa Academy</h3>
                  <span className="text-[9px] text-[#7D6B5D] block">Kitemu Nsangi, Wakiso District, Uganda</span>
                  <span className="text-[9px] text-[#7D6B5D] block">Tel: +256 701 440 022</span>
                </div>
                <div className="text-right">
                  <span className="p-1 px-2.5 bg-amber-100 text-[#8C5A3C] text-[10px] font-black rounded-lg uppercase">
                    Salary Slips
                  </span>
                  <span className="text-[10px] block font-mono text-stone-500 mt-1">Ref: {viewingSlip.receiptNo || 'PRE-RELEASE'}</span>
                </div>
              </div>

              {/* Personnel Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-[#8C5A3C] uppercase tracking-wider block">Employee Profile</span>
                  <div className="mt-1 font-bold">{viewingSlip.staffName}</div>
                  <div className="text-stone-500 text-[10px] uppercase font-semibold">{viewingSlip.role}</div>
                  <div className="text-stone-500 text-[10px]">Staff Account Ref: {viewingSlip.staffId}</div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-[#8C5A3C] uppercase tracking-wider block">Operating Block</span>
                  <div className="mt-1 font-bold">{viewingSlip.month}</div>
                  <div className="text-stone-500 text-[10px]">Payment Date: {viewingSlip.paymentDate || 'Pending Claim'}</div>
                  <div className="text-stone-500 text-[10px]">Channel: {viewingSlip.paymentMethod || 'Treasury Queue'}</div>
                </div>
              </div>

              {/* Financial Ledger calculations */}
              <div className="space-y-2 border-t border-[#E0D8CC]/60 pt-4">
                <span className="text-[9px] font-bold text-[#8C5A3C] uppercase tracking-wider block">Breakdown & Line Items</span>
                
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Base Salary (UGX)</span>
                    <span className="font-mono font-medium">{viewingSlip.baseSalary.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-stone-600">Allowances & Overtime (UGX)</span>
                    <span className="font-mono text-[#6B8E23] font-medium">+{viewingSlip.allowances.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-stone-600">Deductions / Advance / PAYE (UGX)</span>
                    <span className="font-mono text-red-500 font-medium">-{viewingSlip.deductions.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between border-t border-dashed border-[#E0D8CC]/60 pt-2 text-sm font-black text-[#5A3E2B]">
                    <span>Net Paid Take-home Amount:</span>
                    <span className="font-mono">UGX {viewingSlip.netPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="border-t border-[#E0D8CC]/40 pt-4 flex justify-between items-end text-[9px] text-[#7D6B5D]">
                <div>
                  <div className="font-bold underline text-[#3D2B1F] mb-1">Namatovu Florence</div>
                  <div>Head Teacher / Signatory</div>
                  <div>Kids Villa Treasury Clearance</div>
                </div>
                <div className="text-right">
                  <div className="border border-green-200 bg-green-50 rounded-lg p-1.5 inline-block text-[9px] font-bold text-green-700">
                    {viewingSlip.status === 'Paid' ? '✓ SEAL VALIDATED / TREASURY FUNDED' : '⚠️ PREPARATION PHASE / UNAUTHORIZED'}
                  </div>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="px-3.5 py-2 bg-[#3D2B1F] hover:bg-[#5A3E2B] text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Pay Slip
              </button>
              <button
                type="button"
                onClick={() => setViewingSlip(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Close Pay Slip
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
