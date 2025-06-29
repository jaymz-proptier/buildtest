
import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "권한이 필요합니다." });
    if(req.method==="POST") {
        try {
            const data = await req.formData();
            const body = Object.fromEntries(data);

            const sql = `select * from(
        (select 
            '결제건수' as title,
            sum(case when 계약구분 = '순수신규' and 결제금액 > '' then 1 else 0 end) as new,
            SUM(case when 계약구분 = '기존신규' and 결제금액 > '' then 1 else 0 end) as existing,
            SUM(case when 계약구분 = '만기재계약' and 결제금액 > '' then 1 else 0 end) as maturity,
            SUM(case when 계약구분 = '이월재계약' and 결제금액 > '' then 1 else 0 end) as carried
        from 
            tb_data_sales 
        where 
            sawonCode = ? 
            and useYn = 'Y' 
            and 결제금액 > '' and 상품유형 = '이실장') union all
        (select 
            '환불건수' as title,
            sum(case when 계약구분 = '순수신규' and 환불금액 > '' then 1 else 0 end) as new,
            SUM(case when 계약구분 = '기존신규' and 환불금액 > '' then 1 else 0 end) as existing,
            SUM(case when 계약구분 = '만기재계약' and 환불금액 > '' then 1 else 0 end) as maturity,
            SUM(case when 계약구분 = '이월재계약' and 환불금액 > '' then 1 else 0 end) as carried
        from 
            tb_data_sales 
        where 
            sawonCode = ? 
            and useYn = 'Y' 
            and 환불금액 > '' and 상품유형 = '이실장')
            ) a`;
            const result = await executeQuery(sql, [body.sawonCode, body.sawonCode]) as any[];

            const sqlProduct = `select * from (
                (select '이실장' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '이실장')
                union all
                (select '매경포커스' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '포커스')
                union all
                (select '매경프리미엄' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y' and 상품유형 = '프리미엄')
                union all
                (select '합계' as title, sum(결제금액) as sale, sum(환불금액) as refund, (sum(결제금액) - sum(환불금액)) as price from tb_data_sales where sawonCode = ? and useYn = 'Y')
                ) a `;
            const productResult = await executeQuery(sqlProduct, [body.sawonCode, body.sawonCode, body.sawonCode, body.sawonCode]) as any;

            return NextResponse.json({ status: "OK", data: result, product: productResult });

        } catch (error) {
            console.error("읽기 오류 : ", error);
            return NextResponse.json({ status: "Fail", message: error });
        }
    } else {
        return NextResponse.json({ status: "Fail", message: "비정상 접근" });
    }
}