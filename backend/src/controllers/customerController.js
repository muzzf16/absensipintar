const prisma = require('../utils/db');

const getCustomers = async (req, res) => {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { name: 'asc' }
        });
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching customers', error: error.message });
    }
};

module.exports = { getCustomers };
