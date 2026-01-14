import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, Calendar, FileText, RefreshCw, Building } from 'lucide-react';
import api from '../utils/axiosConfig';

const BillingManagement = () => {
    const [activeTab, setActiveTab] = useState('unpaid'); // unpaid | paid
    const [billings, setBillings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPayModal, setShowPayModal] = useState(false);
    const [selectedBilling, setSelectedBilling] = useState(null);
    const [paymentData, setPaymentData] = useState({ paidAmount: '', paidNote: '' });

    // Office filter
    const [offices, setOffices] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('');

    useEffect(() => {
        fetchOffices();
    }, []);

    useEffect(() => {
        if (selectedOffice) {
            fetchBillings();
        }
    }, [activeTab, selectedOffice]);

    const fetchOffices = async () => {
        try {
            const res = await api.get('/offices');
            setOffices(res.data);
            if (res.data.length > 0) {
                setSelectedOffice(res.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch offices:', err);
        }
    };

    const fetchBillings = async () => {
        if (!selectedOffice) return;
        setLoading(true);
        try {
            const endpoint = activeTab === 'paid' ? '/billing/paid' : '/billing';
            const res = await api.get(endpoint, { params: { officeId: selectedOffice } });
            setBillings(res.data);
        } catch (err) {
            console.error('Failed to fetch billings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenPayModal = (billing) => {
        setSelectedBilling(billing);
        setPaymentData({ paidAmount: billing.total, paidNote: '' });
        setShowPayModal(true);
    };

    const handleMarkAsPaid = async () => {
        if (!selectedBilling) return;
        try {
            await api.put(`/billing/${selectedBilling.id}/pay`, paymentData);
            alert('Tagihan berhasil ditandai lunas!');
            setShowPayModal(false);
            setSelectedBilling(null);
            fetchBillings();
        } catch (err) {
            alert('Gagal menandai tagihan sebagai lunas');
        }
    };

    const handleMarkAsUnpaid = async (id) => {
        if (!confirm('Batalkan pembayaran tagihan ini?')) return;
        try {
            await api.put(`/billing/${id}/unpay`);
            alert('Pembayaran dibatalkan');
            fetchBillings();
        } catch (err) {
            alert('Gagal membatalkan pembayaran');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <DollarSign className="text-green-600" size={20} />
                        Manajemen Tagihan
                    </h3>

                    {/* Office Selector */}
                    <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-500" />
                        <select
                            value={selectedOffice}
                            onChange={(e) => setSelectedOffice(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:ring-2 focus:ring-blue-500"
                        >
                            {offices.map(office => (
                                <option key={office.id} value={office.id}>{office.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
                <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'unpaid'
                        ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <XCircle size={16} className="inline mr-2" />
                    Belum Lunas
                </button>
                <button
                    onClick={() => setActiveTab('paid')}
                    className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'paid'
                        ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                        : 'text-gray-500 hover:text-gray-700'}`}
                >
                    <CheckCircle size={16} className="inline mr-2" />
                    Lunas
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">
                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                        Memuat data...
                    </div>
                ) : billings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        {activeTab === 'unpaid' ? 'Tidak ada tagihan yang belum lunas' : 'Tidak ada tagihan yang sudah lunas'}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {billings.map((billing) => (
                            <div key={billing.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{billing.customerName}</h4>
                                        <p className="text-xs text-gray-500">{billing.office?.name || 'Tanpa Kantor'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-gray-800">{formatCurrency(billing.total)}</p>
                                        <p className="text-xs text-gray-500">
                                            <Calendar size={12} className="inline mr-1" />
                                            Jatuh Tempo: {formatDate(billing.dueDate)}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment details for paid billings */}
                                {activeTab === 'paid' && billing.paidAt && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Dibayar: {formatCurrency(billing.paidAmount || billing.total)}</span>
                                            <span>{formatDate(billing.paidAt)}</span>
                                        </div>
                                        {billing.paidNote && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                <FileText size={12} className="inline mr-1" />
                                                {billing.paidNote}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="mt-3 flex gap-2">
                                    {activeTab === 'unpaid' ? (
                                        <button
                                            onClick={() => handleOpenPayModal(billing)}
                                            className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Tandai Lunas
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleMarkAsUnpaid(billing.id)}
                                            className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-200 transition flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={16} />
                                            Batalkan Pembayaran
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {showPayModal && selectedBilling && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Tandai Lunas</h3>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="font-semibold">{selectedBilling.customerName}</p>
                            <p className="text-sm text-gray-600">Total: {formatCurrency(selectedBilling.total)}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Jumlah Dibayar</label>
                                <input
                                    type="number"
                                    value={paymentData.paidAmount}
                                    onChange={(e) => setPaymentData({ ...paymentData, paidAmount: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl"
                                    placeholder="Masukkan jumlah..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Catatan (opsional)</label>
                                <textarea
                                    value={paymentData.paidNote}
                                    onChange={(e) => setPaymentData({ ...paymentData, paidNote: e.target.value })}
                                    className="w-full p-3 border border-gray-200 rounded-xl"
                                    rows={2}
                                    placeholder="Catatan pembayaran..."
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPayModal(false)}
                                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleMarkAsPaid}
                                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
                            >
                                Konfirmasi Lunas
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillingManagement;
