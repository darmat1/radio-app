'use client';

import { useState } from 'react';
import { Station } from '@/lib/radioAPI';

export default function StationFavicon({
    station,
    className = "w-12 h-12 rounded object-cover flex-shrink-0 bg-white"
}: {
    station: Station;
    className?: string;
}) {
    const [error, setError] = useState(false);

    if (error || !station.favicon || station.favicon === 'null') {
        return (
            <div className={`${className} bg-white flex items-center justify-center`}>
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <img
            src={station.favicon}
            alt={station.name}
            className={className}
            onError={() => setError(true)}
        />
    );
}
