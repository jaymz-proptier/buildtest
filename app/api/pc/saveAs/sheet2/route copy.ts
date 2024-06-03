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
        
        const sql = `select a.상품유형, a.상품명, a.회원번호, a.상호명, a.사업자번호, a.대표자명, a.휴대폰, a.시도, a.시군구, a.읍면동, a.상세주소, a.계약구분, a.결제일, a.결제금액, a.시작일, a.종료일, a.담당자, a.상태, a.expireInfo as '탈락사유', a.cpName as '이동CP' from  tb_data_expirecontracts a where a.sawonCode = ? and a.upchaSeq = (select upchaSeq from tb_upload_log where dataGubun = '4' and statusGubun = 'Y' and useYn = 'Y' and calYm = ? order by upchaSeq limit 1) and a.useYn = 'Y'`;
        const result = await executeQuery(sql, [userData.sawonCode, searchParams.get("calYm")]) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}