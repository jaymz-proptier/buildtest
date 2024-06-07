import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { pipeline } from "stream";
import { promisify } from "util";

const pump = promisify(pipeline);

export async function POST(req: NextRequest) {
    const getIp = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').trim().split(',')
    const ipCheck = getIp[getIp.length - 1].trim();
    const ip = ipCheck.replace("::ffff:", "");
    const formData = await req.formData();
    const body = Object.fromEntries(formData);

    try {

        if(body.sawonCode) {

            let sqlSet = " name = ?,";
            const setArray = [body.name];
            sqlSet += " jojikCode = ?,";
            setArray.push(body.jojikCode);            
            sqlSet += " jobCode = ?,";
            setArray.push(body.jobCode);
            sqlSet += " sosok = ?,";
            setArray.push(body.sosok);
            sqlSet += " swId = ?,";
            setArray.push(body.swId);   
            if(body.swPwd) {
                sqlSet += " swPwd = SHA2(CONCAT(CONCAT('*', UPPER(SHA1(UNHEX(SHA1(?))))),'ribo20240408!@'),256),";
                setArray.push(body.swPwd);
            }         
            //sqlSet += " swPwd = SHA2(CONCAT(CONCAT('*', UPPER(SHA1(UNHEX(SHA1(?))))),'ribo20240408!@'),256),";
            //setArray.push(body.swPwd);     
            setArray.push(body.sawonCode);
            
            const query = `update tb_pptn_sawon set ${sqlSet} modDate = now() where sawonCode = ?`;
            await executeQuery(query, setArray);
    
            return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });

        } else {
            const query = `INSERT INTO tb_pptn_sawon (sosok, swId, swPwd, jojikCode, jobCode, name, regDate) VALUES (?, ?, SHA2(CONCAT(CONCAT('*', UPPER(SHA1(UNHEX(SHA1(?))))),'ribo20240408!@'),256), ?, ?, ?, now())`;
            await executeQuery(query, [body.sosok, body.swId, body.swPwd, body.jojikCode, body.jobCode, body.name]);

            return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });
        }

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: `${error}` });
    }
}