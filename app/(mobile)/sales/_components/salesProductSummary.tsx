import executeQuery from "@/lib/mysql";
import style from "@/styles/mobile-sales.module.css";
import Link from "next/link";


export default async function SalesProductSummary({ sawonCode }: { sawonCode: number }) {

    const user = `select a.sawonCode, a.name, b.jobName from tb_pptn_sawon a inner join tb_pptn_jobcode b on a.jobCode = b.jobCode where a.useYn = 'Y' and b.jobName in ('센터장', '파트장') and a.sawonCode = ?`;
    const userResult = await executeQuery(user, [sawonCode]) as any;
    const data = JSON.parse(JSON.stringify(userResult));

    const sql = `select * from (
        (select '이실장' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '이실장')
        union all
        (select '매경포커스' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '포커스')
        union all
        (select '매경프리미엄' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '프리미엄')
        union all
        (select '합계' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y')
        ) a `;
    const result = await executeQuery(sql, [sawonCode, sawonCode, sawonCode, sawonCode]) as any;
    const getData = JSON.parse(JSON.stringify(result));
    
    return <>
        <div className={style.table_summury_wrap}>
            <div className={style.header} aria-label="상품별매출내역">
                상품별 매출내역
                {(data[0]?.jobName==="센터장" || data[0]?.jobName==="파트장") && <Link href="/performance">실적관리</Link>}
            </div>
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
                        {getData.map((item: any, index: number) => (
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
        </div>
    </>
}