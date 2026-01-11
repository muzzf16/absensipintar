import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Save, X, Pencil } from 'lucide-react';
import api from '../utils/axiosConfig';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ setFormData }) => {
    useMapEvents({
        click(e) {
            setFormData(prev => ({
                ...prev,
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            }));
        },
    });
    return null;
};

const OfficeManagement = () => {
    const [offices, setOffices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // Track edit mode
    const [currentId, setCurrentId] = useState(null); // Track ID being edited
    const [formData, setFormData] = useState({
        name: '',
        latitude: '',
        longitude: '',
        radius: 100
    });

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        try {
            const res = await api.get('/offices');
            setOffices(res.data);
        } catch (error) {
            console.error('Error fetching offices:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEdit = (office) => {
        setFormData({
            name: office.name,
            latitude: office.latitude,
            longitude: office.longitude,
            radius: office.radius
        });
        setCurrentId(office.id);
        setIsEditing(true);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setCurrentId(null);
        setFormData({ name: '', latitude: '', longitude: '', radius: 100 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/offices/${currentId}`, formData);
                alert('Kantor berhasil diperbarui!');
            } else {
                await api.post('/offices', formData);
                alert('Kantor berhasil ditambahkan!');
            }
            fetchOffices();
            handleCloseModal();
        } catch (error) {
            alert(`Gagal ${isEditing ? 'memperbarui' : 'menambahkan'} kantor: ` + (error.response?.data?.message || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Yakin ingin menghapus kantor ini?')) {
            try {
                await api.delete(`/offices/${id}`);
                fetchOffices();
            } catch (error) {
                alert('Gagal menghapus kantor: ' + (error.response?.data?.message || error.message));
            }
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-gray-800 text-sm">Data Kantor Cabang</h3>
                    <p className="text-[10px] text-gray-400">Kelola lokasi kantor untuk validasi absensi.</p>
                </div>
                <button
                    onClick={() => {
                        handleCloseModal(); // Ensure clean state
                        setShowModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700"
                >
                    <Plus size={12} />
                    Tambah Kantor
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offices.map((office) => (
                    <div key={office.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm relative">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                                    <MapPin size={16} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 text-sm">{office.name}</h4>
                                    <p className="text-[10px] text-gray-400">{office.radius}m Radius</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(office)} className="text-gray-400 hover:text-blue-500" title="Edit">
                                    <Pencil size={14} />
                                </button>
                                <button onClick={() => handleDelete(office.id)} className="text-gray-400 hover:text-red-500" title="Hapus">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 space-y-1">
                            <div className="flex justify-between">
                                <span>Latitude:</span>
                                <span className="font-mono">{office.latitude}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Longitude:</span>
                                <span className="font-mono">{office.longitude}</span>
                            </div>
                            <div className="pt-2 border-t border-gray-50 mt-2 flex justify-between items-center">
                                <span className="text-gray-400">Karyawan Terdaftar</span>
                                <span className="font-bold text-gray-800">{office._count?.users || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">{isEditing ? 'Edit Kantor' : 'Tambah Kantor Baru'}</h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kantor</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    placeholder="Contoh: Kantor Pusat"
                                    required
                                />
                            </div>

                            {/* Map Container */}
                            <div className="h-64 rounded-lg overflow-hidden border border-gray-200 relative z-0">
                                <MapContainer
                                    center={[formData.latitude || -6.200000, formData.longitude || 106.816666]}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <LocationMarker setFormData={setFormData} />
                                    {formData.latitude && formData.longitude && (
                                        <Marker position={[formData.latitude, formData.longitude]} />
                                    )}
                                </MapContainer>
                            </div>
                            <p className="text-[10px] text-gray-400 italic">* Klik pada peta untuk mengisi koordinat secara otomatis</p>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                        placeholder="-6.12345"
                                        required
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
                                        placeholder="106.12345"
                                        required
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Radius (meter)</label>
                                <input
                                    type="number"
                                    name="radius"
                                    value={formData.radius}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
                                    <Save size={16} />
                                    {isEditing ? 'Simpan Perubahan' : 'Simpan Kantor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfficeManagement;
