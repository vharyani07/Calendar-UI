import { useState, useEffect } from 'react';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (content: string) => void;
    onDelete: () => void;
    initialContent: string;
}

export default function NoteModal({ isOpen, onClose, onSave, onDelete, initialContent }: NoteModalProps) {
    const [content, setContent] = useState('');

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) {
            alert('Please enter note content');
            return;
        }

        onSave(content);
        handleClose();
    };

    const handleClose = () => {
        setContent('');
        onClose();
    };

    const handleDelete = () => {
        onDelete();
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={handleClose}>
            <div className="bg-slate-900/95 border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Edit Note</h2>
                    <button onClick={handleClose} className="text-white/60 hover:text-white text-3xl font-bold leading-none">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-white/70 font-bold mb-2 text-sm">Note Content:</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 min-h-[120px] resize-vertical"
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="flex-1 bg-gradient-to-b from-blue-400 to-blue-500 text-slate-900 font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                        >
                            Update Note
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex-1 bg-gradient-to-b from-red-500 to-red-600 text-white font-bold py-2 px-4 rounded-full hover:brightness-105 transition-all"
                        >
                            Delete Note
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
