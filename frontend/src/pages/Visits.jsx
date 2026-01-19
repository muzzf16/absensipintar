import React, { useState, useEffect } from 'react';
import { Camera, MapPin, Plus, AlertCircle, X } from 'lucide-react';
import api from '../utils/axiosConfig';

const PRODUCT_OPTIONS = [
    { code: 'TAB_UMUM', name: 'Tabungan Umum' },
    { code: 'TAB_BERJANGKA', name: 'Tabungan Berjangka' },
    { code: 'DEP_OS', name: 'Deposito' },
    { code: 'KREDIT_MIKRO', name: 'Kredit Mikro' },
    { code: 'KREDIT_KONSUMTIF', name: 'Kredit Konsumtif' },
    { code: 'OTHER', name: 'Lainnya' }
];

const Visits = () => {
    const [showForm, setShowForm] = useState(false);
    const [visits, setVisits] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [attendanceStatus, setAttendanceStatus] = useState(null); // 'checked-in', 'checked-out', 'none'
    const [loading, setLoading] = useState(true);


    // Form State
    const [formData, setFormData] = useState({
        customerId: '',
        customerName: '', // For manual input
        purpose: 'SERVICE_ONLY',
        notes: '',
        photoUrl: '',
        // Marketing Fields
        marketingProducts: [], // Array of codes
        prospectStatus: '', // NOT_INTERESTED, INTERESTED, IN_PROGRESS, REALIZED
        potentialValue: '',
        marketingNotes: '',
        followUpAt: ''
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

    const handleProductToggle = (code) => {
        const current = formData.marketingProducts;
        if (current.includes(code)) {
            setFormData({ ...formData, marketingProducts: current.filter(c => c !== code) });
        } else {
            setFormData({ ...formData, marketingProducts: [...current, code] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!location) {
            setSubmitError('Lokasi GPS diperlukan!');
            return;
        }


        setSubmitting(true);
        try {
            // Prepare payload - backend will handle customer creation if needed
            const payload = {
                customerId: formData.customerId || null,
                customerName: formData.customerName || null,
                purpose: formData.purpose,
                notes: formData.notes,
                photoUrl: formData.photoUrl,
                latitude: location.latitude,
                longitude: location.longitude,
            };

            // Add Marketing Data if applicable (only for marketing purposes)
            if (['SERVICE_AND_OFFERING', 'OFFERING_ONLY'].includes(formData.purpose)) {
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
                            prospectStatus: null, // Default
                            potentialValue: null  // Default
                        };
                    });
                }
            }

            await api.post('/visits', payload);

            setShowForm(false);
            // Reset Form
            setFormData({
                customerId: '',
                customerName: '',
                purpose: 'SERVICE_ONLY',
                notes: '',
                photoUrl: '',
                marketingProducts: [],
                prospectStatus: '',
                potentialValue: '',
                marketingNotes: '',
                followUpAt: ''
            });
            setLocation(null);
            fetchInitialData(); // Refresh list
        } catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to submit visit');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    const isMarketing = ['SERVICE_AND_OFFERING', 'OFFERING_ONLY'].includes(formData.purpose);

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
                        <p className="font-bold">Presensi Required</p>
                        <p className="text-sm">You must Clock In (Presensi Masuk) first to start visiting customers.</p>
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
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                    {visit.purpose?.replace(/_/g, ' ')}
                                </span>
                                {visit.visitProducts && visit.visitProducts.length > 0 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                        {visit.visitProducts.length} Product(s)
                                    </span>
                                )}
                            </div>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name / Calon Nasabah</label>
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
                                className="w-full border rounded-lg p-2 bg-white text-gray-800"
                                placeholder="Type customer name..."
                                autoComplete="off"
                                required
                            />
                            <datalist id="customer-list">
                                {customers.map((c) => (
                                    <option key={c.id} value={c.name} />
                                ))}
                            </datalist>
                            <p className="text-xs text-gray-400 mt-1">Type manually or select from suggestions</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                            <select
                                className="w-full border rounded-lg p-2 bg-gray-50"
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                required
                            >
                                <option value="SERVICE_ONLY">Service Only</option>
                                <option value="SERVICE_AND_OFFERING">Service & Offering</option>
                                <option value="OFFERING_ONLY">Offering Only</option>
                                <option value="TAGIH_ANGSURAN">Tagih Angsuran Kredit</option>
                            </select>
                        </div>

                        {/* Marketing Section Conditional Render */}
                        {isMarketing && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                                <h4 className="font-semibold text-blue-800 text-sm">Marketing & Offering</h4>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Products Offered</label>
                                    <div className="flex flex-wrap gap-2">
                                        {PRODUCT_OPTIONS.map(prod => (
                                            <button
                                                key={prod.code}
                                                type="button"
                                                onClick={() => handleProductToggle(prod.code)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border ${formData.marketingProducts.includes(prod.code)
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {prod.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prospect Status</label>
                                    <select
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={formData.prospectStatus}
                                        onChange={(e) => setFormData({ ...formData, prospectStatus: e.target.value })}
                                    >
                                        <option value="">Select Status...</option>
                                        <option value="NOT_INTERESTED">Not Interested</option>
                                        <option value="INTERESTED">Interested</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="REALIZED">Realized / Closing</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Potential Value (Rp)</label>
                                    <input
                                        type="number"
                                        className="w-full border rounded-lg p-2 text-sm"
                                        placeholder="Estimate Value (Optional)"
                                        value={formData.potentialValue}
                                        onChange={(e) => setFormData({ ...formData, potentialValue: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Notes</label>
                                    <textarea
                                        className="w-full border rounded-lg p-2 text-sm"
                                        rows="2"
                                        placeholder="Reaction, objections, etc."
                                        value={formData.marketingNotes}
                                        onChange={(e) => setFormData({ ...formData, marketingNotes: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Follow Up Date</label>
                                    <input
                                        type="datetime-local"
                                        className="w-full border rounded-lg p-2 text-sm"
                                        value={formData.followUpAt}
                                        onChange={(e) => setFormData({ ...formData, followUpAt: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">General Notes</label>
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
