import React, { useState } from 'react';
import { Briefcase, Plus, MapPin, Camera } from 'lucide-react';
import api from '../utils/axiosConfig';

const KunjunganTab = () => {
    const [showForm, setShowForm] = useState(false);

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

                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            Belum ada catatan kunjungan.
                        </div>
                    </div>
                </>
            ) : (
                <div className="bg-white rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg">Form Kunjungan</h3>
                        <button onClick={() => setShowForm(false)} className="text-sm text-gray-400 hover:text-gray-600">Batal</button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Nama Nasabah</label>
                            <input type="text" className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm" placeholder="Contoh: PT. Maju Jaya" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tujuan Kunjungan</label>
                            <textarea className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 text-sm h-24" placeholder="Deskripsikan hasil kunjungan..."></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Foto Lokasi</label>
                            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 transition cursor-pointer">
                                <Camera size={24} className="mb-2" />
                                <span className="text-xs">Ambil Foto</span>
                            </div>
                        </div>

                        <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl mt-4 shadow-lg shadow-blue-600/30">
                            Simpan Laporan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KunjunganTab;
