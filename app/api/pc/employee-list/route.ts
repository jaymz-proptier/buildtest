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

        paramsArray.push(((Number(searchParams.get("page") ? searchParams.get("page") : 1) - 1) * 10))
        const sql = `select a.name, b.centerName, b.partName, a.sawonCode  
        from tb_pptn_sawon a inner join tb_pptn_jojikcode b on a.jojikCode = b.jojikCode
        where a.useYn = 'Y' and a.jojikCode > '200' ${sqlWhere}`;
        const result = await executeQuery(sql, paramsArray) as unknown[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        NextResponse.json({ status: "Fail", message: error });
    }
}