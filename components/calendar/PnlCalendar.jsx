'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function PnlCalendar({ trades, onSelectDay }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Aggregate trades by YYYY-MM-DD date string
  const dailySummary = {};
  trades.forEach(t => {
    if (!t.date) return;
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
  
  // Padding for previous month blank slots (hidden on smaller scaled layouts to prevent odd spacing gaps)
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`empty-${i}`} className="h-24 lg:h-28 hidden lg:block bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60 opacity-40"></div>);
  }

  // Actual days of the month
  for (let day = 1; day <= totalDays; day++) {
    const formattedMonth = String(month + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateKey = `${year}-${formattedMonth}-${formattedDay}`;
    
    // Calculate the exact day of the week index for this specific date
    const dayOfWeekIndex = (firstDayIndex + day - 1) % 7;
    const dayLabel = dayNames[dayOfWeekIndex];

    const dayData = dailySummary[dateKey];
    const hasTrades = !!dayData;
    const isWin = hasTrades && dayData.pnl >= 0;

    cells.push(
      <div
        key={dateKey}
        onClick={() => onSelectDay(dateKey, hasTrades)}
        className={`h-24 lg:h-28 rounded-2xl p-2.5 lg:p-3 flex flex-col justify-between border transition-all relative group cursor-pointer overflow-hidden ${
          hasTrades 
            ? isWin 
              ? 'bg-emerald-50/60 border-emerald-200 hover:border-emerald-300 shadow-xs' 
              : 'bg-rose-50/60 border-rose-200 hover:border-rose-300 shadow-xs'
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/55'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span className={`text-xs font-semibold ${hasTrades ? (isWin ? 'text-emerald-900' : 'text-rose-900') : 'text-slate-400'}`}>
            {day} <span className="lg:hidden text-slate-400 font-normal ml-1">({dayLabel})</span>
          </span>
          {hasTrades ? (
            <span className={`text-[9px] lg:text-[10px] px-1.5 py-0.5 rounded-full font-medium truncate ${isWin ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {dayData.count}t
            </span>
          ) : (
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 bg-slate-100 p-1 rounded-lg">
              <Plus size={12} />
            </span>
          )}
        </div>

        {hasTrades ? (
          <div>
            <span className="text-[9px] lg:text-[10px] text-slate-400 block font-medium uppercase tracking-wider">Net P&L</span>
            <span className={`text-xs lg:text-sm font-bold tracking-tight truncate block ${isWin ? 'text-emerald-600' : 'text-rose-600'}`} title={isWin ? `+$${dayData.pnl.toFixed(2)}` : `-$${Math.abs(dayData.pnl).toFixed(2)}`}>
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
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-xs space-y-6">
      
      {/* Calendar Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">Performance Calendar</h3>
          <p className="text-xs text-slate-500">Click any day to inspect executions or log a new setup.</p>
        </div>
        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
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

      {/* Weekday Labels (Visible only on desktop lg+ screens where 7-col matches) */}
      <div className="hidden lg:grid grid-cols-7 gap-3 text-center">
        {dayNames.map(d => (
          <span key={d} className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{d}</span>
        ))}
      </div>

      {/* Scaled Responsive Grid: 2 cols on mobile, 3 cols on small tablets, 5 cols on iPad mini/medium screens, 7 cols on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-2 md:gap-3">
        {cells}
      </div>

    </div>
  );
}