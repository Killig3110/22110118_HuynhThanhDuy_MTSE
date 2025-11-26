import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { userAPI } from '../../services/api';

const UserManager = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        id: null,
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        roleId: ''
    });

    const load = async () => {
        try {
            setLoading(true);
            const { data } = await userAPI.getUsers({ limit: 100 });
            setUsers(data.data.users || data.data || []);
        } catch (error) {
            console.error('Load users failed', error);
            toast.error('Load users failed');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const submit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                firstName: form.firstName,
                lastName: form.lastName,
                email: form.email,
                password: form.password || undefined,
                phone: form.phone,
                roleId: form.roleId || undefined
            };
            if (form.id) {
                await userAPI.updateUser(form.id, payload);
                toast.success('Updated user');
            } else {
                await userAPI.createUser(payload);
                toast.success('Created user');
            }
            setForm({ id: null, firstName: '', lastName: '', email: '', password: '', phone: '', roleId: '' });
            load();
        } catch (error) {
            console.error('Save user failed', error);
            toast.error(error.response?.data?.message || 'Save failed');
        }
    };

    const edit = (u) => {
        setForm({
            id: u.id,
            firstName: u.firstName || '',
            lastName: u.lastName || '',
            email: u.email || '',
            password: '',
            phone: u.phone || '',
            roleId: u.roleId || ''
        });
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            await userAPI.deleteUser(id);
            toast.success('Deleted user');
            load();
        } catch (error) {
            console.error('Delete user failed', error);
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">User Manager</h1>

            <form onSubmit={submit} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <input className="border rounded px-3 py-2 text-sm" placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <input className="border rounded px-3 py-2 text-sm" placeholder="Role ID" value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })} />
                <div className="md:col-span-3 flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-sm rounded">{form.id ? 'Update' : 'Create'}</button>
                    {form.id && <button type="button" className="px-3 py-2 text-sm text-gray-600" onClick={() => setForm({ id: null, firstName: '', lastName: '', email: '', password: '', phone: '', roleId: '' })}>Reset</button>}
                </div>
            </form>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.map((u) => (
                                <tr key={u.id}>
                                    <td className="px-4 py-2 text-sm text-gray-800">{u.firstName} {u.lastName}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{u.email}</td>
                                    <td className="px-4 py-2 text-sm text-gray-600">{u.role?.name || u.roleId}</td>
                                    <td className="px-4 py-2 text-sm space-x-2">
                                        <button onClick={() => edit(u)} className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-xs">Edit</button>
                                        <button onClick={() => remove(u.id)} className="px-3 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && users.length === 0 && (
                                <tr><td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>No users.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {loading && <div className="py-3 text-center text-sm text-gray-500">Loading...</div>}
            </div>
        </div>
    );
};

export default UserManager;
