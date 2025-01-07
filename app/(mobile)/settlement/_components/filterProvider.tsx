"use client"

import {createContext, ReactNode, useEffect, useState} from "react";

const currentYear = new Date().getFullYear();
const currentMonth = new Date();
currentMonth.setMonth(currentMonth.getMonth() - 1);

export const FilterContext = createContext({
    year: currentYear,
    setYear: (value: number) => {},
    month: currentMonth.toString().padStart(2, "0"),
    setMonth: (value: string) => {},
});

type Props = { children: ReactNode };

export default function FilterProvider({ children }: Props) {
    
    const [ year, setYear ] = useState(currentMonth.getFullYear());
    const [ month, setMonth ] = useState((currentMonth.getMonth() + 1).toString().padStart(2, "0"));
    return (
        <FilterContext.Provider value={{ year, setYear, month, setMonth }}>
            {children}
        </FilterContext.Provider>
    );
}