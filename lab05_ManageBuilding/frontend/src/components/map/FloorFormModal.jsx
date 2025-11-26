import React, { useEffect, useState } from 'react';

const empty = {
    buildingId: '',
    floorNumber: '',
    totalApartments: 1
};

const FloorFormModal = ({ open, onClose, onSave, initialData, buildingOptions = [] }) => {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initialData) {
            setForm({
                buildingId: initialData.buildingId || '',
                floorNumber: initialData.floorNumber || '',
                totalApartments: initialData.totalApartments || 1
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
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Floor' : 'Add Floor'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-3">
                    <select className="border rounded px-3 py-2 text-sm" value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })} required>
                        <option value="">Select Building</option>
                        {buildingOptions.map(b => <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>)}
                    </select>
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Floor Number" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Total Apartments" value={form.totalApartments} onChange={(e) => setForm({ ...form, totalApartments: e.target.value })} required />
                    <div className="flex gap-2 mt-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{initialData ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FloorFormModal;
