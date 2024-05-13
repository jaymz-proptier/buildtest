"use client";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { getMembers } from "../_lib/getMembers";
import MemberItem from "./member-item";
import { MemberLoading } from "../../_components/member-loading";
import style from "@/styles/mobile-member.module.css";
import { FilterContext } from "./filterProvider";
interface Item {
    page: number;
    data: any;
}
export default function MembersList({ sawonCode }: { sawonCode: number }) {
    const { filter, search, sort } = useContext(FilterContext);
    const { 
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useInfiniteQuery<Item[], Object, InfiniteData<Item[]>, [_1: string, _2: string, _3: number, _4: string, _5: string, _6: string], number>({
        queryKey: ["member", "member", sawonCode, filter, search, sort],
        queryFn: getMembers,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage?.at(-1)?.page;
        },
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    const { ref, inView } = useInView({
        threshold: 0,
        delay: 0,
    });
    useEffect(() => {
        if(inView) {
            !isFetching && hasNextPage && fetchNextPage();
        }
    }, [inView, isFetching, hasNextPage, fetchNextPage, filter]);
    return <>
        <div className={style.list_contents}>
            {data?.pages[0].length===0 && <div className={style.no_data}>검색 결과가 없습니다.</div>}
            {data?.pages.flatMap(page => page).map((item: any, index: number) => (
            <MemberItem key={index} data={item} /> 
            ))}
            <div ref={ref}>
                {(inView && hasNextPage) && <MemberLoading />}
            </div>
        </div>
    </>
}