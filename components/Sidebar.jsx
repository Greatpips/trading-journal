'use client';

import { LayoutDashboard, Calendar, BarChart3, BookOpen, Settings, ShieldCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'P&L Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics & Graphs', icon: BarChart3 },
    { id: 'journal', label: 'Playbook & Notes', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200/85 flex flex-col justify-between hidden md:flex shrink-0 select-none">
      <div>
        {/* Brand / Logo Area */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold shadow-sm">
            T
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Apex Journal</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] text-slate-400 font-medium">FTMO / Prop Mode</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="p-4 space-y-1.5">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Menu</span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prop Firm Status Box */}
      <div className="p-4 m-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-600" />
          <span className="text-xs font-semibold text-slate-800">Account Verified</span>
        </div>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          Drawdown limits & risk parameters active. Safe equity tracking enabled.
        </p>
      </div>
    </aside>
  );
}