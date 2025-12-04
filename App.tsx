
import React, { useState } from 'react';
import { Map, ListChecks } from 'lucide-react';
import Timeline from './components/Timeline';
import PackingList from './components/PackingList';
import TripManager from './components/TripManager';
import { Day, PackingCategory, TripData } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'itinerary' | 'packing'>('itinerary');
  
  // Multi-day state with Date initialization
  const [days, setDays] = useState<Day[]>([
    {
      id: 'day-1',
      label: 'Day 1',
      date: new Date().toISOString().split('T')[0], // Default to today
      items: [
        {
          id: '1',
          time: '09:00',
          location: '台北車站',
          activity: '集合出發',
          transportMode: 'transit',
          notes: '記得買早餐',
          estimatedTravelTime: undefined
        },
        {
          id: '2',
          time: '10:30',
          location: '九份老街',
          activity: '逛老街、吃芋圓',
          transportMode: 'walking',
          notes: '阿柑姨芋圓必吃',
          estimatedTravelTime: undefined
        }
      ]
    }
  ]);

  // Lifted Packing List State
  const [packingCategories, setPackingCategories] = useState<PackingCategory[]>([
    { id: '1', name: '必備證件/錢包', items: [] },
    { id: '2', name: '衣物', items: [] },
  ]);

  // Global Actions
  const handleImportTrip = (data: TripData) => {
      if (data.days) setDays(data.days);
      if (data.packingList) setPackingCategories(data.packingList);
  };

  const handleResetTrip = () => {
      // Reset to initial state
      setDays([{
          id: crypto.randomUUID(),
          label: 'Day 1',
          date: new Date().toISOString().split('T')[0],
          items: []
      }]);
      setPackingCategories([]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-40 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-slate-200">W</div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">WanderPlan</span>
           </div>
           
           {/* Trip Manager Menu */}
           <TripManager 
              days={days} 
              packingList={packingCategories} 
              onImport={handleImportTrip}
              onReset={handleResetTrip}
           />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-24 px-4 max-w-5xl mx-auto">
        {activeTab === 'itinerary' ? (
            <Timeline days={days} setDays={setDays} />
        ) : (
            <PackingList 
                categories={packingCategories} 
                setCategories={setPackingCategories} 
            />
        )}
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-slate-200/50 rounded-full p-1.5 flex gap-2 z-50">
         <button
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === 'itinerary' 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
         >
            <Map size={18} />
            <span>行程</span>
         </button>
         <button
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all ${
                activeTab === 'packing' 
                ? 'bg-slate-800 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-100'
            }`}
         >
            <ListChecks size={18} />
            <span>清單</span>
         </button>
      </div>
    </div>
  );
};

export default App;
