const prisma = require('../utils/db');
const { getDistanceFromLatLonInMeters } = require('../utils/geoUtils');
const { generateVisitsPDF } = require('../utils/pdfGenerator');


const createVisit = async (req, res) => {
    try {
        console.log("---------------- CREATE VISIT START ----------------");
        console.log("Body:", req.body);
        console.log("User:", req.user);

        const {
            customerId, purpose, notes, latitude, longitude, photoUrl,
            // New Marketing Fields
            prospectStatus, potentialValue, marketingNotes, followUpAt,
            products // Array of { productCode, productName, prospectStatus, potentialValue }
        } = req.body;
        const userId = req.user.userId;

        if (!latitude || !longitude) {
            console.log("Error: Missing GPS");
            return res.status(400).json({ message: 'GPS Location is required.' });
        }

        // 0. Check for Attendance (Clock In)
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
        });

        console.log("Attendance Record:", attendance);

        if (!attendance || !attendance.checkIn) {
            console.log("Error: Not Checked In");
            return res.status(403).json({ message: 'You must Clock In (Absen Masuk) first before creating a visit.' });
        }

        // 1. Get Customer Location
        const customer = await prisma.customer.findUnique({ where: { id: customerId } });
        console.log("Customer Record:", customer);

        if (!customer) {
            console.log("Error: Customer not found");
            return res.status(404).json({ message: 'Customer not found.' });
        }

        // 2. Calculate Distance
        const distanceInfo = getDistanceFromLatLonInMeters(
            parseFloat(latitude), parseFloat(longitude),
            customer.latitude, customer.longitude
        );

        console.log(`Calculate Distance: User(${latitude}, ${longitude}) vs Customer(${customer.latitude}, ${customer.longitude}) = ${distanceInfo} meters`);

        // 3. Validate Radius (e.g., 100 meters)
        const MAX_RADIUS = 100;
        if (distanceInfo > MAX_RADIUS) {
            console.log("Error: Out of Radius");
            return res.status(400).json({
                message: `Out of range! You are ${Math.round(distanceInfo)}m away from customer. Max allowed is ${MAX_RADIUS}m.`
            });
        }

        // Prepare Visit Data
        const visitData = {
            userId,
            customerId,
            attendanceId: attendance.id,
            purpose,
            notes,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            photoUrl,
            status: 'pending',
            visitTime: new Date(),
            // New Fields
            prospectStatus,
            potentialValue: potentialValue ? parseFloat(potentialValue) : null,
            marketingNotes,
            followUpAt: followUpAt ? new Date(followUpAt) : null,
        };

        // Handle Visit Products Nested Create
        if (products && Array.isArray(products) && products.length > 0) {
            visitData.visitProducts = {
                create: products.map(p => ({
                    productCode: p.productCode,
                    productName: p.productName,
                    prospectStatus: p.prospectStatus,
                    potentialValue: p.potentialValue ? parseFloat(p.potentialValue) : null
                }))
            };
        }

        const visit = await prisma.visit.create({
            data: visitData,
            include: { visitProducts: true } // Return created products
        });

        console.log("Visit Created:", visit);
        console.log("---------------- CREATE VISIT END ----------------");

        res.status(201).json(visit);
    } catch (error) {
        console.error("CREATE VISIT ERROR:", error);
        res.status(500).json({ message: 'Error creating visit', error: error.message });
    }
};

const getVisits = async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const { startDate, endDate, customerId, userId: filterUserId } = req.query;

        let where = {};

        // Base logic: Karyawan sees own, Admin sees all (or filtered)
        if (role === 'karyawan') {
            where.userId = userId;
        } else if (filterUserId) {
            where.userId = filterUserId;
        }

        // Apply Date Filter
        if (startDate && endDate) {
            where.visitTime = {
                gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        // Apply Customer Filter
        if (customerId) {
            where.customerId = customerId;
        }

        const visits = await prisma.visit.findMany({
            where,
            include: {
                user: { select: { name: true } },
                customer: { select: { name: true } },
                visitProducts: true
            },
            orderBy: { visitTime: 'desc' },
        });

        res.json(visits);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching visits', error: error.message });
    }
};

const exportVisitsCSV = async (req, res) => {
    try {
        const { startDate, endDate, customerId, userId: filterUserId } = req.query;
        let where = {};

        // Reuse filter logic (simplified for brevity, ideally shared helper)
        if (filterUserId) where.userId = filterUserId;
        if (customerId) where.customerId = customerId;
        if (startDate && endDate) {
            where.visitTime = {
                gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const visits = await prisma.visit.findMany({
            where,
            include: {
                user: { select: { name: true } },
                customer: { select: { name: true } },
                visitProducts: true
            },
            orderBy: { visitTime: 'desc' },
        });

        // Manual CSV Generation
        const headers = ['Date', 'Time', 'Employee', 'Customer', 'Purpose', 'Status', 'Latitude', 'Longitude', 'Notes', 'Prospect Status', 'Potential Value', 'Follow Up', 'Marketing Notes', 'Products'];
        const rows = visits.map(v => [
            new Date(v.visitTime).toLocaleDateString(),
            new Date(v.visitTime).toLocaleTimeString(),
            v.user?.name || 'Unknown',
            v.customer?.name || 'Unknown',
            `"${v.purpose}"`, // Escape quotes
            v.status,
            v.latitude,
            v.longitude,
            `"${v.notes || ''}"`,
            v.prospectStatus || '',
            v.potentialValue || '',
            v.followUpAt ? new Date(v.followUpAt).toLocaleDateString() : '',
            `"${v.marketingNotes || ''}"`,
            `"${v.visitProducts ? v.visitProducts.map(p => p.productName).join('; ') : ''}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        res.header('Content-Type', 'text/csv');
        res.attachment('visits_report.csv');
        res.send(csvContent);

    } catch (error) {
        res.status(500).json({ message: 'Error exporting CSV', error: error.message });
    }
};

const approveVisit = async (req, res) => {
    try {
        const { id } = req.params;
        const approverId = req.user.userId;
        const { status, note } = req.body; // status: 'approved' or 'rejected'

        const visit = await prisma.visit.update({
            where: { id },
            data: { status },
        });

        await prisma.approval.create({
            data: {
                visitId: id,
                approverId,
                status,
                note
            }
        });

        res.json({ message: `Visit ${status}`, visit });
    } catch (error) {
        res.status(500).json({ message: 'Error approving visit', error: error.message });
    }
};

const exportVisitsPDF = async (req, res) => {
    try {
        const { startDate, endDate, customerId, userId: filterUserId } = req.query;
        let where = {};

        // Reuse filter logic
        if (filterUserId) where.userId = filterUserId;
        if (customerId) where.customerId = customerId;
        if (startDate && endDate) {
            where.visitTime = {
                gte: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
                lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
            };
        }

        const visits = await prisma.visit.findMany({
            where,
            include: { user: { select: { name: true } }, customer: { select: { name: true } } },
            orderBy: { visitTime: 'desc' },
        });

        // Generate PDF
        const doc = generateVisitsPDF(visits, { startDate, endDate, userId: filterUserId, customerId });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=visits_report.pdf');

        // Pipe the PDF to response
        doc.pipe(res);
        doc.end();

    } catch (error) {
        console.error('PDF Export Error:', error);
        res.status(500).json({ message: 'Error exporting PDF', error: error.message });
    }
};

module.exports = { createVisit, getVisits, approveVisit, exportVisitsCSV, exportVisitsPDF };

