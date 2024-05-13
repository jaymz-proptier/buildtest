"use client"

import {createContext, ReactNode, useEffect, useState} from "react";

export const FilterContext = createContext({
    filter: "",
    setFilter: (value: string) => {},
    search: "",
    setSearch: (value: string) => {},
    sort: "contract",
    setSort: (value: "contract" | "end" | "coupon") => {},
});

type Props = { children: ReactNode };
export default function FilterProvider({ children }: Props) {
    const [filter, setFilter] = useState("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("contract");
    useEffect(() => {
        if (typeof window!=="undefined") {
          const params = new URLSearchParams(window.location.search);
          if(params.get("filter")) {
            setFilter(params.get("filter") || "");
            window.history.pushState({}, "", window.location.pathname);
          }
        }
    }, []);

    return (
        <FilterContext.Provider value={{ filter, setFilter, search, setSearch, sort, setSort }}>
            {children}
        </FilterContext.Provider>
    )
}