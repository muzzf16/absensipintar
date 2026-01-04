import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Plus, AlertCircle, X } from 'lucide-react';
import api from '../utils/axiosConfig';

const Visits = () => {
    const [showForm, setShowForm] = useState(false);
    const [visits, setVisits] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(null); // 'checked-in', 'checked-out', 'none'
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        customerId: '',
        purpose: '',
        notes: '',
        photoUrl: '', // Optional, mock for now or use valid URL if upload imp.
    });
    const [location, setLocation] = useState(null); // { latitude, longitude }
    const [locError, setLocError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            // 1. Check Attendance Status (using history for today)
            const historyRes = await api.get('/attendance/history');
            const today = new Date().toDateString();
            const todayRecord = historyRes.data.find(r => new Date(r.attendanceDate).toDateString() === today);

            if (todayRecord && todayRecord.checkIn) {
                setAttendanceStatus('checked-in');
            } else {
                setAttendanceStatus('none');
            }

            // 2. Fetch Customers
            const customersRes = await api.get('/customers');
            setCustomers(customersRes.data);

            // 3. Fetch Visits history
            const visitsRes = await api.get('/visits');
            setVisits(visitsRes.data);

        } catch (error) {
            console.error("Error loading mock data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGetLocation = () => {
        setLocError('');
        if (!navigator.geolocation) {
            setLocError('Geolocation not supported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                });
            },
            (err) => {
                setLocError('Failed to get location. GPS is required.');
            }
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!location) {
            setSubmitError('GPS Location is required!');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/visits', {
                ...formData,
                latitude: location.latitude,
                longitude: location.longitude
            });
            setShowForm(false);
            setFormData({ customerId: '', purpose: '', notes: '', photoUrl: '' });
            setLocation(null);
            fetchInitialData(); // Refresh list
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to submit visit');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="p-4 relative min-h-full pb-20">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Kunjungan Nasabah</h2>
            </div>

            {/* Attendance Alert */}
            {attendanceStatus !== 'checked-in' && (
                <div className="bg-orange-50 border border-orange-200 text-orange-700 p-4 rounded-xl mb-4 flex items-start gap-3">
                    <AlertCircle size={24} className="flex-shrink-0" />
                    <div>
                        <p className="font-bold">Absensi Required</p>
                        <p className="text-sm">You must Clock In (Absen Masuk) first to start visiting customers.</p>
                    </div>
                </div>
            )}

            {!showForm ? (
                <div className="space-y-4">
                    {/* List */}
                    {visits.map(visit => (
                        <div key={visit.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{visit.customer?.name || 'Unknown Customer'}</h3>
                                <span className={`text-xs px-2 py-1 rounded-full ${visit.status === 'approved' ? 'bg-green-100 text-green-700' :
                                        visit.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {visit.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{visit.purpose}</p>
                            <div className="flex items-center text-xs text-gray-400 gap-2">
                                <MapPin size={12} />
                                <span>{new Date(visit.visitTime).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}

                    {visits.length === 0 && (
                        <div className="text-center text-gray-400 py-10">No visits recorded today</div>
                    )}

                    <button
                        onClick={() => setShowForm(true)}
                        disabled={attendanceStatus !== 'checked-in'}
                        className={`fixed bottom-20 right-4 p-4 rounded-full shadow-lg transition flex items-center justify-center ${attendanceStatus === 'checked-in'
                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <Plus size={24} />
                    </button>
                </div>
            ) : (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg">New Visit</h3>
                        <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <select
                                className="w-full border rounded-lg p-2 bg-gray-50"
                                value={formData.customerId}
                                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                required
                            >
                                <option value="">Select Customer...</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <input
                                type="text"
                                className="w-full border rounded-lg p-2"
                                placeholder="e.g. Sales pitch"
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                className="w-full border rounded-lg p-2"
                                rows="2"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {/* GPS Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location (Mandatory)</label>
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                {location ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm">
                                        <MapPin size={16} />
                                        <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                                        <button
                                            type="button"
                                            onClick={handleGetLocation}
                                            className="text-xs text-blue-600 underline ml-2"
                                        >
                                            Update
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        className="w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
                                    >
                                        Click to Get GPS Location
                                    </button>
                                )}
                                {locError && <p className="text-red-500 text-xs mt-2">{locError}</p>}
                            </div>
                        </div>

                        {/* Photo Section (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo Evidence (Optional)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-400">
                                <Camera size={32} />
                                <span className="text-xs mt-2">Tap to take photo</span>
                                {/* In a real app, <input type="file" /> here */}
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="flex-1 py-2 text-gray-600 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || !location}
                                className={`flex-1 py-2 rounded-lg font-bold text-white ${submitting || !location ? 'bg-gray-400' : 'bg-blue-600'
                                    }`}
                            >
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Visits;
