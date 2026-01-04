import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { MapPin } from 'lucide-react';

const AbsensiTab = ({ user }) => {
    const [status, setStatus] = useState('none');
    const [stats, setStats] = useState({ checkIn: null, checkOut: null });
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchTodayStatus();
        return () => clearInterval(timer);
    }, []);

    const fetchTodayStatus = async () => {
        try {
            const res = await api.get('/attendance/history');
            // Simplified logic: finding today's record from history for demo
            const today = new Date().toDateString();
            const todayRecord = res.data.find(r => new Date(r.attendanceDate).toDateString() === today);

            if (todayRecord) {
                setStats({
                    checkIn: todayRecord.checkIn,
                    checkOut: todayRecord.checkOut
                });
                if (todayRecord.checkOut) setStatus('completed');
                else if (todayRecord.checkIn) setStatus('checked-in');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async () => {
        // Simple location mock
        const location = { latitude: -6.2088, longitude: 106.8456 }; // Jakarta
        try {
            if (status === 'none') {
                await api.post('/attendance/checkin', location);
            } else if (status === 'checked-in') {
                await api.post('/attendance/checkout', location);
            }
            fetchTodayStatus();
        } catch (err) {
            alert('Action failed: ' + (err.response?.data?.message || err.message));
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = currentTime.toLocaleDateString('id-ID', options).toUpperCase();

    return (
        <div className="flex flex-col items-center">
            <h3 className="text-xs font-bold text-gray-400 mt-6 tracking-wider">{dateString}</h3>
            <div className="text-6xl font-bold text-gray-800 mt-2 mb-8 tracking-tight">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            {/* Circular Button */}
            <div className="relative mb-10">
                <div className="absolute inset-0 bg-blue-50 rounded-full blur-xl opacity-50"></div>
                <button
                    onClick={handleAction}
                    disabled={status === 'completed'}
                    className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center shadow-sm relative z-10 transition-all active:scale-95
                        ${status === 'completed' ? 'border-gray-100 bg-gray-50 text-gray-400' :
                            status === 'checked-in' ? 'border-red-100 bg-white text-red-500' :
                                'border-blue-100 bg-white text-blue-500'}`}
                >
                    <div className={`text-xs uppercase font-bold tracking-widest mb-1 
                        ${status === 'completed' ? 'text-gray-400' :
                            status === 'checked-in' ? 'text-red-400' : 'text-blue-400'}`}>
                        {status === 'completed' ? 'Selesai' : status === 'checked-in' ? 'Check Out' : 'Check In'}
                    </div>
                </button>
                {/* Decorative Dashed Circle */}
                <div className="absolute top-[-10px] left-[-10px] right-[-10px] bottom-[-10px] border-2 border-dashed border-gray-200 rounded-full pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-white border boundary-gray-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">Jam Masuk</p>
                    <p className="text-xl font-bold text-gray-800">{formatTime(stats.checkIn)}</p>
                </div>
                <div className="bg-white border boundary-gray-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">Jam Pulang</p>
                    <p className="text-xl font-bold text-gray-800">{formatTime(stats.checkOut)}</p>
                </div>
            </div>
        </div>
    );
};

export default AbsensiTab;
