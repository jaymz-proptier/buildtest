import { NextRequest, NextResponse } from "next/server";
import executeQuery from "@/lib/mysql";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
    const userData = token as jwt.JwtPayload;
    if(userData.sosok!=="직원") return NextResponse.json({ status: "Fail", message: "관리자만 접근 가능합니다." });

    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const getIp = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').trim().split(',')
    const ipCheck = getIp[getIp.length - 1].trim();
    const ip = ipCheck.replace("::ffff:", "");

    if(req.method === "POST") {
        try {

            if(body.dataGubun==="1") {
            } else if(body.dataGubun==="2") {

            } else if(body.dataGubun==="3") {
                const result = await executeQuery(`select upchaSeq, (case when statusGubun = 'W' then '처리대기' when statusGubun = 'Y' then '처리완료' when statusGubun = 'N' then '처리실패' end) as statusGubun from tb_upload_log where dataGubun = '3' and calYm = ? and statusGubun <> 'D' `, [`${body.year}${body.month}`]) as any[];

                return NextResponse.json({ status: "OK", data: result });
            } else if(body.dataGubun==="4") {
              const result = await executeQuery(`select upchaSeq, (case when statusGubun = 'W' then '처리대기' when statusGubun = 'Y' then '처리완료' when statusGubun = 'N' then '처리실패' end) as statusGubun from tb_upload_log where dataGubun = '4' and calYm = ? and statusGubun <> 'D' `, [`${body.year}${body.month}`]) as any[];

              return NextResponse.json({ status: "OK", data: result });
          }

        } catch (error) {
        console.error('데이터 업로드 오류:', error);
        return NextResponse.json({ status: "Fail", message: error });
        }
  } else {
    console.log(req.method);
  }
}