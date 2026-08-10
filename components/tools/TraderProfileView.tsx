'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Compass, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface CustomItem {
  id: string;
  name: string;
  desc: string;
}

interface TradingAccount {
  id: string;
  name: string;
  trader_type?: string;
  trading_style?: string;
  custom_trader_types?: CustomItem[];
  custom_trading_styles?: CustomItem[];
  initial_balance: number;
}

interface TraderProfileViewProps {
  activeAccount: TradingAccount | null;
  onAccountUpdated: () => void;
}

export default function TraderProfileView({ activeAccount, onAccountUpdated }: TraderProfileViewProps) {
  const [traderType, setTraderType] = useState<string>('Day Trader');
  const [tradingStyle, setTradingStyle] = useState<string>('SMC');
  
  const [customTypes, setCustomTypes] = useState<CustomItem[]>([]);
  const [customStyles, setCustomStyles] = useState<CustomItem[]>([]);

  // Modal / Form States for Custom Items
  const [modalMode, setModalMode] = useState<'type' | 'style' | null>(null);
  const [editTarget, setEditTarget] = useState<CustomItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const defaultTraderTypes: CustomItem[] = [
    { id: 'Scalper', name: 'Scalper', desc: 'Executes rapid short-term positions lasting seconds to minutes.' },
    { id: 'Day Trader', name: 'Day Trader', desc: 'Closes all positions intraday; avoids overnight risk exposure.' },
    { id: 'Swing Trader', name: 'Swing Trader', desc: 'Holds positions over several days or weeks capitalizing on macro trends.' },
    { id: 'Position Trader', name: 'Position Trader', desc: 'Long-term multi-week/month macroeconomic framework execution.' },
    { id: 'Algorithmic / Quant', name: 'Algorithmic / Quant', desc: 'Rule-based algorithmic systematic execution strategy.' }
  ];

  const defaultTradingStyles: CustomItem[] = [
    { id: 'SMC', name: 'SMC', desc: 'Order blocks, liquidity sweeps, mitigation, and institutional footprint mapping.' },
    { id: 'ICT', name: 'ICT', desc: 'Killzones, fair value gaps (FVG), market maker models, and algorithmic time-price.' },
    { id: 'Retail', name: 'Retail', desc: 'Support/Resistance, chart patterns, trendlines, and oscillator indicators.' },
    { id: 'Price Action', name: 'Price Action', desc: 'Naked charts, candlestick structure, and market flow momentum.' },
    { id: 'Wyckoff', name: 'Wyckoff', desc: 'Supply/demand structural cycle phases and institutional markup/markdown.' }
  ];

  useEffect(() => {
    if (activeAccount) {
      setTraderType(activeAccount.trader_type || 'Day Trader');
      setTradingStyle(activeAccount.trading_style || 'SMC');
      setCustomTypes(activeAccount.custom_trader_types || []);
      setCustomStyles(activeAccount.custom_trading_styles || []);
      setSuccessMessage('');
    }
  }, [activeAccount]);

  const handleSaveSelection = async (newType: string, newStyle: string, updatedTypes = customTypes, updatedStyles = customStyles) => {
    if (!activeAccount) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .update({ 
          trader_type: newType, 
          trading_style: newStyle,
          custom_trader_types: updatedTypes,
          custom_trading_styles: updatedStyles
        })
        .eq('id', activeAccount.id);

      if (error) throw error;

      setTraderType(newType);
      setTradingStyle(newStyle);
      setCustomTypes(updatedTypes);
      setCustomStyles(updatedStyles);
      onAccountUpdated();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to save configuration.');
    }
  };

  const handleOpenAddModal = (mode: 'type' | 'style') => {
    setModalMode(mode);
    setEditTarget(null);
    setFormName('');
    setFormDesc('');
  };

  const handleOpenEditModal = (mode: 'type' | 'style', item: CustomItem) => {
    setModalMode(mode);
    setEditTarget(item);
    setFormName(item.name);
    setFormDesc(item.desc);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !modalMode) return;

    const newItem: CustomItem = {
      id: editTarget ? editTarget.id : formName.toLowerCase().replace(/\s+/g, '-'),
      name: formName.trim(),
      desc: formDesc.trim() || 'Custom strategy parameter profile.'
    };

    if (modalMode === 'type') {
      let updated: CustomItem[];
      if (editTarget) {
        updated = customTypes.map(t => t.id === editTarget.id ? newItem : t);
      } else {
        updated = [...customTypes, newItem];
      }
      handleSaveSelection(newItem.name, tradingStyle, updated, customStyles);
    } else {
      let updated: CustomItem[];
      if (editTarget) {
        updated = customStyles.map(s => s.id === editTarget.id ? newItem : s);
      } else {
        updated = [...customStyles, newItem];
      }
      handleSaveSelection(traderType, newItem.name, customTypes, updated);
    }

    setModalMode(null);
    setSuccessMessage('Successfully updated custom parameters.');
  };

  const handleDeleteCustom = (mode: 'type' | 'style', id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete custom parameter "${name}"?`)) return;

    if (mode === 'type') {
      const updated = customTypes.filter(t => t.id !== id);
      const fallbackType = traderType === name ? 'Day Trader' : traderType;
      handleSaveSelection(fallbackType, tradingStyle, updated, customStyles);
    } else {
      const updated = customStyles.filter(s => s.id !== id);
      const fallbackStyle = tradingStyle === name ? 'SMC' : tradingStyle;
      handleSaveSelection(traderType, fallbackStyle, customTypes, updated);
    }
    setSuccessMessage('Custom profile parameter removed.');
  };

  if (!activeAccount) {
    return (
      <div className="bg-white border border-slate-200/85 rounded-3xl p-8 text-center text-slate-400 text-xs">
        Please select an active trading account from the sidebar.
      </div>
    );
  }

  const allTraderTypes = [...defaultTraderTypes, ...customTypes];
  const allTradingStyles = [...defaultTradingStyles, ...customStyles];

  return (
    <div className="bg-white border border-slate-200/85 rounded-3xl p-6 sm:p-8 shadow-xs space-y-8 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight">Trader Profile & Style Configuration</h3>
            <p className="text-xs text-slate-500">
              Account-isolated settings for <span className="font-bold text-slate-800">{activeAccount.name}</span>
            </p>
          </div>
        </div>
        {successMessage && (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 animate-in fade-in">
            {successMessage}
          </span>
        )}
      </div>

      {/* Section 1: Trader Classification */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">1. Trader Classification</h4>
          <button
            onClick={() => handleOpenAddModal('type')}
            className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Custom Type
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTraderTypes.map((item) => {
            const isSelected = traderType === item.name;
            const isCustom = customTypes.some(ct => ct.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSaveSelection(item.name, tradingStyle)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/70 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                    {isCustom && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal('type', item)}
                          className={`p-1 rounded-md transition-colors ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                          title="Edit Custom Type"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustom('type', item.id, item.name)}
                          className={`p-1 rounded-md transition-colors ${isSelected ? 'text-slate-300 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'}`}
                          title="Delete Custom Type"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/60 text-slate-600'
                  }`}>
                    {isSelected ? 'Active Profile' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Trading Style Methodology */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">2. Execution Methodology / Style</h4>
          <button
            onClick={() => handleOpenAddModal('style')}
            className="text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Custom Style
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allTradingStyles.map((item) => {
            const isSelected = tradingStyle === item.name;
            const isCustom = customStyles.some(cs => cs.id === item.id);

            return (
              <div
                key={item.id}
                onClick={() => handleSaveSelection(traderType, item.name)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                  isSelected 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                    : 'bg-slate-50/60 hover:bg-slate-100/70 border-slate-200/70 text-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                      {item.name}
                    </span>
                    {isCustom && (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleOpenEditModal('style', item)}
                          className={`p-1 rounded-md transition-colors ${isSelected ? 'text-slate-300 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}
                          title="Edit Custom Style"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteCustom('style', item.id, item.name)}
                          className={`p-1 rounded-md transition-colors ${isSelected ? 'text-slate-300 hover:text-rose-400' : 'text-slate-400 hover:text-rose-600'}`}
                          title="Delete Custom Style"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200/60 text-slate-600'
                  }`}>
                    {isSelected ? 'Active Style' : 'Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Custom Item Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editTarget ? `Edit Custom ${modalMode === 'type' ? 'Trader Type' : 'Trading Style'}` : `Create New ${modalMode === 'type' ? 'Trader Type' : 'Trading Style'}`}
              </h3>
              <button 
                onClick={() => setModalMode(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-xl bg-slate-50"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Name</label>
                <input
                  type="text"
                  required
                  placeholder={modalMode === 'type' ? 'e.g. Range Trader' : 'e.g. Volume Profile'}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">Description / Strategy Summary</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe your rules or execution focus..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm"
                >
                  {editTarget ? 'Save Changes' : 'Create Parameter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}