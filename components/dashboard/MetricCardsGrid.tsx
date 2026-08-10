import { DollarSign, Percent, TrendingUp, Activity } from 'lucide-react';

interface MetricCardsGridProps {
  totalNetPnl: number;
  winRate: string;
  profitFactor: string;
  initialBalance: number;
}

export default function MetricCardsGrid({ totalNetPnl, winRate, profitFactor, initialBalance }: MetricCardsGridProps) {
  return (
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
  );
}