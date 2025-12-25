import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import { Calendar } from './ui/Calendar';
import { Button } from './ui/Primitives';

const CalendarHub: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Mock events data
  const [events] = useState([
    { id: 1, title: 'Team Sync', time: '10:00 AM', type: 'Work' },
    { id: 2, title: 'Presentation Review', time: '02:00 PM', type: 'Work' },
    { id: 3, title: 'Gemini API Workshop', time: '04:30 PM', type: 'Learning' },
  ]);

  return (
    <div className="h-full flex flex-col space-y-6 p-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-8 h-8 text-orange-500" />
            Schedule & Planning
          </h2>
          <p className="text-gray-400 mt-1">Manage your deadlines and presentation schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Calendar Widget Container */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8 flex flex-col items-center shadow-xl lg:col-span-2 justify-center">
            <div className="transform scale-125 origin-center">
                <Calendar 
                    selected={selectedDate} 
                    onSelect={setSelectedDate}
                    className="bg-gray-950 border border-gray-800 shadow-2xl"
                />
            </div>
            <p className="mt-12 text-gray-500 text-sm">
                Select a date to view detailed logs and upcoming tasks for {selectedDate?.toLocaleDateString()}.
            </p>
        </div>

        {/* Sidebar / Agenda */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 flex flex-col shadow-xl">
           <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-semibold text-gray-200">Agenda</h3>
               <Button size="sm" variant="outline" className="text-xs h-8">
                   <Plus className="w-3 h-3 mr-1" /> Add Event
               </Button>
           </div>

           <div className="space-y-4 flex-1 overflow-y-auto">
               <div className="pb-4 border-b border-gray-800">
                   <h4 className="text-sm font-medium text-orange-400 mb-2">Today, {new Date().toLocaleDateString(undefined, { weekday: 'long' })}</h4>
                   {events.map(evt => (
                       <div key={evt.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-950/50 border border-gray-800/50 mb-2 hover:border-orange-500/30 transition-colors">
                           <div className="w-12 h-12 rounded-lg bg-gray-900 flex flex-col items-center justify-center border border-gray-800">
                               <Clock className="w-4 h-4 text-gray-500 mb-1" />
                           </div>
                           <div>
                               <p className="text-gray-200 font-medium text-sm">{evt.title}</p>
                               <div className="flex items-center gap-2 mt-1">
                                   <span className="text-xs text-gray-500">{evt.time}</span>
                                   <span className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded-full border border-gray-700">{evt.type}</span>
                               </div>
                           </div>
                       </div>
                   ))}
               </div>
               
               <div>
                   <h4 className="text-sm font-medium text-gray-500 mb-2">Tomorrow</h4>
                   <div className="text-center py-6 text-gray-600 text-sm italic border-2 border-dashed border-gray-800 rounded-xl">
                       No events scheduled
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarHub;