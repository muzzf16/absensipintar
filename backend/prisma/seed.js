const prisma = require('../src/utils/db');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Starting seed...');

    // Hash passwords
    const password = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // 0. Create Offices
    console.log('🏢 Seeding Offices...');
    // Kantor Cabang Limpung
    const officeLimpung = await prisma.office.upsert({
        where: { id: 'office-limpung' },
        update: {},
        create: {
            id: 'office-limpung',
            name: 'Kantor Cabang Limpung',
            latitude: -7.000000,
            longitude: 109.900000,
            radius: 500
        }
    });

    // Kantor Cabang Bandar
    const officeBandar = await prisma.office.upsert({
        where: { id: 'office-bandar' },
        update: {},
        create: {
            id: 'office-bandar',
            name: 'Kantor Cabang Bandar',
            latitude: -7.020000,
            longitude: 109.800000,
            radius: 500
        }
    });

    // 1. Create Users
    console.log('👤 Seeding Users...');

    // Admin (Global)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {
            password: adminPassword,
            role: 'admin',
            officeId: 'office-limpung' // Defaulting to one for now, or null if admin is global
        },
        create: {
            email: 'admin@company.com',
            name: 'Admin HR',
            password: adminPassword,
            role: 'admin',
            officeId: 'office-limpung'
        },
    });

    // Supervisor Limpung
    const spvLimpung = await prisma.user.upsert({
        where: { email: 'spv.limpung@company.com' },
        update: {
            password: adminPassword,
            role: 'supervisor',
            officeId: 'office-limpung',
            name: 'SPV Limpung'
        },
        create: {
            email: 'spv.limpung@company.com',
            name: 'SPV Limpung',
            password: adminPassword,
            role: 'supervisor',
            officeId: 'office-limpung'
        },
    });

    // Supervisor Bandar
    const spvBandar = await prisma.user.upsert({
        where: { email: 'spv.bandar@company.com' },
        update: {
            password: adminPassword,
            role: 'supervisor',
            officeId: 'office-bandar',
            name: 'SPV Bandar'
        },
        create: {
            email: 'spv.bandar@company.com',
            name: 'SPV Bandar',
            password: adminPassword,
            role: 'supervisor',
            officeId: 'office-bandar'
        },
    });

    // Employee Limpung 1
    const userLimpung1 = await prisma.user.upsert({
        where: { email: 'karyawan.limpung1@company.com' },
        update: {
            password: password,
            role: 'karyawan',
            officeId: 'office-limpung',
            name: 'Karyawan Limpung 1'
        },
        create: {
            email: 'karyawan.limpung1@company.com',
            name: 'Karyawan Limpung 1',
            password: password,
            role: 'karyawan',
            officeId: 'office-limpung'
        },
    });

    // Employee Limpung 2
    const userLimpung2 = await prisma.user.upsert({
        where: { email: 'karyawan.limpung2@company.com' },
        update: {
            password: password,
            role: 'karyawan',
            officeId: 'office-limpung',
            name: 'Karyawan Limpung 2'
        },
        create: {
            email: 'karyawan.limpung2@company.com',
            name: 'Karyawan Limpung 2',
            password: password,
            role: 'karyawan',
            officeId: 'office-limpung'
        },
    });

    // Employee Bandar 1
    const userBandar1 = await prisma.user.upsert({
        where: { email: 'karyawan.bandar1@company.com' },
        update: {
            password: password,
            role: 'karyawan',
            officeId: 'office-bandar',
            name: 'Karyawan Bandar 1'
        },
        create: {
            email: 'karyawan.bandar1@company.com',
            name: 'Karyawan Bandar 1',
            password: password,
            role: 'karyawan',
            officeId: 'office-bandar'
        },
    });

    // Employee Bandar 2
    const userBandar2 = await prisma.user.upsert({
        where: { email: 'karyawan.bandar2@company.com' },
        update: {
            password: password,
            role: 'karyawan',
            officeId: 'office-bandar',
            name: 'Karyawan Bandar 2'
        },
        create: {
            email: 'karyawan.bandar2@company.com',
            name: 'Karyawan Bandar 2',
            password: password,
            role: 'karyawan',
            officeId: 'office-bandar'
        },
    });

    // 2. Create Customers
    console.log('🏢 Seeding Customers...');

    const customers = [
        { id: 'cust-1', name: 'PT Maju Mundur', address: 'Jl. Medan Merdeka Barat, Jakarta', lat: -6.175392, lng: 106.827153 },
        { id: 'cust-2', name: 'Toko Abadi Jaya', address: 'Jl. Jendral Sudirman No. 10, Jakarta', lat: -6.208763, lng: 106.845599 },
        { id: 'cust-3', name: 'CV Sentosa', address: 'Jl. MH Thamrin No. 5, Jakarta', lat: -6.192455, lng: 106.822987 },
        { id: 'cust-4', name: 'Warung Bu Susi', address: 'Jl. Gatot Subroto No. 88', lat: -6.229728, lng: 106.816430 },
        { id: 'cust-5', name: 'UD Sumber Rejeki', address: 'Jl. Pasar Minggu Raya', lat: -6.284100, lng: 106.844414 },
        { id: 'cust-6', name: 'Koperasi Warga', address: 'Jl. Raya Bogor KM 22', lat: -6.321655, lng: 106.864312 },
    ];

    for (const cust of customers) {
        await prisma.customer.upsert({
            where: { id: cust.id },
            update: {},
            create: {
                id: cust.id,
                name: cust.name,
                address: cust.address,
                latitude: cust.lat,
                longitude: cust.lng,
            }
        });
    }

    // 3. Create Billings (for Tagih Angsuran feature)
    console.log('💰 Seeding Billings...');

    // Clear existing billings first to avoid duplicates if re-seeding without reset
    await prisma.billing.deleteMany({});

    const billings = [
        {
            customerName: 'PT Maju Mundur',
            principal: 10000000,
            interest: 500000,
            penalty: 0,
            total: 10500000,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5)) // 5 days from now
        },
        {
            customerName: 'Toko Abadi Jaya',
            principal: 2500000,
            interest: 150000,
            penalty: 50000,
            total: 2700000,
            dueDate: new Date(new Date().setDate(new Date().getDate() - 2)) // Overdue 2 days
        },
        {
            customerName: 'Warung Bu Susi',
            principal: 500000,
            interest: 25000,
            penalty: 0,
            total: 525000,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 10))
        }
    ];

    for (const bill of billings) {
        // We link by name as per current simple implementation (Billing table doesn't have FK to Customer yet, just name match)
        await prisma.billing.create({
            data: {
                customerName: bill.customerName,
                principal: bill.principal,
                interest: bill.interest,
                penalty: bill.penalty,
                total: bill.total,
                dueDate: bill.dueDate,
                isPaid: false
            }
        });
    }

    console.log('✅ Seed completed successfully!');
    console.log('------------------------------------------------');
    console.log('Admin Creds: admin@company.com / admin123');
    console.log('User Creds: user1@company.com / password123');
    console.log('------------------------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
