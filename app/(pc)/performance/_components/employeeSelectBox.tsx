"use client";
import style from "@/styles/pc.module.css";
import { useQuery } from "@tanstack/react-query";
import { getEmployeeList } from "../_lib/getList";
import { useContext, useEffect, useState } from "react";
import { filterContext } from "../providers/filterProvider";
import { useRouter } from "next/navigation";
interface Item {
    page: number;
}
export default function EmployeeSelectBox(){
    const router = useRouter();
    const { sawonCode, setSawonCode } = useContext(filterContext);
    const [selectBox, setSelectBox] = useState(false);

    const { data, isLoading } = useQuery<Item[], Object, Item[], [_1: string, _2: string, _3: string]>({
        queryKey: ["admin", "exployee", "selectBox"],
        queryFn: getEmployeeList,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;

    const handleSelectBox = (code: string) => {
        setSelectBox(false);
        router.push(`/performance/${code}`);
    }
    return <div className={style.select_box}>
        <button type="button" aria-selected={selectBox} onClick={() => setSelectBox(!selectBox)}>{data?.data.find((item:any) => item.sawonCode===Number(sawonCode))?.name || "전체"}</button>
        <div className={style.select_box_list}>
            <ul>
                {data?.data.map((item: any, index: number) => (
                <li key={index} onClick={() => handleSelectBox(item.sawonCode)}>{item.name}</li>
                ))}
            </ul>
        </div>
    </div>
}