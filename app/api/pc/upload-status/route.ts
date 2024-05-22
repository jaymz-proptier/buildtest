import { NextRequest, NextResponse } from "next/server";
import executeQuery from "@/lib/mysql";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
    const userData = token as jwt.JwtPayload;
    if(userData.sosok!=="직원") return NextResponse.json({ status: "Fail", message: "관리자만 접근 가능합니다." });

    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const getIp = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').trim().split(',')
    const ipCheck = getIp[getIp.length - 1].trim();
    const ip = ipCheck.replace("::ffff:", "");

    if(req.method === "POST") {
        try {

            if(body.dataGubun==="1") {
                if(body.status==="Y") {

                    await executeQuery("truncate table tb_data_member;", []);
                    
                    const query = `INSERT INTO tb_data_member (upchaSeq, uploadSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 시작일, 종료일, 담당자, 상태, 계약전송수, 전송수, 계약전송율, 계약단지명, regDate, modDate, useYn, sawonCode)
                    SELECT b.upchaSeq, b.uploadSeq,
                        b.상품유형, b.상품명, 
                        b.회원번호, b.상호명, b.사업자번호, b.대표자명, b.휴대폰, 
                        b.시도, b.시군구, b.읍면동, b.상세주소, 
                        b.계약구분, b.결제일, b.시작일, b.종료일, 
                        b.담당자, b.상태, 
                        b.계약전송수, b.전송수, 
                        CASE WHEN b.전송수=0 OR b.계약전송수=0 THEN 0
                                ELSE TRUNCATE((b.전송수/b.계약전송수)*100,2) END AS '계약전송율', 
                        b.계약단지명, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        IFNULL((SELECT s1.sawonCode
                                FROM   tb_pptn_sawon s1
                                WHERE  s1.sosok='컨설턴트'
                                AND    s1.name=b.담당자
                                AND    s1.isStatus='재직'
                                AND    s1.useYn='Y'
                                LIMIT 1),0) AS '사원번호'
                    FROM   tb_upload_log a
                        INNER JOIN tb_upload_member_log b ON (b.upchaSeq=a.upchaSeq AND b.useYn='Y')
                    WHERE  a.dataGubun='1'
                    AND    a.statusGubun='W'
                    AND    a.useYn='Y'
                    AND    NOT EXISTS (SELECT 'Y' FROM tb_data_member
                                    WHERE  upchaSeq=a.upchaSeq
                                    AND    uploadSeq=b.uploadSeq
                                    AND    useYn='Y')`;
                    await executeQuery(query, [body.upchaSeq]);
                    
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun ='Y',
                        totalCount  =(SELECT COUNT(uploadSeq) FROM tb_upload_member_log s1 WHERE s1.upchaSeq=upchaSeq AND s1.useYn='Y'),
                        succeseCount=(SELECT COUNT(uploadSeq) FROM tb_data_member s2       WHERE s2.upchaSeq=upchaSeq AND s2.useYn='Y'),
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='1'
                    AND    statusGubun='W'
                    AND    useYn='Y'`, [body.upchaSeq]);

                } else {
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun = ?,
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='1'
                    AND    useYn='Y'`, [body.status, body.upchaSeq]);
                }
                
            } else if(body.dataGubun==="2") {
                if(body.status==="Y") {

                    await executeQuery("truncate table tb_data_sales;", []);
                    
                    const query = `insert into tb_data_sales (upchaSeq, uploadSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 환불일, 환불금액, 담당자, 상태, 계약단지, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.uploadSeq,
                        b.상품유형, b.상품명, 
                        b.회원번호, b.상호명, b.사업자번호, b.대표자명, b.휴대폰, 
                        b.시도, b.시군구, b.읍면동, b.상세주소, 
                        b.계약구분, b.결제일, b.결제금액, b.시작일, b.종료일, b.환불일, b.환불금액, 
                        b.담당자, b.상태, b.계약단지, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_sales_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='2' and a.statusGubun='W' and a.useYn='Y' and not exists (select 'Y' from tb_data_sales where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query, [body.upchaSeq]);
                    
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun ='Y',
                        totalCount  =(SELECT COUNT(uploadSeq) FROM tb_upload_sales_log s1 WHERE s1.upchaSeq=upchaSeq AND s1.useYn='Y'),
                        succeseCount=(SELECT COUNT(uploadSeq) FROM tb_data_sales s2       WHERE s2.upchaSeq=upchaSeq AND s2.useYn='Y'),
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='2'
                    AND    statusGubun='W'
                    AND    useYn='Y'`, [body.upchaSeq]);

                } else {
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun = ?,
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='2'
                    AND    useYn='Y'`, [body.status, body.upchaSeq]);
                }

            } else if(body.dataGubun==="3") {
                let centerName = "";
                let partName = "";
            }



            return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });
        } catch (error) {
        console.error('데이터 업로드 오류:', error);
        return NextResponse.json({ status: "Fail", message: error });
        }
  } else {
    console.log(req.method);
  }
}