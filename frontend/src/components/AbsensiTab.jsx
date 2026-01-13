import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axiosConfig';
import { MapPin, Camera, X, CheckCircle, Loader, AlertTriangle } from 'lucide-react';

const AbsensiTab = ({ user }) => {
    const [status, setStatus] = useState('none');
    const [stats, setStats] = useState({
        checkIn: null,
        checkOut: null,
        checkInPhoto: null,
        checkOutPhoto: null,
        checkInGPS: null,
        checkOutGPS: null
    });
    const [currentTime, setCurrentTime] = useState(new Date());

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [actionType, setActionType] = useState(null); // 'checkin' or 'checkout'
    const [cameraStream, setCameraStream] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [gpsData, setGpsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [gpsRetryCount, setGpsRetryCount] = useState(0);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        fetchTodayStatus();
        return () => clearInterval(timer);
    }, []);

    const fetchTodayStatus = async () => {
        try {
            const res = await api.get('/attendance/history');
            const today = new Date().toDateString();
            const todayRecord = res.data.find(r => new Date(r.attendanceDate).toDateString() === today);

            if (todayRecord) {
                setStats({
                    checkIn: todayRecord.checkIn,
                    checkOut: todayRecord.checkOut,
                    checkInPhoto: todayRecord.checkInPhotoUrl,
                    checkOutPhoto: todayRecord.checkOutPhotoUrl,
                    checkInGPS: todayRecord.checkInLatitude ? {
                        lat: todayRecord.checkInLatitude,
                        lng: todayRecord.checkInLongitude
                    } : null,
                    checkOutGPS: todayRecord.checkOutLatitude ? {
                        lat: todayRecord.checkOutLatitude,
                        lng: todayRecord.checkOutLongitude
                    } : null
                });
                if (todayRecord.checkOut) setStatus('completed');
                else if (todayRecord.checkIn) setStatus('checked-in');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleActionClick = async (type) => {
        setActionType(type);
        setShowCamera(true);
        setCapturedPhoto(null);
        setGpsData(null);

        // Auto-capture GPS
        captureGPS();

        // Start camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert('Gagal mengakses kamera. Pastikan izin kamera diberikan.');
            setShowCamera(false);
        }
    };

    // Detect if user is on mobile device
    const isMobileDevice = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const captureGPS = (isRetry = false) => {
        if (!isRetry) {
            setGpsRetryCount(0); // Reset retry count on new capture
        }

        setGpsLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const accuracy = position.coords.accuracy;
                    const gpsResult = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: accuracy
                    };

                    // Only validate GPS accuracy on mobile devices
                    // PC/Desktop: skip validation, accept any accuracy
                    if (isMobileDevice() && accuracy > 100 && gpsRetryCount < 3) {
                        // Poor accuracy on mobile, auto-retry
                        setGpsRetryCount(prev => prev + 1);
                        setGpsLoading(false);

                        const retryMsg = `GPS kurang akurat (±${accuracy.toFixed(0)}m).\nMencoba lagi... (${gpsRetryCount + 1}/3)\n\nTips: Pindah ke dekat jendela atau ke luar ruangan.`;
                        alert(retryMsg);

                        // Retry after 2 seconds
                        setTimeout(() => captureGPS(true), 2000);
                        return;
                    }

                    // Accept GPS
                    setGpsData(gpsResult);
                    setGpsLoading(false);
                    setGpsRetryCount(0);

                    // Only warn about poor accuracy on mobile devices
                    if (isMobileDevice() && accuracy > 100) {
                        alert(`⚠️ Peringatan: GPS kurang akurat (±${accuracy.toFixed(0)}m)\n\nUntuk akurasi terbaik:\n- Keluar ruangan atau dekat jendela\n- Pastikan GPS device aktif\n- Tunggu beberapa detik lagi`);
                    }
                },
                (error) => {
                    setGpsLoading(false);
                    setGpsRetryCount(0);
                    console.error('GPS Error:', error);

                    let errorMsg = 'Gagal mendapatkan lokasi GPS.\n\n';
                    if (error.code === 1) {
                        errorMsg += 'Izin lokasi ditolak. Aktifkan izin lokasi di browser.';
                    } else if (error.code === 2) {
                        errorMsg += 'Lokasi tidak tersedia. Pastikan GPS aktif.';
                    } else if (error.code === 3) {
                        errorMsg += 'Timeout. Coba lagi di tempat dengan sinyal GPS lebih baik.';
                    }
                    alert(errorMsg);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000, // Increased to 15s for better GPS lock
                    maximumAge: 0
                }
            );
        } else {
            setGpsLoading(false);
            alert('Browser tidak mendukung GPS');
        }
    };

    const takePhoto = () => {
        if (!videoRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;

        // Reduce resolution untuk minimize file size
        const maxWidth = 800;
        const maxHeight = 1000;

        let width = video.videoWidth;
        let height = video.videoHeight;

        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        // Lower quality untuk reduce file size (50%)
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.5);
        console.log('Photo captured, size:', photoDataUrl.length, 'bytes');
        setCapturedPhoto(photoDataUrl);

        // Stop camera stream
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
    };

    const retakePhoto = async () => {
        setCapturedPhoto(null);

        // Restart camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            setCameraStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            alert('Gagal mengakses kamera');
        }
    };

    const closeCamera = () => {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
        setCapturedPhoto(null);
        setGpsData(null);
        setActionType(null);
    };

    const submitAttendance = async () => {
        if (!capturedPhoto) {
            alert('Ambil foto selfie terlebih dahulu');
            return;
        }
        if (!gpsData) {
            alert('Menunggu GPS... Harap tunggu beberapa detik');
            return;
        }

        console.log('=== SUBMIT ATTENDANCE START ===');
        console.log('Action type:', actionType);
        console.log('Photo size:', capturedPhoto.length, 'bytes');
        console.log('GPS:', gpsData);

        setLoading(true);
        try {
            const endpoint = actionType === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
            console.log('Calling endpoint:', endpoint);

            const response = await api.post(endpoint, {
                photoUrl: capturedPhoto,
                latitude: gpsData.latitude,
                longitude: gpsData.longitude,
                gpsAccuracy: gpsData.accuracy || 0
            });

            console.log('Response:', response.data);
            alert(`✅ ${actionType === 'checkin' ? 'Check-in' : 'Check-out'} berhasil!`);
            closeCamera();
            fetchTodayStatus();
        } catch (err) {
            console.error('=== SUBMIT ERROR ===');
            console.error('Error:', err);
            console.error('Response data:', err.response?.data);
            console.error('Response status:', err.response?.status);

            const errorMsg = err.response?.data?.message || err.message || 'Unknown error';
            alert('❌ ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };


    const formatTime = (isoString) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatGPS = (gps) => {
        if (!gps) return 'GPS tidak tersedia';
        return `${gps.lat.toFixed(6)}, ${gps.lng.toFixed(6)}`;
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
                    onClick={() => {
                        if (status === 'none') handleActionClick('checkin');
                        else if (status === 'checked-in') handleActionClick('checkout');
                    }}
                    disabled={status === 'completed'}
                    className={`w-48 h-48 rounded-full border-4 flex flex-col items-center justify-center shadow-sm relative z-10 transition-all active:scale-95
                        ${status === 'completed' ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed' :
                            status === 'checked-in' ? 'border-red-100 bg-white text-red-500 hover:bg-red-50' :
                                'border-blue-100 bg-white text-blue-500 hover:bg-blue-50'}`}
                >
                    <Camera size={48} className="mb-2" />
                    <div className={`text-xs uppercase font-bold tracking-widest 
                        ${status === 'completed' ? 'text-gray-400' :
                            status === 'checked-in' ? 'text-red-400' : 'text-blue-400'}`}>
                        {status === 'completed' ? 'Selesai' : status === 'checked-in' ? 'Check Out' : 'Check In'}
                    </div>
                </button>
                <div className="absolute top-[-10px] left-[-10px] right-[-10px] bottom-[-10px] border-2 border-dashed border-gray-200 rounded-full pointer-events-none"></div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-2 gap-4 w-full mb-6">
                <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">Jam Masuk</p>
                    <p className="text-xl font-bold text-gray-800">{formatTime(stats.checkIn)}</p>
                    {stats.checkInGPS && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                            <MapPin size={10} />
                            GPS OK
                        </p>
                    )}
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl text-center shadow-sm">
                    <p className="text-xs text-gray-400 font-medium mb-1">Jam Pulang</p>
                    <p className="text-xl font-bold text-gray-800">{formatTime(stats.checkOut)}</p>
                    {stats.checkOutGPS && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                            <MapPin size={10} />
                            GPS OK
                        </p>
                    )}
                </div>
            </div>

            {/* Photo Preview */}
            {(stats.checkInPhoto || stats.checkOutPhoto) && (
                <div className="w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-3">Foto Absensi Hari Ini</p>
                    <div className="grid grid-cols-2 gap-3">
                        {stats.checkInPhoto && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Check In</p>
                                <img src={stats.checkInPhoto} alt="Check-in" className="w-full rounded-lg border border-gray-200" />
                                {stats.checkInGPS && (
                                    <p className="text-xs text-gray-400 mt-1 truncate">{formatGPS(stats.checkInGPS)}</p>
                                )}
                            </div>
                        )}
                        {stats.checkOutPhoto && (
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Check Out</p>
                                <img src={stats.checkOutPhoto} alt="Check-out" className="w-full rounded-lg border border-gray-200" />
                                {stats.checkOutGPS && (
                                    <p className="text-xs text-gray-400 mt-1 truncate">{formatGPS(stats.checkOutGPS)}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">
                                {actionType === 'checkin' ? 'Check In' : 'Check Out'} - Ambil Foto Selfie
                            </h3>
                            <button onClick={closeCamera} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Camera/Photo Preview */}
                        <div className="relative bg-gray-900 rounded-xl overflow-hidden mb-4" style={{ aspectRatio: '3/4' }}>
                            {!capturedPhoto ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
                            )}
                        </div>

                        {/* GPS Status */}
                        <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${gpsData
                            ? gpsData.accuracy > 100
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : gpsData.accuracy > 50
                                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                    : 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-blue-50 text-blue-700'
                            }`}>
                            {gpsLoading ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    <div className="flex-1">
                                        <span className="text-xs font-medium">Menangkap GPS...</span>
                                        {gpsRetryCount > 0 && (
                                            <div className="text-xs opacity-75 mt-0.5">Percobaan {gpsRetryCount}/3</div>
                                        )}
                                    </div>
                                </>
                            ) : gpsData ? (
                                <>
                                    {gpsData.accuracy > 100 ? (
                                        <AlertTriangle size={16} />
                                    ) : (
                                        <CheckCircle size={16} />
                                    )}
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold">GPS: {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}</div>
                                        {gpsData.accuracy && (
                                            <div className="text-xs opacity-75">
                                                Akurasi: ±{gpsData.accuracy.toFixed(0)}m
                                                {gpsData.accuracy > 100 && ' (Kurang Akurat)'}
                                                {gpsData.accuracy <= 50 && gpsData.accuracy > 20 && ' (Cukup Baik)'}
                                                {gpsData.accuracy <= 20 && ' (Sangat Baik)'}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <MapPin size={16} />
                                    <span className="text-xs">Menunggu GPS...</span>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            {!capturedPhoto ? (
                                <button
                                    onClick={takePhoto}
                                    className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
                                >
                                    📸 Ambil Foto
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={retakePhoto}
                                        className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition"
                                    >
                                        🔄 Ambil Ulang
                                    </button>
                                    <button
                                        onClick={submitAttendance}
                                        disabled={loading || !gpsData}
                                        className={`flex-1 font-bold py-3 rounded-xl transition ${loading || !gpsData
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        {loading ? 'Menyimpan...' : '✓ Submit'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default AbsensiTab;
