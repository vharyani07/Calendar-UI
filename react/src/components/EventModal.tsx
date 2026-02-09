import { useState, useEffect } from 'react';
import { Event, EventType } from '../types/calendar';
import { generateTimeOptions, validateTimeRange } from '../utils/timeUtils';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: Event) => void;
    onDelete?: () => void;
    initialEvent?: Event;
    initialDate?: string;
    initialStartTime?: string;
}

export default function EventModal({ isOpen, onClose, onSave, onDelete, initialEvent, initialDate, initialStartTime }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [start, setStart] = useState('1 am');
    const [end, setEnd] = useState('2 am');
    const [location, setLocation] = useState('');
    const [type, setType] = useState<EventType>('event-work');
    const [date, setDate] = useState('');

    const timeOptions = generateTimeOptions();

    useEffect(() => {
        if (initialEvent) {
            setTitle(initialEvent.title);
            setStart(initialEvent.start);
            setEnd(initialEvent.end);
            setLocation(initialEvent.location);
            setType(initialEvent.type);
            setDate(initialEvent.date);
        } else if (initialDate) {
            setDate(initialDate);
            setTitle('');
            setLocation('');
            setType('event-work');

            if (initialStartTime) {
                setStart(initialStartTime);
                // Set end time to 1 hour after start
                const startIdx = timeOptions.indexOf(initialStartTime);
                if (startIdx >= 0 && startIdx < timeOptions.length - 1) {
                    setEnd(timeOptions[startIdx + 1]);
                } else {
                    setEnd(initialStartTime);
                }
            } else {
                setStart('1 am');
                setEnd('2 am');
            }
        }
    }, [initialEvent, initialDate, initialStartTime, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !start || !end) {
            alert('Please fill in all required fields');
            return;
        }

        if (!validateTimeRange(start, end)) {
            alert('End time must be after start time');
            return;
        }

        onSave({ title, start, end, location, type, date });
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setStart('1 am');
        setEnd('2 am');
        setLocation('');
        setType('event-work');
        setDate('');
        onClose();
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">{initialEvent ? 'Edit Event' : 'Add New Event'}</h2>
                    <button onClick={handleClose} className="text-white/60 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Event Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-white/70 font-bold mb-2 text-sm">Start Time:</label>
                            <select
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            >
                                {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-white/70 font-bold mb-2 text-sm">End Time:</label>
                            <select
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            >
                                {timeOptions.map((time) => (
                                    <option key={time} value={time}>{time}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Location:</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Event Type:</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as EventType)}
                            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        >
                            <option value="event-work">Work</option>
                            <option value="event-meeting">Meeting</option>
                            <option value="event-personal">Personal</option>
                            <option value="event-assignment">Assignment</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-b from-blue-400 to-blue-500 text-slate-900 font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                        >
                            {initialEvent ? 'Update Event' : 'Add Event'}
                        </button>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 bg-gradient-to-b from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                            >
                                Delete Event
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
