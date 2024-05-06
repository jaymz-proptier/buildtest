"use client";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { getContracts } from "../_lib/getContracts";
import MemberItem from "./expire-member-item";
import { MemberLoading } from "../../_components/member-loading";
import style from "@/styles/mobile-contract.module.css";
import { FilterContext } from "./filterProvider";
import { TabContext } from "./TabProvider";
interface Item {
    page: number;
    data: any;
}
export default function ExpireContractList({ sawonCode }: { sawonCode: number }) {
    const { tab } = useContext(TabContext);
    const { filter } = useContext(FilterContext);
    const { 
        data,
        fetchNextPage,
        hasNextPage,
        isFetching,
    } = useInfiniteQuery<Item[], Object, InfiniteData<Item[]>, [_1: string, _2: string, _3: number, _4: string, _5: string], number>({
        queryKey: ["member", "sales", sawonCode, tab, filter],
        queryFn: getContracts,
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            console.log("lastPage", lastPage);
            return lastPage.at(-1)?.page;
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
            console.log(data);
            !isFetching && hasNextPage && fetchNextPage();
        }
    }, [inView, isFetching, hasNextPage, fetchNextPage, filter]);
    return <>
        <div className={style.list_contents}>
            {data?.pages.flatMap(page => page).map((item: any, index: number) => (
            <MemberItem key={index} data={item} /> 
            ))}
            <div ref={ref}>
                {(inView && hasNextPage) && <MemberLoading />}
            </div>
        </div>
    </>
}