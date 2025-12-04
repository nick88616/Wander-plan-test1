
import React, { useState, useEffect } from 'react';
import { Plus, CheckSquare, Trash2, Square, PackageOpen, Save, FolderOpen, RotateCcw, X } from 'lucide-react';
import { PackingCategory, PackingItem, PackingTemplate } from '../types';

const DEFAULT_TEMPLATES: PackingTemplate[] = [
  {
    id: 'default-1',
    name: '一般旅遊 (3天2夜)',
    categories: [
      { 
        id: 'c1', name: '必備證件/錢包', 
        items: [
           { id: 'i1', text: '身分證/護照', checked: false },
           { id: 'i2', text: '現金/信用卡', checked: false },
           { id: 'i3', text: '健保卡', checked: false }
        ] 
      },
      { 
        id: 'c2', name: '衣物', 
        items: [
           { id: 'i4', text: '換洗衣物', checked: false },
           { id: 'i5', text: '睡衣', checked: false },
           { id: 'i6', text: '外套', checked: false }
        ] 
      },
      { 
        id: 'c3', name: '電子產品', 
        items: [
           { id: 'i7', text: '手機充電器', checked: false },
           { id: 'i8', text: '行動電源', checked: false }
        ] 
      }
    ]
  },
  {
    id: 'default-2',
    name: '戶外露營',
    categories: [
      { 
        id: 'camp1', name: '住宿裝備', 
        items: [
           { id: 'ci1', text: '帳篷', checked: false },
           { id: 'ci2', text: '睡袋/睡墊', checked: false },
           { id: 'ci3', text: '露營燈', checked: false }
        ] 
      },
      { 
        id: 'camp2', name: '野炊用品', 
        items: [
           { id: 'ci4', text: '卡式爐/瓦斯罐', checked: false },
           { id: 'ci5', text: '鍋具/餐具', checked: false },
           { id: 'ci6', text: '食材/水', checked: false }
        ] 
      }
    ]
  },
  {
      id: 'default-3',
      name: '親子出遊',
      categories: [
        { 
          id: 'baby1', name: '寶寶用品', 
          items: [
             { id: 'bi1', text: '尿布', checked: false },
             { id: 'bi2', text: '奶粉/奶瓶', checked: false },
             { id: 'bi3', text: '濕紙巾', checked: false },
             { id: 'bi4', text: '安撫玩具', checked: false }
          ] 
        }
      ]
    }
];

interface Props {
  categories: PackingCategory[];
  setCategories: React.Dispatch<React.SetStateAction<PackingCategory[]>>;
}

const PackingList: React.FC<Props> = ({ categories, setCategories }) => {
  // State for new inputs
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingItemToCatId, setAddingItemToCatId] = useState<string | null>(null);
  const [newItemText, setNewItemText] = useState('');

  // Template State
  const [savedTemplates, setSavedTemplates] = useState<PackingTemplate[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [mode, setMode] = useState<'load' | 'save'>('load');

  // Load templates from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('wanderplan_templates');
    if (stored) {
      try {
        setSavedTemplates(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse templates", e);
      }
    }
  }, []);

  // Save templates to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('wanderplan_templates', JSON.stringify(savedTemplates));
  }, [savedTemplates]);

  // --- Actions ---

  const addCategory = () => {
    if (!newCategoryName.trim()) return;
    setCategories([...categories, {
        id: crypto.randomUUID(),
        name: newCategoryName,
        items: []
    }]);
    setNewCategoryName('');
  };

  const deleteCategory = (catId: string) => {
    setCategories(categories.filter(c => c.id !== catId));
  };

  const addItem = (catId: string) => {
    if (!newItemText.trim()) return;
    const newItem: PackingItem = {
        id: crypto.randomUUID(),
        text: newItemText,
        checked: false
    };
    
    setCategories(categories.map(cat => 
        cat.id === catId ? { ...cat, items: [...cat.items, newItem] } : cat
    ));
    setNewItemText('');
    setAddingItemToCatId(null);
  };

  const deleteItem = (catId: string, itemId: string) => {
    setCategories(categories.map(cat => 
        cat.id === catId ? { ...cat, items: cat.items.filter(i => i.id !== itemId) } : cat
    ));
  };

  const toggleCheck = (catId: string, itemId: string) => {
    setCategories(categories.map(cat => 
        cat.id === catId ? { 
            ...cat, 
            items: cat.items.map(i => i.id === itemId ? { ...i, checked: !i.checked } : i) 
        } : cat
    ));
  };

  const clearAll = () => {
      if (window.confirm('確定要清空目前的清單嗎？此動作無法復原。')) {
          setCategories([]);
      }
  };

  // --- Template Actions ---

  const handleSaveTemplate = () => {
      if (!templateNameInput.trim()) return;
      const newTemplate: PackingTemplate = {
          id: crypto.randomUUID(),
          name: templateNameInput,
          categories: categories // Save current state
      };
      setSavedTemplates([...savedTemplates, newTemplate]);
      setTemplateNameInput('');
      setShowTemplateModal(false);
  };

  const handleLoadTemplate = (template: PackingTemplate) => {
      if (categories.length > 0 && categories.some(c => c.items.length > 0)) {
          if (!window.confirm('載入模板將會覆蓋目前的清單，確定要繼續嗎？')) return;
      }
      
      // Deep copy to generate new IDs so they are independent
      const newCats = template.categories.map(cat => ({
          ...cat,
          id: crypto.randomUUID(),
          items: cat.items.map(item => ({ ...item, id: crypto.randomUUID(), checked: false }))
      }));
      
      setCategories(newCats);
      setShowTemplateModal(false);
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm('確定要刪除此模板嗎？')) {
          setSavedTemplates(savedTemplates.filter(t => t.id !== id));
      }
  };

  const openSaveModal = () => {
      setMode('save');
      setShowTemplateModal(true);
  };

  const openLoadModal = () => {
      setMode('load');
      setShowTemplateModal(true);
  };

  // Stats
  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedItems = categories.reduce((acc, cat) => acc + cat.items.filter(i => i.checked).length, 0);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto pb-32">
      
      {/* Header & Stats */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 mb-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">行李清單</h2>
                <p className="text-slate-500 text-sm mt-1">分門別類，萬無一失</p>
            </div>
            <div className="text-right">
                <span className="text-4xl font-black text-slate-800">{progress}%</span>
            </div>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      {/* Tools / Action Bar */}
      <div className="flex flex-col gap-4 mb-8">
          
          {/* Add Category Input */}
          <div className="flex bg-white rounded-2xl shadow-sm border border-slate-200 p-1.5 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
             <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCategory()}
                placeholder="新增大分類 (例如：露營裝備)..."
                className="flex-grow bg-transparent px-4 py-2 outline-none text-slate-800 font-medium placeholder-slate-400"
             />
             <button 
                onClick={addCategory}
                className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl transition-colors"
             >
                <Plus size={20} />
             </button>
          </div>

          {/* Management Buttons */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
             <button 
                onClick={openLoadModal}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm whitespace-nowrap"
             >
                <FolderOpen size={16} />
                載入模板
             </button>
             <button 
                onClick={openSaveModal}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm whitespace-nowrap"
             >
                <Save size={16} />
                儲存為模板
             </button>
             <div className="flex-grow" />
             <button 
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-100 hover:text-slate-600 transition-all shadow-sm whitespace-nowrap"
             >
                <RotateCcw size={16} />
                全部清空
             </button>
          </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
         {categories.map(cat => (
             <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                 {/* Category Header */}
                 <div className="bg-slate-50/50 p-4 flex items-center justify-between group">
                    <h3 className="font-bold text-lg text-slate-700 flex items-center gap-2">
                        <PackageOpen size={20} className="text-indigo-400" />
                        {cat.name}
                        <span className="text-xs font-normal text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {cat.items.filter(i => i.checked).length}/{cat.items.length}
                        </span>
                    </h3>
                    <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="text-slate-300 hover:text-slate-500 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="刪除分類"
                    >
                        <Trash2 size={16} />
                    </button>
                 </div>

                 {/* Items */}
                 <div className="p-2 space-y-1">
                     {cat.items.map(item => (
                        <div key={item.id} className="group flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <button 
                                onClick={() => toggleCheck(cat.id, item.id)}
                                className={`mr-3 transition-colors ${item.checked ? 'text-emerald-500' : 'text-slate-300 hover:text-indigo-400'}`}
                            >
                                {item.checked ? <CheckSquare size={22} className="fill-emerald-50" /> : <Square size={22} />}
                            </button>
                            <span className={`flex-grow text-sm font-medium transition-all ${item.checked ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {item.text}
                            </span>
                            <button 
                                onClick={() => deleteItem(cat.id, item.id)}
                                className="text-slate-300 hover:text-slate-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                     ))}
                 </div>

                 {/* Add Item Input */}
                 <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                    {addingItemToCatId === cat.id ? (
                        <div className="flex gap-2">
                            <input
                                autoFocus
                                type="text"
                                value={newItemText}
                                onChange={(e) => setNewItemText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addItem(cat.id);
                                    if (e.key === 'Escape') setAddingItemToCatId(null);
                                }}
                                onBlur={() => {
                                    if (!newItemText) setAddingItemToCatId(null);
                                }}
                                placeholder="輸入物品名稱..."
                                className="flex-grow bg-white border border-indigo-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                            <button onClick={() => addItem(cat.id)} className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-sm font-bold">新增</button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                setAddingItemToCatId(cat.id);
                                setNewItemText('');
                            }}
                            className="w-full text-left text-sm text-slate-400 hover:text-indigo-600 hover:bg-white px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                        >
                            <Plus size={16} /> 新增物品...
                        </button>
                    )}
                 </div>
             </div>
         ))}
         
         {categories.length === 0 && (
            <div className="text-center py-20 text-slate-400">
                <PackageOpen size={48} className="mx-auto mb-4 text-slate-200" />
                <p>清單是空的</p>
                <button onClick={openLoadModal} className="text-indigo-500 font-bold hover:underline mt-2">載入模板？</button>
            </div>
         )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        {mode === 'save' ? <Save size={20} className="text-indigo-500"/> : <FolderOpen size={20} className="text-indigo-500"/>}
                        {mode === 'save' ? '儲存為模板' : '選擇模板'}
                    </h3>
                    <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                {/* Modal Content */}
                <div className="p-6 overflow-y-auto">
                    {mode === 'save' ? (
                        <div>
                            <p className="text-sm text-slate-500 mb-4">
                                將目前的清單（包含所有分類與項目）儲存起來，方便下次旅行直接使用。
                            </p>
                            <label className="block text-sm font-bold text-slate-700 mb-2">模板名稱</label>
                            <input 
                                type="text" 
                                value={templateNameInput}
                                onChange={(e) => setTemplateNameInput(e.target.value)}
                                placeholder="例如：日本滑雪清單"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-6"
                            />
                            <button 
                                onClick={handleSaveTemplate}
                                disabled={!templateNameInput}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                儲存
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">預設模板</p>
                            {DEFAULT_TEMPLATES.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => handleLoadTemplate(template)}
                                    className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group"
                                >
                                    <div className="font-bold text-slate-700 group-hover:text-indigo-700">{template.name}</div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        包含 {template.categories.length} 個分類
                                    </div>
                                </button>
                            ))}

                            {savedTemplates.length > 0 && (
                                <>
                                    <div className="h-px bg-slate-100 my-2" />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">我的模板</p>
                                    {savedTemplates.map(template => (
                                        <div key={template.id} className="relative group/item">
                                            <button
                                                onClick={() => handleLoadTemplate(template)}
                                                className="w-full text-left p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                                            >
                                                <div className="font-bold text-slate-700 group-hover/item:text-indigo-700">{template.name}</div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    包含 {template.categories.length} 個分類
                                                </div>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteTemplate(e, template.id)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all"
                                                title="刪除模板"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

             </div>
          </div>
      )}

    </div>
  );
};

export default PackingList;
