
import React, { useState } from 'react';
import { Reorder } from 'framer-motion';
import ItineraryCard from './ItineraryCard';
import { Day, ItineraryItem } from '../types';
import { Plus, Trash2, Calendar } from 'lucide-react';

interface Props {
  days: Day[];
  setDays: React.Dispatch<React.SetStateAction<Day[]>>;
}

const Timeline: React.FC<Props> = ({ days, setDays }) => {
  const [activeDayId, setActiveDayId] = useState<string>(days[0]?.id || '');

  const activeDayIndex = days.findIndex(d => d.id === activeDayId);
  const activeItems = days[activeDayIndex]?.items || [];

  const handleSetItems = (newItems: ItineraryItem[]) => {
    const newDays = [...days];
    newDays[activeDayIndex] = { ...newDays[activeDayIndex], items: newItems };
    setDays(newDays);
  };

  const handleUpdateItem = (id: string, updates: Partial<ItineraryItem>) => {
    const updatedItems = activeItems.map(item => item.id === id ? { ...item, ...updates } : item);
    handleSetItems(updatedItems);
  };

  const handleDeleteItem = (id: string) => {
    const updatedItems = activeItems.filter(item => item.id !== id);
    handleSetItems(updatedItems);
  };

  const handleAddItem = () => {
    const newItem: ItineraryItem = {
      id: crypto.randomUUID(),
      time: '10:00',
      location: '',
      activity: '',
      transportMode: 'transit',
      notes: ''
    };
    handleSetItems([...activeItems, newItem]);
  };

  const addDay = () => {
    const newDayId = crypto.randomUUID();
    const newDayLabel = `Day ${days.length + 1}`;
    // Default next day
    const lastDate = days[days.length - 1]?.date;
    let newDate = '';
    if (lastDate) {
        const d = new Date(lastDate);
        d.setDate(d.getDate() + 1);
        newDate = d.toISOString().split('T')[0];
    }

    const newDays = [...days, { id: newDayId, label: newDayLabel, date: newDate, items: [] }];
    setDays(newDays);
    setActiveDayId(newDayId);
  };

  const updateDayDate = (date: string) => {
     const newDays = [...days];
     newDays[activeDayIndex] = { ...newDays[activeDayIndex], date };
     setDays(newDays);
  };

  const deleteDay = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (days.length <= 1) return;
    const newDays = days.filter(d => d.id !== id);
    setDays(newDays);
    if (activeDayId === id) setActiveDayId(newDays[0].id);
  };

  return (
    <div className="max-w-3xl mx-auto pb-32">
      
      {/* Header */}
      <div className="mb-6 px-1">
         <h1 className="text-3xl font-bold text-slate-800">行程規劃</h1>
         <p className="text-slate-500 mt-2 text-sm">
            左右滑動卡片可刪除或編輯
         </p>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar px-1 items-end">
        {days.map((day) => (
            <div key={day.id} className="relative flex-shrink-0 group">
                <button
                    onClick={() => setActiveDayId(day.id)}
                    className={`relative w-full text-left px-5 py-3 rounded-2xl font-bold transition-all border shadow-sm ${
                        activeDayId === day.id 
                        ? 'bg-slate-800 text-white border-slate-800 shadow-md transform -translate-y-1' 
                        : 'bg-white text-slate-500 hover:bg-slate-50 border-slate-200'
                    }`}
                >
                    <div className="flex flex-col">
                        <span className="text-xs uppercase opacity-70 mb-0.5">{day.label}</span>
                        {/* Custom Date Input Display */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold tracking-tight">
                                {day.date ? new Date(day.date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }) : '選擇日期'}
                            </span>
                        </div>
                    </div>
                </button>
                
                {/* Invisible Date Input Overlay */}
                {activeDayId === day.id && (
                     <input
                        type="date"
                        value={day.date || ''}
                        onChange={(e) => updateDayDate(e.target.value)}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                )}

                {days.length > 1 && (
                    <button 
                        onClick={(e) => deleteDay(e, day.id)}
                        className="absolute -top-2 -right-2 bg-slate-200 text-slate-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-300 hover:text-slate-700 shadow-sm border border-slate-300 z-20"
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
        ))}
        <button 
            onClick={addDay}
            className="flex-shrink-0 mb-0.5 px-5 py-3 h-[68px] rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center"
        >
            <Plus size={20} />
        </button>
      </div>

      {/* Itinerary List */}
      <Reorder.Group axis="y" values={activeItems} onReorder={handleSetItems} className="space-y-6">
        {activeItems.map((item, index) => (
          <ItineraryCard
            key={item.id}
            item={item}
            nextItem={activeItems[index + 1]}
            previousItemLocation={index > 0 ? activeItems[index - 1].location : undefined}
            updateItem={handleUpdateItem}
            deleteItem={handleDeleteItem}
          />
        ))}
      </Reorder.Group>
      
      {activeItems.length === 0 && (
        <div 
            onClick={handleAddItem}
            className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 cursor-pointer transition-all group"
        >
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors">
                <Calendar size={32} className="group-hover:text-indigo-600" />
            </div>
            <p className="font-bold text-lg">這一天還沒有行程</p>
            <p className="text-sm mt-1 opacity-70">點擊此處新增第一個景點</p>
        </div>
      )}

      {activeItems.length > 0 && (
          <div className="mt-8 flex justify-center">
            <button 
                onClick={handleAddItem}
                className="bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 px-8 py-3 rounded-full shadow-sm hover:shadow-md flex items-center gap-2 font-bold transition-all"
            >
                <Plus size={18} />
                <span>新增行程</span>
            </button>
          </div>
      )}
    </div>
  );
};

export default Timeline;
