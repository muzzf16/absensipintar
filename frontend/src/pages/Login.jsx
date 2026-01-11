import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail, Eye, EyeOff, Laptop, User } from 'lucide-react';
import api from '../utils/axiosConfig';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
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
                    <div className="bg-white p-3 rounded-xl">
                        <img src="/bapera.jpg" alt="BAPERA Logo" className="w-16 h-16 object-contain" />
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
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
                                    placeholder="nama@perusahaan.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Key className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
                                    placeholder="Password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="flex justify-end mt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Lupa Password?
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <LoadingSpinner size="sm" />
                                        <span className="ml-2">Memproses...</span>
                                    </>
                                ) : (
                                    'Masuk'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center text-gray-400 text-xs mt-8">
                    © 2026 PT. BPR BAPERA BATANG
                </p>
            </div>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                <Key size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Lupa Password?</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Untuk alasan keamanan, reset password hanya dapat dilakukan oleh Administrator.
                            </p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-sm">
                            <p className="font-bold text-gray-700 mb-1">Silakan hubungi:</p>
                            <div className="flex items-center gap-2 text-gray-600">
                                <User size={14} />
                                <span>Bagian HRD / IT Support</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <Mail size={14} />
                                <span>admin.it@bapera.id</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowForgotPassword(false)}
                            className="w-full bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;
