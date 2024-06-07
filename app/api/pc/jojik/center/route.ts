import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {

    const { searchParams } = new URL(req.url);
    try {
        const sql = `select distinct centerName as title, centerCode as code from tb_pptn_jojikcode where sosok = ? and useYn = 'Y' order by centerName`;
        const result = await executeQuery(sql, [searchParams.get("sosok") ? searchParams.get("sosok") : "컨설턴트"]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}