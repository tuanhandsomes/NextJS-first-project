'use client'
import { createContext, useContext, useState } from "react";

const Appcontext = createContext({
    sessionToken: '',
    setSessionToken: (sessionToken: string) => { }
});

export const useAppContext = () => {
    const context = useContext(Appcontext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}

export default function AppProvider({
    children, inititalSessionToken = ''
}: {
    children: React.ReactNode
    inititalSessionToken?: string
}) {
    const [sessionToken, setSessionToken] = useState(inititalSessionToken);
    return (
        <Appcontext.Provider value={{ sessionToken, setSessionToken }}>
            {children}
        </Appcontext.Provider>
    )
}