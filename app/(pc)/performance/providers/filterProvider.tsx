"use client"

import {createContext, ReactNode, useState} from "react";

export const filterContext = createContext({
    tab: "T01",
    setTab: (value: string) => {},
    sawonCode: "",
    setSawonCode: (value: string) => {},
    centerName: "",
    setCenterName: (value: string) => {},
    partName: "",
    setPartName: (value: string) => {}
});

type props = { children: ReactNode };

export default function FilterProvider({ children }: props) {
    const [tab, setTab] = useState<string>("T01");
    const [sawonCode, setSawonCode] = useState<string>("");
    const [centerName, setCenterName] = useState<string>("");
    const [partName, setPartName] = useState<string>("");

    return (
        <filterContext.Provider value={{ tab, setTab, sawonCode, setSawonCode, centerName, setCenterName, partName, setPartName }}>
            {children}
        </filterContext.Provider>
    )
}