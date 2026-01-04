import React, { useState, useEffect } from 'react';
import { Download, Filter, MapPin, Calendar, User } from 'lucide-react';
import api from '../utils/axiosConfig';

const AdminVisitDashboard = () => {
    const [visits, setVisits] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        userId: '',
        customerId: ''
    });

    useEffect(() => {
        fetchDropdowns();
        fetchVisits();
    }, []);

    useEffect(() => {
        fetchVisits(); // Refetch when filters change (or use a button to apply)
    }, [filters]);

    const fetchDropdowns = async () => {
        try {
            const usersRes = await api.get('/attendance/all'); // Reuse or create specific endpoint
            // Extract unique users from attendance or better add /users endpoint. 
            // For now, let's assume we can get unique users from the visits or attendance list if no dedicated endpoint.
            // But wait, we need a list of ALL employees. Assuming /attendance/all gives us some, but better to have /users?
            // Let's us basic unique extraction from visits for now as fallback, or better:
            // Modify backend to have /users later. Here I'll try to use what I have.
            // Actually, let's just use the 'attendance/stats' or similar? No.
            // I'll stick to fetching visits and unique-ifying for now to avoid backend creep, or just simple text search/ID input if needed.
            // WAIT: I can just fetch all unique users from the visits list itself for the dropdown? No, that misses people with 0 visits.
            // I'll just skip the exhaustive employee dropdown for now or mock it if needed.
            // Better: use the customer list from /customers.
            const custRes = await api.get('/customers');
            setCustomers(custRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchVisits = async () => {
        try {
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.userId) params.userId = filters.userId;
            if (filters.customerId) params.customerId = filters.customerId;

            const res = await api.get('/visits', { params });
            setVisits(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExport = async () => {
        try {
            const params = {};
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;
            if (filters.userId) params.userId = filters.userId;
            if (filters.customerId) params.customerId = filters.customerId;

            const response = await api.get('/visits/export', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'visits_report.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error("Export failed", err);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this visit?')) return;
        try {
            await api.post(`/visits/${id}/approve`, { status: 'approved' });
            // Optimistic update or refetch
            setVisits(visits.map(v => v.id === id ? { ...v, status: 'approved' } : v));
        } catch (err) {
            console.error(err);
            alert('Failed to approve visit');
        }
    };

    const handleReject = async (id) => {
        const note = window.prompt('Please provide a reason for rejection:');
        if (note === null) return; // Cancelled
        if (!note.trim()) return alert('Rejection note is required');

        try {
            await api.post(`/visits/${id}/approve`, { status: 'rejected', note });
            setVisits(visits.map(v => v.id === id ? { ...v, status: 'rejected', note } : v));
        } catch (err) {
            console.error(err);
            alert('Failed to reject visit');
        }
    };

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Laporan Kunjungan</h3>
                    <p className="text-xs text-gray-400">Monitoring aktivitas lapangan</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-xl text-sm">
                <div>
                    <label className="block text-gray-500 mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg p-2"
                        value={filters.startDate}
                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        className="w-full border rounded-lg p-2"
                        value={filters.endDate}
                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-gray-500 mb-1">Nasabah</label>
                    <select
                        className="w-full border rounded-lg p-2 bg-white"
                        value={filters.customerId}
                        onChange={e => setFilters({ ...filters, customerId: e.target.value })}
                    >
                        <option value="">Semua Nasabah</option>
                        {customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                {/* Employee Filter could go here if we had the list */}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/50">
                            <th className="p-3 font-medium">Tanggal</th>
                            <th className="p-3 font-medium">Karyawan</th>
                            <th className="p-3 font-medium">Nasabah</th>
                            <th className="p-3 font-medium">Tujuan & Catatan</th>
                            <th className="p-3 font-medium">Lokasi</th>
                            <th className="p-3 font-medium">Status & Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {visits.length > 0 ? visits.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                                <td className="p-3">
                                    <div className="font-bold text-gray-700">{new Date(item.visitTime).toLocaleDateString()}</div>
                                    <div className="text-xs text-gray-400">{new Date(item.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="p-3 text-gray-700">
                                    {item.user?.name}
                                </td>
                                <td className="p-3 text-gray-700">
                                    {item.customer?.name}
                                </td>
                                <td className="p-3">
                                    <div className="font-medium text-gray-800">{item.purpose}</div>
                                    <div className="text-xs text-gray-400 italic">"{item.notes || '-'}"</div>
                                </td>
                                <td className="p-3">
                                    <a
                                        href={`https://www.google.com/maps?q=${item.latitude},${item.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-blue-600 hover:underline text-xs"
                                    >
                                        <MapPin size={12} />
                                        Lihat Peta
                                    </a>
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {item.status}
                                        </span>
                                        {/* Action Buttons for Pending */}
                                        {item.status === 'pending' && (
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                                                    title="Approve"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleReject(item.id)}
                                                    className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100"
                                                    title="Reject"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="6" className="py-8 text-center text-gray-400">Tidak ada data kunjungan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminVisitDashboard;
