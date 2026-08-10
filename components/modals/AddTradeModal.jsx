'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [rules, setRules] = useState([]);
  const [ruleEvaluations, setRuleEvaluations] = useState({}); // { [ruleId]: { passed: boolean, breakReason: '' } }

  // Fetch persistent master rules and initialize form data whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...initialFormState,
        date: initialDate || new Date().toISOString().split('T')[0],
      });
      fetchRules();
    }
  }, [isOpen, initialDate]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setRules(data);
        // Default all rules to passed (checked) initially
        const initialEvals = {};
        data.forEach((r) => {
          initialEvals[r.id] = { passed: true, breakReason: '' };
        });
        setRuleEvaluations(initialEvals);
      }
    } catch (err) {
      console.error('Error fetching persistent trading rules:', err);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRuleToggle = (ruleId, passed) => {
    setRuleEvaluations((prev) => ({
      ...prev,
      [ruleId]: {
        ...prev[ruleId],
        passed,
        breakReason: passed ? '' : prev[ruleId]?.breakReason || '',
      },
    }));
  };

  const handleReasonChange = (ruleId, breakReason) => {
    setRuleEvaluations((prev) => ({
      ...prev,
      [ruleId]: {
        ...prev[ruleId],
        breakReason,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that if any rule is failed, a mandatory reason is filled out
    for (const rule of rules) {
      const evalData = ruleEvaluations[rule.id];
      if (evalData && !evalData.passed && !evalData.breakReason.trim()) {
        alert(`Mandatory Check: Please provide a reason why you broke the rule: "${rule.rule_text}"`);
        return;
      }
    }

    // Format rule evaluations array for the trade record
    const formattedEvaluations = rules.map((rule) => ({
      rule_id: rule.id,
      rule_text: rule.rule_text,
      passed: ruleEvaluations[rule.id]?.passed ?? true,
      break_reason: ruleEvaluations[rule.id]?.breakReason || '',
    }));

    // Pass combined payload back up
    onAddTrade({
      ...formData,
      ruleEvaluations: formattedEvaluations,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 sm:p-6 animate-fadeIn">
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-6 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Log New Execution & Rules</h3>
            <p className="text-[11px] sm:text-xs text-slate-500">Record parameters and verify discipline checklist.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto space-y-3.5 sm:space-y-4 pr-1 pt-3 sm:pt-4 flex-1">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asset</label>
              <input
                type="text"
                name="asset"
                value={formData.asset}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Position Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="Asian">Asian</option>
                <option value="Overlap">London / NY Overlap</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trend Direction</label>
              <select
                name="trend"
                value={formData.trend}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="Bearish Zone">Bearish Zone</option>
                <option value="Bullish Zone">Bullish Zone</option>
                <option value="Bearish Breakout Continuation">Bearish Breakout Continuation</option>
                <option value="Bullish Breakout Continuation">Bullish Breakout Continuation</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Risk Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                name="riskPercentage"
                value={formData.riskPercentage}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
                placeholder="e.g. 150 or -50"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Price Levels & Targets</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <input
                type="text"
                name="entryPrice"
                value={formData.entryPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                placeholder="Entry"
              />
              <input
                type="text"
                name="exitPrice"
                value={formData.exitPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                placeholder="Exit"
              />
              <input
                type="text"
                name="slPrice"
                value={formData.slPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                placeholder="Stop Loss"
              />
              <input
                type="text"
                name="tpPrice"
                value={formData.tpPrice}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 font-mono"
                placeholder="Take Profit"
              />
            </div>
          </div>

          {/* Persistent Trading Rules Verification Checklist */}
          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-slate-900" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Master Rules Verification</h4>
            </div>
            <p className="text-[11px] text-slate-500">Check each rule followed. Unchecking requires a mandatory breakdown reason.</p>

            <div className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60 max-h-44 overflow-y-auto">
              {rules.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No active rules found. Add them in the Trading Rules menu tab.</p>
              ) : (
                rules.map((rule) => {
                  const evalState = ruleEvaluations[rule.id] || { passed: true, breakReason: '' };
                  return (
                    <div key={rule.id} className="bg-white p-2.5 rounded-xl border border-slate-200/80 space-y-1.5">
                      <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-xs font-semibold text-slate-800 pr-2">{rule.rule_text}</span>
                        <input
                          type="checkbox"
                          checked={evalState.passed}
                          onChange={(e) => handleRuleToggle(rule.id, e.target.checked)}
                          className="w-4 h-4 accent-slate-900 rounded cursor-pointer"
                        />
                      </label>

                      {!evalState.passed && (
                        <div className="space-y-1 pt-1 animate-fadeIn">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-600">
                            <AlertCircle size={11} /> Rule Broken — Mandatory Breakdown Reason:
                          </div>
                          <input
                            type="text"
                            required
                            value={evalState.breakReason}
                            onChange={(e) => handleReasonChange(rule.id, e.target.value)}
                            placeholder="Why was this rule broken on this setup?"
                            className="w-full bg-rose-50/50 border border-rose-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration / Hold Time</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400"
              placeholder="e.g. 45 mins, 3 hours"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Trading Thoughts & Psychology Notes</label>
            <textarea
              name="thoughts"
              value={formData.thoughts}
              onChange={handleChange}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-slate-400 resize-none"
              placeholder="How did you feel? Was execution aligned with your plan?"
            />
          </div>

          {/* Form Footer Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Save Execution
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}