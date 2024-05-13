"use client";
import style from "@/styles/mobile-contract.module.css";
import { useContext, useEffect, useState } from "react";
import { FilterContext } from "./filterProvider";
import { useQuery } from "@tanstack/react-query";
import { getContractCounts } from "../_lib/getContractCount";
import { TabContext } from "./TabProvider";

interface Item {
    data: any,
    status: string,
    message: string,
    total: number
}
export default function ContractFilterBox({ sawonCode }: { sawonCode: number }) {
    const { tab } = useContext(TabContext);
    const { filter, setFilter } = useContext(FilterContext);
    const [ selectBox, setSelectBox ] = useState(false);
    const filterCode: {
        code: string,
        title: string
    }[] = [
        { code: "", title: "종합"},
        { code: "이실장", title: "이실장"},
        { code: "포커스", title: "매경"},
    ];
    const { data: totalCount } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number, _4: string, _5: string]>({
        queryKey: ['member', 'salesCount', sawonCode, tab, filter],
        queryFn: getContractCounts,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    return <>
        <div className={style.sorting_wrap}>
            <div className={style.reponse_count}>
                {tab==="new" ? "매출" : "탈락"}내역  {totalCount ? totalCount.total : 0}개
            </div> 
            <div className={style.select_box}>
                <button type="button" aria-selected={selectBox} onClick={() => setSelectBox(!selectBox)}>{filterCode.find((item) => item.code===filter)?.title}</button>
                <div className={style.select_box_list}>
                    <ul>
                        {filterCode.map((item: any, index: number) => (
                        <li key={index} onClick={() => { setSelectBox(false); setFilter(item.code); }}>{item.title}</li>
                        ))}
                    </ul>
                </div>
            </div>        
        </div>   
    </>
}