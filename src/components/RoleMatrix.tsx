import React, { useState } from 'react';
import { Shield, Check, X, Search, Info } from 'lucide-react';

interface PermissionRow {
  module: string;
  subModule: string;
  description: string;
  rolesApproved: { [key: string]: 'Full' | 'Read' | 'None' };
}

const ROLES = [
  'Super Admin',
  'School Admin',
  'Head Teacher',
  'Director/Proprietor',
  'Teacher',
  'Class Teacher',
  'Parent/Guardian',
  'Student/Pupil',
  'Accountant/Bursar',
  'Librarian',
  'Nurse/Health Officer',
  'Transport Mgr',
  'Store Mgr',
  'HR Mgr'
];

const INITIAL_ROWS: PermissionRow[] = [
  {
    module: 'Student Management',
    subModule: 'Admission Approval',
    description: 'Approve online registrations, allocate sections & issue admission numbers',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Full',
      'Director/Proprietor': 'Read',
      'Teacher': 'None',
      'Class Teacher': 'None',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'Read',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'None',
    }
  },
  {
    module: 'ECD Learning & Assessment',
    subModule: 'Score & AI Comments Entry',
    description: 'Grade NCDC 5-domain competences and generate AI comments via Gemini',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Full',
      'Director/Proprietor': 'Read',
      'Teacher': 'Full',
      'Class Teacher': 'Full',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'None',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'None',
    }
  },
  {
    module: 'School Finance',
    subModule: 'Fee Payments & Budget',
    description: 'Acknowledge Mobile Money slips, issue invoices and approve general ledger',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Read',
      'Director/Proprietor': 'Full',
      'Teacher': 'None',
      'Class Teacher': 'None',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'Full',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'Read',
    }
  },
  {
    module: 'Human Resource',
    subModule: 'Staff Contracts & Salary',
    description: 'Manage Caregivers contracts, leaves status and click payroll credits',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Read',
      'Director/Proprietor': 'Full',
      'Teacher': 'None',
      'Class Teacher': 'None',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'Read',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'Full',
    }
  },
  {
    module: 'Health & Medical',
    subModule: 'Sickbay Logs & Alerts',
    description: 'Administer basic syrups, log incidents & push emergency allergies warning',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Full',
      'Director/Proprietor': 'Read',
      'Teacher': 'Read',
      'Class Teacher': 'Read',
      'Parent/Guardian': 'Read',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'None',
      'Librarian': 'None',
      'Nurse/Health Officer': 'Full',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'None',
    }
  },
  {
    module: 'Transport Module',
    subModule: 'Fleet and GPS Track',
    description: 'Maintain school vans and map-pick points tracker',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'None',
      'Director/Proprietor': 'Read',
      'Teacher': 'None',
      'Class Teacher': 'None',
      'Parent/Guardian': 'Read',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'None',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'Full',
      'Store Mgr': 'None',
      'HR Mgr': 'None',
    }
  },
  {
    module: 'Library Module',
    subModule: 'Book Loans & Catalogs',
    description: 'Update shelf items, scan barcodes and monitor card borrowing returns',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Read',
      'Director/Proprietor': 'None',
      'Teacher': 'Read',
      'Class Teacher': 'Read',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'Read',
      'Accountant/Bursar': 'None',
      'Librarian': 'Full',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'None',
      'HR Mgr': 'None',
    }
  },
  {
    module: 'Inventory Module',
    subModule: 'Stationery & Stock Alerts',
    description: 'Replenish chalk, textbooks, student uniform stocks and request items',
    rolesApproved: {
      'Super Admin': 'Full',
      'School Admin': 'Full',
      'Head Teacher': 'Read',
      'Director/Proprietor': 'Read',
      'Teacher': 'Read',
      'Class Teacher': 'Read',
      'Parent/Guardian': 'None',
      'Student/Pupil': 'None',
      'Accountant/Bursar': 'None',
      'Librarian': 'None',
      'Nurse/Health Officer': 'None',
      'Transport Mgr': 'None',
      'Store Mgr': 'Full',
      'HR Mgr': 'None',
    }
  }
];

export function RoleMatrix() {
  const [rows, setRows] = useState<PermissionRow[]>(INITIAL_ROWS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');

  const filteredRows = rows.filter(row => {
    const matchesSearch = row.module.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          row.subModule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          row.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleToggleCell = (rowIndex: number, role: string) => {
    const updatedRows = [...rows];
    const currentRow = updatedRows[rowIndex];
    const currentPermission = currentRow.rolesApproved[role];

    let nextPermission: 'Full' | 'Read' | 'None';
    if (currentPermission === 'None') nextPermission = 'Read';
    else if (currentPermission === 'Read') nextPermission = 'Full';
    else nextPermission = 'None';

    currentRow.rolesApproved[role] = nextPermission;
    setRows(updatedRows);
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#8C5A3C] text-white p-6 rounded-3xl border border-[#7D6B5D]/25">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#E8F1D7]" /> Role Permissions & Access Matrix Control
        </h3>
        <p className="text-xs text-white/90 mt-1 leading-relaxed">
          Kids Villa Academy platform uses customizable Role-Based Access Control (RBAC). Admin can click any interactive table bubble to cycle permissions status:
          <span className="font-bold text-[#E8F1D7] ml-2 font-mono">None → Read-Only → Full Write Access</span>.
        </p>
      </div>

      {/* Filter and search utilities */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#E0D8CC]">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#7D6B5D]" />
          <input
            type="text"
            placeholder="Search system capability or specific module details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-2 bg-[#FDFBF7] text-[#3D2B1F] border border-[#E0D8CC] rounded-lg focus:outline-hidden"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-[#7D6B5D]">Focus Role:</span>
          <select 
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs bg-[#FDFBF7] border border-[#E0D8CC] p-1.5 rounded-lg text-[#3D2B1F] font-bold"
          >
            <option value="All">All 14 School Roles</option>
            {ROLES.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Permissions Grid Table */}
      <div className="bg-white rounded-3xl border border-[#E0D8CC] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F2EDE4] text-[#3D2B1F] font-bold text-[10px] uppercase border-b border-[#E0D8CC]">
                <th className="p-4 min-w-[200px]">System Module & Action</th>
                {ROLES.filter(r => selectedRoleFilter === 'All' || r === selectedRoleFilter).map((role) => (
                  <th key={role} className="p-3 text-center min-w-[110px] border-l border-[#E0D8CC]/60">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E0D8CC]">
              {filteredRows.map((row, rIndex) => (
                <tr key={row.subModule} className="hover:bg-[#FDFBF7] transition-all">
                  <td className="p-4 space-y-1">
                    <span className="text-[10px] bg-[#E8F1D7] text-[#6B8E23] px-2 py-0.5 rounded-md font-bold uppercase">
                      {row.module}
                    </span>
                    <h5 className="font-extrabold text-xs text-[#3D2B1F]">{row.subModule}</h5>
                    <p className="text-[10px] text-[#7D6B5D] leading-tight font-medium">{row.description}</p>
                  </td>

                  {ROLES.filter(r => selectedRoleFilter === 'All' || r === selectedRoleFilter).map((role) => {
                    const status = row.rolesApproved[role] || 'None';
                    return (
                      <td 
                        key={role} 
                        className="p-3 text-center border-l border-[#E0D8CC]/55"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleCell(rIndex, role)}
                          className={`w-full py-2.5 rounded-xl text-[10px] font-bold flex flex-col items-center justify-center gap-1 transition-all border outline-hidden ${
                            status === 'Full' 
                              ? 'bg-[#E8F1D7] border-[#6B8E23] text-[#3D2B1F]' 
                              : status === 'Read'
                              ? 'bg-[#F2EDE4] border-[#7D6B5D]/40 text-[#7D6B5D]'
                              : 'bg-white text-gray-300 border-gray-100 hover:border-gray-300'
                          }`}
                        >
                          {status === 'Full' && (
                            <>
                              <Check className="w-3 w-3 text-[#6B8E23]" />
                              <span>Full Write</span>
                            </>
                          )}
                          {status === 'Read' && (
                            <>
                              <Info className="w-3 w-3 text-[#7D6B5D]" />
                              <span>Read-Only</span>
                            </>
                          )}
                          {status === 'None' && (
                            <>
                              <X className="w-3 w-3 text-gray-300" />
                              <span>Restricted</span>
                            </>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-[#FDFBF7] p-4 text-[11px] text-[#7D6B5D] font-bold flex items-center gap-2 border-t border-[#E0D8CC]">
          <span className="w-2 h-2 rounded-full bg-[#6B8E23] animate-ping" />
          <span>RBAC modifications are instantly applied to active user sessions and stored securely. Secure GDPR audit logs log who triggered the change.</span>
        </div>
      </div>
    </div>
  );
}
