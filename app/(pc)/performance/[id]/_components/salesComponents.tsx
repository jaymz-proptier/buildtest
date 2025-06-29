import style from "@/styles/pc.module.css";
import { sales } from "../../_lib/getList";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { filterContext } from "../../providers/filterProvider";
import LoadingSpinner from "@/app/(pc)/_components/loading";

interface Item {
    data: any;
}
export default function SalesComponents() {
    const { sawonCode, tab } = useContext(filterContext);
    
    const { data, isLoading } = useQuery<Item[], Object, Item[], [_1: string, _2: string, string, string ]>({
        queryKey: ["admin", "member", "sales", sawonCode],
        queryFn: sales,
        staleTime: 60 * 1000,
        gcTime: 300 * 1000,
        enabled: !!sawonCode,
    }) as any;
    return (
        <div className={style.sales_components}>
            <h5 className={style.title}>상품별 매출내역</h5>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>결제액</th>
                            <th>환불액</th>
                            <th>순매출액</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!data && isLoading ? <tr>
                            <td colSpan={4} className={style.no_data}><LoadingSpinner /></td>
                        </tr> : data?.product.map((item: any, index: number) => (
                        <tr key={index} className={item.title==="합계" ? style.total : item.title==="매경프리미엄" ? style.premium : ""}>
                            <td>{item.title}</td>
                            <td>{Number(item.sale).toLocaleString()}</td>
                            <td>{Number(item.refund).toLocaleString()}</td>
                            <td>{Number(item.price).toLocaleString()}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <h5 className={style.title}>이실장 영업실적(건수)</h5>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>구분</th>
                            <th>순수신규</th>
                            <th>기존신규</th>
                            <th>만기재계약</th>
                            <th>이월재계약</th>
                        </tr>
                    </thead>
                    <tbody>
                        {!data && isLoading ? <tr>
                            <td colSpan={5} className={style.no_data}><LoadingSpinner /></td>
                        </tr> : data?.data.map((item: any, index: number) => (
                        <tr key={index}>
                            <td>{item.title}</td>
                            <td>{Number(item.new).toLocaleString()}</td>
                            <td>{Number(item.existing).toLocaleString()}</td>
                            <td>{Number(item.maturity).toLocaleString()}</td>
                            <td>{Number(item.carried).toLocaleString()}</td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}