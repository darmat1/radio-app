'use client';

import { useEffect, useState } from 'react';

export default function HydrationFix({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <div suppressHydrationWarning>
      {isHydrated ? children : (
        <div className="min-h-screen bg-gray-950 text-white">
          <div className="max-w-md mx-auto p-4 space-y-4">
            <div className="animate-pulse">
              <div className="h-8 w-24 bg-gray-800 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="bg-gray-900 p-4 rounded-lg h-32"></div>
                <div className="bg-gray-900 p-4 rounded-lg h-24"></div>
                <div className="bg-gray-900 p-4 rounded-lg h-64"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}