export type TaskType = 'meeting' | 'assignment' | 'personal' | 'work';

export type EventType = 'event-work' | 'event-meeting' | 'event-personal' | 'event-assignment';

export interface Task {
    title: string;
    date: string; // YYYY-MM-DD
    type: TaskType;
    priority: number; // 0-3
}

export interface Event {
    title: string;
    start: string; // e.g., "1 am", "2 pm"
    end: string;
    location: string;
    type: EventType;
    date: string; // YYYY-MM-DD
}

export interface Note {
    content: string;
}
