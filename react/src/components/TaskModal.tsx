import { useState, useEffect } from 'react';
import { Task, TaskType } from '../types/calendar';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Task) => void;
    onDelete?: () => void;
    initialTask?: Task;
    initialDate?: string;
}

export default function TaskModal({ isOpen, onClose, onSave, onDelete, initialTask, initialDate }: TaskModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [type, setType] = useState<TaskType>('meeting');
    const [priority, setPriority] = useState(0);

    useEffect(() => {
        if (initialTask) {
            setTitle(initialTask.title);
            setDate(initialTask.date);
            setType(initialTask.type);
            setPriority(initialTask.priority);
        } else if (initialDate) {
            setDate(initialDate);
            setTitle('');
            setType('meeting');
            setPriority(0);
        }
    }, [initialTask, initialDate, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !date) {
            alert('Please fill in all required fields');
            return;
        }

        onSave({ title, date, type, priority });
        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setDate('');
        setType('meeting');
        setPriority(0);
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
                    <h2 className="text-xl font-bold text-white">{initialTask ? 'Edit Task' : 'Add New Task'}</h2>
                    <button onClick={handleClose} className="text-white/60 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Task Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Date:</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Task Type:</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as TaskType)}
                            className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                        >
                            <option value="meeting">Meeting</option>
                            <option value="assignment">Assignment</option>
                            <option value="personal">Personal</option>
                            <option value="work">Work</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Priority:</label>
                        <div className="flex gap-2 text-3xl">
                            {[1, 2, 3].map((star) => (
                                <span
                                    key={star}
                                    onClick={() => setPriority(star)}
                                    className={`cursor-pointer transition-colors ${star <= priority ? 'text-yellow-400' : 'text-white/25'
                                        }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-b from-blue-400 to-blue-500 text-slate-900 font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                        >
                            {initialTask ? 'Update Task' : 'Add Task'}
                        </button>
                        {onDelete && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 bg-gradient-to-b from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                            >
                                Delete Task
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
