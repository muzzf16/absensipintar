import React, { useState, useEffect, useRef } from 'react';
import { Briefcase, MapPin, AlertCircle, CheckCircle, CreditCard, User, Camera, X } from 'lucide-react';
import api from '../utils/axiosConfig';

const PRODUCT_OPTIONS = [
    { code: 'TAB_UMUM', name: 'Tabungan Umum' },
    { code: 'TAB_BERJANGKA', name: 'Tabungan Berjangka' },
    { code: 'DEP_OS', name: 'Deposito' },
    { code: 'KREDIT_MIKRO', name: 'Kredit Mikro' },
    { code: 'KREDIT_KONSUMTIF', name: 'Kredit Konsumtif' },
    { code: 'OTHER', name: 'Lainnya' }
];

const KunjunganTab = () => {
    const [showForm, setShowForm] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [billings, setBillings] = useState([]); // Active billings
    const [recentVisits, setRecentVisits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);

    // Camera State
    const [showCamera, setShowCamera] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '', // For manual input
        purpose: 'SERVICE_ONLY',
        notes: '',
        latitude: null,
        longitude: null,
        photoUrl: '',
        // Marketing Fields
        marketingProducts: [], // Array of codes
        prospectStatus: '', // NOT_INTERESTED, INTERESTED, IN_PROGRESS, REALIZED
        potentialValue: '',
        marketingNotes: '',
        followUpAt: ''
    });

    const [selectedBilling, setSelectedBilling] = useState(null);

    useEffect(() => {
        fetchCustomers();
        fetchBillings();
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

    const fetchBillings = async () => {
        try {
            const res = await api.get('/billing');
            setBillings(res.data);
        } catch (err) {
            console.error('Failed to fetch billings:', err);
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

    const handleOpenCamera = async () => {
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }, // Default to back camera for visits
                audio: false
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            // Fallback to user camera if environment fails (e.g. laptop)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setCameraStream(stream);
                if (videoRef.current) videoRef.current.srcObject = stream;
            } catch (error) {
                alert('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
                setShowCamera(false);
            }
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;
        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Set dimensions (reduce size for performance/storage)
        const maxWidth = 800;
        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        // Compress to JPEG 0.6
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setFormData({ ...formData, photoUrl: photoDataUrl });
        closeCamera();
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
        setCameraStream(null);
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

    const handleProductToggle = (code) => {
        const current = formData.marketingProducts;
        if (current.includes(code)) {
            setFormData({ ...formData, marketingProducts: current.filter(c => c !== code) });
        } else {
            setFormData({ ...formData, marketingProducts: [...current, code] });
        }
    };

    const handleBillingSelect = (billingId) => {
        const billing = billings.find(b => b.id === billingId);
        if (billing) {
            setSelectedBilling(billing);
            setFormData({
                ...formData,
                customerId: billingId, // Using billing ID as reference if needed, or just name
                customerName: billing.customerName,
                notes: `Tagih Angsuran: Total Rp ${billing.total.toLocaleString('id-ID')}`
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.purpose === 'TAGIH_ANGSURAN' && !selectedBilling) {
            alert('Pilih nasabah yang akan ditagih');
            return;
        }
        if (formData.purpose !== 'TAGIH_ANGSURAN' && !formData.customerName && !formData.customerId) {
            alert('Nama nasabah wajib diisi/dipilih');
            return;
        }
        if (!formData.purpose) {
            alert('Tujuan kunjungan wajib diisi');
            return;
        }
        if (!formData.latitude || !formData.longitude) {
            alert('Lokasi GPS wajib ditangkap. Klik "Tangkap Lokasi GPS"');
            return;
        }
        if (!formData.photoUrl) {
            alert('Foto kunjungan wajib diambil. Klik "Ambil Foto"');
            return;
        }

        setLoading(true);
        try {
            // Prepare payload - backend will handle customer creation if needed
            const payload = {
                customerId: formData.customerId || null,
                customerName: formData.customerName || selectedBilling?.customerName || null,
                purpose: formData.purpose,
                notes: formData.notes,
                photoUrl: formData.photoUrl,
                latitude: formData.latitude,
                longitude: formData.longitude,
            };

            // Add Marketing Data if applicable
            if (formData.purpose !== 'SERVICE_ONLY' && formData.purpose !== 'TAGIH_ANGSURAN') {
                payload.prospectStatus = formData.prospectStatus;
                payload.potentialValue = formData.potentialValue;
                payload.marketingNotes = formData.marketingNotes;
                payload.followUpAt = formData.followUpAt;

                // Transform products
                if (formData.marketingProducts.length > 0) {
                    payload.products = formData.marketingProducts.map(code => {
                        const prod = PRODUCT_OPTIONS.find(p => p.code === code);
                        return {
                            productCode: code,
                            productName: prod?.name || code,
                            prospectStatus: null,
                            potentialValue: null
                        };
                    });
                }
            }

            const response = await api.post('/visits', payload);
            alert('✅ Kunjungan berhasil disimpan!');

            // Reset form
            setFormData({
                customerId: '',
                customerName: '',
                purpose: 'SERVICE_ONLY',
                notes: '',
                latitude: null,
                longitude: null,
                photoUrl: '',
                marketingProducts: [],
                prospectStatus: '',
                potentialValue: '',
                marketingNotes: '',
                followUpAt: ''
            });
            setShowForm(false);
            setSelectedBilling(null);
            fetchRecentVisits(); // Refresh the list
        } catch (error) {
            console.error("Submit error:", error);
            alert(`Gagal: ${error.response?.data?.message || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    };

    const isMarketing = ['SERVICE_AND_OFFERING', 'OFFERING_ONLY'].includes(formData.purpose);
    const isBilling = formData.purpose === 'TAGIH_ANGSURAN';

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
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                {visit.purpose?.replace(/_/g, ' ')}
                                            </span>
                                            {visit.visitProducts && visit.visitProducts.length > 0 && (
                                                <span className="text-xs text-blue-600 font-medium">
                                                    {visit.visitProducts.length} Produk
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 italic">"{visit.notes || '-'}"</p>
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

                        {/* Purpose */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan Kunjungan *</label>
                            <select
                                value={formData.purpose}
                                onChange={(e) => {
                                    handleInputChange('purpose', e.target.value);
                                    setFormData(prev => ({ ...prev, purpose: e.target.value, customerId: '', customerName: '' }));
                                    setSelectedBilling(null);
                                }}
                                className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                                required
                            >
                                <option value="SERVICE_ONLY">Layanan Rutin (Service)</option>
                                <option value="SERVICE_AND_OFFERING">Layanan & Penawaran Produk</option>
                                <option value="OFFERING_ONLY">Penawaran Produk (Prospek Baru)</option>
                                <option value="TAGIH_ANGSURAN">Tagih Angsuran Kredit</option>
                            </select>
                        </div>

                        {/* Customer Selection Logic */}
                        {isBilling ? (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Nasabah Tagihan *</label>
                                <select
                                    onChange={(e) => handleBillingSelect(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm"
                                    required
                                >
                                    <option value="">-- Pilih Tagihan Nasabah --</option>
                                    {billings.map((bill) => (
                                        <option key={bill.id} value={bill.id}>
                                            {bill.customerName} - Rp {bill.total.toLocaleString()}
                                        </option>
                                    ))}
                                </select>

                                {/* Billing Details Card */}
                                {selectedBilling && (
                                    <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                                            <CreditCard size={16} />
                                            Detail Tagihan
                                        </h4>
                                        <div className="space-y-2 text-sm text-gray-700">
                                            <div className="flex justify-between">
                                                <span>Pokok:</span>
                                                <span className="font-semibold">Rp {selectedBilling.principal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Bunga:</span>
                                                <span className="font-semibold">Rp {selectedBilling.interest.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-red-600">
                                                <span>Denda:</span>
                                                <span className="font-semibold">Rp {selectedBilling.penalty.toLocaleString()}</span>
                                            </div>
                                            <div className="border-t border-red-200 pt-2 flex justify-between font-bold text-lg">
                                                <span>Total:</span>
                                                <span>Rp {selectedBilling.total.toLocaleString()}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 text-right">
                                                Jatuh Tempo: {new Date(selectedBilling.dueDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Nasabah / Calon Nasabah *</label>
                                {/* Manual Input with Datalist suggestion */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        list="customer-list"
                                        value={formData.customerName}
                                        onChange={(e) => {
                                            const inputName = e.target.value;
                                            const match = customers.find(c => c.name.toLowerCase() === inputName.toLowerCase());
                                            setFormData({
                                                ...formData,
                                                customerName: inputName,
                                                customerId: match ? match.id : ''
                                            });
                                        }}
                                        className="w-full p-3 pl-10 rounded-xl border border-gray-200 bg-white text-sm text-gray-800"
                                        placeholder="Ketik nama nasabah..."
                                        autoComplete="off"
                                        required
                                    />
                                    <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <datalist id="customer-list">
                                        {customers.map((c) => (
                                            <option key={c.id} value={c.name} />
                                        ))}
                                    </datalist>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 ml-1">Ketik manual atau pilih dari saran</p>
                            </div>
                        )}


                        {/* Marketing Section */}
                        {isMarketing && (
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                                <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
                                    <Briefcase size={16} />
                                    Detail Pemasaran & Prospek
                                </h4>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Produk Ditawarkan</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PRODUCT_OPTIONS.map(prod => (
                                            <button
                                                key={prod.code}
                                                type="button"
                                                onClick={() => handleProductToggle(prod.code)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${formData.marketingProducts.includes(prod.code)
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {prod.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Status Prospek</label>
                                    <select
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        value={formData.prospectStatus}
                                        onChange={(e) => handleInputChange('prospectStatus', e.target.value)}
                                    >
                                        <option value="">-- Pilih Status --</option>
                                        <option value="NOT_INTERESTED">Tidak Berminat</option>
                                        <option value="INTERESTED">Berminat / Tertarik</option>
                                        <option value="IN_PROGRESS">Sedang Proses / Negoisasi</option>
                                        <option value="REALIZED">Closing / Realisasi</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Potensi Nilai (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        placeholder="Contoh: 5000000"
                                        value={formData.potentialValue}
                                        onChange={(e) => handleInputChange('potentialValue', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Marketing</label>
                                    <textarea
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm h-20"
                                        placeholder="Respon nasabah, keberatan, dll..."
                                        value={formData.marketingNotes}
                                        onChange={(e) => handleInputChange('marketingNotes', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Jadwal Follow Up</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full p-3 rounded-xl border border-gray-200 bg-white text-sm"
                                        value={formData.followUpAt}
                                        onChange={(e) => handleInputChange('followUpAt', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Notes (Optional) */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Catatan Umum (Opsional)</label>
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

                        {/* Photo Capture */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Foto Kunjungan *</label>

                            {formData.photoUrl ? (
                                <div className="relative rounded-xl overflow-hidden border border-gray-200">
                                    <img src={formData.photoUrl} alt="Visit Proof" className="w-full h-48 object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, photoUrl: '' })}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[10px] p-1 text-center">
                                        Foto berhasil diambil
                                    </div>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleOpenCamera}
                                    className="w-full border-2 border-dashed border-gray-200 bg-gray-50 rounded-xl p-4 flex flex-col items-center justify-center hover:bg-gray-100 transition"
                                >
                                    <Camera size={24} className="mb-2 text-gray-400" />
                                    <span className="text-xs text-gray-600">
                                        Klik untuk ambil Foto Selfie / Lokasi
                                    </span>
                                </button>
                            )}

                            {!formData.photoUrl && (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <AlertCircle size={12} />
                                    Foto wajib disertakan
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

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                    <div className="relative flex-1 bg-black">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                        />
                        {/* Close Button */}
                        <button
                            onClick={closeCamera}
                            className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="p-6 bg-black flex justify-center pb-10">
                        <button
                            onClick={takePhoto}
                            className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition"
                        >
                            <div className="w-12 h-12 bg-white rounded-full"></div>
                        </button>
                    </div>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default KunjunganTab;
