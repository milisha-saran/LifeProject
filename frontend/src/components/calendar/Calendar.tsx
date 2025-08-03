import React, { useState, useCallback } from 'react';
import { Calendar as BigCalendar, momentLocalizer, View, Views } from 'react-big-calendar';
import moment from 'moment';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { CalendarEvent, TimeSlot } from '@/types/calendar';
import { CalendarEventComponent } from './CalendarEventComponent';
import { EventPopover } from './EventPopover';
import { CalendarToolbar } from './CalendarToolbar';
import { CreateEventDialog } from './CreateEventDialog';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

const localizer = momentLocalizer(moment);

interface CalendarProps {
  events: CalendarEvent[];
  date: Date;
  onDateChange: (date: Date) => void;
  onEventMove: (event: CalendarEvent, timeSlot: TimeSlot) => void;
  onEventComplete: (event: CalendarEvent) => void;
  onEventEdit: (event: CalendarEvent) => void;
  onEventDelete: (event: CalendarEvent) => void;
  loading?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  events,
  date,
  onDateChange,
  onEventMove,
  onEventComplete,
  onEventEdit,
  onEventDelete,
  loading = false,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createTimeSlot, setCreateTimeSlot] = useState<TimeSlot | null>(null);
  const [view, setView] = useState<View>(Views.DAY);

  const handleSelectEvent = useCallback((event: CalendarEvent, e: React.SyntheticEvent) => {
    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    setPopoverPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setCreateTimeSlot({ start, end });
    setShowCreateDialog(true);
  }, []);

  const handleEventDrop = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      onEventMove(event, { start, end });
    },
    [onEventMove]
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: { event: CalendarEvent; start: Date; end: Date }) => {
      onEventMove(event, { start, end });
    },
    [onEventMove]
  );

  const closePopover = useCallback(() => {
    setSelectedEvent(null);
    setPopoverPosition(null);
  }, []);

  const handleEventComplete = useCallback(() => {
    if (selectedEvent) {
      onEventComplete(selectedEvent);
      closePopover();
    }
  }, [selectedEvent, onEventComplete, closePopover]);

  const handleEventEdit = useCallback(() => {
    if (selectedEvent) {
      onEventEdit(selectedEvent);
      closePopover();
    }
  }, [selectedEvent, onEventEdit, closePopover]);

  const handleEventDelete = useCallback(() => {
    if (selectedEvent) {
      onEventDelete(selectedEvent);
      closePopover();
    }
  }, [selectedEvent, onEventDelete, closePopover]);

  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => ({
      style: {
        backgroundColor: event.color,
        borderColor: event.color,
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        fontSize: '12px',
        padding: '2px 4px',
      },
    }),
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col">
        <CalendarToolbar
          date={date}
          view={view}
          onDateChange={onDateChange}
          onViewChange={setView}
        />
        
        <div className="flex-1 min-h-0">
          <BigCalendar
            localizer={localizer}
            events={events}
            date={date}
            view={view}
            onView={setView}
            onNavigate={onDateChange}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            eventPropGetter={eventStyleGetter}
            components={{
              event: CalendarEventComponent,
            }}
            selectable
            resizable
            dragFromOutsideItem={null}
            step={15}
            timeslots={4}
            min={new Date(2024, 0, 1, 6, 0)} // 6 AM
            max={new Date(2024, 0, 1, 23, 0)} // 11 PM
            defaultView={Views.DAY}
            views={[Views.DAY, Views.WEEK]}
            formats={{
              timeGutterFormat: 'HH:mm',
              eventTimeRangeFormat: ({ start, end }) =>
                `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`,
            }}
            className="calendar-container"
          />
        </div>

        {selectedEvent && popoverPosition && (
          <EventPopover
            event={selectedEvent}
            position={popoverPosition}
            onEdit={handleEventEdit}
            onComplete={handleEventComplete}
            onDelete={handleEventDelete}
            onClose={closePopover}
          />
        )}

        {showCreateDialog && createTimeSlot && (
          <CreateEventDialog
            timeSlot={createTimeSlot}
            onClose={() => {
              setShowCreateDialog(false);
              setCreateTimeSlot(null);
            }}
          />
        )}
      </div>
    </DndProvider>
  );
};