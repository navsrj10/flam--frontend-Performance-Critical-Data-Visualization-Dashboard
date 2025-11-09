'use client';

import { createContext, useEffect, useState } from "react";

export const DataContext = createContext<{ data: any[] }>({ data: [] });

export function DataProviderClient({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const id = setInterval(() => {
      setData(prev => [
        ...prev.slice(-1000), // keep the last 1000 data points
        { t: Date.now(), value: Math.random() * 100 }, // synthetic random data
      ]);
    }, 100); // every 100ms
    return () => clearInterval(id);
  }, []);

  return <DataContext.Provider value={{ data }}>{children}</DataContext.Provider>;
}
