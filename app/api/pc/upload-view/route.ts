import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        const sql = `select * from tb_upload_log_test where upchaSeq = ?`;
        const result = await executeQuery(sql, [searchParams.get("upchaSeq")]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result[0] });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: `데이터 업로드 중 오류가 발생했습니다.\n\r${error}` });
    }
}