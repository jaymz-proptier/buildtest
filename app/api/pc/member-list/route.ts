import { auth } from "@/auth";
import executeQuery from "@/lib/mysql";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    
    const { searchParams } = new URL(req.url);
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    try {
        const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
        const userData = token as jwt.JwtPayload;

        const user = await executeQuery("select b.centerCode, b.partCode, b.jojikCode, a.jobCode, b.centerName, b.partName from tb_pptn_sawon a inner join tb_pptn_jojikcode b on a.jojikCode = b.jojikCode where a.sawonCode = ? and a.useYn = 'Y'", [userData.sawonCode]) as any[];
        
        if(!(user[0].jobCode==="1" || user[0].jobCode==="31" || user[0].jobCode==="32")) return NextResponse.json({ status: "Fail", message: "권한이 필요합니다." });

        let sqlWhere = "";
        const paramsArray = [];
        if(user[0].partCode==="0") {
            sqlWhere += " and a.jojikCode like concat(?, '%') ";
            paramsArray.push(user[0].centerCode);
        } else if(user[0].jobCode==="1") {
        } else {
            sqlWhere += " and a.jojikCode = ? ";
            paramsArray.push(user[0].jojikCode);
        }

        const countSql = `select count(*) as count from tb_pptn_sawon a where a.useYn = 'Y'${sqlWhere}`;
        const countResult = await executeQuery(countSql, paramsArray) as unknown[];
        const totalCount = JSON.parse(JSON.stringify(countResult));
        paramsArray.push(((Number(searchParams.get("page") ? searchParams.get("page") : 1) - 1) * 10))
        const sql = `select a.sawonCode, a.name, b.centerName, b.partName, coalesce(c.member1, 0) as member1, coalesce(c.member2, 0) as member2, coalesce(d.sales1, 0) as sales1, coalesce(d.sales2, 0) as sales2, coalesce(d.sales3, 0) as sales3, coalesce(d.sales4, 0) as sales4 
        from tb_pptn_sawon a inner join tb_pptn_jojikcode b on a.jojikCode = b.jojikCode left join (
        select sawonCode, sum(상품유형 = '이실장') as member1, sum(상품유형 <> '이실장') as member2 from tb_data_member where useYn = 'Y' group by sawonCode ) c on a.sawonCode = c.sawonCode left join (
        select sawonCode, sum(상품유형 = '이실장' and 계약구분 in ('순수신규', '기존신규') and 결제금액 > '') as sales1, sum(상품유형 = '이실장' and 계약구분 in ('만기재계약', '이월재계약') and 결제금액 > '') as sales2, sum(상품유형 <> '이실장' and 계약구분 in ('순수신규', '기존신규') and 결제금액 > '') as sales3, sum(상품유형 <> '이실장' and 계약구분 in ('만기재계약', '이월재계약') and 결제금액 > '') as sales4 
        from tb_data_sales where useYn = 'Y' group by sawonCode) d on a.sawonCode = d.sawonCode 
        where a.useYn = 'Y' and a.jojikCode > '200' ${sqlWhere} limit ?, 10`;
        const result = await executeQuery(sql, paramsArray) as unknown[];
        return NextResponse.json({ status: "OK", data: result, total: totalCount[0].count, centerName: user[0].centerName, partName: user[0].partName });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        NextResponse.json({ status: "Fail", message: error });
    }
}