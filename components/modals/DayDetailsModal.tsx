'use client';

import { X, Trash2, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, Target, Plus, CheckCircle2, XCircle } from 'lucide-react';

interface TradeRuleEvaluation {
  id: string;
  rule_id: string;
  rule_text: string;
  passed: boolean;
  break_reason?: string;
}

interface Trade {
  id: string;
  asset: string;
  type: string;
  trend: string;
  zoneTimeframe?: string;
  zone_timeframe?: string;
  zoneType?: string;
  zone_type?: string;
  riskPercentage?: number;
  risk_percentage?: number;
  session: string;
  duration?: string;
  pnl: number;
  entryPrice?: number;
  entry_price?: number;
  exitPrice?: number;
  exit_price?: number;
  slPrice?: number;
  sl_price?: number;
  tpPrice?: number;
  tp_price?: number;
  thoughts?: string;
  date: string;
  trade_rules_evaluation?: TradeRuleEvaluation[];
}

interface DayDetailsModalProps {
  isOpen: boolean;
  date: string | null;
  trades: Trade[];
  onClose: () => void;
  onDeleteTrade: (id: string) => void;
  onAddTradeForDate?: (dateStr: string) => void;
}

export default function DayDetailsModal({ isOpen, date, trades, onClose, onDeleteTrade, onAddTradeForDate }: DayDetailsModalProps) {
  if (!isOpen || !date) return null;

  const dayTrades = trades.filter(t => t.date === date);
  const dayPnl = dayTrades.reduce((acc, t) => acc + Number(t.pnl), 0);
  const isWin = dayPnl >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl max-w-3xl w-full p-6 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Executions Logged for {date}</h3>
            <p className="text-xs text-slate-500">Complete breakdown of parameters, prices, psychology notes, and rule compliance.</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onClose();
                if (onAddTradeForDate) onAddTradeForDate(date);
              }}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Plus size={14} />
              <span>Add Trade</span>
            </button>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Daily Summary Banner */}
        <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-slate-400 block font-medium">Daily Net P&L</span>
            <span className={`text-lg font-bold ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isWin ? `+$${dayPnl.toFixed(2)}` : `-$${Math.abs(dayPnl).toFixed(2)}`}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block font-medium">Total Executions</span>
            <span className="text-sm font-bold text-slate-800">{dayTrades.length} Trades</span>
          </div>
        </div>

        {/* Scrollable Trade Cards */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {dayTrades.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-12">No records found for this date.</p>
          ) : (
            dayTrades.slice().reverse().map((t) => {
              const tradeWin = Number(t.pnl) >= 0;
              const evaluations = t.trade_rules_evaluation || [];

              return (
                <div key={t.id} className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs space-y-4">
                  
                  {/* Top card row */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-slate-900">{t.asset}</span>
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${t.type === 'Long' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {t.type === 'Long' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {t.type}
                      </span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-medium">{t.session} Session</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-bold ${tradeWin ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tradeWin ? `+$${t.pnl}` : `-$${Math.abs(t.pnl)}`}
                      </span>
                      <button
                        onClick={() => onDeleteTrade(t.id)}
                        className="text-slate-300 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete trade"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Parameter Grid with Fallbacks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Trend & Zone</span>
                      <span className="font-semibold text-slate-800">{t.trend} ({t.zoneTimeframe || t.zone_timeframe})</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Zone Setup</span>
                      <span className="font-semibold text-slate-800 truncate block">{t.zoneType || t.zone_type}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block font-medium">Risked Capital</span>
                      <span className="font-semibold text-slate-800">{t.riskPercentage || t.risk_percentage}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-1.5">
                      <Clock size={14} className="text-slate-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Duration</span>
                        <span className="font-semibold text-slate-800">{t.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Execution Values with Fallbacks */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Entry Price</span>
                      <span className="font-semibold text-slate-700">{t.entryPrice || t.entry_price}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-sans block">Exit Price</span>
                      <span className="font-semibold text-slate-700">{t.exitPrice || t.exit_price}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldAlert size={12} className="text-rose-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Stop Loss</span>
                        <span className="font-semibold text-slate-700">{t.slPrice || t.sl_price}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target size={12} className="text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 font-sans block">Take Profit</span>
                        <span className="font-semibold text-slate-700">{t.tpPrice || t.tp_price}</span>
                      </div>
                    </div>
                  </div>

                  {/* Trading Rules Compliance Display */}
                  {evaluations.length > 0 && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Rules Checklist Audit:</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {evaluations.map((ev) => (
                          <div 
                            key={ev.id} 
                            className={`p-2.5 rounded-xl text-xs border flex flex-col gap-1 ${
                              ev.passed 
                                ? 'bg-emerald-50/50 border-emerald-200/60 text-emerald-900' 
                                : 'bg-rose-50/60 border-rose-200 text-rose-900'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-1.5 truncate pr-2">
                                {ev.passed ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" /> : <XCircle size={14} className="text-rose-600 shrink-0" />}
                                <span className="truncate">{ev.rule_text}</span>
                              </span>
                              <span className="shrink-0 text-[11px] font-bold">
                                {ev.passed ? 'Followed' : 'Broken'}
                              </span>
                            </div>
                            {!ev.passed && ev.break_reason && (
                              <p className="text-[11px] text-rose-700 italic pl-5">
                                Reason: "{ev.break_reason}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trading Thoughts & Psychology */}
                  {t.thoughts && (
                    <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100/60 text-xs text-slate-700">
                      <span className="font-semibold text-amber-900 block mb-1">Trading Thoughts & Psychology:</span>
                      <p className="leading-relaxed">{t.thoughts}</p>
                    </div>
                  )}

                </div>
              );
            })
          )}
        </div>

        {/* Footer Close */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
}