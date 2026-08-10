import PerformanceChart from '@/components/charts/PerformanceChart';

interface Trade {
  id: string;
  pnl: number;
  date: string;
  [key: string]: any;
}

interface AnalyticsViewProps {
  trades: Trade[];
  initialBalance: number;
  grossProfit: number;
  grossLoss: number;
  winningTrades: Trade[];
  losingTrades: Trade[];
}

export default function AnalyticsView({ trades, initialBalance, grossProfit, grossLoss, winningTrades, losingTrades }: AnalyticsViewProps) {
  return (
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
  );
}