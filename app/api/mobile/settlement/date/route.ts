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
                
        const countSql = `select left(min(calYm), 4) as min_year, right(max(calYm), 2) as max_month from tb_data_calculate where sawonCode = ? and useYn = 'Y'`;
        const result = await executeQuery(countSql, [userData.sawonCode]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}