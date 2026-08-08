'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const initialFormState = {
  asset: '',
  type: 'Long',
  trend: 'Bullish',
  zoneTimeframe: '15m',
  zoneType: 'Bullish Zone',
  riskPercentage: '1',
  session: 'London',
  entryPrice: '',
  exitPrice: '',
  slPrice: '',
  tpPrice: '',
  duration: '',
  pnl: '',
  thoughts: '',
  date: '',
};

export default function AddTradeModal({ isOpen, onClose, onAddTrade, initialDate }) {
  const [formData, setFormData] = useState(initialFormState);

  // Reset or initialize form data whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormState,
        date: initialDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTrade(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl max-w-xl w-full p-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Log New Execution</h3>
            <p className="text-xs text-slate-500">Record parameters for your trading journal.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-4 pr-1 pt-4 flex-1">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asset</label>
              <input
                type="text"
                name="asset"
                value={formData.asset}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                placeholder="e.g. XAUUSD, EURUSD"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Execution Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Position Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Long">Long (Buy)</option>
                <option value="Short">Short (Sell)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trading Session</label>
              <select
                name="session"
                value={formData.session}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="Overlap">London / NY Overlap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trend Direction</label>
              <select
                name="trend"
                value={formData.trend}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Bullish">Bullish</option>
                <option value="Bearish">Bearish</option>
                <option value="Consolidation">Consolidation</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Zone Timeframe</label>
              <select
                name="zoneTimeframe"
                value={formData.zoneTimeframe}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="1m">1m</option>
                <option value="5m">5m</option>
                <option value="15m">15m</option>
                <option value="1h">1h</option>
                <option value="2h">2h</option>
                <option value="4h">4h</option>
                <option value="Daily">Daily</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Zone Type</label>
              <select
                name="zoneType"
                value={formData.zoneType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              >
                <option value="Bearish Zone">Bearish Zone</option>
                <option value="Bullish Zone">Bullish Zone</option>
                <option value="Bearish Breakout Continuation">Bearish Breakout Continuation</option>
                <option value="Bullish Breakout Continuation">Bullish Breakout Continuation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Risk Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                name="riskPercentage"
                value={formData.riskPercentage}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                placeholder="1"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Net P&L ($)</label>
              <input
                type="number"
                step="any"
                name="pnl"
                value={formData.pnl}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
                placeholder="e.g. 150 or -50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Entry Price</label>
              <input
                type="text"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Exit Price</label>
              <input
                type="text"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Stop Loss</label>
              <input
                type="text"
                name="slPrice"
                value={formData.slPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Take Profit</label>
              <input
                type="text"
                name="tpPrice"
                value={formData.tpPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration / Hold Time</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none"
              placeholder="e.g. 45 mins, 3 hours"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trading Thoughts & Psychology Notes</label>
            <textarea
              name="thoughts"
              value={formData.thoughts}
              onChange={handleChange}
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none resize-none"
              placeholder="How did you feel? Was execution aligned with your plan?"
            />
          </div>

          {/* Form Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              Save Execution
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}