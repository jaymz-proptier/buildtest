import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        let sqlWhere = "";
        const paramsArray = [];
        if (searchParams.has("noticeGubun") && searchParams.get("noticeGubun")!=="") {
            sqlWhere += " and noticeGubun = ? ";
            paramsArray.push(searchParams.get("noticeGubun"));
        }

        const sql = `select bnSeq, noticeGubun, title, contents from tb_board_notice where dispYn = 'Y' and useYn = 'Y' ${sqlWhere} order by (case when topYn = 'Y' then 0 else 1 end), regDate desc`;
        const result = await executeQuery(sql, paramsArray) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}