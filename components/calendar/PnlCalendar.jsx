'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function PnlCalendar({ trades, onSelectDay }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month name & Days calculation
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Aggregate trades by YYYY-MM-DD date string (robust against timezone drift)
  const dailySummary = {};
  trades.forEach(t => {
    if (!t.date) return;
    // Ensures we match the exact YYYY-MM-DD string regardless of time or timezone offsets
    const dStr = t.date.includes('T') ? t.date.split('T')[0] : t.date;
    
    if (!dailySummary[dStr]) {
      dailySummary[dStr] = { pnl: 0, count: 0 };
    }
    dailySummary[dStr].pnl += Number(t.pnl || 0);
    dailySummary[dStr].count += 1;
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Build calendar matrix cells
  const cells = [];
  // Padding for previous month blank slots
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="h-28 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60 opacity-40"></div>);
  }

  // Actual days of the month
  for (let day = 1; day <= totalDays; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    
    const dayData = dailySummary[dateKey];
    const hasTrades = !!dayData;
    const isWin = hasTrades && dayData.pnl >= 0;

    cells.push(
      <div
        key={dateKey}
        onClick={() => onSelectDay(dateKey, hasTrades)}
        className={`h-28 rounded-2xl p-3 flex flex-col justify-between border transition-all relative group cursor-pointer ${
          hasTrades 
            ? isWin 
              ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 shadow-xs' 
              : 'bg-rose-50/60 border-rose-200 hover:border-rose-300 shadow-xs'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${hasTrades ? (isWin ? 'text-emerald-900' : 'text-rose-900') : 'text-slate-400'}`}>
            {day}
          </span>
          {hasTrades ? (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${isWin ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {dayData.count} trade{dayData.count > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 bg-slate-100 p-1 rounded-lg">
              <Plus size={12} />
            </span>
          )}
        </div>

        {hasTrades ? (
          <div>
            <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Net P&L</span>
            <span className={`text-sm font-bold tracking-tight ${isWin ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isWin ? `+$${dayData.pnl.toFixed(2)}` : `-$${Math.abs(dayData.pnl).toFixed(2)}`}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-300 italic">No activity</span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
      
      {/* Calendar Navigation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Performance Calendar</h3>
          <p className="text-xs text-slate-500">Click any day to inspect executions or log a new setup.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800 px-3 py-1 bg-slate-100 rounded-xl">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-3 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <span key={d} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</span>
        ))}
      </div>

      {/* Days Matrix Grid */}
      <div className="grid grid-cols-7 gap-3">
        {cells}
      </div>

    </div>
  );
}