import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../utils/axiosConfig';

const BillingUpload = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // success | error

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setStatus(null);
    };

    const handleUpload = async () => {
        if (!file) return alert('Pilih file CSV terlebih dahulu');

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setStatus(null);

        try {
            await api.post('/billing/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setStatus('success');
            setFile(null);
            alert('Data tagihan berhasil diupload!');
        } catch (error) {
            console.error(error);
            setStatus('error');
            alert('Gagal upload data tagihan');
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

            {file && (
                <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className={`mt-4 w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${uploading
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
