const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');

const uploadBilling = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        // Get officeId from request body
        const { officeId } = req.body;
        if (!officeId) {
            return res.status(400).json({ message: 'Pilih kantor terlebih dahulu' });
        }

        // Verify office exists
        const office = await prisma.office.findUnique({ where: { id: officeId } });
        if (!office) {
            return res.status(400).json({ message: 'Kantor tidak ditemukan' });
        }

        const results = [];
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => {
                console.log("CSV Row:", data);
                results.push(data);
            })
            .on('end', async () => {
                try {
                    if (results.length === 0) {
                        return res.status(400).json({ message: 'File CSV kosong atau format salah' });
                    }

                    // Transaction to ensure atomicity
                    const createPromises = results.map((row, index) => {
                        console.log(`Processing row ${index}:`, row);

                        // Handle potential BOM in column names
                        const customerName = row.customerName || row['﻿customerName'] || row[Object.keys(row)[0]];
                        const principal = parseFloat(row.principal) || 0;
                        const interest = parseFloat(row.interest) || 0;
                        const penalty = parseFloat(row.penalty) || 0;
                        const total = parseFloat(row.total) || 0;
                        const dueDate = new Date(row.dueDate);

                        if (!customerName) {
                            throw new Error(`Row ${index + 1}: customerName tidak boleh kosong`);
                        }
                        if (isNaN(dueDate.getTime())) {
                            throw new Error(`Row ${index + 1}: dueDate format salah (gunakan YYYY-MM-DD)`);
                        }

                        return prisma.billing.create({
                            data: {
                                officeId,  // Link to office
                                customerName,
                                principal,
                                interest,
                                penalty,
                                total,
                                dueDate,
                                isPaid: false
                            }
                        });
                    });

                    await prisma.$transaction(createPromises);

                    // Cleanup file
                    fs.unlinkSync(req.file.path);

                    res.status(201).json({ message: `Berhasil upload ${results.length} data tagihan untuk ${office.name}` });
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
        const { userId, role } = req.user;
        let where = { isPaid: false };

        // Filter by user's office
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { officeId: true }
        });

        if (user?.officeId) {
            where.officeId = user.officeId;
        }

        // Admin can see all if no office assigned
        // Supervisor and karyawan only see their office billings

        const billings = await prisma.billing.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: { office: { select: { name: true } } }
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
