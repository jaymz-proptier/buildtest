import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        const page = (Number(searchParams.get("page") && searchParams.get("page")!=="0" ? searchParams.get("page") : 1) - 1) * 10;
        
        let sqlWhere = " sawonCode = ?";
        const paramsArray = [searchParams.get("sawonCode")];
        if (searchParams.has("type") && searchParams.get("type")!=="") {
            sqlWhere += " and 상품유형 = ? ";
            paramsArray.push(searchParams.get("type"));
        }
        const countSql = `select count(*) as count from tb_data_sales where ${sqlWhere} and useYn = 'Y'`;
        const countResult = await executeQuery(countSql, paramsArray) as unknown[];
        const totalCount = JSON.parse(JSON.stringify(countResult));

        const sql = `select (${Number(searchParams.get("page") && searchParams.get("page")!=="0" ? searchParams.get("page") : 1)} + 1) as page, salesSeq, 회원번호, 상호명, 대표자명, 휴대폰, (case when 소재지 > '' then 소재지 else concat(시도, ' ', (case when 시군구 = '세종시' then '' else 시군구 end), ' ',  읍면동, ' ', 상세주소) end) as 주소, 시도, 시군구, 상품명, 계약구분, DATE_FORMAT(결제일, '%y.%m.%d') as 결제일, DATE_FORMAT(시작일, '%y.%m.%d') as 시작일, DATE_FORMAT(종료일, '%y.%m.%d') as 종료일, DATE_FORMAT(환불일, '%y.%m.%d') as 환불일, 환불금액, 상태, 결제금액, 계약구분 from tb_data_sales where ${sqlWhere} and useYn = 'Y' limit ?, 10`;
        const result = await executeQuery(sql, [...paramsArray, page]) as unknown[];
        return NextResponse.json({ status: "OK", data: result, total: totalCount[0].count });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}