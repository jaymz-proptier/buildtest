"use client";

import style from "@/styles/mobile-settlement.module.css";  
import { useContext } from "react";
import { FilterContext } from "./filterProvider";
import { useQuery } from "@tanstack/react-query";
import { getSettlementPayment } from "../_lib/getSettlementPayment";
import { DownloadIcon } from "@/app/(mobile)/_components/downloadIcon"
import { getExcelSheet1 } from "../_lib/getExcelSheet1";
import { getExcelSheet2 } from "../_lib/getExcelSheet2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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
    const { data: sheet1 } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number, _4: string]>({
        queryKey: ['member', 'settlement', sawonCode, (year +""+ month)],
        queryFn: getExcelSheet1,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    
    const { data: sheet2 } = useQuery<Item, Object, Item, [_1: string, _2:string, _3: number, _4: string]>({
        queryKey: ['member', 'settlement', sawonCode, (year +""+ month)],
        queryFn: getExcelSheet2,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    async function handleButtonClick() {
        try {
            /* const response1 = await fetch(`/api/mobile/saveAs/sheet1?sawonCode=${sawonCode}`);
            const sheet1 = await response1.json();
            const response2 = await fetch(`/api/mobile/saveAs/sheet2?sawonCode=${sawonCode}`);
            const sheet2 = await response2.json(); */

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(sheet1?.data);
            const ws2 = XLSX.utils.json_to_sheet(sheet2?.data);
        
            XLSX.utils.book_append_sheet(wb, ws1, "매출");
            XLSX.utils.book_append_sheet(wb, ws2, "기타");
        
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            const buf = new ArrayBuffer(wbout.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
        
            saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${year}년${month}월_상품별_내역서.xlsx`);

        } catch (error) {
            console.error('Failed to download data', error);
        }
    }
    return <>
        {data?.data[0] && <div className={style.table_summury_wrap}>
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
                        {data?.data[0]?.매출_이실장 > 0 &&
                        <tr>
                            <td>이실장</td>
                            <td>{Number(data?.data[0]?.매출_이실장).toLocaleString()}</td>
                            <td>{data?.data[0]?.이실장_수수료율 ? `${Number(data?.data[0]?.이실장_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_이실장).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_포커스 > 0 &&
                        <tr>
                            <td>매경포커스</td>
                            <td>{Number(data?.data[0]?.매출_포커스).toLocaleString()}</td>
                            <td>{data?.data[0]?.포커스_수수료율 ? `${Number(data?.data[0]?.포커스_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_포커스).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_프리미엄 > 0 &&
                        <tr>
                            <td>매경프리미엄</td>
                            <td>{Number(data?.data[0]?.매출_프리미엄).toLocaleString()}</td>
                            <td>{data?.data[0]?.프리미엄_수수료율 ? `${Number(data?.data[0]?.프리미엄_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_프리미엄).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_enote > 0 &&
                        <tr>
                            <td>enote</td>
                            <td>{Number(data?.data[0]?.매출_enote).toLocaleString()}</td>
                            <td>{data?.data[0]?.enote_수수료율 ? `${Number(data?.data[0]?.enote_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_enote).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_동기화 > 0 &&
                        <tr>
                            <td>동기화</td>
                            <td>{Number(data?.data[0]?.매출_동기화).toLocaleString()}</td>
                            <td>{data?.data[0]?.동기화_수수료율 ? `${Number(data?.data[0]?.동기화_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_동기화).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.검색광고 > 0 &&
                        <tr>
                            <td>검색광고</td>
                            <td>{Number(data?.data[0]?.검색광고).toLocaleString()}</td>
                            <td>{data?.data[0]?.검색광고_수수료율 ? `${Number(data?.data[0]?.검색광고_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_검색광고).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_홈페이지 > 0 &&
                        <tr>
                            <td>홈페이지</td>
                            <td>{Number(data?.data[0]?.매출_홈페이지).toLocaleString()}</td>
                            <td>{data?.data[0]?.홈페이지_수수료율 ? `${Number(data?.data[0]?.홈페이지_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_홈페이지).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_e분양 > 0 &&
                        <tr>
                            <td>e분양</td>
                            <td>{Number(data?.data[0]?.매출_e분양).toLocaleString()}</td>
                            <td>{data?.data[0]?.e분양_수수료율 ? `${Number(data?.data[0]?.e분양_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_e분양).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_입주탐방 > 0 &&
                        <tr>
                            <td>입주탐방</td>
                            <td>{Number(data?.data[0]?.매출_입주탐방).toLocaleString()}</td>
                            <td>{data?.data[0]?.입주탐방_수수료율 ? `${Number(data?.data[0]?.입주탐방_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_입주탐방).toLocaleString()}</td>
                        </tr>}
                        {data?.data[0]?.매출_도메인 > 0 &&
                        <tr>
                            <td>도메인</td>
                            <td>{Number(data?.data[0]?.매출_도메인).toLocaleString()}</td>
                            <td>{data?.data[0]?.도메인_수수료율 ? `${Number(data?.data[0]?.도메인_수수료율).toLocaleString()}%` : "-"}</td>
                            <td>{Number(data?.data[0]?.영업_도메인).toLocaleString()}</td>
                        </tr>}
                        {!data?.data[0] && <tr>
                            <td colSpan={4} className={style.no_data}>{year}년 {month}월분 정산지급 내역이 없습니다.</td>
                        </tr>}
                    </tbody>
                </table>
            </div>
            <div className={style.sub_contents}>
                <button type="button" className={style.download} onClick={handleButtonClick}>
                    <DownloadIcon />
                    상품별 내역서 다운로드
                </button>
            </div>
        </div>}
        {data?.data[0] &&<div className={style.table_summury_wrap}>
            <div className={style.header} aria-label="기타수수료">
                기타수수료
            </div>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>직책수당</th>
                            <th>주차비</th>
                            <th>지원금</th>
                            <th>구매지원</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{Number(data?.data[0]?.직책수당).toLocaleString()}</td>
                            <td>{Number(data?.data[0]?.지원금_주차비).toLocaleString()}</td>
                            <td>{Number(data?.data[0]?.지원금_영업지원금).toLocaleString()}</td>
                            <td>{Number(data?.data[0]?.지원금_디바이스구매지원).toLocaleString()}</td>
                        </tr>
                    </tbody>  
                    <thead>
                        <tr>
                            <th>기타</th>
                            <th colSpan={3}>반반쿠폰(차감)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{Number(data?.data[0]?.지원금_기타).toLocaleString()}</td>
                            <td colSpan={3}>{Number(data?.data[0]?.지원금_반반쿠폰).toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>}
        {data?.data[0] ? <div className={style.message_info}>
            <ul>
                <li>
                    <label>기타사항</label>
                    {data?.data[0]?.지원금_기타사항 ? data?.data[0]?.지원금_기타사항 : "-"}
                </li>
                <li>
                    <label>당월 총정산액</label>
                    {Number(data?.data[0]?.정산액).toLocaleString()}
                </li>
                <li>
                    <label>입금 예정액</label>
                    {Number(data?.data[0]?.입금예정액).toLocaleString()}
                </li>
            </ul>
            <h5>귀하의 노고에 감사드립니다.</h5>
        </div> : data ? <div className={style.no_data}>{year}년 {month}월분 정산지급 내역이 없습니다.</div> : <div className={style.no_data}>정산지급 내역을 가져오고 있습니다.</div>}
    </>
}