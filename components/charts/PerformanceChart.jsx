'use client';

import { useState } from 'react';

export default function PerformanceChart({ trades, initialBalance }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const baseBalance = Number(initialBalance) || 10000;

  // STRICT CHRONOLOGICAL SORT: Oldest trade first (left) to newest trade last (right)
  const sortedTrades = [...trades].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  let runningBalance = baseBalance;
  const tradePoints = sortedTrades.map((t, index) => {
    runningBalance += Number(t.pnl);
    return { 
      id: t.id || index,
      date: t.date, 
      asset: t.asset,
      type: t.type,
      pnl: Number(t.pnl),
      balance: runningBalance 
    };
  });

  // Anchor starting capital at index 0 (far left edge)
  const dataPoints = [
    { 
      id: 'start',
      date: 'Account Creation', 
      asset: 'Initial Capital', 
      type: '', 
      pnl: 0, 
      balance: baseBalance 
    },
    ...tradePoints
  ];

  // Calculate SVG bounds
  const balances = dataPoints.map(d => d.balance);
  const maxB = Math.max(...balances, baseBalance + 200);
  const minB = Math.min(...balances, baseBalance - 200);
  const range = maxB - minB || 1;

  const width = 700;
  const height = 200;

  const points = dataPoints.map((d, index) => {
    const x = (index / (dataPoints.length - 1 || 1)) * width;
    const y = height - ((d.balance - minB) / range) * (height - 30) - 15;
    return { x, y, ...d };
  });

  const startLineY = height - ((baseBalance - minB) / range) * (height - 30) - 15;

  const pathString = points.reduce((acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`), '');
  const fillString = points.length > 0 ? `${pathString} L ${width} ${height} L 0 ${height} Z` : '';
  const isNetPositive = runningBalance >= baseBalance;

  return (
    <div className="bg-white border border-slate-200/85 rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">Detailed Equity Curve & Balance Progression</h3>
          <p className="text-xs text-slate-500">Tracking equity performance against your starting balance milestone.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-medium">Current Equity</span>
            <span className={`text-xs font-bold ${runningBalance >= baseBalance ? 'text-emerald-600' : 'text-rose-600'}`}>
              ${runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl ${isNetPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isNetPositive ? 'Profitable' : 'In Drawdown'}
          </span>
        </div>
      </div>

      {dataPoints.length <= 1 ? (
        <div className="h-48 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
          Log at least one trade to render equity graph trajectory and progression milestones.
        </div>
      ) : (
        <div className="relative w-full">
          {hoveredPoint && (
            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[11px] px-3.5 py-2 rounded-xl shadow-lg z-20 space-y-0.5 pointer-events-none">
              <div className="flex items-center justify-between gap-4">
                <span className="font-bold text-slate-200">{hoveredPoint.date}</span>
                <span className={hoveredPoint.pnl >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {hoveredPoint.pnl === 0 ? 'Base' : (hoveredPoint.pnl > 0 ? `+$${hoveredPoint.pnl}` : `-$${Math.abs(hoveredPoint.pnl)}`)}
                </span>
              </div>
              <div className="text-slate-400 text-[10px] flex items-center gap-2">
                <span>{hoveredPoint.asset} {hoveredPoint.type}</span>
                <span>•</span>
                <span className="text-white font-semibold">Balance: ${hoveredPoint.balance.toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="w-full overflow-x-auto pt-4">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48 overflow-visible select-none">
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isNetPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={isNetPositive ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              <line 
                x1="0" 
                y1={startLineY} 
                x2={width} 
                y2={startLineY} 
                stroke="#cbd5e1" 
                strokeDasharray="4 4" 
                strokeWidth="1" 
              />
              <text x="5" y={startLineY - 6} fill="#94a3b8" fontSize="10" fontWeight="500">
                Start: ${baseBalance.toLocaleString()}
              </text>

              <path d={fillString} fill="url(#equityGradient)" />
              <path d={pathString} fill="none" stroke={isNetPositive ? '#10b981' : '#f43f5e'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {points.map((p, idx) => (
                <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={hoveredPoint?.id === p.id ? "6" : "4"}
                    className={`transition-all ${
                      hoveredPoint?.id === p.id 
                        ? 'fill-slate-900 stroke-white stroke-2' 
                        : 'fill-white stroke-slate-900 stroke-2'
                    }`}
                  />
                </g>
              ))}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}