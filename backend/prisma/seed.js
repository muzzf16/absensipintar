const prisma = require('../src/utils/db');
const bcrypt = require('bcryptjs');

async function main() {
    const password = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'karyawan@company.com' },
        update: {},
        create: {
            email: 'karyawan@company.com',
            name: 'Budi Santoso',
            password,
            role: 'karyawan',
        },
    });

    const supervisor = await prisma.user.upsert({
        where: { email: 'spv@company.com' },
        update: {},
        create: {
            email: 'spv@company.com',
            name: 'Pak Agus',
            password,
            role: 'supervisor',
        },
    });

    // Seed Customers
    const monitorLat = -6.175392; // Monas
    const monitorLng = 106.827153;

    await prisma.customer.upsert({
        where: { id: 'cust-1' },
        update: {},
        create: {
            id: 'cust-1',
            name: 'PT Maju Mundur',
            address: 'Jl. Medan Merdeka Barat, Jakarta',
            latitude: monitorLat,
            longitude: monitorLng,
        }
    });

    await prisma.customer.upsert({
        where: { id: 'cust-2' },
        update: {},
        create: {
            id: 'cust-2',
            name: 'Toko Abadi Jaya',
            address: 'Jl. Jendral Sudirman No. 10, Jakarta',
            latitude: -6.208763,
            longitude: 106.845599,
        }
    });

    await prisma.customer.upsert({
        where: { id: 'cust-3' },
        update: {},
        create: {
            id: 'cust-3',
            name: 'CV Sentosa',
            address: 'Jl. MH Thamrin No. 5, Jakarta',
            latitude: -6.192455,
            longitude: 106.822987,
        }
    });

    console.log({ user, supervisor });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
