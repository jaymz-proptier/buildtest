"use client"

import { createContext, ReactNode, useState } from "react";

export const TabContext = createContext({
     tab: "new",
    setTab: (value: "new" | "expire") => {},
});

type Props = { children: ReactNode };
export default function TabProvider({ children }: Props) {
    const [tab, setTab] = useState("new");

    return (
        <TabContext.Provider value={{ tab, setTab }}>
            {children}
        </TabContext.Provider>
    )
}