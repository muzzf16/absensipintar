const prisma = require('../utils/db');

const createNotification = async (userId, title, message, type = 'info', referenceId = null) => {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                referenceId
            }
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

const notifySupervisor = async (officeId, title, message, type = 'info', referenceId = null) => {
    try {
        // Find supervisors in the office
        // Assuming supervisors have role 'supervisor' OR 'admin' (admin might want to know too, but let's stick to supervisor logic first)
        // Actually, let's find ALL users with role 'supervisor' assigned to this office.
        // Also include 'admin' regardless of office? Or maybe just supervisors of that office.

        const supervisors = await prisma.user.findMany({
            where: {
                role: 'supervisor',
                officeId: officeId
            }
        });

        // Also notify global admins? Maybe later. For now, strict office supervision.

        for (const spv of supervisors) {
            await createNotification(spv.id, title, message, type, referenceId);
        }

    } catch (error) {
        console.error('Error notifying supervisor:', error);
    }
};

module.exports = { createNotification, notifySupervisor };
