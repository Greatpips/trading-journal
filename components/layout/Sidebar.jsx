import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  BarChart3, 
  BookOpen, 
  Settings, 
  Plus, 
  Trash2, 
  Calculator,
  Compass,
  CheckSquare
} from 'lucide-react';

export default function Sidebar({
  user,
  accounts,
  activeAccount,
  setActiveAccount,
  isCreatingAccount,
  setIsCreatingAccount,
  newAccountName,
  setNewAccountName,
  newAccountBalance,
  setNewAccountBalance,
  handleCreateAccount,
  handleDeleteAccount,
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar P&L', icon: CalendarIcon },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'calculator', label: 'Pip Calculator', icon: Calculator },
    { id: 'profile', label: 'Trader Profile', icon: Compass },
    { id: 'rules', label: 'Trading Rules', icon: CheckSquare },
    { id: 'journal', label: 'Playbook Journal', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/85 flex flex-col h-full min-h-screen md:h-screen md:sticky md:top-0 shrink-0">
      
      {/* Brand Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold tracking-wider text-sm shadow-sm">
            GP
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 tracking-tight">GP TRADING JOURNAL</h2>
            <span className="text-[10px] text-slate-400 font-medium">Professional Suite v2.0</span>
          </div>
        </div>
      </div>

      {/* Account Switcher Section */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Trading Accounts</span>
          <button
            onClick={() => setIsCreatingAccount(!isCreatingAccount)}
            className="text-[10px] font-bold text-slate-900 hover:text-emerald-600 flex items-center gap-1 transition-colors"
          >
            <Plus size={12} /> New Account
          </button>
        </div>

        {isCreatingAccount && (
          <form onSubmit={handleCreateAccount} className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 shadow-xs animate-in fade-in duration-150">
            <input
              type="text"
              placeholder="Account Name (e.g. Funded Prop)"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden"
              autoFocus
            />
            <input
              type="number"
              placeholder="Initial Balance"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-hidden"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingAccount(false)}
                className="px-2 py-1 text-[10px] font-medium text-slate-500 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-[10px] font-semibold"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
          {accounts.map((acc) => {
            const isActive = activeAccount?.id === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => {
                  setActiveAccount(acc);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/60'
                }`}
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="truncate">{acc.name}</span>
                  <span className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                    ${Number(acc.initial_balance).toLocaleString()} {acc.trader_type ? `• ${acc.trader_type}` : ''}
                  </span>
                </div>
                {accounts.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteAccount(acc.id, e)}
                    className={`p-1 rounded-md transition-colors ${
                      isActive ? 'text-slate-300 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'
                    }`}
                    title="Delete Account"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 p-4 space-y-1 overflow-y-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 block">Menu</span>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-slate-900' : 'text-slate-400'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="truncate pr-2">
          <span className="text-[10px] text-slate-400 block font-medium">Logged in as</span>
          <span className="text-xs font-bold text-slate-800 truncate block">{user?.email || 'Trader'}</span>
        </div>
      </div>

    </aside>
  );
}