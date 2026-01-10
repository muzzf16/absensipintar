import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Briefcase, Download, CheckCircle, Users, MapPin, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import MapComponent from '../components/MapComponent';
import AdminVisitDashboard from '../components/AdminVisitDashboard';
import OfficeManagement from '../components/OfficeManagement';
import UserManagement from '../components/UserManagement';

const AdminDashboard = ({ user }) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalEmployees: 0, presentCount: 0, lateCount: 0, visitCount: 0 });
    const [activeTab, setActiveTab] = useState('absensi'); // absensi, kunjungan, peta, kantor, karyawan
    const [attendanceList, setAttendanceList] = useState([]);
    const [visitList, setVisitList] = useState([]);

    const [offices, setOffices] = useState([]);

    useEffect(() => {
        fetchStats();
        fetchData();
        fetchOffices();
    }, [activeTab]);

    const fetchOffices = async () => {
        try {
            const res = await api.get('/offices');
            setOffices(res.data);
        } catch (error) {
            console.error('Error fetching offices:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/attendance/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchData = async () => {
        try {
            if (activeTab === 'absensi') {
                const res = await api.get('/attendance/all');
                setAttendanceList(res.data);
            } else {
                // Fetch visits for both 'kunjungan' and 'peta' tabs
                const res = await api.get('/visits');
                setVisitList(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleExportAttendance = async () => {
        try {
            const response = await api.get('/attendance/export-csv', {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            alert('Data absensi berhasil di-export!');
        } catch (error) {
            console.error('Export error:', error);
            alert('Gagal export data: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>
                    <p className="text-xs text-gray-500">Monitoring Aktivitas Karyawan</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs font-bold hover:bg-red-50 transition">
                        <LogOut size={14} />
                        Keluar
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 space-y-4">
                {/* Stats Cards Row 1 */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">Total Karyawan</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</h3>
                                <p className="text-xs text-gray-400 mt-1">Karyawan aktif</p>
                            </div>
                            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                                <Users size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">Hadir Hari Ini</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stats.presentCount}</h3>
                                <p className="text-xs text-gray-400 mt-1">{(stats.presentCount / (stats.totalEmployees || 1) * 100).toFixed(0)}% hadir</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-lg text-green-500">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">Terlambat</p>
                                <h3 className="text-2xl font-bold text-orange-500">{stats.lateCount}</h3>
                                <p className="text-xs text-gray-400 mt-1">Masuk telat</p>
                            </div>
                            <div className="p-2 bg-orange-50 rounded-lg text-orange-500">
                                <Clock size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-gray-500 font-bold mb-1">Total Kunjungan</p>
                                <h3 className="text-2xl font-bold text-blue-600">{stats.visitCount}</h3>
                                <p className="text-xs text-gray-400 mt-1">Total aktivitas luar</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                <Briefcase size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="pt-4">
                    <div className="bg-gray-50 p-1 rounded-xl flex mb-4 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('absensi')}
                            className={`flex-1 min-w-[80px] py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'absensi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Clock size={14} />
                            Absensi
                        </button>
                        <button
                            onClick={() => setActiveTab('kunjungan')}
                            className={`flex-1 min-w-[80px] py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'kunjungan' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Briefcase size={14} />
                            Kunjungan
                        </button>
                        <button
                            onClick={() => setActiveTab('peta')}
                            className={`flex-1 min-w-[80px] py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'peta' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <MapPin size={14} />
                            Peta
                        </button>
                        <button
                            onClick={() => setActiveTab('kantor')}
                            className={`flex-1 min-w-[80px] py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'kantor' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Building size={14} />
                            Kantor
                        </button>
                        <button
                            onClick={() => setActiveTab('karyawan')}
                            className={`flex-1 min-w-[80px] py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'karyawan' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'}`}
                        >
                            <Users size={14} />
                            Karyawan
                        </button>
                    </div>

                    {/* Report Card / Map View / Office View */}
                    {activeTab === 'kantor' ? (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                            <OfficeManagement />
                        </div>
                    ) : activeTab === 'karyawan' ? (
                        <UserManagement offices={offices} />
                    ) : activeTab === 'peta' ? (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                            <div className="mb-4">
                                <h3 className="font-bold text-gray-800 text-sm">Peta Kunjungan</h3>
                                <p className="text-[10px] text-gray-400">Sebaran lokasi kunjungan tim.</p>
                            </div>
                            <MapComponent visits={visitList} />
                        </div>
                    ) : (
                        activeTab === 'kunjungan' ? (
                            <AdminVisitDashboard />
                        ) : (
                            // Existing Attendance Table logic
                            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-sm">Laporan Kehadiran</h3>
                                        <p className="text-[10px] text-gray-400">Daftar aktivitas absensi.</p>
                                    </div>
                                    <button onClick={handleExportAttendance} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50">
                                        <Download size={12} />
                                        Export
                                    </button>
                                </div>
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="text-[10px] text-gray-400 border-b border-gray-50">
                                                <th className="pb-2 font-medium">Petugas</th>
                                                <th className="pb-2 font-medium">Waktu</th>
                                                {activeTab === 'absensi' ? (
                                                    <>
                                                        <th className="pb-2 font-medium">Masuk</th>
                                                        <th className="pb-2 font-medium">Status</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th className="pb-2 font-medium">Tujuan</th>
                                                        <th className="pb-2 font-medium">Status</th>
                                                    </>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="text-xs">
                                            {activeTab === 'absensi' ? (
                                                attendanceList.length > 0 ? attendanceList.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                                                        <td className="py-3 pr-2">
                                                            <div className="font-bold text-gray-800">{item.user?.name}</div>
                                                            <div className="text-[10px] text-gray-400">{new Date(item.attendanceDate).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="py-3 text-green-600 font-medium">
                                                            {new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="py-3 text-gray-600">
                                                            {item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                        </td>
                                                        <td className="py-3">
                                                            {/* Mock status logic */}
                                                            <span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-bold">present</span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="py-8 text-center text-gray-400">Belum ada data.</td></tr>
                                                )
                                            ) : (
                                                visitList.length > 0 ? visitList.map((item, idx) => (
                                                    <tr key={idx} className="border-b border-gray-50 last:border-0">
                                                        <td className="py-3 pr-2">
                                                            <div className="font-bold text-gray-800">{item.user?.name}</div>
                                                            <div className="text-[10px] text-gray-400">{item.customer?.name}</div>
                                                        </td>
                                                        <td className="py-3 text-gray-600">
                                                            {new Date(item.visitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </td>
                                                        <td className="py-3 text-gray-800">
                                                            {item.purpose}
                                                        </td>
                                                        <td className="py-3">
                                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr><td colSpan="4" className="py-8 text-center text-gray-400">Belum ada data.</td></tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Modal removed - managed in UserManagement */}
        </div>
    );
};

export default AdminDashboard;
