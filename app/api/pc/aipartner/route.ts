
import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "권한이 필요합니다." });
    if(req.method==="POST") {
        try {
            const data = await req.formData();
            const body = Object.fromEntries(data);

            const page = (Number(body.page && body.page!=="0" ? body.page : 1) - 1) * 10;
            
            const typeWhere = body.type==="T01" ? " a.상품유형 = '이실장' " : body.type==="T02" ? " a.상품유형 <> '이실장' " : "";
            const countSql = `select count(*) as count from tb_data_member a where ${typeWhere} and a.sawonCode =? and a.useYn = 'Y'`;
            const countResult = await executeQuery(countSql, [body.sawonCode]) as unknown[];
            const totalCount = JSON.parse(JSON.stringify(countResult));

            const sql = `select a.memSeq, a.회원번호, a.상호명, a.대표자명, a.휴대폰, concat(a.시도, ' ', (case when a.시군구 = '세종시' then '' else a.시군구 end), ' ',  a.읍면동, ' ', a.상세주소) as 주소, a.시도, a.시군구, a.읍면동, a.상세주소, a.상품명, a.계약구분, a.결제일, DATE_FORMAT(a.시작일, '%y.%m.%d') as 시작일, DATE_FORMAT(a.종료일, '%y.%m.%d') as 종료일, a.상태, a.계약전송수, a.전송수, a.담당자 from tb_data_member a where ${typeWhere} and a.sawonCode =? and a.useYn = 'Y' limit ?, 10`;
            const result = await executeQuery(sql, [body.sawonCode, page]) as any[];

            return NextResponse.json({ status: "OK", data: result, total: totalCount[0].count });

        } catch (error) {
            console.error("읽기 오류 : ", error);
            return NextResponse.json({ status: "Fail", message: error });
        }
    } else {
        return NextResponse.json({ status: "Fail", message: "비정상 접근" });
    }
}