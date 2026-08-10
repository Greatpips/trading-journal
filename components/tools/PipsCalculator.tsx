'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, RefreshCcw } from 'lucide-react';

interface CalculationResult {
  pips: number;
  pipValueUSD: number;
  totalProfitUSD: number;
}

export default function PipsCalculator() {
  const [assetClass, setAssetClass] = useState<'forex' | 'crypto' | 'metal'>('forex');
  const [pair, setPair] = useState<string>('EURUSD');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [exitPrice, setExitPrice] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('1.0');
  const [accountCurrency, setAccountCurrency] = useState<string>('USD');

  // Pre-configured typical pairs
  const assetOptions = {
    forex: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'EURJPY'],
    crypto: ['BTCUSD', 'ETHUSD', 'SOLUSD'],
    metal: ['XAUUSD', 'XAGUSD']
  };

  const handleAssetClassChange = (newClass: 'forex' | 'crypto' | 'metal') => {
    setAssetClass(newClass);
    setPair(assetOptions[newClass][0]);
    if (newClass === 'metal') {
      setEntryPrice('2350.00');
      setExitPrice('2365.00');
    } else if (newClass === 'crypto') {
      setEntryPrice('65000.00');
      setExitPrice('66200.00');
    } else {
      setEntryPrice('1.08500');
      setExitPrice('1.09200');
    }
  };

  const calculateResults = (): CalculationResult => {
    const entry = parseFloat(entryPrice) || 0;
    const exit = parseFloat(exitPrice) || 0;
    const lots = parseFloat(lotSize) || 0;

    if (entry === 0 || exit === 0 || lots === 0) {
      return { pips: 0, pipValueUSD: 0, totalProfitUSD: 0 };
    }

    let diff = tradeType === 'buy' ? exit - entry : entry - exit;
    let pipMultiplier = 10000; // Standard forex (4 decimal places)
    let pipValuePerLot = 10 * lots; // Standard 1 lot EURUSD = $10/pip

    if (pair.includes('JPY')) {
      pipMultiplier = 100; // JPY pairs use 2 decimal places
    }

    if (assetClass === 'metal') {
      if (pair === 'XAUUSD') {
        // Gold: 1 pip = 0.10 price movement or 0.01 depending on broker. Let's use 0.1 standard (1 pip = $1 per 0.1 move for 1 lot)
        pipMultiplier = 10; 
      }
    } else if (assetClass === 'crypto') {
      // Crypto structural pips (1 full dollar move or 0.1)
      pipMultiplier = 1;
    }

    const pips = diff * pipMultiplier;
    
    // Approximate pip value calculation based on standard contract specs
    let pipValueUSD = 10 * lots;
    if (pair.includes('JPY')) {
      pipValueUSD = (10 / exit) * 10 * lots; // Dynamic JPY adjustment
    } else if (assetClass === 'metal') {
      pipValueUSD = 1 * lots; // Gold standard calculation per 0.1 tick
    } else if (assetClass === 'crypto') {
      pipValueUSD = 1 * lots;
    }

    const totalProfitUSD = diff * (assetClass === 'forex' ? (pair.includes('JPY') ? 1000 * lots : 100000 * lots) : lots * 100);

    return {
      pips: Number(pips.toFixed(1)),
      pipValueUSD: Number(pipValueUSD.toFixed(2)),
      totalProfitUSD: Number(totalProfitUSD.toFixed(2))
    };
  };

  const results = calculateResults();

  const handleReset = () => {
    setEntryPrice('');
    setExitPrice('');
    setLotSize('1.0');
  };

  return (
    <div className="bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Professional Pips & Risk Calculator</h3>
            <p className="text-xs text-slate-500">Accurately calculate pip values, spread impacts, and projected monetary return.</p>
          </div>
        </div>
        <button
          onClick={handleReset}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl transition-colors"
        >
          <RefreshCcw size={14} />
          <span>Reset Fields</span>
        </button>
      </div>

      {/* Calculator Grid Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* 1. Asset Class Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Asset Category</label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
            {(['forex', 'crypto', 'metal'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleAssetClassChange(cat)}
                className={`py-2 text-xs font-bold capitalize rounded-lg transition-all ${
                  assetClass === cat 
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60' 
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Symbol / Pair Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Instrument / Pair</label>
          <select
            value={pair}
            onChange={(e) => setPair(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
          >
            {assetOptions[assetClass].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        {/* 3. Trade Execution Type (Buy / Sell) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block">Execution Position</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTradeType('buy')}
              className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                tradeType === 'buy'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200/70 text-slate-500 hover:bg-slate-100'
              }`}
            >
              BUY (LONG)
            </button>
            <button
              type="button"
              onClick={() => setTradeType('sell')}
              className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                tradeType === 'sell'
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-2xs'
                  : 'bg-slate-50 border-slate-200/70 text-slate-500 hover:bg-slate-100'
              }`}
            >
              SELL (SHORT)
            </button>
          </div>
        </div>

      </div>

      {/* Price Inputs & Lot Sizing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 block">Entry Price</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 1.08500"
            value={entryPrice}
            onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 block">Exit / Target Price</label>
          <input
            type="number"
            step="any"
            placeholder="e.g. 1.09200"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-600 block">Position Size (Lots / Units)</label>
          <input
            type="number"
            step="0.01"
            placeholder="1.0"
            value={lotSize}
            onChange={(e) => setLotSize(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
          />
        </div>
      </div>

      {/* Real-Time Results Output Panel */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center shadow-md">
        
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Total Pip Movement</span>
          <div className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <span className={results.pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {results.pips > 0 ? `+${results.pips}` : results.pips} Pips
            </span>
          </div>
        </div>

        <div className="space-y-1 sm:border-x sm:border-slate-800 sm:px-6">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Estimated Pip Value</span>
          <div className="text-xl font-bold tracking-tight text-white">
            ${results.pipValueUSD} <span className="text-xs font-normal text-slate-400">per pip</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Projected Profit / Loss</span>
          <div className={`text-2xl font-bold tracking-tight ${results.totalProfitUSD >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {results.totalProfitUSD >= 0 ? `+$${results.totalProfitUSD.toLocaleString()}` : `-$${Math.abs(results.totalProfitUSD).toLocaleString()}`}
          </div>
        </div>

      </div>

    </div>
  );
}