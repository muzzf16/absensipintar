import React, { useEffect, useState } from 'react';

const SplashScreen = ({ onFinish }) => {
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        // Start fade out animation after 2 seconds
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 2000);

        // Remove splash screen after animation completes
        const removeTimer = setTimeout(() => {
            onFinish();
        }, 2500);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(removeTimer);
        };
    }, [onFinish]);

    return (
        <div
            className={`fixed inset-0 bg-blue-500 flex flex-col items-center justify-center z-50 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
        >
            <div className="bg-white/20 p-6 rounded-3xl backdrop-blur-sm mb-6 animate-pulse">
                <div className="bg-white p-4 rounded-2xl">
                    <img
                        src="/bapera.jpg"
                        alt="BAPERA Logo"
                        className="w-24 h-24 object-contain"
                    />
                </div>
            </div>
            <h1 className="text-white text-3xl font-bold mb-2">PresensiPintar</h1>
            <p className="text-blue-100 text-sm mb-8">PT. BPR BAPERA BATANG</p>

            {/* Loading spinner */}
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
        </div>
    );
};

export default SplashScreen;
