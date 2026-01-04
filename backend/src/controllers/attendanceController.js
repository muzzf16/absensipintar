const prisma = require('../utils/db');

const checkIn = async (req, res) => {
    try {
        const userId = req.user.userId;
        const now = new Date();

        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

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
            return res.status(400).json({ message: 'Already checked in today' });
        }

        const attendance = await prisma.attendance.create({
            data: {
                userId,
                checkIn: new Date(),
                attendanceDate: new Date(),
            },
        });

        res.status(201).json({ message: 'Check-in successful', attendance });
    } catch (error) {
        res.status(500).json({ message: 'Error checking in', error: error.message });
    }
};

const checkOut = async (req, res) => {
    try {
        const userId = req.user.userId;
        const now = new Date();
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
            data: { checkOut: new Date() },
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

module.exports = { checkIn, checkOut, getHistory, getAllAttendance, getStats };
