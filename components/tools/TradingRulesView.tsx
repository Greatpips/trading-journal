'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, CheckSquare, Edit2, Save, X } from 'lucide-react';

interface Rule {
  id: string;
  rule_text: string;
  created_at: string;
}

interface AuthUser {
  id: string;
  email?: string;
}

interface TradingRulesViewProps {
  user: AuthUser | null;
}

export default function TradingRulesView({ user }: TradingRulesViewProps) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [newRuleText, setNewRuleText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchRules();
  }, [user]);

  const fetchRules = async () => {
    try {
      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRules(data || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleText.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('trading_rules')
        .insert([{ user_id: user.id, rule_text: newRuleText.trim() }])
        .select();

      if (error) throw error;
      if (data) {
        setRules([...rules, data[0]]);
        setNewRuleText('');
      }
    } catch (err) {
      console.error('Error adding rule:', err);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this trading rule?')) return;
    try {
      const { error } = await supabase.from('trading_rules').delete().eq('id', id);
      if (error) throw error;
      setRules(rules.filter((r) => r.id !== id));
    } catch (err) {
      console.error('Error deleting rule:', err);
    }
  };

  const handleUpdateRule = async (id: string) => {
    if (!editText.trim()) return;
    try {
      const { error } = await supabase
        .from('trading_rules')
        .update({ rule_text: editText.trim() })
        .eq('id', id);

      if (error) throw error;
      setRules(rules.map((r) => (r.id === id ? { ...r, rule_text: editText.trim() } : r)));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Error updating rule:', err);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-slate-400">Loading rules...</div>;
  }

  return (
    <div className="bg-white border border-slate-200/85 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xs space-y-6 max-w-3xl w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
          <CheckSquare size={20} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900">Master Trading Rules</h3>
          <p className="text-[11px] sm:text-xs text-slate-500">
            Define your universal checklist. Changes here apply across all your accounts globally.
          </p>
        </div>
      </div>

      <form onSubmit={handleAddRule} className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new rule (e.g., Never risk more than 1% per setup)..."
          value={newRuleText}
          onChange={(e) => setNewRuleText(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden"
        />
        <button
          type="submit"
          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={14} /> Add Rule
        </button>
      </form>

      <div className="space-y-2.5">
        {rules.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No trading rules set up yet. Add your first rule above.</p>
        ) : (
          rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/70 bg-slate-50/50 gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-200/70 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                {editingId === rule.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 focus:outline-hidden"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-800 truncate">{rule.rule_text}</span>
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {editingId === rule.id ? (
                  <>
                    <button
                      onClick={() => handleUpdateRule(rule.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Save"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(rule.id);
                        setEditText(rule.rule_text);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
                      title="Edit Rule"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(rule.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Rule"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}