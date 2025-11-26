import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { blockAPI } from '../../services/api';

const BlockManager = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        name: '',
        blockCode: '',
        location: '',
        totalBuildings: 1,
        description: ''
    });

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await blockAPI.list({ limit: 100 });
            setItems(data.data || []);
        } catch (error) {
            console.error('Load blocks failed', error);
            toast.error('Load blocks failed');
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
                blockCode: form.blockCode,
                location: form.location,
                totalBuildings: Number(form.totalBuildings),
                description: form.description
            };
            if (form.id) {
                await blockAPI.update(form.id, payload);
                toast.success('Updated block');
            } else {
                await blockAPI.create(payload);
                toast.success('Created block');
            }
            setForm({ id: null, name: '', blockCode: '', location: '', totalBuildings: 1, description: '' });
            load();
        } catch (error) {
            console.error('Save block failed', error);
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    const edit = (item) => {
        setForm({
            id: item.id,
            name: item.name || '',
            blockCode: item.blockCode || '',
            location: item.location || '',
            totalBuildings: item.totalBuildings || 1,
            description: item.description || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this block?')) return;
        try {
            await blockAPI.remove(id);
            toast.success('Deleted block');
            load();
        } catch (error) {
            console.error('Delete block failed', error);
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Block Manager</h1>
            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input className="border rounded px-3 py-2 text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Block Code" value={form.blockCode} onChange={(e) => setForm({ ...form, blockCode: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" type="number" min="1" max="50" placeholder="Total Buildings" value={form.totalBuildings} onChange={(e) => setForm({ ...form, totalBuildings: e.target.value })} />
                <input className="border rounded px-3 py-2 text-sm md:col-span-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="md:col-span-2 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{form.id ? 'Update' : 'Create'}</button>
                    {form.id && <button type="button" className="px-3 py-2 text-sm text-gray-600" onClick={() => setForm({ id: null, name: '', blockCode: '', location: '', totalBuildings: 1, description: '' })}>Reset</button>}
                </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {items.map((b) => (
                                <tr key={b.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{b.name}</td>
                                    <td className="px-4 py-2 text-sm text-gray-800">{b.blockCode}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{b.location}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => edit(b)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs">Edit</button>
                                        <button onClick={() => remove(b.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && items.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>No blocks.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default BlockManager;
