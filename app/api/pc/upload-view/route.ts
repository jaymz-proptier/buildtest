import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        const sql = `select a.*, (case when a.statusGubun = 'W' then '처리대기' when a.statusGubun = 'Y' then '처리완료' when a.statusGubun = 'N' then '처리실패' when a.statusGubun = 'D' then '삭제' end) as statusGubunName, (case when a.dataGubun = '4' then concat('신규: ',
        coalesce((select count(uploadSeq) from tb_data_newcontracts where a.upchaSeq = upchaSeq and useYn = 'Y'), 0), '건 / 만기: ', 
        coalesce((select count(uploadSeq) from tb_data_expirecontracts where a.upchaSeq = upchaSeq and useYn = 'Y'), 0), '건') 
        when a.dataGubun = '3' then concat('정산: ',
        coalesce((select count(uploadSeq) from tb_data_calculate where a.upchaSeq = upchaSeq and useYn = 'Y'), 0), '건 / 매출: ', 
        coalesce((select count(uploadSeq) from tb_data_calculate_sales where a.upchaSeq = upchaSeq and useYn = 'Y'), 0), '건 / 기타: ', 
        coalesce((select count(uploadSeq) from tb_data_calculate_etc where a.upchaSeq = upchaSeq and useYn = 'Y'), 0), '건') else '' end) as resultStatus from tb_upload_log a where a.upchaSeq = ?`;
        const result = await executeQuery(sql, [searchParams.get("upchaSeq")]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result[0] });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: `데이터 업로드 중 오류가 발생했습니다.\n\r${error}` });
    }
}