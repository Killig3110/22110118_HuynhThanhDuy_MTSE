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

const BuildingFormModal = ({ open, onClose, onSave, initialData, blocks = [], defaultBlockId }) => {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

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
            setErrors({});
        } else {
            setForm({
                ...empty,
                blockId: defaultBlockId || ''
            });
            setErrors({});
        }
    }, [initialData, open, defaultBlockId]);

    if (!open) return null;

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Name is required';
        if (!form.buildingCode.trim()) next.buildingCode = 'Code is required';
        if (!form.blockId) next.blockId = 'Block is required';
        if (!form.address.trim()) next.address = 'Address is required';
        if (!form.city.trim()) next.city = 'City is required';
        if (!form.state.trim()) next.state = 'State is required';
        if (!form.zipCode.trim()) next.zipCode = 'Zip is required';
        if (!form.totalFloors || Number(form.totalFloors) <= 0) next.totalFloors = 'Total floors must be greater than 0';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave?.({
            ...form,
            totalFloors: Number(form.totalFloors) || 0
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Building' : 'Add Building'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.name ? 'border-red-500' : ''}`} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.buildingCode ? 'border-red-500' : ''}`} placeholder="Building Code" value={form.buildingCode} onChange={(e) => setForm({ ...form, buildingCode: e.target.value })} />
                        {errors.buildingCode && <p className="text-red-500 text-xs mt-1">{errors.buildingCode}</p>}
                    </div>
                    <div>
                        {defaultBlockId ? (
                            <select className="border rounded px-3 py-2 text-sm bg-gray-100 w-full" value={form.blockId} disabled>
                                <option value={defaultBlockId}>{blocks.find(b => b.id === defaultBlockId)?.name || 'Selected Block'}</option>
                            </select>
                        ) : (
                            <select className={`border rounded px-3 py-2 text-sm w-full ${errors.blockId ? 'border-red-500' : ''}`} value={form.blockId} onChange={(e) => setForm({ ...form, blockId: e.target.value })}>
                                <option value="">Select Block</option>
                                {blocks.map(b => <option key={b.id} value={b.id}>{b.name} ({b.blockCode})</option>)}
                            </select>
                        )}
                        {errors.blockId && <p className="text-red-500 text-xs mt-1">{errors.blockId}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.totalFloors ? 'border-red-500' : ''}`} placeholder="Total Floors" type="number" min="1" value={form.totalFloors} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} />
                        {errors.totalFloors && <p className="text-red-500 text-xs mt-1">{errors.totalFloors}</p>}
                    </div>
                    <div className="md:col-span-2">
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.address ? 'border-red-500' : ''}`} placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.city ? 'border-red-500' : ''}`} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.state ? 'border-red-500' : ''}`} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                        {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.zipCode ? 'border-red-500' : ''}`} placeholder="Zip" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
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
