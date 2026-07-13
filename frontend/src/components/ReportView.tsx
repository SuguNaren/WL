import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRef, useState } from 'react';
import { api } from '../lib/api';
import { Workload } from '../types';
import { useAuthStore } from '../store/authStore';
import { Input } from './Input';
import { SectionCard } from './SectionCard';

type FilterState = {
  fromDate: string;
  toDate: string;
  department: string;
};

export function ReportView() {
  const user = useAuthStore((state) => state.user);
  const reportRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    fromDate: '',
    toDate: '',
    department: ''
  });

  const reportQuery = useQuery({
    queryKey: ['report-workloads', filters],
    queryFn: async () =>
      (
        await api.get<Workload[]>('/reports/workloads', {
          params: {
            fromDate: filters.fromDate || undefined,
            toDate: filters.toDate || undefined,
            department: user?.role === 'ADMIN' ? filters.department || undefined : undefined
          }
        })
      ).data
  });

  const headerEmployee = reportQuery.data?.[0]?.employee;

  const saveAsPdf = () => {
    if (!reportRef.current) {
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1024,height=768');
    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Workload Report</title>
          <style>
            body { font-family: "IBM Plex Sans", Arial, sans-serif; margin: 24px; color: #14213d; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #d6d3d1; padding: 10px 12px; text-align: left; vertical-align: top; }
            thead tr { border-bottom: 2px solid #0f172a; }
            h2, h3, p { margin: 0; }
            .header { text-align: center; }
            .header img { width: 48px; height: 48px; object-fit: contain; margin-bottom: 12px; }
            .criteria { margin-top: 16px; font-size: 12px; }
            .section { margin-top: 32px; padding-top: 24px; border-top: 1px solid #d6d3d1; }
          </style>
        </head>
        <body>${reportRef.current.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  return (
    <SectionCard title="Workload Report" description="Generate the institutional report layout and print directly from the browser.">
      <div className={`no-print mb-6 grid gap-4 ${user?.role === 'ADMIN' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">From Date</span>
          <Input
            type="date"
            value={filters.fromDate}
            onChange={(event) => setFilters((state) => ({ ...state, fromDate: event.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">To Date</span>
          <Input
            type="date"
            value={filters.toDate}
            onChange={(event) => setFilters((state) => ({ ...state, toDate: event.target.value }))}
          />
        </label>
        {user?.role === 'ADMIN' ? (
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Department</span>
            <Input
              value={filters.department}
              onChange={(event) => setFilters((state) => ({ ...state, department: event.target.value }))}
              placeholder="All Departments"
            />
          </label>
        ) : null}
        <div className="flex items-end">
          <button
            type="button"
            onClick={saveAsPdf}
            className="h-12 w-full bg-brand-500 px-5 text-sm font-semibold text-white"
          >
            Save as PDF
          </button>
        </div>
      </div>

      <div ref={reportRef} className="mx-auto max-w-6xl bg-white px-4 py-8 print:px-0">
        <div className="text-center">
          <img
            src="/logo.webp"
            alt="Stella Maris College"
            className="mx-auto mb-4 h-10 w-10 object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
          <h2 className="text-3xl font-semibold uppercase text-slate-900">Stella Maris College (Autonomous)</h2>
          <p className="mt-1 text-sm text-slate-500">Chennai - 600 086</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <p>
              <span className="font-semibold">Emp ID</span>: {headerEmployee?.employeeId || user?.employeeId || '-'}
            </p>
            <p>
              <span className="font-semibold">Employee</span>: {headerEmployee?.name || user?.employeeName || '-'}
            </p>
            <p>
              <span className="font-semibold">Department</span>: {headerEmployee?.department || '-'}
            </p>
          </div>
          <p className="mt-4 text-sm">
            <span className="font-semibold">Report Criteria:</span>{' '}
            {filters.fromDate ? format(new Date(filters.fromDate), 'dd-MM-yyyy') : 'All Dates'}{' '}
            {filters.toDate ? `to ${format(new Date(filters.toDate), 'dd-MM-yyyy')}` : ''}
            {user?.role === 'ADMIN' ? ` | Dept: ${filters.department || 'All'}` : ''}
          </p>
        </div>

        <div className="mt-10 border-t border-stone-300 pt-8">
          <h3 className="text-center text-2xl font-semibold uppercase text-slate-900">Daily Workload Report</h3>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b-2 border-stone-900">
                  <th className="px-3 py-3 font-semibold uppercase">Date</th>
                  <th className="px-3 py-3 font-semibold uppercase">Work Type</th>
                  <th className="px-3 py-3 font-semibold uppercase">Description</th>
                  <th className="px-3 py-3 font-semibold uppercase">Detailed Description</th>
                </tr>
              </thead>
              <tbody>
                {reportQuery.data?.map((item) => (
                  <tr key={item.id} className="border-b border-stone-200 align-top">
                    <td className="px-3 py-3">{item.workDate}</td>
                    <td className="px-3 py-3">{item.workType}</td>
                    <td className="px-3 py-3">{item.workDescription}</td>
                    <td className="px-3 py-3">{item.detailedDescription}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
