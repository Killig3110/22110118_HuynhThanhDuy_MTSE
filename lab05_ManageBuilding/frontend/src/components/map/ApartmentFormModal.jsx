import React, { useEffect, useState } from 'react';

const empty = {
    floorId: '',
    apartmentNumber: '',
    type: '2bhk',
    area: '',
    bedrooms: 2,
    bathrooms: 1,
    monthlyRent: '',
    salePrice: ''
};

const ApartmentFormModal = ({ open, onClose, onSave, initialData, floorOptions = [] }) => {
    const [form, setForm] = useState(empty);

    useEffect(() => {
        if (initialData) {
            setForm({
                floorId: initialData.floorId || '',
                apartmentNumber: initialData.apartmentNumber || '',
                type: initialData.type || '2bhk',
                area: initialData.area || '',
                bedrooms: initialData.bedrooms || 2,
                bathrooms: initialData.bathrooms || 1,
                monthlyRent: initialData.monthlyRent || '',
                salePrice: initialData.salePrice || ''
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
                    <h3 className="text-lg font-semibold text-gray-900">{initialData ? 'Edit Apartment' : 'Add Apartment'}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <select className="border rounded px-3 py-2 text-sm" value={form.floorId} onChange={(e) => setForm({ ...form, floorId: e.target.value })} required>
                        <option value="">Select Floor</option>
                        {floorOptions.map(f => <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>)}
                    </select>
                    <input className="border rounded px-3 py-2 text-sm" placeholder="Apartment Number" value={form.apartmentNumber} onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })} required />
                    <select className="border rounded px-3 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                        <option value="studio">Studio</option>
                        <option value="1bhk">1bhk</option>
                        <option value="2bhk">2bhk</option>
                        <option value="3bhk">3bhk</option>
                        <option value="4bhk">4bhk</option>
                        <option value="penthouse">Penthouse</option>
                        <option value="duplex">Duplex</option>
                    </select>
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Area" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Bedrooms" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Bathrooms" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} required />
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Monthly Rent" value={form.monthlyRent} onChange={(e) => setForm({ ...form, monthlyRent: e.target.value })} />
                    <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Sale Price" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} />
                    <div className="md:col-span-2 flex gap-2 mt-2">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{initialData ? 'Update' : 'Create'}</button>
                        <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-gray-600">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApartmentFormModal;
