const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const csv = require('csv-parser');

const uploadBilling = async (req, res) => {
    try {
        console.log('=== BILLING UPLOAD START ===');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file ? req.file.path : 'no file');

        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a CSV file' });
        }

        // Get officeId from request body
        const { officeId } = req.body;
        console.log('officeId:', officeId);

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

                        // Parse date - support both DD/MM/YYYY and YYYY-MM-DD formats
                        let dueDate;
                        const rawDate = row.dueDate?.trim();
                        if (rawDate && rawDate.includes('/')) {
                            // Format DD/MM/YYYY - convert to YYYY-MM-DD
                            const [day, month, year] = rawDate.split('/');
                            dueDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
                        } else {
                            // Format YYYY-MM-DD
                            dueDate = new Date(rawDate);
                        }

                        if (!customerName) {
                            throw new Error(`Row ${index + 1}: customerName tidak boleh kosong`);
                        }
                        if (isNaN(dueDate.getTime())) {
                            throw new Error(`Row ${index + 1}: dueDate format salah (gunakan DD/MM/YYYY atau YYYY-MM-DD)`);
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
        const { userId } = req.user;
        const { officeId: queryOfficeId } = req.query; // Accept officeId from query
        let where = { isPaid: false };

        // If officeId provided in query, use it (admin can view any office)
        if (queryOfficeId) {
            where.officeId = queryOfficeId;
        } else {
            // Otherwise filter by user's office
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { officeId: true }
            });
            if (user?.officeId) {
                where.officeId = user.officeId;
            }
        }

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

// Get paid billings
const getPaidBillings = async (req, res) => {
    try {
        const { userId } = req.user;
        const { officeId: queryOfficeId } = req.query; // Accept officeId from query
        let where = { isPaid: true };

        // If officeId provided in query, use it
        if (queryOfficeId) {
            where.officeId = queryOfficeId;
        } else {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { officeId: true }
            });
            if (user?.officeId) {
                where.officeId = user.officeId;
            }
        }

        const billings = await prisma.billing.findMany({
            where,
            orderBy: { paidAt: 'desc' },
            include: { office: { select: { name: true } } }
        });
        res.json(billings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching paid billings', error: error.message });
    }
};

// Get all billings (paid + unpaid)
const getAllBillings = async (req, res) => {
    try {
        const { userId } = req.user;
        let where = {};

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { officeId: true }
        });

        if (user?.officeId) {
            where.officeId = user.officeId;
        }

        const billings = await prisma.billing.findMany({
            where,
            orderBy: { dueDate: 'asc' },
            include: { office: { select: { name: true } } }
        });
        res.json(billings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching all billings', error: error.message });
    }
};

// Mark billing as paid
const markAsPaid = async (req, res) => {
    try {
        const { id } = req.params;
        const { paidAmount, paidNote } = req.body;

        const billing = await prisma.billing.update({
            where: { id },
            data: {
                isPaid: true,
                paidAmount: paidAmount ? parseFloat(paidAmount) : null,
                paidAt: new Date(),
                paidNote: paidNote || null
            }
        });

        res.json({ message: 'Tagihan berhasil ditandai lunas', billing });
    } catch (error) {
        res.status(500).json({ message: 'Error marking billing as paid', error: error.message });
    }
};

// Mark billing as unpaid (revert)
const markAsUnpaid = async (req, res) => {
    try {
        const { id } = req.params;

        const billing = await prisma.billing.update({
            where: { id },
            data: {
                isPaid: false,
                paidAmount: null,
                paidAt: null,
                paidNote: null
            }
        });

        res.json({ message: 'Pembayaran tagihan dibatalkan', billing });
    } catch (error) {
        res.status(500).json({ message: 'Error marking billing as unpaid', error: error.message });
    }
};

module.exports = {
    uploadBilling,
    getActiveBillings,
    getPaidBillings,
    getAllBillings,
    markAsPaid,
    markAsUnpaid
};
