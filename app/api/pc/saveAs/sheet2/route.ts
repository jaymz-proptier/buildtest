import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    
    const { searchParams } = new URL(req.url);

    try {
        
        const sql = `select a.상품유형 as '상품구분', a.상품명, a.계약단지, a.계약구분, a.상호명 as '중개사명', date_format(a.결제일, '%y.%m.%d') as '결제일자', a.결제금액 as '매출액', '' as '유치수수료', '' as '관리수수료', '' as '결제수수료', '' as '쿠폰원가', '' as '정산수수료', a.담당자, c.centerName as '소속1', c.partName as '소속2'
        from tb_data_sales a inner join tb_pptn_sawon b on a.sawonCode = b.sawonCode and b.useYn = 'Y' 
        inner join tb_pptn_jojikcode c on b.jojikCode = c.jojikCode and c.useYn = 'Y'
          where a.upchaSeq = (select upchaSeq from tb_upload_log where dataGubun = '2' and statusGubun = 'Y' and useYn = 'Y') and a.useYn = 'Y'
          order by a.salesSeq`;
        const result = await executeQuery(sql, []) as any[];
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}