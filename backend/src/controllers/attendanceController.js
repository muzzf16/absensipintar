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

        // Get GPS accuracy from request (sent from frontend)
        const gpsAccuracy = req.body.gpsAccuracy || 0;

        if (user.office) {
            const distance = getDistanceFromLatLonInMeters(
                parseFloat(user.office.latitude),
                parseFloat(user.office.longitude),
                parseFloat(latitude),
                parseFloat(longitude)
            );

            console.log(`Office: ${user.office.name}, Radius: ${user.office.radius}m, Distance: ${distance.toFixed(2)}m, GPS Accuracy: ${gpsAccuracy}m`);

            // Skip radius validation if GPS accuracy is very poor (>1000m = likely PC/desktop)
            // Only validate on mobile devices with good GPS accuracy
            if (gpsAccuracy < 1000 && distance > user.office.radius) {
                return res.status(400).json({
                    message: `Anda berada di luar radius kantor (${distance.toFixed(0)}m). Maksimal ${user.office.radius}m.`
                });
            }

            // Check-in time blocking validation
            if (user.office.enableBlocking) {
                const currentTime = new Date();
                const currentHour = currentTime.getHours();
                const currentMinute = currentTime.getMinutes();
                const currentTimeMinutes = currentHour * 60 + currentMinute;

                const [blockBeforeHour, blockBeforeMin] = user.office.blockBeforeTime.split(':').map(Number);
                const [blockAfterHour, blockAfterMin] = user.office.blockAfterTime.split(':').map(Number);
                const blockBeforeMinutes = blockBeforeHour * 60 + blockBeforeMin;
                const blockAfterMinutes = blockAfterHour * 60 + blockAfterMin;

                console.log(`Time Check: Current ${currentHour}:${currentMinute} (${currentTimeMinutes}min), Allowed: ${user.office.blockBeforeTime}-${user.office.blockAfterTime}`);

                if (currentTimeMinutes < blockBeforeMinutes || currentTimeMinutes > blockAfterMinutes) {
                    return res.status(400).json({
                        message: `Check-in hanya diizinkan antara jam ${user.office.blockBeforeTime} - ${user.office.blockAfterTime}`
                    });
                }
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

        // NOTIFICATION TRIGGER
        if (user.officeId) {
            const { notifySupervisor } = require('../services/notificationService');
            // Don't await to avoid blocking response
            notifySupervisor(
                user.officeId,
                'Absensi Masuk',
                `${user.name} baru saja melakukan Check In.`,
                'success',
                attendance.id
            ).catch(err => console.error('Notification Error:', err));
        }

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

        // NOTIFICATION TRIGGER
        // We need user info to get officeId and name. Attendance has userId.
        // Fetch user if not available in req.user (req.user has id/role, maybe not name/officeId)
        // Let's fetch user briefly
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && user.officeId) {
            const { notifySupervisor } = require('../services/notificationService');
            notifySupervisor(
                user.officeId,
                'Absensi Pulang',
                `${user.name} baru saja melakukan Check Out.`,
                'info',
                updatedAttendance.id
            ).catch(err => console.error('Notification Error:', err));
        }

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
        const userId = req.user.userId;
        const role = req.user.role;
        let where = {};

        if (role === 'supervisor') {
            const supervisor = await prisma.user.findUnique({
                where: { id: userId },
                select: { officeId: true }
            });

            if (supervisor?.officeId) {
                where = {
                    user: {
                        officeId: supervisor.officeId
                    }
                };
            }
        }

        const attendances = await prisma.attendance.findMany({
            where,
            include: { user: { select: { name: true, role: true, officeId: true } } },
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
        const userId = req.user.userId;
        const role = req.user.role;

        let userFilter = {}; // For filtering Counts based on Office

        if (role === 'supervisor') {
            const supervisor = await prisma.user.findUnique({
                where: { id: userId },
                select: { officeId: true }
            });

            if (supervisor?.officeId) {
                userFilter = { officeId: supervisor.officeId };
            }
        }

        // Simple stats for today
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        const totalEmployees = await prisma.user.count({
            where: {
                role: 'karyawan',
                ...userFilter
            }
        });

        const attendancesToday = await prisma.attendance.findMany({
            where: {
                attendanceDate: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                user: userFilter // Filter attendance by user's office
            },
            include: {
                user: {
                    include: { office: true }
                }
            }
        });

        const presentCount = attendancesToday.length;

        // Calculate 'late' based on office work schedule settings
        const lateCount = attendancesToday.filter(a => {
            if (!a.checkIn || !a.user?.office) return false;

            const checkInTime = new Date(a.checkIn);
            const checkInHour = checkInTime.getHours();
            const checkInMinute = checkInTime.getMinutes();
            const checkInMinutes = checkInHour * 60 + checkInMinute;

            const office = a.user.office;
            const [startHour, startMin] = office.workStartTime.split(':').map(Number);
            const workStartMinutes = startHour * 60 + startMin + office.gracePeriod;

            return checkInMinutes > workStartMinutes;
        }).length;

        // Calculate overtime (check-out after work end time)
        let overtimeMinutes = 0;
        attendancesToday.forEach(a => {
            if (!a.checkOut || !a.user?.office) return;

            const checkOutTime = new Date(a.checkOut);
            const checkOutHour = checkOutTime.getHours();
            const checkOutMinute = checkOutTime.getMinutes();
            const checkOutMinutes = checkOutHour * 60 + checkOutMinute;

            const office = a.user.office;
            const [endHour, endMin] = office.workEndTime.split(':').map(Number);
            const workEndMinutes = endHour * 60 + endMin;

            if (checkOutMinutes > workEndMinutes) {
                overtimeMinutes += (checkOutMinutes - workEndMinutes);
            }
        });

        const visitCount = await prisma.visit.count({
            where: {
                visitTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                user: userFilter // Filter visits by user's office
            }
        });

        res.json({
            totalEmployees,
            presentCount,
            lateCount,
            visitCount,
            overtimeMinutes
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
