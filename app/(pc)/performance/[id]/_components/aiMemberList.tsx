import Pagination from "@/app/(pc)/_components/pagination";
import style from "@/styles/pc.module.css";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/app/(pc)/_components/loading";
import { useSearchParams } from "next/navigation";
import { aiMemberList } from "../../_lib/getList";
import { useContext } from "react";
import { filterContext } from "../../providers/filterProvider";

interface Item {
    page: number;
}
export default function AiMemberList() {
    const searchParams = useSearchParams();
    const page = Number(searchParams.get("page") || 1);
    const { sawonCode, tab } = useContext(filterContext);
    
    const { data, isLoading } = useQuery<Item[], Object, Item[], [_1: string, _2: string, string, string, number ]>({
        queryKey: ["admin", "member", tab, sawonCode, page],
        queryFn: aiMemberList,
        staleTime: 60 * 1000,
        gcTime: 300 * 1000,
        enabled: !!sawonCode && !!tab,
    }) as any;

    return <>
        <div className={style.table_wrap}>
            <table>
                <colgroup>
                    <col width="70px" />
                    <col width="70px" />
                    <col />
                    <col width="80px" />
                    <col width="100px" />
                    <col width="200px" />
                    <col width="100px" />
                    <col width="80px" />
                    <col width="80px" />
                    <col width="70px" />
                    <col width="70px" />
                </colgroup>
                <thead>
                    <tr>
                        <th>상품명</th>
                        <th>회원번호</th>
                        <th>상호명</th>
                        <th>대표자명</th>
                        <th>휴대폰</th>
                        <th>소재지</th>
                        <th>계약구분</th>
                        <th>시작일</th>
                        <th>종료일</th>
                        <th>담당자</th>
                        <th>상태</th>
                    </tr>
                </thead>
                <tbody>
                    {data?.total > 0 ? (
                        data?.data.map((item: any, index: number) => (
                        <tr key={index}>
                            <td>{item.상품명}</td>
                            <td>{item.회원번호}</td>
                            <td>{item.상호명}</td>
                            <td>{item.대표자명}</td>
                            <td>{item.휴대폰}</td>
                            <td>{item.소재지}</td>
                            <td>{item.계약구분}</td>
                            <td>{item.시작일}</td>
                            <td>{item.종료일}</td>
                            <td>{item.담당자}</td>
                            <td>{item.상태}</td>
                        </tr>
                        ))
                    ) : isLoading ? (
                    <tr>
                        <td colSpan={14} className={style.no_data}><LoadingSpinner /></td>
                    </tr>
                    ) : (
                    <tr>
                        <td colSpan={14} className={style.no_data}>등록된 회원이 없습니다.</td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
        {!isLoading && <Pagination page={page} total={data?.total} />}
    </>
}