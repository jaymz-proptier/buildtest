"use client";
import { useContext, useEffect, useRef, useState } from "react";
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
    const currentYear = new Date().getFullYear();
    const { year, setYear, month, setMonth } = useContext(FilterContext); 
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
    const [selectBox, setSelectBox] = useState(false);

    useEffect(() => {
        if(data?.data[0].max_month) {
            setMonth(data.data[0].max_month);
        }
    }, [data]);
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
                setSelectBox(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return data?.data[0] && (
        <div className={style.settlememt_header} aria-label="매출수수료">
            <span className={style.calendar_wrap} ref={selectBoxRef} aria-selected={selectBox} onClick={() => setSelectBox(!selectBox)}><label className={style.date}>{year}년 {month}월분 
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0, verticalAlign: "middle"}}>
                    <path fill="currentColor" d="M11.48 14.095a.7.7 0 0 0 1.04 0l2.929-3.254a.7.7 0 0 0-.52-1.168H9.071a.7.7 0 0 0-.52 1.168l2.928 3.254Z"></path>
                </svg></label>
                <div className={style.calendar_box}>
                    <div className={style.year_select}>
                        {year}
                        <div className={style.btn_wrap}>
                            <button type="button" aria-hidden={data?.data[0].min_year >= year} onClick={() => { if(data?.data[0].min_year < year) setYear(year - 1); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0, verticalAlign: "middle"}}>
                                    <path fill="#8d96a1" d="m14.217 6.434 1.131 1.132L10.915 12l4.435 4.434-1.132 1.132L8.651 12l5.566-5.566Z"></path>
                                </svg>
                            </button>
                            <button type="button" aria-hidden={year >= currentYear} onClick={() => { if(year < currentYear) setYear(year + 1); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0, verticalAlign: "middle"}}>
                                    <path fill="#8d96a1" d="M9.783 17.566 8.65 16.434 13.086 12 8.65 7.566l1.132-1.132L15.349 12l-5.566 5.566Z"></path>
                                </svg>
                            </button>
                        </div>
                        
                    </div>
                    <div className={style.month_select}>
                        {Array.from({ length: 12 }, (_, index) => (index + 1).toString().padStart(2, "0")).map((item) => (
                        <div key={item} className={style.month_item} onClick={() => {  setSelectBox(false); setMonth(item); }}>{item}</div>
                        ))}
                    </div>
                </div>
            </span> 정산지급 내역
        </div>
    )
}