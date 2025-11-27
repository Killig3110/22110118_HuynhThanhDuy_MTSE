import React, { useEffect, useState } from 'react';

const empty = {
    buildingId: '',
    floorNumber: '',
    totalApartments: 1
};

const FloorFormModal = ({ open, onClose, onSave, initialData, buildingOptions = [], defaultBuildingId }) => {
    const [form, setForm] = useState(empty);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (initialData) {
            setForm({
                buildingId: initialData.buildingId || '',
                floorNumber: initialData.floorNumber || '',
                totalApartments: initialData.totalApartments || 1
            });
            setErrors({});
        } else {
            setForm({
                ...empty,
                buildingId: defaultBuildingId || ''
            });
            setErrors({});
        }
    }, [initialData, open, defaultBuildingId]);

    if (!open) return null;

    const validate = () => {
        const next = {};
        if (!form.buildingId) next.buildingId = 'Building is required';
        if (!form.floorNumber || Number(form.floorNumber) < 0) next.floorNumber = 'Floor number must be 0 or more';
        if (!form.totalApartments || Number(form.totalApartments) <= 0) next.totalApartments = 'Total apartments must be greater than 0';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const submit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave?.({
            ...form,
            floorNumber: Number(form.floorNumber),
            totalApartments: Number(form.totalApartments)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Floor' : 'Add Floor'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 gap-3">
                    {defaultBuildingId ? (
                        <select className="border rounded px-3 py-2 text-sm bg-gray-100" value={form.buildingId} disabled>
                            <option value={defaultBuildingId}>{buildingOptions.find(b => b.id === defaultBuildingId)?.name || 'Selected Building'}</option>
                        </select>
                    ) : (
                        <select className={`border rounded px-3 py-2 text-sm ${errors.buildingId ? 'border-red-500' : ''}`} value={form.buildingId} onChange={(e) => setForm({ ...form, buildingId: e.target.value })}>
                            <option value="">Select Building</option>
                            {buildingOptions.map(b => <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>)}
                        </select>
                    )}
                    {errors.buildingId && <p className="text-red-500 text-xs -mt-2">{errors.buildingId}</p>}
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.floorNumber ? 'border-red-500' : ''}`} type="number" placeholder="Floor Number" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} />
                        {errors.floorNumber && <p className="text-red-500 text-xs mt-1">{errors.floorNumber}</p>}
                    </div>
                    <div>
                        <input className={`border rounded px-3 py-2 text-sm w-full ${errors.totalApartments ? 'border-red-500' : ''}`} type="number" placeholder="Total Apartments" value={form.totalApartments} onChange={(e) => setForm({ ...form, totalApartments: e.target.value })} />
                        {errors.totalApartments && <p className="text-red-500 text-xs mt-1">{errors.totalApartments}</p>}
                    </div>
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
