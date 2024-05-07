import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        const sql = `select '' as '서비스명', 상호명 as '중개사명', '' as '지급일자', '' as '지급수량', '' as '금액', '' as '본인부담금' from tb_data_sales 
        where sawonCode = ? and useYn = 'Y' and upchaSeq = '3'`;
        const result = await executeQuery(sql, [searchParams.get("sawonCode")]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}