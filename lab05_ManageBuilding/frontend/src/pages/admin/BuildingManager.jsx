import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { buildingAPI, blockAPI } from '../../services/api';

const BuildingManager = () => {
    const [items, setItems] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        name: '',
        blockId: '',
        buildingCode: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        totalFloors: 1
    });

    const load = async () => {
        try {
            setLoading(true);
            const [bRes, blkRes] = await Promise.all([
                buildingAPI.list({ limit: 100 }),
                blockAPI.list({ limit: 100 })
            ]);
            setItems(bRes.data.data.buildings || bRes.data.data || []);
            setBlocks(blkRes.data.data || []);
        } catch (error) {
            console.error('Load buildings failed', error);
            toast.error('Load buildings failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: form.name,
                blockId: Number(form.blockId),
                buildingCode: form.buildingCode,
                address: form.address,
                city: form.city,
                state: form.state,
                zipCode: form.zipCode,
                totalFloors: Number(form.totalFloors)
            };
            if (form.id) {
                await buildingAPI.update(form.id, payload);
                toast.success('Updated building');
            } else {
                await buildingAPI.create(payload);
                toast.success('Created building');
            }
            setForm({ id: null, name: '', blockId: '', buildingCode: '', address: '', city: '', state: '', zipCode: '', totalFloors: 1 });
            load();
        } catch (error) {
            console.error('Save building failed', error);
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    const edit = (item) => {
        setForm({
            id: item.id,
            name: item.name || '',
            blockId: item.blockId || '',
            buildingCode: item.buildingCode || '',
            address: item.address || '',
            city: item.city || '',
            state: item.state || '',
            zipCode: item.zipCode || '',
            totalFloors: item.totalFloors || 1
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this building?')) return;
        try {
            await buildingAPI.remove(id);
            toast.success('Deleted building');
            load();
        } catch (error) {
            console.error('Delete building failed', error);
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Building Manager</h1>

            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <select className="border rounded px-3 py-2 text-sm" value={form.blockId} onChange={(e) => setForm({ ...form, blockId: e.target.value })} required>
                    <option value="">Select Block</option>
                    {blocks.map((b) => <option key={b.id} value={b.id}>{b.name} ({b.blockCode})</option>)}
                </select>
                <input className="border rounded px-3 py-2 text-sm" placeholder="Building Code" value={form.buildingCode} onChange={(e) => setForm({ ...form, buildingCode: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Zip" value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" type="number" min="1" max="200" placeholder="Total Floors" value={form.totalFloors} onChange={(e) => setForm({ ...form, totalFloors: e.target.value })} />
                <div className="md:col-span-3 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{form.id ? 'Update' : 'Create'}</button>
                    {form.id && <button type="button" className="px-3 py-2 text-sm text-gray-600" onClick={() => setForm({ id: null, name: '', blockId: '', buildingCode: '', address: '', city: '', state: '', zipCode: '', totalFloors: 1 })}>Reset</button>}
                </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Block</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Floors</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{b.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{b.buildingCode}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{b.block?.name || b.blockId}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{b.totalFloors}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => edit(b)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs">Edit</button>
                                        <button onClick={() => remove(b.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && items.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={5}>No buildings.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default BuildingManager;
