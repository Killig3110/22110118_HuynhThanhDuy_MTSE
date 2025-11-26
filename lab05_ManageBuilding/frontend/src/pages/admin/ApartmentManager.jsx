import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { apartmentAPI, floorAPI, buildingAPI } from '../../services/api';

const ApartmentManager = () => {
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [apartments, setApartments] = useState([]);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        floorId: '',
        apartmentNumber: '',
        type: '2bhk',
        area: '',
        bedrooms: 2,
        bathrooms: 1,
        monthlyRent: '',
        salePrice: ''
    });

    const loadBuildings = async () => {
        const { data } = await buildingAPI.list({ limit: 100 });
        const list = data.data.buildings || data.data || [];
        setBuildings(list);
        if (!selectedBuilding && list.length) {
            setSelectedBuilding(list[0].id);
        }
    };

    const loadFloors = async (buildingId) => {
        if (!buildingId) return;
        const { data } = await floorAPI.listByBuilding(buildingId, { limit: 200 });
        const list = data.data?.floors || data.data || [];
        setFloors(list);
        if (!selectedFloor && list.length) setSelectedFloor(list[0].id);
    };

    const loadApartments = async (floorId) => {
        if (!floorId) return;
        try {
            setLoading(true);
            const { data } = await apartmentAPI.listByFloor(floorId, { limit: 200 });
            setApartments(data.data || []);
        } catch (error) {
            console.error('Load apartments failed', error);
            toast.error('Load apartments failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBuildings(); }, []);
    useEffect(() => { if (selectedBuilding) loadFloors(selectedBuilding); }, [selectedBuilding]);
    useEffect(() => { if (selectedFloor) loadApartments(selectedFloor); }, [selectedFloor]);

    const submit = async (e) => {
        e.preventDefault();
        if (!selectedFloor) return;
        try {
            const payload = {
                floorId: Number(selectedFloor),
                apartmentNumber: form.apartmentNumber,
                type: form.type,
                area: Number(form.area),
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                monthlyRent: form.monthlyRent ? Number(form.monthlyRent) : null,
                salePrice: form.salePrice ? Number(form.salePrice) : null,
            };
            if (form.id) {
                await apartmentAPI.update(form.id, payload);
                toast.success('Updated apartment');
            } else {
                await apartmentAPI.create(payload);
                toast.success('Created apartment');
            }
            setForm({ id: null, floorId: '', apartmentNumber: '', type: '2bhk', area: '', bedrooms: 2, bathrooms: 1, monthlyRent: '', salePrice: '' });
            loadApartments(selectedFloor);
        } catch (error) {
            console.error('Save apartment failed', error);
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    const edit = (item) => {
        setForm({
            id: item.id,
            floorId: item.floorId,
            apartmentNumber: item.apartmentNumber,
            type: item.type,
            area: item.area,
            bedrooms: item.bedrooms,
            bathrooms: item.bathrooms,
            monthlyRent: item.monthlyRent || '',
            salePrice: item.salePrice || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this apartment?')) return;
        try {
            await apartmentAPI.remove(id);
            toast.success('Deleted apartment');
            loadApartments(selectedFloor);
        } catch (error) {
            console.error('Delete apartment failed', error);
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Apartment Manager</h1>

            <div className="flex flex-wrap gap-2 mb-4">
                <select className="border rounded px-3 py-2 text-sm" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}>
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.buildingCode})</option>
                    ))}
                </select>
                <select className="border rounded px-3 py-2 text-sm" value={selectedFloor} onChange={(e) => setSelectedFloor(e.target.value)}>
                    {floors.map((f) => (
                        <option key={f.id} value={f.id}>Floor {f.floorNumber}</option>
                    ))}
                </select>
                <button onClick={() => loadApartments(selectedFloor)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Reload</button>
            </div>

            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
                <input className="border rounded px-3 py-2 text-sm" placeholder="Apartment No." value={form.apartmentNumber} onChange={(e) => setForm({ ...form, apartmentNumber: e.target.value })} required />
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
                <div className="md:col-span-4 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{form.id ? 'Update' : 'Create'}</button>
                    {form.id && <button type="button" className="px-3 py-2 text-sm text-gray-600" onClick={() => setForm({ id: null, floorId: '', apartmentNumber: '', type: '2bhk', area: '', bedrooms: 2, bathrooms: 1, monthlyRent: '', salePrice: '' })}>Reset</button>}
                </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apt</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Beds/Baths</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rent/Sale</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {apartments.map((a) => (
                                <tr key={a.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{a.apartmentNumber}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{a.type}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{a.bedrooms} / {a.bathrooms}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{a.monthlyRent || '-'} / {a.salePrice || '-'}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => edit(a)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs">Edit</button>
                                        <button onClick={() => remove(a.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && apartments.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={5}>No apartments.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default ApartmentManager;
