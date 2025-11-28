import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import type { DayPickerProps } from "react-day-picker"
import { cn } from "@/lib/utils"
import './Calendar.css'

export type CalendarProps = DayPickerProps

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("calendar", className)}
      classNames={{
        months: "calendar-months",
        month: "calendar-month",
        month_caption: "calendar-caption",
        caption_label: "calendar-caption-label",
        nav: "calendar-nav",
        button_previous: "calendar-nav-button calendar-nav-button-previous",
        button_next: "calendar-nav-button calendar-nav-button-next",
        month_grid: "calendar-table",
        weekdays: "calendar-head-row",
        weekday: "calendar-head-cell",
        week: "calendar-row",
        day: "calendar-cell",
        day_button: "calendar-day",
        selected: "calendar-day-selected",
        today: "calendar-day-today",
        outside: "calendar-day-outside",
        disabled: "calendar-day-disabled",
        range_middle: "calendar-day-range-middle",
        hidden: "calendar-day-hidden",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) => {
          const Icon = orientation === 'left' ? ChevronLeft : ChevronRight;
          return <Icon {...iconProps} className="calendar-icon" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
