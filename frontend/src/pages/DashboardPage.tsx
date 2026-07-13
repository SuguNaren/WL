import { useState } from 'react';
import { ClipboardList, FileSpreadsheet, LogOut, Users } from 'lucide-react';
import { BrandHeader } from '../components/BrandHeader';
import { EmployeeMasterForm } from '../components/EmployeeMasterForm';
import { ReportView } from '../components/ReportView';
import { WorkloadEntryForm } from '../components/WorkloadEntryForm';
import { useAuthStore } from '../store/authStore';

type TabKey = 'employees' | 'workload' | 'reports';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [tab, setTab] = useState<TabKey>(user?.role === 'ADMIN' ? 'employees' : 'workload');

  const tabs =
    user?.role === 'ADMIN'
      ? [
          { key: 'employees' as TabKey, label: 'Employee Master', icon: Users },
          { key: 'workload' as TabKey, label: 'Workload Entry', icon: ClipboardList },
          { key: 'reports' as TabKey, label: 'Reports', icon: FileSpreadsheet }
        ]
      : [
          { key: 'workload' as TabKey, label: 'Workload Entry', icon: ClipboardList },
          { key: 'reports' as TabKey, label: 'Reports', icon: FileSpreadsheet }
        ];

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <BrandHeader compact />
          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user?.employeeName || 'Administrator'}</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{user?.role}</p>
            </div>
            <button
              onClick={logout}
              className="inline-flex h-11 items-center gap-2 border border-stone-300 px-4 text-sm font-medium text-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          {tabs.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`inline-flex h-11 items-center gap-2 border px-4 text-sm font-medium ${
                  active
                    ? 'border-brand-500 bg-brand-500 text-white'
                    : 'border-stone-300 bg-white text-slate-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {tab === 'employees' && user?.role === 'ADMIN' ? <EmployeeMasterForm /> : null}
        {tab === 'workload' ? <WorkloadEntryForm /> : null}
        {tab === 'reports' ? <ReportView /> : null}
      </main>
    </div>
  );
}
