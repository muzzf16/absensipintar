import React, { useState } from 'react';
import { LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AbsensiTab from '../components/AbsensiTab';
import KunjunganTab from '../components/KunjunganTab';
import AdminDashboard from './AdminDashboard';

const EmployeeDashboard = ({ user, handleLogout }) => {
    const [activeTab, setActiveTab] = useState('presensi'); // presensi or kunjungan

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header Profile Section */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-xl">
                            {user.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 leading-tight">{user.name || 'User Name'}</h2>
                            <p className="text-xs text-gray-500">{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Karyawan'}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition">
                        <LogOut size={20} />
                    </button>
                </div>

                {/* Location Bar */}
                <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2 text-xs text-gray-600">
                    <div className="text-blue-500">
                        <MapPin size={14} />
                    </div>
                    <span>Lokasi: Kantor Pusat (GPS Aktif)</span>
                </div>
            </div>

            {/* Tab Switcher */}
            <div className="px-6 pt-4">
                <div className="bg-gray-50 p-1 rounded-xl flex">
                    <button
                        onClick={() => setActiveTab('presensi')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'presensi' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Presensi
                    </button>
                    <button
                        onClick={() => setActiveTab('kunjungan')}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'kunjungan' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        Kunjungan
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
                {activeTab === 'presensi' ? (
                    <AbsensiTab user={user} />
                ) : (
                    <KunjunganTab user={user} />
                )}
            </div>
        </div>
    );
};

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (user.role === 'supervisor' || user.role === 'admin') {
        return <AdminDashboard user={user} />;
    }

    return <EmployeeDashboard user={user} handleLogout={handleLogout} />;
};

export default Dashboard;
