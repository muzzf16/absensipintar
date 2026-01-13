import React, { useState, useEffect } from 'react';
import { Clock, Settings, Save, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/axiosConfig';

const WorkScheduleSettings = () => {
    const [offices, setOffices] = useState([]);
    const [selectedOffice, setSelectedOffice] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [scheduleData, setScheduleData] = useState({
        workStartTime: '08:00',
        workEndTime: '17:00',
        gracePeriod: 15,
        enableBlocking: false,
        blockBeforeTime: '06:00',
        blockAfterTime: '12:00'
    });

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        try {
            const res = await api.get('/offices');
            setOffices(res.data);
            if (res.data.length > 0) {
                setSelectedOffice(res.data[0].id);
                fetchSchedule(res.data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch offices:', err);
        }
    };

    const fetchSchedule = async (officeId) => {
        if (!officeId) return;
        setLoading(true);
        try {
            const res = await api.get(`/offices/${officeId}/schedule`);
            setScheduleData({
                workStartTime: res.data.workStartTime || '08:00',
                workEndTime: res.data.workEndTime || '17:00',
                gracePeriod: res.data.gracePeriod || 15,
                enableBlocking: res.data.enableBlocking || false,
                blockBeforeTime: res.data.blockBeforeTime || '06:00',
                blockAfterTime: res.data.blockAfterTime || '12:00'
            });
        } catch (err) {
            console.error('Failed to fetch schedule:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOfficeChange = (e) => {
        const officeId = e.target.value;
        setSelectedOffice(officeId);
        fetchSchedule(officeId);
        setMessage({ type: '', text: '' });
    };

    const handleSave = async () => {
        if (!selectedOffice) return;
        setSaving(true);
        setMessage({ type: '', text: '' });

        try {
            await api.put(`/offices/${selectedOffice}/schedule`, scheduleData);
            setMessage({ type: 'success', text: 'Pengaturan jam kerja berhasil disimpan!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Gagal menyimpan pengaturan' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setScheduleData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-100 rounded-xl">
                    <Settings size={24} className="text-purple-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Pengaturan Jam Kerja</h2>
                    <p className="text-sm text-gray-500">Atur jadwal kerja per kantor</p>
                </div>
            </div>

            {/* Office Selector */}
            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Kantor</label>
                <select
                    value={selectedOffice}
                    onChange={handleOfficeChange}
                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                    {offices.map(office => (
                        <option key={office.id} value={office.id}>{office.name}</option>
                    ))}
                </select>
            </div>

            {loading ? (
                <div className="text-center py-8 text-gray-500">Memuat pengaturan...</div>
            ) : (
                <div className="space-y-6">
                    {/* Work Hours */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                            <Clock size={18} />
                            Jam Kerja
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Jam Masuk</label>
                                <input
                                    type="time"
                                    value={scheduleData.workStartTime}
                                    onChange={(e) => handleChange('workStartTime', e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Jam Pulang</label>
                                <input
                                    type="time"
                                    value={scheduleData.workEndTime}
                                    onChange={(e) => handleChange('workEndTime', e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Grace Period */}
                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                        <h3 className="font-semibold text-yellow-900 mb-4 flex items-center gap-2">
                            <Clock size={18} />
                            Toleransi Keterlambatan
                        </h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                min="0"
                                max="60"
                                value={scheduleData.gracePeriod}
                                onChange={(e) => handleChange('gracePeriod', parseInt(e.target.value) || 0)}
                                className="w-24 p-3 border border-gray-200 rounded-xl bg-white text-center"
                            />
                            <span className="text-gray-600">menit</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Karyawan tidak dianggap terlambat jika check-in dalam toleransi ini
                        </p>
                    </div>

                    {/* Blocking Settings */}
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-red-900 flex items-center gap-2">
                                <AlertCircle size={18} />
                                Blokir Check-in di Luar Jam
                            </h3>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={scheduleData.enableBlocking}
                                    onChange={(e) => handleChange('enableBlocking', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>

                        {scheduleData.enableBlocking && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Mulai</label>
                                    <input
                                        type="time"
                                        value={scheduleData.blockBeforeTime}
                                        onChange={(e) => handleChange('blockBeforeTime', e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Check-in Sampai</label>
                                    <input
                                        type="time"
                                        value={scheduleData.blockAfterTime}
                                        onChange={(e) => handleChange('blockAfterTime', e.target.value)}
                                        className="w-full p-3 border border-gray-200 rounded-xl bg-white"
                                    />
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                            Jika aktif, karyawan tidak bisa check-in di luar waktu yang ditentukan
                        </p>
                    </div>

                    {/* Message */}
                    {message.text && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            {message.text}
                        </div>
                    )}

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full bg-purple-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 transition disabled:opacity-50"
                    >
                        <Save size={20} />
                        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorkScheduleSettings;
