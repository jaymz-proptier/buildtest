"use client"

import {createContext, ReactNode, useState} from "react";

export const FilterContext = createContext({
  filter: "",
  setFilter: (value: "" | "이실장" | "포커스" | "프리미엄") => {},
});

type Props = { children: ReactNode };
export default function FilterProvider({ children }: Props) {
  const [filter, setFilter] = useState("");

  return (
    <FilterContext.Provider value={{ filter, setFilter }}>
      {children}
    </FilterContext.Provider>
  )
}