import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";


export async function GET(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    
    const { searchParams } = new URL(req.url);
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    try {
        const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
        const userData = token as jwt.JwtPayload;

        const page = (Number(searchParams.get("page") && searchParams.get("page")!=="0" ? searchParams.get("page") : 1) - 1) * 10;
        
        let sqlWhere = " and sawonCode = ? ";
        const paramsArray = [userData.sawonCode];
        if(searchParams.has("product_type") && searchParams.get("product_type")!=="") {
            sqlWhere += " and 상품유형 = ? ";
            paramsArray.push(searchParams.get("product_type"));
        }
        if(searchParams.has("query") && searchParams.get("query")!=="") {
            sqlWhere += " and (상호명 like concat('%', ?, '%') or 휴대폰 like concat('%', ?, '%') or 시도 like concat('%', ?, '%') or 시군구 like concat('%', ?, '%') or 읍면동 like concat('%', ?, '%'))";
            paramsArray.push(searchParams.get("query"), searchParams.get("query"), searchParams.get("query"), searchParams.get("query"), searchParams.get("query"));
        }
        let sqlOrderBy = " regDate desc";
        if(searchParams.has("sort") && searchParams.get("sort")==="end") sqlOrderBy = " 종료일 desc";
        else if(searchParams.has("sort") && searchParams.get("sort")==="coupon") sqlOrderBy = " (전송수 / 계약전송수) desc";

        const countSql = `select count(*) as count from tb_data_member where useYn = 'Y'${sqlWhere}`;
        const countResult = await executeQuery(countSql, paramsArray) as unknown[];
        const totalCount = JSON.parse(JSON.stringify(countResult));

        const sql = `select (${Number(searchParams.get("page") && searchParams.get("page")!=="0" ? searchParams.get("page") : 1)} + 1) as page, memSeq, 회원번호, 상품유형, 상호명, 대표자명, 휴대폰, concat(시도, ' ', (case when 시군구 = '세종시' then '' else 시군구 end), ' ',  읍면동, ' ', 상세주소) as 주소, 시도, 시군구, 상품명, 계약구분, 결제일, DATE_FORMAT(시작일, '%y.%m.%d') as 시작일, DATE_FORMAT(종료일, '%y.%m.%d') as 종료일, 상태, 계약전송수, 전송수 from tb_data_member where useYn = 'Y'${sqlWhere} order by ${sqlOrderBy} limit ?, 10`;
        const result = await executeQuery(sql, [...paramsArray, page]) as unknown[];

        return NextResponse.json({ status: "OK", data: result, total: totalCount[0].count });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}