import { Menu, Plus, LogOut } from 'lucide-react';

interface TradingAccount {
  id: string;
  name: string;
  initial_balance: number;
}

interface HeaderProps {
  activeAccount: TradingAccount | null;
  activeTab: string;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
  setModalInitialDate: (date: string | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  handleSignOut: () => void;
}

export default function Header({ activeAccount, activeTab, setIsMobileMenuOpen, setModalInitialDate, setIsModalOpen, handleSignOut }: HeaderProps) {
  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/85 px-4 sm:px-6 py-4 sticky top-0 z-30 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-slate-600 hover:text-slate-900 p-1.5 rounded-xl bg-slate-100"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-slate-900 tracking-tight truncate">
            {activeAccount ? activeAccount.name : 'Dashboard'} <span className="text-xs font-normal text-slate-400">({activeTab})</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={() => {
            setModalInitialDate(null);
            setIsModalOpen(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm active:scale-95 flex items-center gap-1.5 sm:gap-2"
        >
          <Plus size={15} />
          <span>Add Trade</span>
        </button>
        <button
          onClick={handleSignOut}
          title="Sign Out"
          className="text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 p-2.5 rounded-xl transition-colors hidden sm:block"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}