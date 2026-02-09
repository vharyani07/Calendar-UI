import { useState, useEffect } from 'react';
import { Task, Event } from '../types/calendar';
import { formatDateForStorage, getDayLabel, parseDateString } from '../utils/dateUtils';
import { generateTimeOptions, getHourIndex } from '../utils/timeUtils';
import EventModal from './EventModal';
import NoteModal from './NoteModal';

interface DayViewProps {
    date: string;
    tasks: Task[];
    events: Event[];
    notes: string[];
    onAddEvent: (event: Event) => void;
    onUpdateEvent: (index: number, event: Event) => void;
    onDeleteEvent: (index: number) => void;
    onAddNote: (note: string) => void;
    onUpdateNote: (index: number, note: string) => void;
    onDeleteNote: (index: number) => void;
    onNavigateDay: (offset: number) => void;
    onReturnToMonth: () => void;
}

export default function DayView({
    date,
    tasks,
    events,
    notes,
    onAddEvent,
    onUpdateEvent,
    onDeleteEvent,
    onAddNote,
    onUpdateNote,
    onDeleteNote,
    onNavigateDay,
    onReturnToMonth
}: DayViewProps) {
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [editingEventIndex, setEditingEventIndex] = useState<number | null>(null);
    const [selectedStartTime, setSelectedStartTime] = useState<string>('');
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
    const [noteInput, setNoteInput] = useState('');

    const currentDate = parseDateString(date) || new Date();
    const dateLabel = getDayLabel(currentDate);
    const timeOptions = generateTimeOptions();

    const dayTasks = tasks.filter(task => task.date === date);
    const dayEvents = events.filter(event => event.date === date);

    const openAddEventModal = (startTime: string) => {
        setEditingEventIndex(null);
        setSelectedStartTime(startTime);
        setIsEventModalOpen(true);
    };

    const openEditEventModal = (eventIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingEventIndex(eventIndex);
        setIsEventModalOpen(true);
    };

    const handleSaveEvent = (event: Event) => {
        if (editingEventIndex !== null) {
            onUpdateEvent(editingEventIndex, event);
        } else {
            onAddEvent(event);
        }
        setIsEventModalOpen(false);
    };

    const handleDeleteEvent = () => {
        if (editingEventIndex !== null) {
            onDeleteEvent(editingEventIndex);
            setIsEventModalOpen(false);
        }
    };

    const handleAddNote = () => {
        if (!noteInput.trim()) {
            alert('Please enter a note before saving');
            return;
        }
        onAddNote(noteInput);
        setNoteInput('');
    };

    const openEditNoteModal = (noteIndex: number) => {
        setEditingNoteIndex(noteIndex);
        setIsNoteModalOpen(true);
    };

    const handleSaveNote = (content: string) => {
        if (editingNoteIndex !== null) {
            onUpdateNote(editingNoteIndex, content);
        }
        setIsNoteModalOpen(false);
    };

    const handleDeleteNote = () => {
        if (editingNoteIndex !== null) {
            onDeleteNote(editingNoteIndex);
            setIsNoteModalOpen(false);
        }
    };

    const getEventStyle = (event: Event) => {
        const startIdx = getHourIndex(event.start);
        const endIdx = getHourIndex(event.end);
        const top = startIdx * 60; // 60px per hour
        const height = (endIdx - startIdx) * 60;

        return { top: `${top}px`, height: `${height}px` };
    };

    const getEventColor = (type: string) => {
        const colors = {
            'event-work': 'bg-red-500',
            'event-meeting': 'bg-blue-500',
            'event-personal': 'bg-orange-500',
            'event-assignment': 'bg-yellow-400 text-slate-900'
        };
        return colors[type as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 backdrop-blur-lg">
                    <div className="flex justify-between items-center">
                        <button
                            onClick={onReturnToMonth}
                            className="px-4 py-2 bg-white/10 border border-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                        >
                            ← Return to Month
                        </button>

                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white">{dateLabel.split(', ')[1]}, {dateLabel.split(', ')[2]}</h2>
                            <p className="text-sm text-white/70">{dateLabel.split(', ')[0]}</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => onNavigateDay(-1)}
                                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                &lt;
                            </button>
                            <button
                                onClick={() => onNavigateDay(1)}
                                className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 transition-all"
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-lg">
                    <div className="flex h-[600px]">
                        {/* Timeline */}
                        <div className="flex-[3] border-r border-white/10 overflow-y-auto relative bg-white/5">
                            {timeOptions.map((time, idx) => (
                                <div
                                    key={time}
                                    onClick={() => openAddEventModal(time)}
                                    className="flex items-center h-[60px] border-b border-white/10 px-3 hover:bg-white/10 cursor-pointer transition-all relative"
                                >
                                    <span className="text-xs text-white/60 w-12">{time}</span>
                                </div>
                            ))}

                            {/* Events */}
                            {dayEvents.map((event, idx) => {
                                const globalIndex = events.findIndex(e =>
                                    e.date === event.date &&
                                    e.title === event.title &&
                                    e.start === event.start &&
                                    e.end === event.end
                                );
                                const style = getEventStyle(event);

                                return (
                                    <div
                                        key={idx}
                                        onClick={(e) => openEditEventModal(globalIndex, e)}
                                        className={`absolute left-14 right-3 px-3 py-2 rounded-lg border border-white/20 cursor-pointer hover:brightness-110 transition-all shadow-lg ${getEventColor(event.type)}`}
                                        style={style}
                                    >
                                        <div className="font-bold text-sm">{event.title}</div>
                                        <div className="text-xs opacity-90">{event.start} - {event.end}</div>
                                        {event.location && <div className="text-xs opacity-75">{event.location}</div>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Notepad */}
                        <div className="flex-[2] flex flex-col border-l border-white/10">
                            <div className="bg-white/10 p-3 text-center font-bold text-white/70 border-b border-white/10">
                                NOTEPAD
                            </div>

                            <div className="flex-1 p-4 overflow-y-auto bg-white/5">
                                <ul className="space-y-2 mb-4">
                                    {notes.map((note, idx) => (
                                        <li
                                            key={idx}
                                            onClick={() => openEditNoteModal(idx)}
                                            className="p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-all text-white text-sm"
                                        >
                                            • {note}
                                        </li>
                                    ))}
                                </ul>

                                <textarea
                                    value={noteInput}
                                    onChange={(e) => setNoteInput(e.target.value)}
                                    placeholder="Add a new note..."
                                    className="w-full h-24 px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 resize-none"
                                />
                            </div>

                            <div className="flex border-t border-white/10">
                                <button
                                    onClick={handleAddNote}
                                    className="flex-1 py-3 text-white font-bold hover:bg-white/10 transition-all"
                                >
                                    SAVE
                                </button>
                                <button
                                    onClick={() => setNoteInput('')}
                                    className="flex-1 py-3 text-white font-bold border-l border-white/10 hover:bg-white/10 transition-all"
                                >
                                    CLEAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tasks Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4 backdrop-blur-lg">
                    <h2 className="text-xl font-bold text-white mb-4">Tasks for Today</h2>

                    {dayTasks.length === 0 ? (
                        <p className="text-white/60 text-center italic py-4">No tasks assigned for this day.</p>
                    ) : (
                        <div className="space-y-3">
                            {dayTasks.map((task, idx) => {
                                const typeColors = {
                                    meeting: 'border-l-blue-500 bg-blue-500/10',
                                    assignment: 'border-l-yellow-400 bg-yellow-400/10',
                                    personal: 'border-l-green-500 bg-green-500/10',
                                    work: 'border-l-red-500 bg-red-500/10'
                                };

                                const typeBadgeColors = {
                                    meeting: 'bg-blue-500 text-white',
                                    assignment: 'bg-yellow-400 text-slate-900',
                                    personal: 'bg-green-500 text-white',
                                    work: 'bg-red-500 text-white'
                                };

                                const priorityStars = '★'.repeat(task.priority);

                                return (
                                    <div
                                        key={idx}
                                        className={`p-3 rounded-xl border-l-4 border border-white/10 ${typeColors[task.type]} hover:bg-white/10 transition-all`}
                                    >
                                        <div className="font-bold text-white">{task.title}</div>
                                        <div className="flex gap-3 items-center mt-2">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${typeBadgeColors[task.type]}`}>
                                                {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                                            </span>
                                            {task.priority > 0 && (
                                                <span className="text-sm text-white/70">Priority: {priorityStars}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <EventModal
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={editingEventIndex !== null ? handleDeleteEvent : undefined}
                initialEvent={editingEventIndex !== null ? events[editingEventIndex] : undefined}
                initialDate={date}
                initialStartTime={selectedStartTime}
            />

            <NoteModal
                isOpen={isNoteModalOpen}
                onClose={() => setIsNoteModalOpen(false)}
                onSave={handleSaveNote}
                onDelete={handleDeleteNote}
                initialContent={editingNoteIndex !== null ? notes[editingNoteIndex] : ''}
            />
        </div>
    );
}
