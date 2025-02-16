'use client';

// src/app/context/GlobalStateContext.tsx
import React, { createContext, useState, ReactNode, useContext } from 'react';

// Define the context type (now it's an array of strings)
interface GlobalStateContextType {
  res: string[]; // An array of strings
  setRes: React.Dispatch<React.SetStateAction<string[]>>; // Update function for the array
}

// Create the context with a default value
const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

// Create a provider component
export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  const [res, setRes] = useState<string[]>([]); // Initialize with an empty array or default values

  return (
    <GlobalStateContext.Provider value={{ res, setRes }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

// Custom hook to use the context in any component
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};
