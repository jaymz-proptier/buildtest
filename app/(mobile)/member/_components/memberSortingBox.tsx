"use client";
import style from "@/styles/mobile-member.module.css";
import { useContext, useEffect, useRef, useState } from "react";
import { FilterContext } from "./filterProvider";
import { useQuery } from "@tanstack/react-query";
import { getMembersCount } from "../_lib/getMembersCount";
interface Item {
    data: any,
    status: string,
    message: string,
    total: number
}
export default function MemberSortingBox({ sawonCode }: { sawonCode: number }) {
    const { filter, search, sort, setSort } = useContext(FilterContext);
    const [ selectBox, setSelectBox ] = useState(false);
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
    const sortingCode: {
        code: string,
        title: string
    }[] = [
        { code: "contract", title: "계약일순"},
        { code: "end", title: "종료일순"},
        { code: "coupon", title: "쿠폰사용률순"},
    ];
    const { data: totalCount } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number, _4: string, _5: string, _6: string]>({
        queryKey: ["member", "membersCount", sawonCode, filter, search, sort],
        queryFn: getMembersCount,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
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
    return <>
        <div className={style.sorting_wrap}>
            <div className={style.reponse_count}>
                검색결과 {totalCount ? totalCount.total : 0}개
            </div> 
            <div className={style.select_box} ref={selectBoxRef}>
                <button type="button" aria-selected={selectBox} onClick={() => setSelectBox(!selectBox)}>{sortingCode.find((item) => item.code===sort)?.title}</button>
                <div className={style.select_box_list}>
                    <ul>
                        {sortingCode.map((item: any, index: number) => (
                        <li key={index} onClick={() => { setSelectBox(false); setSort(item.code); }}>{item.title}</li>
                        ))}
                    </ul>
                </div>
            </div>        
        </div>   
    </>
}