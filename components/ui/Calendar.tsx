import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Primitives';

interface CalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  className?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className = "" }) => {
  const [viewDate, setViewDate] = useState(selected || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onSelect(newDate);
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className={`p-3 w-full max-w-[280px] bg-gray-950 border border-gray-800 rounded-md shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-100 ml-2">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-7 w-7">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-7 w-7">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-[0.8rem] text-gray-500 text-center font-medium">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          if (day === null) return <div key={`empty-${idx}`} />;
          
          const isSelected = selected && 
            selected.getDate() === day && 
            selected.getMonth() === viewDate.getMonth() && 
            selected.getFullYear() === viewDate.getFullYear();

          const isToday = new Date().getDate() === day && 
            new Date().getMonth() === viewDate.getMonth() && 
            new Date().getFullYear() === viewDate.getFullYear();

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`
                h-8 w-8 text-sm rounded-md flex items-center justify-center transition-colors
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950
                ${isSelected 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'text-gray-200 hover:bg-gray-800'}
                ${!isSelected && isToday ? 'bg-gray-800 text-indigo-400' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
