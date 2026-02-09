import { useState } from 'react';
import { Task } from '../types/calendar';
import { formatDateString, getMonthName, getDaysInMonth, getFirstDayOfMonth } from '../utils/dateUtils';
import TaskModal from './TaskModal';

interface MonthViewProps {
    tasks: Task[];
    onAddTask: (task: Task) => void;
    onUpdateTask: (index: number, task: Task) => void;
    onDeleteTask: (index: number) => void;
    onDayClick: (date: string) => void;
}

export default function MonthView({ tasks, onAddTask, onUpdateTask, onDeleteTask, onDayClick }: MonthViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [editingTaskIndex, setEditingTaskIndex] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const openAddTaskModal = () => {
        setEditingTaskIndex(null);
        setSelectedDate(formatDateString(currentYear, currentMonth, new Date().getDate()));
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (taskIndex: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingTaskIndex(taskIndex);
        setIsTaskModalOpen(true);
    };

    const handleSaveTask = (task: Task) => {
        if (editingTaskIndex !== null) {
            onUpdateTask(editingTaskIndex, task);
        } else {
            onAddTask(task);
        }
        setIsTaskModalOpen(false);
    };

    const handleDeleteTask = () => {
        if (editingTaskIndex !== null) {
            onDeleteTask(editingTaskIndex);
            setIsTaskModalOpen(false);
        }
    };

    const getTasksForDate = (dateStr: string): Task[] => {
        return tasks.filter(task => task.date === dateStr);
    };

    const renderCalendar = () => {
        const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
        const daysInMonth = getDaysInMonth(currentYear, currentMonth);
        const prevMonthDays = currentMonth === 0 ? getDaysInMonth(currentYear - 1, 11) : getDaysInMonth(currentYear, currentMonth - 1);

        const days: JSX.Element[] = [];

        // Day of week headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            days.push(
                <div key={`header-${day}`} className="text-center font-bold p-2 bg-white/10 border border-white/10 rounded-lg text-white/70">
                    {day}
                </div>
            );
        });

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const dateStr = formatDateString(prevYear, prevMonth, day);

            days.push(
                <div
                    key={`prev-${i}`}
                    className="p-2 h-28 bg-white/5 border border-white/10 rounded-lg opacity-50 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => onDayClick(dateStr)}
                >
                    <div className="font-bold text-white/60">{day}</div>
                </div>
            );
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = formatDateString(currentYear, currentMonth, day);
            const dayTasks = getTasksForDate(dateStr);
            const visibleTasks = dayTasks.slice(0, 2);
            const additionalCount = dayTasks.length - 2;

            days.push(
                <div
                    key={`current-${day}`}
                    className="p-2 h-28 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 hover:-translate-y-0.5 hover:border-blue-400/40 transition-all relative"
                    onClick={() => onDayClick(dateStr)}
                >
                    <div className="font-bold text-white mb-2">{day}</div>

                    {additionalCount > 0 && (
                        <div className="absolute top-2 right-2 bg-blue-400 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            +{additionalCount}
                        </div>
                    )}

                    <div className="space-y-1">
                        {visibleTasks.map((task, idx) => {
                            const taskIndex = tasks.findIndex(t =>
                                t.title === task.title && t.date === task.date && t.type === task.type
                            );

                            const typeColors = {
                                meeting: 'bg-blue-500',
                                assignment: 'bg-yellow-400 text-slate-900',
                                personal: 'bg-green-500',
                                work: 'bg-red-500'
                            };

                            return (
                                <div
                                    key={idx}
                                    onClick={(e) => openEditTaskModal(taskIndex, e)}
                                    className={`text-xs px-2 py-1 rounded-lg border border-white/20 truncate hover:brightness-110 transition-all ${typeColors[task.type]}`}
                                >
                                    {task.title}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        // Next month days to fill grid
        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
        const nextMonthDays = totalCells - (firstDay + daysInMonth);

        for (let day = 1; day <= nextMonthDays; day++) {
            const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
            const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
            const dateStr = formatDateString(nextYear, nextMonth, day);

            days.push(
                <div
                    key={`next-${day}`}
                    className="p-2 h-28 bg-white/5 border border-white/10 rounded-lg opacity-50 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => onDayClick(dateStr)}
                >
                    <div className="font-bold text-white/60">{day}</div>
                </div>
            );
        }

        return days;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <header className="text-center py-6">
                <h1 className="text-3xl font-bold text-white tracking-tight">My Calendar</h1>
            </header>

            <div className="max-w-6xl mx-auto px-4 pb-8">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={prevMonth}
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                        >
                            &lt;
                        </button>
                        <h2 className="text-xl font-bold text-white min-w-[200px] text-center">
                            {getMonthName(currentMonth)} {currentYear}
                        </h2>
                        <button
                            onClick={nextMonth}
                            className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all"
                        >
                            &gt;
                        </button>
                    </div>

                    <button
                        onClick={openAddTaskModal}
                        className="bg-gradient-to-b from-blue-400 to-blue-500 border border-blue-400/40 px-4 py-2 rounded-full font-bold text-slate-900 hover:brightness-105 transition-all"
                    >
                        Add Task
                    </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-lg shadow-2xl">
                    <div className="grid grid-cols-7 gap-2">
                        {renderCalendar()}
                    </div>
                </div>
            </div>

            <TaskModal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                onDelete={editingTaskIndex !== null ? handleDeleteTask : undefined}
                initialTask={editingTaskIndex !== null ? tasks[editingTaskIndex] : undefined}
                initialDate={selectedDate}
            />
        </div>
    );
}
