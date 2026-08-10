import { Wallet, Compass } from 'lucide-react';

interface AccountBalanceBannerProps {
  currentAccountBalance: number;
  initialBalance: number;
  tradeCount: number;
  traderType?: string;
  tradingStyle?: string;
}

export default function AccountBalanceBanner({ 
  currentAccountBalance, 
  initialBalance, 
  tradeCount,
  traderType = 'Day Trader',
  tradingStyle = 'SMC'
}: AccountBalanceBannerProps) {
  return (
    <div className="bg-white border border-slate-200/85 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
          <Wallet size={24} />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-slate-400">Current Account Balance</span>
            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
              <Compass size={10} className="text-slate-400" />
              {traderType} • {tradingStyle}
            </span>
          </div>
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
          <span className="text-xs font-bold text-slate-800">{tradeCount} Executions</span>
        </div>
      </div>
    </div>
  );
}