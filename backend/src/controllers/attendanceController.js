const prisma = require('../utils/db');
const { getDistanceFromLatLonInMeters } = require('../utils/geoUtils');

const checkIn = async (req, res) => {
    try {
        console.log('=== CHECK-IN REQUEST START ===');
        const userId = req.user.userId;
        const { photoUrl, latitude, longitude } = req.body;
        const now = new Date();

        console.log('User ID:', userId);
        console.log('Photo URL length:', photoUrl ? photoUrl.length : 0);
        console.log('GPS:', latitude, longitude);

        // Validation
        if (!photoUrl) {
            console.log('ERROR: No photo');
            return res.status(400).json({ message: 'Foto selfie wajib untuk check-in' });
        }
        if (!latitude || !longitude) {
            console.log('ERROR: No GPS');
            return res.status(400).json({ message: 'Lokasi GPS wajib untuk check-in' });
        }

        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        // Get User and Office
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { office: true }
        });

        if (user.office) {
            const distance = getDistanceFromLatLonInMeters(
                parseFloat(user.office.latitude),
                parseFloat(user.office.longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );

            console.log(`Office: ${user.office.name}, Radius: ${user.office.radius}m, Distance: ${distance.toFixed(2)}m`);

            if (distance > user.office.radius) {
                return res.status(400).json({
                    message: `Anda berada di luar radius kantor (${distance.toFixed(0)}m). Maksimal ${user.office.radius}m.`
                });
            }
        }

        console.log('Checking existing attendance...');
        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId,
                attendanceDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        if (existingAttendance) {
            console.log('ERROR: Already checked in');
            return res.status(400).json({ message: 'Already checked in today' });
        }

        console.log('Creating attendance record...');
        const attendance = await prisma.attendance.create({
            data: {
                userId,
                checkIn: new Date(),
                attendanceDate: new Date(),
                checkInPhotoUrl: photoUrl,
                checkInLatitude: parseFloat(latitude),
                checkInLongitude: parseFloat(longitude),
            },
        });

        console.log('SUCCESS: Attendance created:', attendance.id);
        res.status(201).json({ message: 'Check-in successful', attendance });
    } catch (error) {
        console.error('=== CHECK-IN ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};


const checkOut = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { photoUrl, latitude, longitude } = req.body;
        const now = new Date();

        // Validation
        if (!photoUrl) {
            return res.status(400).json({ message: 'Foto selfie wajib untuk check-out' });
        }
        if (!latitude || !longitude) {
            return res.status(400).json({ message: 'Lokasi GPS wajib untuk check-out' });
        }

        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const attendance = await prisma.attendance.findFirst({
            where: {
                userId,
                attendanceDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { attendanceDate: 'desc' }
        });

        if (!attendance) {
            return res.status(400).json({ message: 'No check-in record found for today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        const updatedAttendance = await prisma.attendance.update({
            where: { id: attendance.id },
            data: {
                checkOut: new Date(),
                checkOutPhotoUrl: photoUrl,
                checkOutLatitude: parseFloat(latitude),
                checkOutLongitude: parseFloat(longitude),
            },
        });

        res.json({ message: 'Check-out successful', attendance: updatedAttendance });
    } catch (error) {
        res.status(500).json({ message: 'Error checking out', error: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const history = await prisma.attendance.findMany({
            where: { userId },
            orderBy: { attendanceDate: 'desc' },
            take: 30
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history', error: error.message });
    }
};

const getAllAttendance = async (req, res) => {
    try {
        const attendances = await prisma.attendance.findMany({
            include: { user: { select: { name: true, role: true } } },
            orderBy: { attendanceDate: 'desc' },
            take: 100
        });
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all attendance', error: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        // Simple stats for today
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const totalEmployees = await prisma.user.count({ where: { role: 'karyawan' } });

        const attendancesToday = await prisma.attendance.findMany({
            where: {
                attendanceDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        });

        const presentCount = attendancesToday.length;

        // Mocking 'late' calculation: Check-in after 9 AM
        const lateCount = attendancesToday.filter(a => {
            const checkInTime = new Date(a.checkIn);
            return checkInTime.getHours() >= 9;
        }).length;

        const visitCount = await prisma.visit.count({
            where: {
                visitTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                }
            }
        });

        res.json({
            totalEmployees,
            presentCount,
            lateCount,
            visitCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
};

const exportCSV = async (req, res) => {
    try {
        const attendances = await prisma.attendance.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { attendanceDate: 'desc' }
        });

        // CSV Headers
        const headers = ['Tanggal', 'Nama', 'Check In', 'Check Out', 'Latitude In', 'Longitude In', 'Latitude Out', 'Longitude Out'];

        // CSV Rows
        const rows = attendances.map(a => [
            new Date(a.attendanceDate).toLocaleDateString('id-ID'),
            a.user?.name || 'Unknown',
            a.checkIn ? new Date(a.checkIn).toLocaleTimeString('id-ID') : '-',
            a.checkOut ? new Date(a.checkOut).toLocaleTimeString('id-ID') : '-',
            a.checkInLatitude || '-',
            a.checkInLongitude || '-',
            a.checkOutLatitude || '-',
            a.checkOutLongitude || '-'
        ]);

        // Generate CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Set response headers for CSV download
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.header('Content-Disposition', 'attachment; filename=attendance_report.csv');
        res.send('\uFEFF' + csvContent); // UTF-8 BOM for Excel compatibility

    } catch (error) {
        console.error('Export CSV error:', error);
        res.status(500).json({ message: 'Gagal export data', error: error.message });
    }
};

module.exports = { checkIn, checkOut, getHistory, getAllAttendance, getStats, exportCSV };
