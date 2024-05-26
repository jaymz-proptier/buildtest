import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    try {
        
        const { searchParams } = new URL(req.url);
        const sql = `select jobCode as code, jobName as title from tb_pptn_jobcode where useYn = 'Y' and sosok = ? and jobName > ''`;
        const result = await executeQuery(sql, [searchParams.get("sosok") ? searchParams.get("sosok") : "컨설턴트"]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}