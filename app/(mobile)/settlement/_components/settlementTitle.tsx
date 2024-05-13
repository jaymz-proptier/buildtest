"use client";
import { useContext, useEffect, useState } from "react";
import { FilterContext } from "./filterProvider";
import style from "@/styles/mobile-settlement.module.css";
import { useQuery } from "@tanstack/react-query";
import { getSettlementDate } from "../_lib/getSettlementDate";

interface Item {
    data: any,
    status: string,
    message: string,
    total: number,
    매출_이실장: number,
    매출_포커스: number,
    매출_프리미엄: number,
    검색광고: number,
    매출_e분양: number,
}

export default function SettlementTitle({ sawonCode }: { sawonCode: number }) {
    const { data } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number]>({
        queryKey: ['member', 'settlement', sawonCode],
        queryFn: getSettlementDate,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    const { year, setYear, month, setMonth } = useContext(FilterContext); 
    const [selectBox2, setSelectBox2] = useState(false);
    const [selectBox3, setSelectBox3] = useState(false);

    const monthHandler = (item: string) => {
        setSelectBox3(false);
        setMonth(item);
    }
    useEffect(() => {
        if(data?.data[0].max_month) {
            console.log(data?.data[0]);
            setMonth(data.data[0].max_month);
        }
    }, [data]);
    return data?.data[0] && (
        <div className={style.settlememt_header} aria-label="매출수수료">
            {year}년 {month}월분 정산지급 내역
            <div className={style.select_wrap}>
                <div className={style.select_box}>
                    <button type="button" aria-selected={selectBox2} onClick={() => setSelectBox2(!selectBox2)}>{year}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {Array.from({ length: year - Number(data?.data[0].min_year)-1 }, (_, index) => year - index).map((item) => (
                            <li key={item} onClick={() => { setSelectBox2(false); setYear(item); }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className={style.select_box}>
                    <button type="button" aria-selected={selectBox3} onClick={() => setSelectBox3(!selectBox3)}>{month}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {Array.from({ length: 12 }, (_, index) => (index + 1).toString().padStart(2, "0")).map((item) => (
                            <li key={item} onClick={() => { monthHandler(item); }}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}