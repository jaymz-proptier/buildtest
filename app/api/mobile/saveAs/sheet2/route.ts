import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    
    const { searchParams } = new URL(req.url);

    try {
        const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
        const userData = token as jwt.JwtPayload;
        
        const sql = `select a.구분, a.내용, a.상품구분, a.계약구분, a.중개사명, a.결제일, a.매출액, a.본인부담금, a.담당자, a.소속1, a.소속2, a.관리자메모 from tb_data_calculate_etc a where a.sawonCode = ? and a.upchaSeq = (select upchaSeq from tb_upload_log where dataGubun = '3' and statusGubun = 'Y' and useYn = 'Y' and calYm = ? order by upchaSeq limit 1) and a.useYn = 'Y'`;
        const result = await executeQuery(sql, [userData.sawonCode, searchParams.get("calYm")]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}