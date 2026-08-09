'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import AuthModal from '@/components/AuthModal';
import PnlCalendar from '@/components/PnlCalendar';
import AddTradeModal from '@/components/AddTradeModal';
import DayDetailsModal from '@/components/DayDetailsModal';
import PerformanceChart from '@/components/PerformanceChart';
import { Plus, Wallet, TrendingUp, Percent, DollarSign, Activity, LogOut, Trash2, FolderPlus, Briefcase, Menu, X } from 'lucide-react';

interface Trade {
  id: string;
  user_id: string;
  account_id: string;
  asset: string;
  type: string;
  trend: string;
  zone_timeframe: string;
  zone_type: string;
  risk_percentage: number;
  session: string;
  entry_price?: number;
  exit_price?: number;
  sl_price?: number;
  tp_price?: number;
  duration?: string;
  pnl: number;
  thoughts?: string;
  date: string;
}

interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  created_at?: string;
}

interface AuthUser {
  id: string;
  email?: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  
  // Accounts state
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<TradingAccount | null>(null);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const [newAccountName, setNewAccountName] = useState<string>('');
  const [newAccountBalance, setNewAccountBalance] = useState<string>('10000');

  // Trade modals & data
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialDate, setModalInitialDate] = useState<string | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchAccounts();
    }
  }, [user]);

  useEffect(() => {
    if (activeAccount) {
      fetchTrades(activeAccount.id);
    } else {
      setTrades([]);
    }
  }, [activeAccount]);

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAccounts(data);
        if (!activeAccount) setActiveAccount(data[0]);
      } else {
        await createDefaultAccount();
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching accounts:', errorMessage);
    }
  };

  const createDefaultAccount = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ user_id: user.id, name: 'Main Account', initial_balance: 10000 }])
        .select();

      if (error) throw error;
      if (data) {
        setAccounts(data);
        setActiveAccount(data[0]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating default account:', errorMessage);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ 
          user_id: user.id, 
          name: newAccountName.trim(), 
          initial_balance: Number(newAccountBalance) || 10000 
        }])
        .select();

      if (error) throw error;
      if (data) {
        setAccounts([...accounts, data[0]]);
        setActiveAccount(data[0]);
        setNewAccountName('');
        setNewAccountBalance('10000');
        setIsCreatingAccount(false);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error creating account:', errorMessage);
    }
  };

  const handleDeleteAccount = async (accountId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (accounts.length <= 1) {
      alert('You must keep at least one active account.');
      return;
    }
    if (!confirm('Are you sure you want to delete this account and all its trades?')) return;

    try {
      const { error } = await supabase.from('accounts').delete().eq('id', accountId);
      if (error) throw error;

      const updatedAccounts = accounts.filter(acc => acc.id !== accountId);
      setAccounts(updatedAccounts);
      if (activeAccount?.id === accountId) {
        setActiveAccount(updatedAccounts[0]);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting account:', errorMessage);
    }
  };

  const fetchTrades = async (accountId: string) => {
    try {
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('account_id', accountId)
        .order('date', { ascending: true }); 

      if (error) throw error;
      setTrades(data || []);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching trades:', errorMessage);
    }
  };

  const handleAddTrade = async (newTrade: any) => {
    if (!activeAccount || !user) return;
    try {
      const payload = {
        user_id: user.id,
        account_id: activeAccount.id,
        asset: newTrade.asset,
        type: newTrade.type,
        trend: newTrade.trend,
        zone_timeframe: newTrade.zoneTimeframe,
        zone_type: newTrade.zoneType,
        risk_percentage: Number(newTrade.riskPercentage),
        session: newTrade.session,
        entry_price: Number(newTrade.entryPrice),
        exit_price: Number(newTrade.exitPrice),
        sl_price: Number(newTrade.slPrice),
        tp_price: Number(newTrade.tpPrice),
        duration: newTrade.duration,
        pnl: Number(newTrade.pnl),
        thoughts: newTrade.thoughts,
        date: newTrade.date,
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([payload])
        .select();

      if (error) throw error;
      if (data) {
        setTrades((prevTrades: Trade[]) => 
          [...prevTrades, data[0]].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error adding trade:', errorMessage);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) throw error;
      setTrades(trades.filter(t => t.id !== id));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error deleting trade:', errorMessage);
      alert('Delete failed: ' + errorMessage);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTrades([]);
    setAccounts([]);
  };

  const handleOpenAddTradeForDate = (dateStr: string) => {
    setModalInitialDate(dateStr);
    setIsModalOpen(true);
  };

  if (authChecking) {
    return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center text-xs font-medium text-slate-400">Loading Journal...</div>;
  }

  if (!user) {
    return <AuthModal onAuthSuccess={(authUser: AuthUser) => setUser(authUser)} />;
  }

  const initialBalance = activeAccount ? Number(activeAccount.initial_balance) : 10000;
  const totalNetPnl = trades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const currentAccountBalance = initialBalance + totalNetPnl;
  const winningTrades = trades.filter(t => Number(t.pnl) > 0);
  const losingTrades = trades.filter(t => Number(t.pnl) < 0);
  const winRate = trades.length > 0 ? ((winningTrades.length / trades.length) * 100).toFixed(1) : '0';
  
  const grossProfit = winningTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const grossLoss = Math.abs(losingTrades.reduce((acc, t) => acc + Number(t.pnl), 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'Infinite' : '0.00';

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">AJ</div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Apex Journal</h2>
            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden text-slate-400 hover:text-slate-900 p-1"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Accounts</span>
          <button 
            onClick={() => setIsCreatingAccount(!isCreatingAccount)}
            className="text-slate-600 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="Add New Account"
          >
            <FolderPlus size={16} />
          </button>
        </div>

        {isCreatingAccount && (
          <form onSubmit={handleCreateAccount} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <input
              type="text"
              placeholder="Account Name (e.g. FTMO)"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              required
            />
            <input
              type="number"
              placeholder="Starting Balance"
              value={newAccountBalance}
              onChange={(e) => setNewAccountBalance(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none"
              required
            />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-1.5 rounded-xl text-[11px] font-semibold">Create</button>
              <button type="button" onClick={() => setIsCreatingAccount(false)} className="text-slate-400 text-[11px] px-2">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {accounts.map((acc) => {
            const isActive = activeAccount?.id === acc.id;
            return (
              <div
                key={acc.id}
                onClick={() => { setActiveAccount(acc); setIsMobileMenuOpen(false); }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                  isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Briefcase size={14} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
                  <span className="truncate">{acc.name}</span>
                </div>
                {accounts.length > 1 && (
                  <button
                    onClick={(e) => handleDeleteAccount(acc.id, e)}
                    className={`p-1 rounded-lg transition-colors ${isActive ? 'text-slate-300 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'}`}
                    title="Delete account"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div onClick={() => setIsMobileMenuOpen(false)}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans flex overflow-x-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200/85 flex-col shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex md:hidden">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
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

        {/* Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Account Balance Banner */}
          <div className="bg-white border border-slate-200/85 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <Wallet size={24} />
              </div>
              <div>
                <span className="text-xs font-medium text-slate-400 block">Current Account Balance</span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  ${currentAccountBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-6 w-full md:w-auto justify-around md:justify-start">
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Starting Capital Base</span>
                <span className="text-xs font-bold text-slate-800">${initialBalance.toLocaleString()}</span>
              </div>
              <div className="border-l border-slate-200 pl-6">
                <span className="text-[10px] text-slate-400 block font-medium">Active Trades</span>
                <span className="text-xs font-bold text-slate-800">{trades.length} Executions</span>
              </div>
            </div>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white border border-slate-200/85 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Net P&L</span>
                <DollarSign size={16} className={totalNetPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'} />
              </div>
              <h4 className={`text-lg sm:text-xl font-bold tracking-tight truncate ${totalNetPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {totalNetPnl >= 0 ? `+$${totalNetPnl.toLocaleString()}` : `-$${Math.abs(totalNetPnl).toLocaleString()}`}
              </h4>
            </div>

            <div className="bg-white border border-slate-200/85 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Win Rate</span>
                <Percent size={16} className="text-slate-400" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{winRate}%</h4>
            </div>

            <div className="bg-white border border-slate-200/85 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Profit Factor</span>
                <TrendingUp size={16} className="text-slate-400" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">{profitFactor}</h4>
            </div>

            <div className="bg-white border border-slate-200/85 rounded-2xl p-4 sm:p-5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-400">Account Return</span>
                <Activity size={16} className="text-slate-400" />
              </div>
              <h4 className={`text-lg sm:text-xl font-bold tracking-tight truncate ${totalNetPnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {initialBalance > 0 ? ((totalNetPnl / initialBalance) * 100).toFixed(2) : 0}%
              </h4>
            </div>
          </div>

          {/* ACTIVE TAB VIEWS */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <PerformanceChart trades={trades} initialBalance={initialBalance} />
              <PnlCalendar trades={trades} onSelectDay={(dateStr: string) => { setSelectedDateFilter(dateStr); setIsDetailModalOpen(true); }} />
            </div>
          )}

          {activeTab === 'calendar' && (
            <PnlCalendar trades={trades} onSelectDay={(dateStr: string) => { setSelectedDateFilter(dateStr); setIsDetailModalOpen(true); }} />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <PerformanceChart trades={trades} initialBalance={initialBalance} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Gross Performance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <span className="text-xs font-medium text-slate-600">Total Gross Profit</span>
                      <span className="text-xs font-bold text-emerald-600">+${grossProfit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3.5 rounded-xl bg-rose-50/50 border border-rose-100">
                      <span className="text-xs font-medium text-slate-600">Total Gross Loss</span>
                      <span className="text-xs font-bold text-rose-600">-${grossLoss.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-semibold text-slate-900">Execution Statistics</h3>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">Winning Trades</span>
                      <span className="font-semibold text-emerald-600">{winningTrades.length}</span>
                    </div>
                    <div className="flex justify-between p-2.5 bg-slate-50 rounded-xl">
                      <span className="text-slate-500">Losing Trades</span>
                      <span className="font-semibold text-rose-600">{losingTrades.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Trading Playbook & Logged Thoughts</h3>
                <p className="text-xs text-slate-500">Review notes for {activeAccount?.name}.</p>
              </div>

              <div className="space-y-3">
                {trades.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No trade logs available for this account yet.</p>
                ) : (
                  [...trades].reverse().map((t) => (
                    <div key={t.id} className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate pr-2">{t.asset} ({t.type}) — {t.date}</span>
                        <span className={`text-xs font-bold shrink-0 ${Number(t.pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {Number(t.pnl) >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-800">Setup:</strong> {t.zone_type} ({t.zone_timeframe}) • <strong className="text-slate-800">Session:</strong> {t.session}
                      </p>
                      {t.thoughts && (
                        <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 mt-2">
                          <strong className="text-slate-900 block mb-0.5">Thoughts:</strong> {t.thoughts}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-xl">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Account & Data Settings</h3>
                <p className="text-xs text-slate-500">Currently managing: <span className="font-bold text-slate-800">{activeAccount?.name}</span></p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors w-full sm:w-auto"
              >
                Sign Out of Platform
              </button>
            </div>
          )}

        </main>

        {/* Modals */}
        <AddTradeModal 
          isOpen={isModalOpen} 
          onClose={() => {
            setIsModalOpen(false);
            setModalInitialDate(null);
          }} 
          onAddTrade={handleAddTrade} 
          initialDate={modalInitialDate}
        />
        
        <DayDetailsModal 
          isOpen={isDetailModalOpen} 
          date={selectedDateFilter} 
          trades={trades} 
          onClose={() => setIsDetailModalOpen(false)} 
          onDeleteTrade={handleDeleteTrade}
          onAddTradeForDate={handleOpenAddTradeForDate}
        />

      </div>
    </div>
  );
}