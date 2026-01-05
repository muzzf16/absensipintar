import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Camera, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/axiosConfig';

const KunjunganTab = () => {
    const [showForm, setShowForm] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerId: '',
        purpose: '',
        notes: '',
        latitude: null,
        longitude: null,
        photoUrl: ''
    });

    useEffect(() => {
        fetchCustomers();
        fetchRecentVisits();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await api.get('/customers');
            setCustomers(res.data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        }
    };

    const fetchRecentVisits = async () => {
        try {
            const res = await api.get('/visits');
            setRecentVisits(res.data.slice(0, 3)); // Get latest 3 visits
        } catch (err) {
            console.error('Failed to fetch visits:', err);
        }
    };

    const captureGPS = () => {
        setGpsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData({
                        ...formData,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                    setGpsLoading(false);
                    alert(`GPS berhasil ditangkap!\nLat: ${position.coords.latitude.toFixed(6)}\nLng: ${position.coords.longitude.toFixed(6)}`);
                },
                (error) => {
                    setGpsLoading(false);
                    alert('Gagal mendapatkan lokasi GPS. Pastikan GPS aktif dan izin lokasi diberikan.');
                    console.error('GPS Error:', error);
                }
            );
        } else {
            setGpsLoading(false);
            alert('Browser tidak mendukung GPS');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.customerId) {
            alert('Pilih nasabah terlebih dahulu');
            return;
        }
        if (!formData.purpose.trim()) {
            alert('Tujuan kunjungan wajib diisi');
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            alert('Lokasi GPS wajib ditangkap. Klik "Tangkap Lokasi GPS"');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/visits', formData);
            alert('✅ Kunjungan berhasil disimpan!');

            // Reset form
            setFormData({
                customerId: '',
                purpose: '',
                notes: '',
                latitude: null,
                longitude: null,
                photoUrl: ''
            });
            setShowForm(false);
            fetchRecentVisits(); // Refresh the list
        } catch (err) {
            console.error('Submit error:', err);
            const errorMsg = err.response?.data?.message || 'Gagal menyimpan kunjungan';
            alert(`❌ ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    return (
        <div className="pt-8">
            {!showForm ? (
                <>
                    <div className="flex flex-col items-center justify-center py-10">
                        <div className="bg-blue-50 p-6 rounded-full text-blue-500 mb-4">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">Kunjungan Nasabah</h3>
                        <p className="text-gray-400 text-sm text-center max-w-[200px] mt-1">
                            Catat aktivitas kunjungan Anda ke nasabah hari ini.
                        </p>

                        <button
                            onClick={() => setShowForm(true)}
                            className="mt-8 bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-600/30 w-full max-w-xs hover:bg-blue-700 transition"
                        >
                            Tambah Kunjungan
                        </button>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                        <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
                            <div className="w-5 h-5 rounded-full border border-blue-500 flex items-center justify-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                            Kunjungan Terakhir
                        </div>

                        {recentVisits.length > 0 ? (
                            <div className="space-y-3">
                                {recentVisits.map((visit) => (
                                    <div key={visit.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{visit.customer?.name}</p>
                                                <p className="text-xs text-gray-500">{new Date(visit.visitTime).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${visit.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    visit.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {visit.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-600">{visit.purpose}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                Belum ada catatan kunjungan.
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Form Kunjungan</h3>
                        <button
                            onClick={() => setShowForm(false)}
                            className="text-sm text-gray-400 hover:text-gray-600"
                            disabled={loading}
                        >
                            Batal
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Nasabah *</label>
                            <select
                                value={formData.customerId}
                                onChange={(e) => handleInputChange('customerId', e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                                required
                            >
                                <option value="">-- Pilih Nasabah --</option>
                                {customers.map((customer) => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Purpose */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan Kunjungan *</label>
                            <textarea
                                value={formData.purpose}
                                onChange={(e) => handleInputChange('purpose', e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm h-24"
                                placeholder="Contoh: Presentasi produk baru, follow up invoice, dll."
                                required
                            />
                        </div>

                        {/* Notes (Optional) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Catatan (Opsional)</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm h-20"
                                placeholder="Catatan tambahan..."
                            />
                        </div>

                        {/* GPS Capture */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Lokasi GPS *</label>
                            <button
                                type="button"
                                onClick={captureGPS}
                                disabled={gpsLoading}
                                className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition ${formData.latitude ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                {formData.latitude ? (
                                    <>
                                        <CheckCircle size={24} className="mb-2 text-green-600" />
                                        <span className="text-xs text-green-700 font-bold">GPS Berhasil Ditangkap</span>
                                        <span className="text-xs text-gray-500 mt-1">
                                            {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <MapPin size={24} className="mb-2 text-gray-400" />
                                        <span className="text-xs text-gray-600">
                                            {gpsLoading ? 'Menangkap lokasi...' : 'Klik untuk tangkap lokasi GPS'}
                                        </span>
                                    </>
                                )}
                            </button>
                            {!formData.latitude && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Lokasi GPS wajib untuk validasi kunjungan
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full font-bold py-3 rounded-xl mt-4 shadow-lg transition ${loading
                                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    : 'bg-blue-600 text-white shadow-blue-600/30 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Laporan'}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default KunjunganTab;
