
import React, { useState, useRef } from 'react';
import { Settings, FileText, Download, Upload, RotateCcw, X, Check } from 'lucide-react';
import { Day, PackingCategory, TripData, TRANSPORT_LABELS } from '../types';

interface Props {
  days: Day[];
  packingList: PackingCategory[];
  onImport: (data: TripData) => void;
  onReset: () => void;
}

const TripManager: React.FC<Props> = ({ days, packingList, onImport, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState<'text' | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Export as Text
  const generateTextExport = () => {
    let text = "✈️ 旅遊行程規劃 \n\n";
    days.forEach(day => {
        text += `📅 ${day.label} (${day.date || '未定'})\n`;
        if (day.items.length === 0) text += "   (無行程)\n";
        day.items.forEach(item => {
            text += `   🕒 ${item.time} ${item.activity}\n`;
            text += `      📍 ${item.location}\n`;
            text += `      🚗 ${TRANSPORT_LABELS[item.transportMode]}${item.estimatedTravelTime ? ` (${item.estimatedTravelTime})` : ''}\n`;
            if (item.notes) text += `      📝 ${item.notes}\n`;
            text += "\n";
        });
        text += "-------------------\n";
    });
    return text;
  };

  const handleCopyText = async () => {
      const text = generateTextExport();
      try {
          await navigator.clipboard.writeText(text);
          setCopyFeedback(true);
          setTimeout(() => setCopyFeedback(false), 2000);
      } catch (err) {
          console.error('Failed to copy', err);
      }
  };

  // 2. Export as JSON File
  const handleDownloadJSON = () => {
      const data: TripData = {
          days,
          packingList,
          savedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wanderplan-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsOpen(false);
  };

  // 3. Import JSON File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              if (json.days && Array.isArray(json.days)) {
                  onImport(json as TripData);
                  setIsOpen(false);
                  alert('旅程匯入成功！');
              } else {
                  alert('檔案格式錯誤，找不到行程資料。');
              }
          } catch (err) {
              alert('無法解析檔案，請確認是否為有效的備份檔。');
          }
      };
      reader.readAsText(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 4. Reset
  const handleReset = () => {
      if (window.confirm('確定要清空所有行程與清單，開始新的旅程嗎？此動作無法復原！')) {
          onReset();
          setIsOpen(false);
      }
  };

  return (
    <>
      <div className="relative">
        <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl transition-all ${isOpen ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}
            title="旅程管理"
        >
            <Settings size={24} />
        </button>

        {isOpen && (
            <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-1.5 space-y-0.5">
                        <button 
                            onClick={() => { setShowModal('text'); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors text-left"
                        >
                            <FileText size={18} /> 匯出行程 (文字)
                        </button>
                        <button 
                            onClick={handleDownloadJSON}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors text-left"
                        >
                            <Download size={18} /> 儲存備份 (檔案)
                        </button>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors text-left"
                        >
                            <Upload size={18} /> 匯入備份
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept=".json" 
                            className="hidden" 
                        />
                        <div className="h-px bg-slate-100 my-1" />
                        <button 
                            onClick={handleReset}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-xl transition-colors text-left"
                        >
                            <RotateCcw size={18} /> 開始新旅程
                        </button>
                    </div>
                </div>
            </>
        )}
      </div>

      {/* Text Export Modal */}
      {showModal === 'text' && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <FileText size={20} className="text-indigo-500"/>
                            匯出行程文字
                        </h3>
                        <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600">
                            <X size={24} />
                        </button>
                  </div>
                  <div className="p-0 overflow-auto bg-slate-50 relative">
                      <textarea 
                        readOnly
                        className="w-full h-80 p-6 bg-slate-50 text-slate-600 font-mono text-sm outline-none resize-none"
                        value={generateTextExport()}
                      />
                  </div>
                  <div className="p-5 border-t border-slate-100 bg-white">
                      <button 
                        onClick={handleCopyText}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                            copyFeedback 
                            ? 'bg-emerald-500 text-white' 
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                          {copyFeedback ? <Check size={20} /> : <FileText size={20} />}
                          {copyFeedback ? '已複製！' : '複製文字'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

export default TripManager;
