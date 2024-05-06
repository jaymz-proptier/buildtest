"use client";

import style from "@/styles/mobile-settlement.module.css";  
import { useContext } from "react";
import { FilterContext } from "./filterProvider";
import { useQuery } from "@tanstack/react-query";
import { getSettlementPayment } from "../_lib/getSettlementPayment";

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
export default function SettlementMainPayment({ sawonCode }: { sawonCode: number }) {

    const { year, month } = useContext(FilterContext);    
    const { data } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number, _4: string]>({
        queryKey: ['member', 'settlement', sawonCode, (year +""+ month)],
        queryFn: getSettlementPayment,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    return <>
        <div className={style.table_summury_wrap}>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>매출액</th>
                            <th>수수료율</th>
                            <th>영업수수료</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>이실장</td>
                            <td>{data?.매출_이실장}</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>매경포커스</td>
                            <td>{data?.매출_포커스}</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>매경프리미엄</td>
                            <td>{data?.매출_프리미엄}</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>검색광고</td>
                            <td>{data?.검색광고}</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                        <tr>
                            <td>e분양</td>
                            <td>{data?.매출_e분양}</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <div className={style.table_summury_wrap}>
            <div className={style.header} aria-label="기타수수료">
                기타수수료
            </div>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>지책수당</th>
                            <th>주차비</th>
                            <th>지원금</th>
                            <th>구매지원</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                            <td>0</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
}