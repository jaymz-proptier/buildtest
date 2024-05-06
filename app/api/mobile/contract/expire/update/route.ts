import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    
    const formData = await req.formData();
    console.log(formData);
    const body = Object.fromEntries(formData);

    try {

        let sqlSet = "";
        const setArray = []; 
        if(body.cpName) {
            sqlSet += " cpName = ?,";
            setArray.push(body.cpName);
        }
        if(body.expireInfo) {
            sqlSet += " expireInfo = ?,";
            setArray.push(body.expireInfo);
        }
        setArray.push(body.expireContSeq);
        
        const query = `update tb_data_expirecontracts set ${sqlSet} modDate = now() where expireContSeq = ?`;
        await executeQuery(query, setArray);

        return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });


    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: `${error}` });
    }
}