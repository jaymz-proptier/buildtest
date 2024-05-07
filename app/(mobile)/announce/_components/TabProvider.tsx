"use client"

import { createContext, ReactNode, useState } from "react";

export const TabContext = createContext({
    tab: "new",
    setTab: (value: "" | "네이버" | "이실장" | "매경" | "PPTN") => {},
});

type Props = { children: ReactNode };
export default function TabProvider({ children }: Props) {
    const [tab, setTab] = useState("");

    return (
        <TabContext.Provider value={{ tab, setTab }}>
            {children}
        </TabContext.Provider>
    )
}