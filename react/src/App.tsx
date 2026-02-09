import { useState } from 'react';
import { Task, Event } from './types/calendar';
import { useLocalStorage } from './hooks/useLocalStorage';
import { formatDateForStorage, parseDateString } from './utils/dateUtils';
import MonthView from './components/MonthView';
import DayView from './components/DayView';

type View = 'month' | 'day';

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('calendar_tasks', []);
  const [events, setEvents] = useLocalStorage<Event[]>('calendar_events', []);
  const [notesByDate, setNotesByDate] = useLocalStorage<Record<string, string[]>>('calendar_notes', {});

  const [currentView, setCurrentView] = useState<View>('month');
  const [selectedDate, setSelectedDate] = useState<string>(formatDateForStorage(new Date()));

  // Task handlers
  const handleAddTask = (task: Task) => {
    setTasks([...tasks, task]);
  };

  const handleUpdateTask = (index: number, updatedTask: Task) => {
    const newTasks = [...tasks];
    newTasks[index] = updatedTask;
    setTasks(newTasks);
  };

  const handleDeleteTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  // Event handlers
  const handleAddEvent = (event: Event) => {
    setEvents([...events, event]);
  };

  const handleUpdateEvent = (index: number, updatedEvent: Event) => {
    const newEvents = [...events];
    newEvents[index] = updatedEvent;
    setEvents(newEvents);
  };

  const handleDeleteEvent = (index: number) => {
    const newEvents = events.filter((_, i) => i !== index);
    setEvents(newEvents);
  };

  // Note handlers
  const handleAddNote = (note: string) => {
    const newNotes = { ...notesByDate };
    if (!newNotes[selectedDate]) {
      newNotes[selectedDate] = [];
    }
    newNotes[selectedDate] = [...newNotes[selectedDate], note];
    setNotesByDate(newNotes);
  };

  const handleUpdateNote = (index: number, updatedNote: string) => {
    const newNotes = { ...notesByDate };
    if (newNotes[selectedDate]) {
      newNotes[selectedDate][index] = updatedNote;
      setNotesByDate(newNotes);
    }
  };

  const handleDeleteNote = (index: number) => {
    const newNotes = { ...notesByDate };
    if (newNotes[selectedDate]) {
      newNotes[selectedDate] = newNotes[selectedDate].filter((_, i) => i !== index);
      setNotesByDate(newNotes);
    }
  };

  // Navigation handlers
  const handleDayClick = (date: string) => {
    setSelectedDate(date);
    setCurrentView('day');
  };

  const handleNavigateDay = (offset: number) => {
    const currentDate = parseDateString(selectedDate) || new Date();
    currentDate.setDate(currentDate.getDate() + offset);
    setSelectedDate(formatDateForStorage(currentDate));
  };

  const handleReturnToMonth = () => {
    setCurrentView('month');
  };

  return (
    <>
      {currentView === 'month' ? (
        <MonthView
          tasks={tasks}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onDayClick={handleDayClick}
        />
      ) : (
        <DayView
          date={selectedDate}
          tasks={tasks}
          events={events}
          notes={notesByDate[selectedDate] || []}
          onAddEvent={handleAddEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onDeleteNote={handleDeleteNote}
          onNavigateDay={handleNavigateDay}
          onReturnToMonth={handleReturnToMonth}
        />
      )}
    </>
  );
}
