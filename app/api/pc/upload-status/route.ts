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
                        b.회원번호, b.상호명, left(b.사업자번호, 12), b.대표자명, b.휴대폰, 
                        b.시도, b.시군구, b.읍면동, b.상세주소, 
                        b.계약구분, b.결제일, left(b.시작일, 10), left(b.종료일, 10), 
                        replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.상태, 
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
                        b.회원번호, b.상호명, left(b.사업자번호, 12), b.대표자명, b.휴대폰, 
                        b.시도, b.시군구, b.읍면동, b.상세주소, 
                        b.계약구분, b.결제일, b.결제금액, left(b.시작일, 10), left(b.종료일, 10), left(b.환불일, 10), b.환불금액, 
                        replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.상태, b.계약단지, 
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
                if(body.status==="Y") {
                    
                    await executeQuery("delete from tb_data_calculate where upchaSeq = ? and calYm = ? ", [body.upchaSeq, `${body.year}${body.month}`]);
                    await executeQuery("delete from tb_data_calculate_sales where upchaSeq = ? and calYm = ? ", [body.upchaSeq, `${body.year}${body.month}`]);
                    await executeQuery("delete from tb_data_calculate_etc where upchaSeq = ? and calYm = ? ", [body.upchaSeq, `${body.year}${body.month}`]);
                    const query = `insert into tb_data_calculate (upchaSeq, uploadSeq, calYm, title, 담당자, 월매출액, 매출_이실장, 매출_포커스, 매출_프리미엄, 매출_enote, 매출_동기화, 매출_네이버검색광고, 매출_네이트검색광고, 매출_홈페이지, 매출_e분양, 매출_입주탐방, 매출_도메인, 관리자_이실장, 관리자_이실장외, 영업_이실장, 영업_포커스, 영업_프리미엄, 영업_enote, 영업_동기화, 영업_네이버검색광고, 영업_네이트검색광고, 영업_홈페이지, 영업_e분양, 영업_입주탐방, 영업_도메인, 지원금_주차비, 지원금_디바이스구매지원, 지원금_영업지원금, 지원금_기타, 지원금_반반쿠폰, 정산액, 입금예정액, 지원금_기타사항, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.uploadSeq,
                    b.calYm, b.title, replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.월매출액, b.매출_이실장, b.매출_포커스, b.매출_프리미엄, b.매출_enote, b.매출_동기화, b.매출_네이버검색광고, b.매출_네이트검색광고, b.매출_홈페이지, b.매출_e분양, b.매출_입주탐방, b.매출_도메인, b.관리자_이실장, b.관리자_이실장외, b.영업_이실장, b.영업_포커스, b.영업_프리미엄, b.영업_enote, b.영업_동기화, b.영업_네이버검색광고, b.영업_네이트검색광고, b.영업_홈페이지, b.영업_e분양, b.영업_입주탐방, b.영업_도메인, b.지원금_주차비, b.지원금_디바이스구매지원, b.지원금_영업지원금, b.지원금_기타, b.지원금_반반쿠폰, b.정산액, b.입금예정액, b.지원금_기타사항, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_calculate_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='3' and a.statusGubun='W' and a.useYn='Y' and a.upchaSeq = ? and not exists (select 'Y' from tb_data_calculate where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query, [body.upchaSeq]);
                    
                    const query2 = `insert into tb_data_calculate_sales (calSeq, upchaSeq, uploadSeq, calYm, 상품구분, 상품명, 계약단지, 계약구분, 중개사명, 대표자명, 연락처, 결제일자, 만료일자, 매출액, 유치수수료, 관리수수료, 추가수수료, 결제수수료, 쿠폰원가, 정산수수료, 담당자, 소속1, 소속2, 관리자메모, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.upchaSeq as upchaSeq2, b.uploadSeq,
                    b.calYm, b.상품구분, b.상품명, b.계약단지, b.계약구분, b.중개사명, b.대표자명, b.연락처, left(b.결제일자, 10), left(b.만료일자, 10), b.매출액, b.유치수수료, b.관리수수료, b.추가수수료, b.결제수수료, b.쿠폰원가, b.정산수수료, replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.소속1, b.소속2, b.관리자메모, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_calculate_sales_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='3' and a.statusGubun='W' and a.useYn='Y' and a.upchaSeq = ? and not exists (select 'Y' from tb_data_calculate_sales where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query2, [body.upchaSeq]);

                    const query3 = `insert into tb_data_calculate_etc (calSeq, upchaSeq, uploadSeq, calYm, 구분, 내용, 상품구분, 계약구분, 중개사명, 결제일, 매출액, 본인부담금, 담당자, 소속1, 소속2, 관리자메모, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.upchaSeq as upchaSeq2, b.uploadSeq,
                    b.calYm, b.구분, b.내용, b.상품구분, b.계약구분, b.중개사명, left(b.결제일, 10), b.매출액, b.본인부담금, replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.소속1, b.소속2, b.관리자메모, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_calculate_etc_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='3' and a.statusGubun='W' and a.useYn='Y' and a.upchaSeq = ? and not exists (select 'Y' from tb_data_calculate_etc where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query3, [body.upchaSeq]);

                    
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun ='Y',
                        totalCount  =(SELECT COUNT(uploadSeq) FROM tb_upload_calculate_log s1 WHERE s1.upchaSeq=upchaSeq AND s1.useYn='Y'),
                        succeseCount=(SELECT COUNT(uploadSeq) FROM tb_data_calculate s2       WHERE s2.upchaSeq=upchaSeq AND s2.useYn='Y'),
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='3'
                    AND    statusGubun='W'
                    AND    useYn='Y'`, [body.upchaSeq]);

                } else {
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun = ?,
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='3'
                    AND    useYn='Y'`, [body.status, body.upchaSeq]);
                }
            } else if(body.dataGubun==="4") {
                if(body.status==="Y") {
                    
                    await executeQuery("delete from tb_data_newcontracts where upchaSeq = ? ", [body.upchaSeq]);
                    await executeQuery("delete from tb_data_expirecontracts where upchaSeq = ? ", [body.upchaSeq]);
                    const query = `insert into tb_data_newcontracts (upchaSeq, uploadSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 담당자, 상태, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.uploadSeq,
                    b.상품유형, b.상품명, b.회원번호, b.상호명, left(b.사업자번호, 12), b.대표자명, b.휴대폰, b.시도, b.시군구, b.읍면동, b.상세주소, b.계약구분, b.결제일, b.결제금액, left(b.시작일, 10), left(b.종료일, 10), replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.상태, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_newcontracts_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='4' and a.statusGubun='W' and a.useYn='Y' and a.upchaSeq = ? and not exists (select 'Y' from tb_data_newcontracts where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query, [body.upchaSeq]);
                    
                    const query2 = `insert into tb_data_expirecontracts (upchaSeq, uploadSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 담당자, 상태, regDate, modDate, useYn, sawonCode)
                    select b.upchaSeq, b.uploadSeq,
                    b.상품유형, b.상품명, b.회원번호, b.상호명, left(b.사업자번호, 12), b.대표자명, b.휴대폰, b.시도, b.시군구, b.읍면동, b.상세주소, b.계약구분, b.결제일, b.결제금액, left(b.시작일, 10), left(b.종료일, 10), replace(replace(b.담당자, 'a', ''), 'b', '') as 담당자, b.상태, 
                        SYSDATE() '등록일', 
                        SYSDATE() '수정일',
                        'Y' AS '사용여부',
                        ifnull((select s1.sawonCode from tb_pptn_sawon s1 where s1.sosok='컨설턴트' and s1.name=b.담당자 and s1.isStatus='재직' and s1.useYn='Y' limit 1),0) as '사원번호'
                    from tb_upload_log a
                        inner join tb_upload_expirecontracts_log b ON (b.upchaSeq=a.upchaSeq and b.useYn='Y')
                    where  a.dataGubun='4' and a.statusGubun='W' and a.useYn='Y' and a.upchaSeq = ? and not exists (select 'Y' from tb_data_expirecontracts where upchaSeq=a.upchaSeq and uploadSeq=b.uploadSeq and useYn='Y')`;
                    await executeQuery(query2, [body.upchaSeq]);

                    
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun ='Y',
                        totalCount  =(SELECT COUNT(uploadSeq) FROM tb_upload_newcontracts_log s1 WHERE s1.upchaSeq=upchaSeq AND s1.useYn='Y'),
                        succeseCount=(SELECT COUNT(uploadSeq) FROM tb_data_newcontracts s2       WHERE s2.upchaSeq=upchaSeq AND s2.useYn='Y'),
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='4'
                    AND    statusGubun='W'
                    AND    useYn='Y'`, [body.upchaSeq]);

                } else {
                    await executeQuery(`UPDATE tb_upload_log
                    SET    statusGubun = ?,
                        modDate     =SYSDATE()
                    WHERE  upchaSeq = ?
                    AND    dataGubun='4'
                    AND    useYn='Y'`, [body.status, body.upchaSeq]);
                }
            }



            return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });
        } catch (error: any) {
        console.error('데이터 업로드 오류:', error.sqlMessage);
        return NextResponse.json({ status: "Fail", message: error });
        }
  } else {
    console.log(req.method);
  }
}