import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Building } from 'lucide-react';
import api from '../utils/axiosConfig';

const BillingUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // success | error
    const [offices, setOffices] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('');

    useEffect(() => {
        fetchOffices();
    }, []);

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

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
    };

    const handleDownloadTemplate = () => {
        // CSV template content
        const csvContent = `customerName,principal,interest,penalty,total,dueDate
Budi Santoso,5000000,250000,0,5250000,2026-01-15
Siti Aminah,3000000,150000,50000,3200000,2026-01-20
Ahmad Wijaya,7500000,375000,0,7875000,2026-01-25`;

        // Create blob and download
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = 'template_tagihan.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleUpload = async () => {
        if (!selectedOffice) return alert('Pilih kantor terlebih dahulu');
        if (!file) return alert('Pilih file CSV terlebih dahulu');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('officeId', selectedOffice);

        setUploading(true);
        setStatus(null);

        try {
            const res = await api.post('/billing/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
            setFile(null);
            alert(res.data.message || 'Data tagihan berhasil diupload!');
        } catch (error) {
            console.error(error);
            setStatus('error');
            alert(error.response?.data?.message || 'Gagal upload data tagihan');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} />
                Upload Data Tagihan Angsuran
            </h3>

            {/* Office Selector */}
            <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building size={16} />
                    Pilih Kantor Tujuan
                </label>
                <select
                    value={selectedOffice}
                    onChange={(e) => setSelectedOffice(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    {offices.map(office => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-4 border-2 border-dashed border-gray-200 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 transition">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="billing-upload"
                />
                <label
                    htmlFor="billing-upload"
                    className="cursor-pointer flex flex-col items-center gap-2 w-full text-center"
                >
                    <Upload className="text-gray-400" size={32} />
                    <span className="text-sm font-medium text-gray-600">
                        {file ? file.name : 'Klik untuk pilih file CSV'}
                    </span>
                    <span className="text-xs text-gray-400">Format CSV: customerName,principal,interest,penalty,total,dueDate</span>
                </label>
            </div>

            {/* Download Template Button */}
            <button
                onClick={handleDownloadTemplate}
                className="mt-3 w-full py-2 rounded-lg font-medium text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition flex items-center justify-center gap-2 border border-gray-200"
            >
                <FileText size={16} />
                Download Template CSV
            </button>

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading || !selectedOffice}
                    className={`mt-4 w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${uploading || !selectedOffice
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                        }`}
                >
                    {uploading ? 'Mengupload...' : 'Upload Data'}
                </button>
            )}

            {status === 'success' && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm">
                    <CheckCircle size={16} /> Data berhasil diproses
                </div>
            )}
            {status === 'error' && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle size={16} /> Gagal memproses data. Cek format file.
                </div>
            )}
        </div>
    );
};

export default BillingUpload;

