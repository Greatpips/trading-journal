'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import AuthModal from '@/components/modals/AuthModal';
import AddTradeModal from '@/components/modals/AddTradeModal';
import DayDetailsModal from '@/components/modals/DayDetailsModal';
import PerformanceChart from '@/components/charts/PerformanceChart';
import PnlCalendar from '@/components/calendar/PnlCalendar';
import AccountBalanceBanner from '@/components/dashboard/AccountBalanceBanner';
import MetricCardsGrid from '@/components/dashboard/MetricCardsGrid';
import AnalyticsView from '@/components/dashboard/AnalyticsView';
import PipsCalculator from '@/components/tools/PipsCalculator';
import TraderProfileView from '@/components/tools/TraderProfileView';

interface CustomItem {
  id: string;
  name: string;
  desc: string;
}

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
  trader_type?: string;
  trading_style?: string;
  custom_trader_types?: CustomItem[];
  custom_trading_styles?: CustomItem[];
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
    // Prevent locking user out if they arrived via a password reset link hash
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setAuthChecking(false);
      return;
    }

    // Bulletproof session check on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthChecking(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        return;
      }
      setUser(session?.user || null);
      setAuthChecking(false);
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
        if (!activeAccount) {
          setActiveAccount(data[0]);
        } else {
          const updatedActive = data.find((acc: TradingAccount) => acc.id === activeAccount.id);
          if (updatedActive) setActiveAccount(updatedActive);
        }
      } else {
        await createDefaultAccount();
      }
    } catch (error: unknown) {
      console.error('Error fetching accounts:', error);
    }
  };

  const createDefaultAccount = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([{ 
          user_id: user.id, 
          name: 'Main Account', 
          initial_balance: 10000, 
          trader_type: 'Day Trader', 
          trading_style: 'SMC',
          custom_trader_types: [],
          custom_trading_styles: []
        }])
        .select();

      if (error) throw error;
      if (data) {
        setAccounts(data);
        setActiveAccount(data[0]);
      }
    } catch (error: unknown) {
      console.error('Error creating default account:', error);
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
          initial_balance: Number(newAccountBalance) || 10000,
          trader_type: 'Day Trader',
          trading_style: 'SMC',
          custom_trader_types: [],
          custom_trading_styles: []
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
      console.error('Error creating account:', error);
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
      console.error('Error deleting account:', error);
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
      console.error('Error fetching trades details:', error);
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
      console.error('Error adding trade:', error);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    try {
      const { error } = await supabase.from('trades').delete().eq('id', id);
      if (error) throw error;
      setTrades(trades.filter(t => t.id !== id));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
      console.error('Error deleting trade:', error);
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

  const sidebarProps = {
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
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans flex overflow-x-hidden">
      
      <Sidebar {...sidebarProps} />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex md:hidden">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <Sidebar {...sidebarProps} />
          </div>
          <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <Header 
          activeAccount={activeAccount} 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          setModalInitialDate={setModalInitialDate} 
          setIsModalOpen={setIsModalOpen} 
          handleSignOut={handleSignOut} 
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          <AccountBalanceBanner 
            currentAccountBalance={currentAccountBalance} 
            initialBalance={initialBalance} 
            tradeCount={trades.length} 
            traderType={activeAccount?.trader_type || 'Day Trader'}
            tradingStyle={activeAccount?.trading_style || 'SMC'}
          />

          <MetricCardsGrid 
            totalNetPnl={totalNetPnl} 
            winRate={winRate} 
            profitFactor={profitFactor} 
            initialBalance={initialBalance} 
          />

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
            <AnalyticsView 
              trades={trades} 
              initialBalance={initialBalance} 
              grossProfit={grossProfit} 
              grossLoss={grossLoss} 
              winningTrades={winningTrades} 
              losingTrades={losingTrades} 
            />
          )}

          {activeTab === 'calculator' && (
            <PipsCalculator />
          )}

          {activeTab === 'profile' && (
            <TraderProfileView 
              activeAccount={activeAccount} 
              onAccountUpdated={fetchAccounts} 
            />
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