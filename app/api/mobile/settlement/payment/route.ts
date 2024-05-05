import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        let sqlWhere = " sawonCode = ?";
        const paramsArray = [searchParams.get("sawonCode")];
        if (searchParams.has("type") && searchParams.get("type")!=="") {
            sqlWhere += " and 상품유형 = ? ";
            paramsArray.push(searchParams.get("type"));
        }
        const countSql = `select calYm, title, 매출_이실장, 매출_포커스, 매출_프리미엄, (매출_네이버검색광고 + 매출_네이트검색광고) as 검색광고, 매출_e분양, 지원금_주차비, 지원금_디바이스구매지원, 지원금_기타, 정산액, 입금예정액, 선지급금, 실입금액 from tb_data_calculate where sawonCode = ? and calYm = ? and useYn = 'Y'`;
        const result = await executeQuery(countSql, [searchParams.get("sawonCode"), searchParams.get("calYm")]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}