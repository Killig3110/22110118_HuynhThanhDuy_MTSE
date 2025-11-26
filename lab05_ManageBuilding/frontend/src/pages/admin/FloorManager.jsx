import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { floorAPI, buildingAPI } from '../../services/api';

const FloorManager = () => {
    const [buildings, setBuildings] = useState([]);
    const [floors, setFloors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [form, setForm] = useState({
        id: null,
        buildingId: '',
        floorNumber: '',
        totalApartments: 1
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
        try {
            setLoading(true);
            const { data } = await floorAPI.listByBuilding(buildingId, { limit: 200 });
            setFloors(data.data?.floors || data.data || []);
        } catch (error) {
            console.error('Load floors failed', error);
            toast.error('Load floors failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadBuildings(); }, []);
    useEffect(() => { loadFloors(selectedBuilding); }, [selectedBuilding]);

    const submit = async (e) => {
        e.preventDefault();
        if (!selectedBuilding) return;
        try {
            const payload = {
                buildingId: Number(selectedBuilding),
                floorNumber: Number(form.floorNumber),
                totalApartments: Number(form.totalApartments)
            };
            if (form.id) {
                await floorAPI.update(form.id, payload);
                toast.success('Updated floor');
            } else {
                await floorAPI.create(payload);
                toast.success('Created floor');
            }
            setForm({ id: null, buildingId: '', floorNumber: '', totalApartments: 1 });
            loadFloors(selectedBuilding);
        } catch (error) {
            console.error('Save floor failed', error);
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    const edit = (item) => {
        setForm({
            id: item.id,
            buildingId: item.buildingId,
            floorNumber: item.floorNumber,
            totalApartments: item.totalApartments
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this floor?')) return;
        try {
            await floorAPI.remove(id);
            toast.success('Deleted floor');
            loadFloors(selectedBuilding);
        } catch (error) {
            console.error('Delete floor failed', error);
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Floor Manager</h1>

            <div className="flex flex-wrap gap-2 mb-4">
                <select
                    className="border rounded px-3 py-2 text-sm"
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                >
                    {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.name} ({b.buildingCode})
                        </option>
                    ))}
                </select>
                <button onClick={() => loadFloors(selectedBuilding)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded">Reload</button>
            </div>

            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Floor Number" value={form.floorNumber} onChange={(e) => setForm({ ...form, floorNumber: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" type="number" placeholder="Total Apartments" value={form.totalApartments} onChange={(e) => setForm({ ...form, totalApartments: e.target.value })} required />
                <div className="flex gap-2 items-center">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{form.id ? 'Update' : 'Create'}</button>
                    {form.id && <button type="button" className="px-3 py-2 text-sm text-gray-600" onClick={() => setForm({ id: null, buildingId: '', floorNumber: '', totalApartments: 1 })}>Reset</button>}
                </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Floor</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Apts</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {floors.map((f) => (
                                <tr key={f.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">#{f.floorNumber}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{f.totalApartments}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => edit(f)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs">Edit</button>
                                        <button onClick={() => remove(f.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && floors.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={3}>No floors.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default FloorManager;
