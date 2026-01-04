import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle } from 'lucide-react';
import api from '../utils/axiosConfig';

const Attendance = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, [status]); // Reload history when status changes

    const fetchHistory = async () => {
        try {
            const res = await api.get('/attendance/history');
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history");
        }
    };

    const getLocation = () => {
        setLoading(true);
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLoading(false);
            },
            (err) => {
                setError('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleCheckIn = async () => {
        if (!location) {
            setError('Please get location first');
            return;
        }
        setError('');
        try {
            await api.post('/attendance/checkin', location);
            setStatus('checked-in');
            // fetchHistory is triggered by useEffect dependency
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed');
        }
    };

    const handleCheckOut = async () => {
        try {
            await api.post('/attendance/checkout', location || {});
            setStatus('checked-out');
        } catch (err) {
            setError(err.response?.data?.message || 'Check-out failed');
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Attendance</h2>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="mb-4 flex flex-col items-center justify-center">
                    {location ? (
                        <div className="text-green-600 flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full text-sm">
                            <MapPin size={16} />
                            <span>Location Acquired</span>
                        </div>
                    ) : (
                        <button
                            onClick={getLocation}
                            disabled={loading}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                        >
                            <MapPin size={16} />
                            {loading ? 'Getting GPS...' : 'Get GPS Location'}
                        </button>
                    )}
                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                </div>

                <div className="text-5xl font-bold text-gray-800 my-4">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <p className="text-gray-500 text-sm mb-6">{new Date().toDateString()}</p>

                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleCheckIn}
                        disabled={status === 'checked-in' || !location}
                        className={`py-3 rounded-xl font-bold text-white shadow-md transition transform active:scale-95 ${status === 'checked-in' ? 'bg-gray-300' : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        Check In
                    </button>
                    <button
                        onClick={handleCheckOut}
                        disabled={status !== 'checked-in'}
                        className={`py-3 rounded-xl font-bold text-white shadow-md transition transform active:scale-95 ${status !== 'checked-in' ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'
                            }`}
                    >
                        Check Out
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Recent History</h3>
                {history.map((record) => (
                    <div key={record.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-full text-green-600">
                                <CheckCircle size={18} />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Present</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                                </p>
                            </div>
                        </div>
                        <span className="text-sm text-gray-400">
                            {new Date(record.attendanceDate).toLocaleDateString()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Attendance;
