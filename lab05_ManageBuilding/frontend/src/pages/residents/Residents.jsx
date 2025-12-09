import React, { useEffect, useState } from 'react';
import { Users, Mail, Phone, Home } from 'lucide-react';
import { userAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const Residents = () => {
    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await userAPI.getUsers({ role: 'resident', limit: 200 });
                const list = res.data?.data?.users || res.data?.data || res.data?.items || res.data || [];
                const normalized = Array.isArray(list) ? list : [];
                const onlyResidents = normalized.filter((u) => u.role?.name === 'resident');
                setResidents(onlyResidents);
            } catch (error) {
                console.error('Load residents failed', error);
                toast.error('Failed to load residents');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto py-8 px-4">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-600" />
                            Residents
                        </h1>
                        <p className="text-gray-600">List of active residents and their contact info.</p>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="min-w-full divide-y divide-gray-200">
                        <div className="grid grid-cols-4 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">
                            <div>Name</div>
                            <div>Email</div>
                            <div>Phone</div>
                            <div>Role</div>
                        </div>
                        {loading ? (
                            <div className="p-6 text-center text-gray-500">Loading residents...</div>
                        ) : residents.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">No residents found.</div>
                        ) : (
                            residents.map((resident) => (
                                <div key={resident.id} className="grid grid-cols-4 px-4 py-3 hover:bg-gray-50 text-sm">
                                    <div className="flex items-center gap-2 text-gray-900">
                                        <Home className="h-4 w-4 text-blue-500" />
                                        {resident.firstName} {resident.lastName}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Mail className="h-4 w-4 text-gray-400" />
                                        {resident.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        {resident.phone || 'N/A'}
                                    </div>
                                    <div className="text-gray-700">{resident.role?.name || 'resident'}</div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Residents;
