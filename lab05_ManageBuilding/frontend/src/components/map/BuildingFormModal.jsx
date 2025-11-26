import React, { useEffect, useState } from 'react';

const empty = {
    name: '',
    buildingCode: '',
    blockId: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    totalFloors: 1
};

const BuildingFormModal = ({ open, onClose, onSave, initialData, blocks = [] }) => {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initialData) {
            setForm({
                name: initialData.name || '',
                buildingCode: initialData.buildingCode || '',
                blockId: initialData.blockId || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                zipCode: initialData.zipCode || '',
                totalFloors: initialData.totalFloors || 1
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
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Building' : 'Add Building'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Building Code" value={form.buildingCode} onChange={(e) => setForm({ ...form, buildingCode: e.target.value })} required />
                    <select className="border rounded px-3 py-2 text-sm" value={form.blockId} onChange={(e) => setForm({ ...form, blockId: e.target.value })} required>
                        <option value="">Select Block</option>
                        {blocks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.blockCode})</option>)}
                    </select>
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Total Floors" type="number" min="1" value={form.totalFloors} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Zip" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} required />
                    <div className="md:col-span-2 flex gap-2 mt-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{initialData ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BuildingFormModal;
