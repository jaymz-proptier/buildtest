import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        const page = (Number(searchParams.get("page") && searchParams.get("page")!=="0" ? searchParams.get("page") : 1) - 1) * 10;
        
        let sqlWhere = " and sawonCode = ? ";
        const paramsArray = [searchParams.get("sawonCode")];
        if (searchParams.has("product_type") && searchParams.get("product_type")!=="") {
            sqlWhere += " and 상품유형 = ? ";
            paramsArray.push(searchParams.get("product_type"));
        }
        if (searchParams.has("query") && searchParams.get("query")!=="") {
            sqlWhere += " and (상호명 like concat('%', ?, '%') or 휴대폰 like concat('%', ?, '%') or 시도 like concat('%', ?, '%') or 시군구 like concat('%', ?, '%') or 읍면동 like concat('%', ?, '%'))";
            paramsArray.push(searchParams.get("query"), searchParams.get("query"), searchParams.get("query"), searchParams.get("query"), searchParams.get("query"));
        }

        const countSql = `select count(*) as count from tb_data_member where useYn = 'Y'${sqlWhere}`;
        const countResult = await executeQuery(countSql, paramsArray) as unknown[];
        const totalCount = JSON.parse(JSON.stringify(countResult));

        return NextResponse.json({ status: "OK", total: totalCount[0].count });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}