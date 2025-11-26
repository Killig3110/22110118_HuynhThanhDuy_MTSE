import React, { useState, useEffect } from 'react';

const empty = {
    name: '',
    blockCode: '',
    location: '',
    totalBuildings: 1,
    description: ''
};

const BlockFormModal = ({ open, onClose, onSave, initialData }) => {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                blockCode: initialData.blockCode || '',
                location: initialData.location || '',
                totalBuildings: initialData.totalBuildings || 1,
                description: initialData.description || ''
            });
        } else {
            setForm(empty);
        }
    }, [initialData, open]);

    if (!open) return null;

    const submit = (e) => {
        e.preventDefault();
        onSave?.(form);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Block' : 'Add Block'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-3">
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Block Code" value={form.blockCode} onChange={(e) => setForm({ ...form, blockCode: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" type="number" min="1" max="50" placeholder="Total Buildings" value={form.totalBuildings} onChange={(e) => setForm({ ...form, totalBuildings: e.target.value })} />
                    <textarea className="border rounded px-3 py-2 text-sm" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{initialData ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BlockFormModal;
