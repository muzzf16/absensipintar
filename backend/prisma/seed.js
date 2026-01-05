const prisma = require('../src/utils/db');
const bcrypt = require('bcryptjs');

async function main() {
    console.log('🌱 Starting seed...');

    // Hash passwords
    const password = await bcrypt.hash('password123', 10);
    const adminPassword = await bcrypt.hash('admin123', 10);

    // 1. Create Users
    console.log('👤 Seeding Users...');

    // Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@company.com' },
        update: {},
        create: {
            email: 'admin@company.com',
            name: 'Admin Supervisor',
            password: adminPassword,
            role: 'supervisor',
        },
    });

    // Employee 1
    const user1 = await prisma.user.upsert({
        where: { email: 'user1@company.com' },
        update: {},
        create: {
            email: 'user1@company.com',
            name: 'Budi Santoso',
            password: password,
            role: 'karyawan',
        },
    });

    // Employee 2
    const user2 = await prisma.user.upsert({
        where: { email: 'user2@company.com' },
        update: {},
        create: {
            email: 'user2@company.com',
            name: 'Andi Wijaya',
            password: password,
            role: 'karyawan',
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
