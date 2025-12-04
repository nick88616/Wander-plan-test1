
import React, { useState, useMemo } from 'react';
import { Reorder, useDragControls, motion, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, GripVertical, Car, Train, Bike, PersonStanding, Trash2, Map, ArrowRight, Timer } from 'lucide-react';
import { ItineraryItem, TransportMode, TRANSPORT_LABELS, NOTE_PRESETS } from '../types';
import { estimateTravelTime } from '../services/geminiService';

interface Props {
  item: ItineraryItem;
  nextItem?: ItineraryItem;
  previousItemLocation?: string;
  updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  deleteItem: (id: string) => void;
}

// Helper to calculate time
const calculateLatestLeaveTime = (arrivalTime: string, durationStr: string) => {
    if (!arrivalTime || !durationStr) return null;
    
    // Parse target time HH:MM
    const [hours, minutes] = arrivalTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    // Parse duration string
    let durationMinutes = 0;
    const hourMatch = durationStr.match(/(\d+)\s*小時/);
    const minMatch = durationStr.match(/(\d+)\s*分/);
    
    if (hourMatch) durationMinutes += parseInt(hourMatch[1]) * 60;
    if (minMatch) durationMinutes += parseInt(minMatch[1]);
    
    if (durationMinutes === 0) return null;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - durationMinutes);
    
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const ItineraryCard: React.FC<Props> = ({ item, nextItem, previousItemLocation, updateItem, deleteItem }) => {
  const dragControls = useDragControls();
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  
  // Swipe Logic
  const x = useMotionValue(0);
  const backgroundOpacity = useTransform(x, [-100, -50], [1, 0]);
  const contentOpacity = useTransform(x, [-150, 0], [0.5, 1]);

  const handleEstimateTime = async () => {
    if (!previousItemLocation || !item.location) return;
    setLoadingEstimate(true);
    const estimate = await estimateTravelTime(previousItemLocation, item.location, TRANSPORT_LABELS[item.transportMode]);
    updateItem(item.id, { estimatedTravelTime: estimate });
    setLoadingEstimate(false);
  };

  const addNoteTag = (tag: string) => {
    const currentNotes = item.notes ? item.notes + ' ' : '';
    if (!currentNotes.includes(tag)) {
        updateItem(item.id, { notes: currentNotes + tag });
    }
  };

  const getTransportIcon = (mode: TransportMode) => {
    switch (mode) {
      case 'driving': return <Car size={16} />;
      case 'transit': return <Train size={16} />;
      case 'cycling': return <Bike size={16} />;
      default: return <PersonStanding size={16} />;
    }
  };

  const latestLeaveTime = useMemo(() => {
    if (!nextItem || !nextItem.time || !nextItem.estimatedTravelTime) return null;
    return calculateLatestLeaveTime(nextItem.time, nextItem.estimatedTravelTime);
  }, [nextItem]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`;

  return (
    <Reorder.Item
      value={item}
      id={item.id}
      dragListener={false}
      dragControls={dragControls}
      className="relative group isolate"
    >
        {/* Connector Line */}
      <div className="absolute left-6 -top-6 bottom-0 w-0.5 bg-slate-200 -z-20 group-first:top-6 group-last:bottom-auto group-last:h-full" />

      {/* Traffic Estimate Bubble (Between Cards) */}
      {previousItemLocation && (
        <div className="flex items-center justify-start ml-14 mb-3">
           <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full shadow-sm border border-slate-200">
              <span className="text-indigo-500">{getTransportIcon(item.transportMode)}</span>
              {loadingEstimate ? (
                 <span className="animate-pulse">計算中...</span>
              ) : (
                <span className="font-medium">{item.estimatedTravelTime || '距離/時間'}</span>
              )}
              {!item.estimatedTravelTime && !loadingEstimate && (
                  <button 
                    onClick={handleEstimateTime}
                    className="text-indigo-600 hover:text-indigo-700 font-bold ml-1 text-[10px] uppercase tracking-wider"
                  >
                    計算
                  </button>
              )}
           </div>
        </div>
      )}

      {/* Background Actions Layer (for Swipe) - Changed to Slate Gray */}
      <div className="absolute inset-0 bg-slate-500 rounded-2xl flex items-center justify-end pr-6 -z-10 overflow-hidden shadow-inner">
        <motion.div style={{ opacity: backgroundOpacity }} className="text-white font-bold flex items-center gap-2">
            <span>刪除</span>
            <Trash2 size={20} />
        </motion.div>
      </div>

      {/* Main Card Content (Draggable on X axis) */}
      <motion.div
        style={{ x, opacity: contentOpacity }}
        drag="x"
        dragConstraints={{ left: -150, right: 0 }}
        dragSnapToOrigin={true}
        onDragEnd={(e, info) => {
            if (info.offset.x < -100) {
                deleteItem(item.id);
            }
        }}
        className="bg-white rounded-2xl shadow-sm border border-slate-200/60 relative overflow-hidden z-0"
      >
        <div className="p-4">
            <div className="flex items-start gap-3">
            
            {/* Reorder Handle & Time */}
            <div className="flex flex-col items-center gap-2 pt-1 w-14 flex-shrink-0 border-r border-slate-100 pr-2 mr-1">
                <div 
                    onPointerDown={(e) => dragControls.start(e)}
                    className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 p-2 -m-2 touch-none"
                >
                    <GripVertical size={20} />
                </div>
                <input
                    type="time"
                    value={item.time}
                    onChange={(e) => updateItem(item.id, { time: e.target.value })}
                    className="w-full bg-slate-50 rounded px-1 py-1.5 text-xs font-bold text-center text-slate-600 focus:text-indigo-600 outline-none border border-transparent focus:border-indigo-200 transition-colors"
                />
            </div>

            {/* Main Inputs */}
            <div className="flex-grow min-w-0 space-y-3">
                
                {/* Title */}
                <input
                    type="text"
                    value={item.activity}
                    onChange={(e) => updateItem(item.id, { activity: e.target.value })}
                    placeholder="行程名稱 (例如：吃午餐)"
                    className="w-full text-lg font-bold text-slate-800 placeholder-slate-300 border-none focus:ring-0 p-0 outline-none bg-transparent"
                />
                
                {/* Location with Prominent Map Button */}
                <div className="flex items-center gap-2 group/loc bg-slate-50 rounded-lg p-1.5 pr-2 focus-within:bg-indigo-50/30 focus-within:ring-1 focus-within:ring-indigo-200 transition-all">
                    <MapPin size={18} className="text-slate-400 group-focus-within/loc:text-indigo-500 ml-1 flex-shrink-0" />
                    <input 
                        type="text"
                        value={item.location}
                        onChange={(e) => updateItem(item.id, { location: e.target.value })}
                        placeholder="輸入地點 (例如：台北101)"
                        className="text-sm text-slate-700 flex-grow bg-transparent border-none outline-none min-w-0"
                    />
                    {item.location && (
                        <a 
                            href={googleMapsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 rounded-md text-xs font-bold transition-all shadow-sm"
                        >
                            <Map size={14} />
                            <span className="hidden sm:inline">地圖</span>
                        </a>
                    )}
                </div>

                {/* Visible Transport Selection */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        {(Object.keys(TRANSPORT_LABELS) as TransportMode[]).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => updateItem(item.id, { transportMode: mode, estimatedTravelTime: undefined })}
                                className={`px-3 py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                                    item.transportMode === mode 
                                    ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                                }`}
                                title={TRANSPORT_LABELS[mode]}
                            >
                                {getTransportIcon(mode)}
                            </button>
                        ))}
                    </div>
                    <span className="text-xs text-slate-400">
                        {TRANSPORT_LABELS[item.transportMode]}前往
                    </span>
                </div>

                {/* Latest Leave Time Warning - Less Harsh Color */}
                {latestLeaveTime && (
                    <div className="bg-amber-50/70 border border-amber-200/50 rounded-xl p-3 flex items-start gap-3 mt-1">
                        <div className="bg-amber-100 p-1.5 rounded-full mt-0.5">
                             <Timer className="text-amber-600" size={16} />
                        </div>
                        <div className="text-xs text-amber-800">
                            <span className="font-bold block mb-0.5 text-amber-900">出發時間提醒</span>
                            若要準時抵達下一個行程，依據選擇的交通方式最晚要 <span className="font-black text-amber-700 text-sm bg-amber-100 px-1 rounded">{latestLeaveTime}</span> 離開
                        </div>
                    </div>
                )}

                {/* Collapsible/Expandable Notes Section */}
                <div className="pt-1">
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full text-left text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-2 transition-colors py-1"
                    >
                         <div className={`p-1 rounded bg-slate-100 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
                            <ArrowRight size={12} />
                         </div>
                         {isExpanded ? '收起備註' : item.notes ? '編輯備註' : '新增備註'}
                    </button>

                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-80 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                         {/* Quick Tags - Mobile Friendly */}
                         <div className="flex flex-wrap gap-2 mb-3">
                            {NOTE_PRESETS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => addNoteTag(tag)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm active:scale-95"
                                >
                                    + {tag}
                                </button>
                            ))}
                         </div>
                        <textarea
                            value={item.notes}
                            onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                            placeholder="輸入詳細備註、訂位編號等..."
                            className="w-full text-sm bg-indigo-50/30 border border-indigo-100 rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 outline-none transition-all placeholder-slate-400 text-slate-700"
                        />
                    </div>
                </div>
            </div>
            </div>
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export default ItineraryCard;
