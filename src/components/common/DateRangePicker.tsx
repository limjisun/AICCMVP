import React from 'react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calendar } from './Calendar';
import { Popover, PopoverContent, PopoverTrigger } from './Popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startPlaceholder = '시작일',
  endPlaceholder = '종료일',
}) => {
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(null);

  const handleMonthSelect = (monthsAgo: number) => {
    const targetDate = subMonths(new Date(), monthsAgo);
    const start = startOfMonth(targetDate);
    const end = endOfMonth(targetDate);
    onStartDateChange(start);
    onEndDateChange(end);
    setSelectedMonth(monthsAgo);
  };

  return (
    <div className="date-range-container">
      <div className="date-range">
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'date-button',
                !startDate && 'date-button-placeholder'
              )}
            >
              <CalendarIcon className="icon" />
              {startDate ? format(startDate, 'yyyy-MM-dd') : startPlaceholder}
            </button>
          </PopoverTrigger>
          <PopoverContent className="calendar-popover">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={onStartDateChange}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
        <span className="date-separator">~</span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                'date-button',
                !endDate && 'date-button-placeholder'
              )}
            >
              <CalendarIcon className="icon" />
              {endDate ? format(endDate, 'yyyy-MM-dd') : endPlaceholder}
            </button>
          </PopoverTrigger>
          <PopoverContent className="calendar-popover">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={onEndDateChange}
              locale={ko}
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="month-buttons">
        <button
          className={cn("month-btn", selectedMonth === 0 && "active")}
          onClick={() => handleMonthSelect(0)}
        >
          당월
        </button>
        <button
          className={cn("month-btn", selectedMonth === 1 && "active")}
          onClick={() => handleMonthSelect(1)}
        >
          전월
        </button>
        <button
          className={cn("month-btn", selectedMonth === 2 && "active")}
          onClick={() => handleMonthSelect(2)}
        >
          전전월
        </button>
      </div>
    </div>
  );
};
