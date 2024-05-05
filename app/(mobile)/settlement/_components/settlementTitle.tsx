"use client";
import { useContext, useState } from "react";
import { FilterContext } from "./filterProvider";
import style from "@/styles/mobile-settlement.module.css";

export default function SettlementTitle() {
    const { year, setYear, month, setMonth } = useContext(FilterContext); 
    const [selectBox2, setSelectBox2] = useState(false);
    const [selectBox3, setSelectBox3] = useState(false);

    const monthHandler = (item: string) => {
        setSelectBox3(false);
        console.log("month",month);
        setMonth(item);
    }

    return (
        <div className={style.settlememt_header} aria-label="매출수수료">
            {year}년 {month}월분 정산지급 내역
            <div className={style.select_wrap}>
                <div className={style.select_box}>
                    <button type="button" aria-selected={selectBox2} onClick={() => setSelectBox2(!selectBox2)}>{year}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {Array.from({ length: year - 2019 }, (_, index) => year - index).map((item) => (
                            <li key={item} onClick={() => { setSelectBox2(false); setYear(item); console.log(item); }}>{item}</li>
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