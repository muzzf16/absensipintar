const prisma = require('../utils/db');

const getAllOffices = async (req, res) => {
    try {
        const offices = await prisma.office.findMany({
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

module.exports = { getAllOffices, createOffice, updateOffice, deleteOffice };
