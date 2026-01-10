const prisma = require('../utils/db');
const bcrypt = require('bcryptjs');

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                office: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Remove passwords from response
        const safeUsers = users.map(user => {
            const { password, ...rest } = user;
            return rest;
        });

        res.json(safeUsers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, officeId } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role: role || 'karyawan',
            officeId: officeId || null
        };

        const user = await prisma.user.create({
            data: userData,
        });

        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, officeId } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const updateData = {
            name,
            email,
            role,
            officeId: officeId || null
        };

        if (password && password.trim() !== '') {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        const { password: _, ...userWithoutPassword } = user;
        res.json({ message: 'User updated successfully', user: userWithoutPassword });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (req.user && req.user.userId === id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Manual Cascade Delete using Transaction
        await prisma.$transaction(async (prisma) => {
            // 1. Delete Approvals where user is the approver
            await prisma.approval.deleteMany({
                where: { approverId: id }
            });

            // 2. Delete Approvals belonging to user's visits
            await prisma.approval.deleteMany({
                where: { visit: { userId: id } }
            });

            // 3. Delete VisitProducts belonging to user's visits
            await prisma.visitProduct.deleteMany({
                where: { visit: { userId: id } }
            });

            // 4. Delete Visits belonging to user
            await prisma.visit.deleteMany({
                where: { userId: id }
            });

            // 5. Delete Attendances belonging to user
            await prisma.attendance.deleteMany({
                where: { userId: id }
            });

            // 6. Finally delete the User
            await prisma.user.delete({ where: { id } });
        });

        res.json({ message: 'User and related data deleted successfully' });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUser,
    deleteUser
};
