import React, { useState, useEffect } from 'react';
import { Users, Edit2, Trash2, Plus, X, Search } from 'lucide-react';
import api from '../utils/axiosConfig';

const UserManagement = ({ offices }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'karyawan',
        officeId: '',
        phone: '',
        position: '',
        nik: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Gagal mengambil data user');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, formData);
                alert('User berhasil diupdate');
            } else {
                await api.post('/users', formData);
                alert('User berhasil ditambahkan');
            }
            setShowModal(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            alert('Gagal menyimpan user: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus user ini?')) return;
        try {
            await api.delete(`/users/${id}`);
            alert('User berhasil dihapus');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Gagal menghapus user: ' + (error.response?.data?.message || error.message));
        }
    };

    const openEditModal = (user) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            password: '', // Leave empty for edit unless changing
            role: user.role,
            officeId: user.officeId || '',
            phone: user.phone || '',
            position: user.position || '',
            nik: user.nik || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'karyawan',
            officeId: '',
            phone: '',
            position: '',
            nik: ''
        });
    };

    return (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="font-bold text-gray-800 text-lg">Manajemen User</h3>
                    <p className="text-xs text-gray-400">Kelola data karyawan dan akses sistem.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
                >
                    <Plus size={16} />
                    Tambah User
                </button>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-400">Loading details...</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs text-gray-400 border-b border-gray-50 bg-gray-50/50">
                                <th className="p-3 font-medium rounded-tl-lg">Nama</th>
                                <th className="p-3 font-medium">Role</th>
                                <th className="p-3 font-medium">Kantor</th>
                                <th className="p-3 font-medium rounded-tr-lg text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {users.length > 0 ? (
                                users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                                        <td className="p-3">
                                            <div className="font-bold text-gray-800">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase
                                                ${user.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                                                    user.role === 'supervisor' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-green-50 text-green-600'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 text-xs">
                                            {user.office?.name || '-'}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400">Belum ada data user.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingUser ? 'Edit User' : 'Tambah User Baru'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Password {editingUser && <span className="text-gray-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    required={!editingUser}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="karyawan">Karyawan</option>
                                        <option value="supervisor">Supervisor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Kantor</label>
                                    <select
                                        name="officeId"
                                        value={formData.officeId}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {offices.map(office => (
                                            <option key={office.id} value={office.id}>{office.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
