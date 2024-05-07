"use client";
import style from "@/styles/mobile-notice.module.css";
import Link from "next/link";
import { useContext } from "react";
import { TabContext } from "./TabProvider";
import { useQuery } from "@tanstack/react-query";
import { getNotice } from "../_lib/getNotice";

interface Item {
    page: number;
    data: any;
}
export default function NoticeList({ searchParams }: { searchParams: any }) {
    console.log(searchParams.bnSeq);
    const { tab } = useContext(TabContext);
    const { data } = useQuery<Item[], Object, Item[], [_1: string, _2: string, _3: string]>({
        queryKey: ["member", "notice", tab],
        queryFn: getNotice,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;
    console.log(data);
    return <>    
        <div className={style.notice_wrap}>
            <div className={style.list_wrap}>
                {data && <ul>
                    {data?.data?.map((item: any, index: number) => (
                    <li key={index}>
                        <Link href={`/announce?bnSeq=${item.bnSeq}`} className={style.link} aria-selected={Number(searchParams.bnSeq)===item.bnSeq}>[{item.noticeGubun}] {item.title}</Link>
                        <div className={style.detail_contents}>{item.contents}</div>
                    </li>
                    ))}
                </ul>}
            </div>
        </div>
    </>
}