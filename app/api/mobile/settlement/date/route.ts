import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        let sqlWhere = " sawonCode = ?";
        const paramsArray = [searchParams.get("sawonCode")];
        
        const countSql = `select left(min(calYm), 4) as min_year, right(max(calYm), 2) as max_month from tb_data_calculate where sawonCode = ? and useYn = 'Y'`;
        const result = await executeQuery(countSql, [searchParams.get("sawonCode")]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}