const prisma = require('../utils/db');

const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false }
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;

        if (id === 'all') {
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        } else {
            await prisma.notification.update({
                where: { id, userId },
                data: { isRead: true }
            });
        }

        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error: error.message });
    }
};

module.exports = { getNotifications, markAsRead };
