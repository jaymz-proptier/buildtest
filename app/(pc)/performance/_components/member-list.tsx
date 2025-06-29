"use client";
import style from "@/styles/pc.module.css";
import Link from "next/link";
import Pagination from "@/app/(pc)/_components/pagination";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getList } from "../_lib/getList";
import { useRouter } from "next/navigation";
import LoadingSpinner from "../../_components/loading";
import EmployeeSelectBox from "./employeeSelectBox";
import { useContext, useEffect } from "react";
import { filterContext } from "../providers/filterProvider";

interface Item {
    page: number;
}

type Props = {
    searchParams: { p: string, q?: string };
}
export default function MemberList({ searchParams }: { searchParams: any}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setSawonCode } = useContext(filterContext);
    const page = Number(searchParams?.page ?? 1);
    const { data, isLoading } = useQuery<Item[], Object, Item[], [_1: string, _2: string, Props['searchParams']]>({
        queryKey: ["admin", "member", searchParams],
        queryFn: getList,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;
    const handleClick = (item: any) => {
        router.push(`/performance/${item.sawonCode}`);
    }
    useEffect(() => {
        setSawonCode("");
    }, [setSawonCode]);
    return <>
        <div className={style.list_contents}>
            <div className={style.list_header}>
                <div className={style.index_wrap}>
                    <div className={style.index}>{data?.centerName}{data?.partName ? ` > ${data?.partName}` : ""}</div>
                    <div className={`${style.filter_wrap} `}>
                        <EmployeeSelectBox />
                    </div>
                </div>
            </div>
            <div className={style.table_wrap}>
                <table>
                    <colgroup>
                        <col />
                        <col width="150px" />
                        <col width="150px" />
                        <col width="150px" />
                        <col width="150px" />
                        <col width="150px" />
                        <col width="150px" />
                    </colgroup>
                    <thead>
                        <tr>
                            <th rowSpan={2}>구분</th>
                            <th colSpan={2}>회원현황</th>
                            <th colSpan={2}>이실장 영업현황</th>
                            <th colSpan={2}>매경 영업현황</th>
                        </tr>
                        <tr>
                            <th>이실장</th>
                            <th>매경포커스</th>
                            <th>신규</th>
                            <th>재계약</th>
                            <th>신규</th>
                            <th>재계약</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.total > 0 ? (
                            data?.data.map((item: any) => (
                            <tr key={item.sawonCode} onClick={() => handleClick(item)}>
                                <td>{item.name}<span className={style.part}>({item.partName})</span></td>
                                <td>{item.member1}</td>
                                <td>{item.member2}</td>
                                <td>{item.sales1}</td>
                                <td>{item.sales2}</td>
                                <td>{item.sales3}</td>
                                <td>{item.sales4}</td>
                            </tr>
                            ))
                        ) : isLoading ? (
                        <tr>
                            <td colSpan={7} className={style.no_data}><LoadingSpinner /></td>
                        </tr>
                        ) : (
                        <tr>
                            <td colSpan={7} className={style.no_data}>등록된 실적이 없습니다.</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {!isLoading && <Pagination page={page} total={data?.total} />}
        </div>
    </>
}