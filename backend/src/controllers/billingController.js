const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');

const uploadBilling = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Transaction to ensure atomicity
                    const createPromises = results.map(row => {
                        return prisma.billing.create({
                            data: {
                                customerName: row.customerName,
                                principal: parseFloat(row.principal) || 0,
                                interest: parseFloat(row.interest) || 0,
                                penalty: parseFloat(row.penalty) || 0,
                                total: parseFloat(row.total) || 0,
                                dueDate: new Date(row.dueDate),
                                isPaid: false
                            }
                        });
                    });

                    await prisma.$transaction(createPromises);

                    // Cleanup file
                    fs.unlinkSync(req.file.path);

                    res.status(201).json({ message: `Successfully uploaded ${results.length} billing records` });
                } catch (error) {
                    console.error("Error inserting billing data:", error);
                    res.status(500).json({ message: 'Error processing CSV data', error: error.message });
                }
            });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
};

const getActiveBillings = async (req, res) => {
    try {
        const billings = await prisma.billing.findMany({
            where: { isPaid: false },
            orderBy: { dueDate: 'asc' }
        });
        res.json(billings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching billings', error: error.message });
    }
};

module.exports = {
    uploadBilling,
    getActiveBillings
};
