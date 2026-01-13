const prisma = require('../utils/db');

const getAllOffices = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let where = {};

        if (role === 'supervisor') {
            const supervisor = await prisma.user.findUnique({
                where: { id: userId },
                select: { officeId: true }
            });

            if (supervisor?.officeId) {
                where.id = supervisor.officeId;
            } else {
                // Safe fallback: if supervisor has no office, return nothing (or handle gracefully)
                where.id = 'non-existent-id';
            }
        }

        const offices = await prisma.office.findMany({
            where,
            include: { _count: { select: { users: true } } }
        });
        res.json(offices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offices', error: error.message });
    }
};

const createOffice = async (req, res) => {
    try {
        const { name, latitude, longitude, radius } = req.body;
        const office = await prisma.office.create({
            data: {
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: parseInt(radius) || 100
            }
        });
        res.status(201).json(office);
    } catch (error) {
        res.status(500).json({ message: 'Error creating office', error: error.message });
    }
};

const updateOffice = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, latitude, longitude, radius } = req.body;
        const office = await prisma.office.update({
            where: { id },
            data: {
                name,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                radius: parseInt(radius)
            }
        });
        res.json(office);
    } catch (error) {
        res.status(500).json({ message: 'Error updating office', error: error.message });
    }
};

const deleteOffice = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.office.delete({ where: { id } });
        res.json({ message: 'Office deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting office', error: error.message });
    }
};

// Get work schedule settings for an office
const getWorkSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const office = await prisma.office.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                workStartTime: true,
                workEndTime: true,
                gracePeriod: true,
                enableBlocking: true,
                blockBeforeTime: true,
                blockAfterTime: true
            }
        });

        if (!office) {
            return res.status(404).json({ message: 'Office not found' });
        }

        res.json(office);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching work schedule', error: error.message });
    }
};

// Update work schedule settings for an office
const updateWorkSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            workStartTime,
            workEndTime,
            gracePeriod,
            enableBlocking,
            blockBeforeTime,
            blockAfterTime
        } = req.body;

        const office = await prisma.office.update({
            where: { id },
            data: {
                workStartTime: workStartTime || '08:00',
                workEndTime: workEndTime || '17:00',
                gracePeriod: parseInt(gracePeriod) || 15,
                enableBlocking: Boolean(enableBlocking),
                blockBeforeTime: blockBeforeTime || '06:00',
                blockAfterTime: blockAfterTime || '12:00'
            }
        });

        res.json({ message: 'Work schedule updated successfully', office });
    } catch (error) {
        res.status(500).json({ message: 'Error updating work schedule', error: error.message });
    }
};

module.exports = {
    getAllOffices,
    createOffice,
    updateOffice,
    deleteOffice,
    getWorkSchedule,
    updateWorkSchedule
};
