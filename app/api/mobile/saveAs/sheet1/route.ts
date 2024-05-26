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
        
        const sql = `select 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 담당자, 상태, cpName as '기존CP' from tb_data_newcontracts where sawonCode = ? and useYn = 'Y'`;
        const result = await executeQuery(sql, [userData.sawonCode]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}