import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        const sql = `select 상품유형 as '상품구분', 상품명, 계약구분, 상호명 as '중개사명', date_format(결제일, '%y.%m.%d') as '결제일자', 결제금액 as '매출액', 0 as '수수료율', 0 as '정산수수료'
        from tb_data_sales where sawonCode = ? and useYn = 'Y'`;
        const result = await executeQuery(sql, [searchParams.get("sawonCode")]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}