import executeQuery from "@/lib/mysql";
import { supabase } from "@/lib/supabase-client";
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

    const filePath = `/public/files/${body.fileName}`;

    try {

        let sqlSet = "";
        const setArray = [];   
        sqlSet += " workSawonNo = ?,";
        setArray.push(body.sawonCode);          
        sqlSet += " workIp = ? ";
        setArray.push(body.ip);
        setArray.push(body.bnSeq);
        
        const query = `update tb_board_notice set ${sqlSet}, delDate = now(), useYn = 'N' where bnSeq = ?`;
        await executeQuery(query, setArray);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('There was an error deleting the file:', err);
            } else {
                console.log('File deleted successfully');
            }
            });        
        return NextResponse.json({ status: "OK", message: "정상적으로 처리했습니다." });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: `데이터 업로드 중 오류가 발생했습니다.\n\r${error}` });
    }
}