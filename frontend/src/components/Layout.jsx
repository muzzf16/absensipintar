import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, MapPin, ClipboardList, LogOut } from 'lucide-react';
import clsx from 'clsx';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { icon: Home, label: 'Home', path: '/dashboard' },
        { icon: MapPin, label: 'Absen', path: '/attendance' },
        { icon: ClipboardList, label: 'Kunjungan', path: '/visits' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">

            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
};

export default Layout;
