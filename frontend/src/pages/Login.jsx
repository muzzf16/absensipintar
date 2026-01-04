import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { Laptop, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        }
    };

    const fillCredentials = (type) => {
        if (type === 'karyawan') {
            setEmail('karyawan@company.com');
            setPassword('password123');
        } else {
            setEmail('spv@company.com');
            setPassword('password123');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            {/* Top Section - Blue Header */}
            <div className="bg-blue-500 h-[45vh] relative flex flex-col items-center justify-center text-white p-6 pb-16 rounded-b-[3rem] shadow-lg">
                <div className="bg-white/20 p-4 rounded-2xl mb-4 backdrop-blur-sm">
                    <div className="bg-white text-blue-500 p-2 rounded-xl">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-1">Absensi Mobile</h1>
                <p className="text-blue-100 text-sm">Sistem absensi karyawan terintegrasi</p>
            </div>

            {/* Main Content Card */}
            <div className="flex-1 px-6 -mt-12 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <p className="text-center text-gray-400 text-xs mb-4">Pilih akun demo untuk mencoba aplikasi</p>

                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => fillCredentials('karyawan')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            <User size={16} />
                            Karyawan
                        </button>
                        <button
                            onClick={() => fillCredentials('admin')}
                            className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            <Laptop size={16} />
                            Admin HR
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-xs p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Email</label>
                            <input
                                type="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="nama@perusahaan.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition transform active:scale-95"
                            >
                                Masuk
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    © 2026 PT. Absensi Pintar Indonesia
                </p>
            </div>
        </div>
    );
};

export default Login;
