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
import TradingRulesView from '@/components/tools/TradingRulesView';

interface CustomItem {
  id: string;
  name: string;
  desc: string;
}

interface TradeRuleEvaluation {
  id: string;
  trade_id: string;
  rule_id: string;
  rule_text: string;
  passed: boolean;
  break_reason: string;
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
  trade_rules_evaluation?: TradeRuleEvaluation[];
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
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      setAuthChecking(false);
      return;
    }

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
        .select(`
          *,
          trade_rules_evaluation (
            id,
            trade_id,
            rule_id,
            rule_text,
            passed,
            break_reason
          )
        `)
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
      const { ruleEvaluations, ...tradeFormData } = newTrade;

      const payload = {
        user_id: user.id,
        account_id: activeAccount.id,
        asset: tradeFormData.asset,
        type: tradeFormData.type,
        trend: tradeFormData.trend,
        zone_timeframe: tradeFormData.zoneTimeframe,
        zone_type: tradeFormData.zoneType,
        risk_percentage: Number(tradeFormData.riskPercentage),
        session: tradeFormData.session,
        entry_price: tradeFormData.entryPrice ? Number(tradeFormData.entryPrice) : null,
        exit_price: tradeFormData.exitPrice ? Number(tradeFormData.exitPrice) : null,
        sl_price: tradeFormData.slPrice ? Number(tradeFormData.slPrice) : null,
        tp_price: tradeFormData.tpPrice ? Number(tradeFormData.tpPrice) : null,
        duration: tradeFormData.duration,
        pnl: Number(tradeFormData.pnl),
        thoughts: tradeFormData.thoughts,
        date: tradeFormData.date,
      };

      // 1. Insert core trade record
      const { data: insertedTrade, error: tradeError } = await supabase
        .from('trades')
        .insert([payload])
        .select(`
          *,
          trade_rules_evaluation (
            id,
            trade_id,
            rule_id,
            rule_text,
            passed,
            break_reason
          )
        `)
        .single();

      if (tradeError) throw tradeError;

      // 2. Insert rule evaluations if present
      if (ruleEvaluations && ruleEvaluations.length > 0 && insertedTrade) {
        const evaluationsPayload = ruleEvaluations.map((evalItem: any) => ({
          trade_id: insertedTrade.id,
          rule_id: evalItem.rule_id,
          rule_text: evalItem.rule_text,
          passed: evalItem.passed,
          break_reason: evalItem.break_reason,
        }));

        const { error: evalError } = await supabase
          .from('trade_rules_evaluation')
          .insert(evaluationsPayload);

        if (evalError) throw evalError;

        // Re-fetch or manually attach evaluations to state item
        const { data: refreshedTrade } = await supabase
          .from('trades')
          .select(`
            *,
            trade_rules_evaluation (
              id,
              trade_id,
              rule_id,
              rule_text,
              passed,
              break_reason
            )
          `)
          .eq('id', insertedTrade.id)
          .single();

        if (refreshedTrade) {
          setTrades((prevTrades: Trade[]) => 
            [...prevTrades, refreshedTrade].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          );
        }
      } else if (insertedTrade) {
        setTrades((prevTrades: Trade[]) => 
          [...prevTrades, insertedTrade].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        );
      }
    } catch (error: unknown) {
      console.error('Error adding trade:', error);
      alert('Failed to save execution record.');
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
    <div className="min-h-screen bg-[#F5F5F7] text-slate-900 font-sans flex w-full overflow-x-hidden">
      
      {/* Desktop Sidebar */}
      <div className="hidden md:block shrink-0">
        <Sidebar {...sidebarProps} />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            <Sidebar {...sidebarProps} />
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <Header 
          activeAccount={activeAccount} 
          activeTab={activeTab} 
          setIsMobileMenuOpen={setIsMobileMenuOpen} 
          setModalInitialDate={setModalInitialDate} 
          setIsModalOpen={setIsModalOpen} 
          handleSignOut={handleSignOut} 
        />

        <main className="p-3 sm:p-5 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl w-full mx-auto box-border">
          
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
            <div className="space-y-4 sm:space-y-6">
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

          {activeTab === 'rules' && (
            <TradingRulesView user={user} />
          )}

          {activeTab === 'journal' && (
            <div className="bg-white border border-slate-200/85 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">Trading Playbook, Rules & Logged Thoughts</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Review execution details and master discipline breakdown logs for {activeAccount?.name}.</p>
              </div>

              <div className="space-y-3">
                {trades.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No trade logs available for this account yet.</p>
                ) : (
                  [...trades].reverse().map((t) => {
                    const evaluations = t.trade_rules_evaluation || [];
                    const brokenRules = evaluations.filter((e) => !e.passed);

                    return (
                      <div key={t.id} className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/70 bg-slate-50/50 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 truncate pr-2">{t.asset} ({t.type}) — {t.date}</span>
                          <span className={`text-xs font-bold shrink-0 ${Number(t.pnl) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {Number(t.pnl) >= 0 ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          <strong className="text-slate-800">Setup:</strong> {t.zone_type} ({t.zone_timeframe}) • <strong className="text-slate-800">Session:</strong> {t.session} • <strong className="text-slate-800">Risk:</strong> {t.risk_percentage}%
                        </p>

                        {/* Rules Verification Display */}
                        {evaluations.length > 0 && (
                          <div className="pt-1 border-t border-slate-200/60 mt-2 space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Master Rules Checklist:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {evaluations.map((ev) => (
                                <div key={ev.id} className={`p-2 rounded-xl text-[11px] border ${ev.passed ? 'bg-emerald-50/50 border-emerald-200/70 text-emerald-900' : 'bg-rose-50/60 border-rose-200 text-rose-900'}`}>
                                  <div className="font-semibold flex items-center justify-between">
                                    <span>{ev.rule_text}</span>
                                    <span>{ev.passed ? '✅ Followed' : '❌ Broken'}</span>
                                  </div>
                                  {!ev.passed && ev.break_reason && (
                                    <p className="text-[10px] text-rose-700 mt-1 italic">
                                      Reason: "{ev.break_reason}"
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {t.thoughts && (
                          <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200/60 mt-2">
                            <strong className="text-slate-900 block mb-0.5">Thoughts & Psychology:</strong> {t.thoughts}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200/85 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-4 sm:space-y-6 max-w-xl">
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-slate-900">Account & Data Settings</h3>
                <p className="text-[11px] sm:text-xs text-slate-500">Currently managing: <span className="font-bold text-slate-800">{activeAccount?.name}</span></p>
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