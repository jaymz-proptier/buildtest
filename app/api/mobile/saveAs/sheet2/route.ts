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
        
        const sql = `select 구분, 내용, 상품구분, 계약구분, 중개사명, 결제일, 매출액, 본인부담금, 담당자, 소속1, 소속2, 관리자메모 from  tb_data_calculate_etc where sawonCode = ? and useYn = 'Y'`;
        const result = await executeQuery(sql, [userData.sawonCode]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}