import React from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
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

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onStartDateChange(new Date(value));
      setSelectedMonth(null);
    } else {
      onStartDateChange(undefined);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      onEndDateChange(new Date(value));
      setSelectedMonth(null);
    } else {
      onEndDateChange(undefined);
    }
  };

  return (
    <div className="date-range-container">
      <div className="date-range">
        <input
          type="date"
          className="date-input"
          value={formatDateForInput(startDate)}
          onChange={handleStartDateChange}
          placeholder={startPlaceholder}
        />
        <span className="date-separator">~</span>
        <input
          type="date"
          className="date-input"
          value={formatDateForInput(endDate)}
          onChange={handleEndDateChange}
          placeholder={endPlaceholder}
        />
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
