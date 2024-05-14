import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import * as XLSX from "xlsx";
import executeQuery from "@/lib/mysql";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const getIp = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').trim().split(',')
    const ipCheck =  getIp.length > 1 ? getIp[getIp.length - 1].trim() : getIp
    const ip = ipCheck

    if(req.method === "POST") {
        try {
            const session = await auth();
            const sawonData = JSON.parse(JSON.stringify(session));


            const file = body.file;
            const files = formData.getAll('file') as File[];
            const fileToStorage = files[0];
            const fileName = Buffer.from(fileToStorage.name, "latin1").toString("utf8");
            const data = new Uint8Array(await new Response(file).arrayBuffer());
            const workbook = XLSX.read(data, { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet) as any;

            const insertData = [];
            if(body.dataGubun==="1") {
                for (let i = 0; i < jsonData.length; i++) {
                    insertData.push([
                        jsonData[i]["상품유형"],
                        jsonData[i]["상품명"],
                        jsonData[i]['회원번호'],
                        jsonData[i]['상호명'],
                        jsonData[i]['사업자번호'],
                        jsonData[i]['대표자명'],
                        jsonData[i]['휴대폰 번호'],
                        jsonData[i]['시도'],
                        jsonData[i]['구시군'],
                        jsonData[i]['읍면동'],
                        jsonData[i]['상세주소'],
                        jsonData[i]['계약구분'],
                        jsonData[i]['결제일'],
                        jsonData[i]['시작일'],
                        jsonData[i]['종료일'],
                        jsonData[i]['담당자'],
                        jsonData[i]['상태'],
                        jsonData[i]['계약전송수'],
                        jsonData[i]['전송수'],
                        jsonData[i]['계약단지']
                    ]);
                }
                await executeQuery("UPDATE tb_upload_log SET statusGubun='D', useYn='N' WHERE dataGubun='1' AND statusGubun='W' AND useYn='Y';", []);
                await executeQuery("TRUNCATE TABLE tb_upload_member_log;", []);
                await executeQuery("UPDATE tb_upload_member_log SET useYn='N' WHERE useYn='Y';", []);
                const uploadSql = `insert into tb_upload_log_test (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, body.sawonCode, ip]);
                const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                const lastInsertId = rows[0]["LAST_INSERT_ID()"];

                const placeholders = Array.from({ length: 20 }, () => '?').join(',');
                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')}, now(), 'Y')`).join(',');
                const query = `INSERT INTO tb_upload_member_log_test (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 시작일, 종료일, 담당자, 상태, 계약전송수, 전송수, 계약단지명, regDate, useYn) VALUES ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());
                
                await executeQuery(`update tb_upload_log_test set succeseCount = ( select count(*) from tb_upload_member_log_test where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);
                
            } else if(body.dataGubun==="2") {
                for (let i = 0; i < jsonData.length; i++) {
                    insertData.push([
                        jsonData[i]["상품유형"],
                        jsonData[i]["상품명"],
                        jsonData[i]['회원번호'],
                        jsonData[i]['상호명'],
                        jsonData[i]['사업자번호'],
                        jsonData[i]['대표자명'],
                        jsonData[i]['휴대폰'],
                        jsonData[i]['시도'],
                        jsonData[i]['구시군'],
                        jsonData[i]['읍면동'],
                        jsonData[i]['상세주소'],
                        jsonData[i]['계약구분'],
                        jsonData[i]['결제일'],
                        jsonData[i]['결제금액'],
                        jsonData[i]['시작일'],
                        jsonData[i]['종료일'],
                        jsonData[i]['환불일'],
                        jsonData[i]['환불액'],
                        jsonData[i]['담당자'],
                        jsonData[i]['상태'],
                        jsonData[i]['계약단지']
                    ]);
                }
                const uploadSql = `insert into tb_upload_log_test (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, body.sawonCode, ip]);
                const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                const lastInsertId = rows[0]["LAST_INSERT_ID()"];

                const placeholders = Array.from({ length: 22 }, () => '?').join(',');
                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')}, sysdate(), SYSDATE())`).join(',');

                const query = `INSERT INTO tb_upload_sales_log_test (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 환불일, 환불금액, 담당자, 상태, 계약단지,regDate, modDate) VALUES ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());

                await executeQuery(`update tb_upload_log_test set succeseCount = ( select count(*) from tb_upload_sales_log_test where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);

            } else if(body.dataGubun==="3") {
                console.log(jsonData[38], jsonData[36], jsonData[41], jsonData.length);
                let centerName = "";
                let partName = "";
                for (let i = 2; i < jsonData.length; i++) {
                    centerName = jsonData[i]["__EMPTY_1"] ? jsonData[i]["__EMPTY_1"] : centerName;
                    partName = jsonData[i]["__EMPTY_2"] ? jsonData[i]["__EMPTY_2"] : partName;
                    if(!(jsonData[i]["__EMPTY_1"]==="합계" || jsonData[i]["__EMPTY_2"]==="소계" || jsonData[i]["__EMPTY_3"]==="소계")) insertData.push([
                        jsonData[i]["1"],
                        jsonData[i]["2"] || 0,
                        jsonData[i]["3"] || 0,
                        jsonData[i]["4"] || 0,
                        jsonData[i]["5"] || 0,
                        jsonData[i]["6"] || 0,
                        jsonData[i]["7"] || 0,
                        jsonData[i]["8"] || 0,
                        jsonData[i]["9"] || 0,
                        jsonData[i]["10"] || 0,
                        jsonData[i]["11"] || 0,
                        jsonData[i]["12"] || 0,
                        jsonData[i]["13"] || 0,
                        jsonData[i]["17"] || 0,
                        jsonData[i]["18"] || 0,
                        jsonData[i]["19"] || 0,
                        jsonData[i]["20"] || 0,
                        jsonData[i]["21"] || 0,
                        jsonData[i]["22"] || 0,
                        jsonData[i]["23"] || 0,
                        jsonData[i]["24"] || 0,
                        jsonData[i]["25"] || 0,
                        jsonData[i]["26"] || 0,
                        jsonData[i]["27"] || 0,
                        jsonData[i]["28"] || 0,
                        jsonData[i]["29"] || 0,
                        jsonData[i]["33"] || 0,
                        jsonData[i]["34"] || 0,
                        jsonData[i]["35"] || 0,
                        jsonData[i]["36"] || 0,
                        jsonData[i]["37"] || 0,
                        jsonData[i]["38"] || 0,
                        jsonData[i]["39"] || 0,
                        jsonData[i]["40"] || 0,
                        jsonData[i]["41"] || 0,
                        jsonData[i]["42"] || 0,
                        jsonData[i]["44"],
                        jsonData[i]["45"] || 0,
                        jsonData[i]["46"] || 0,
                        jsonData[i]["47"] || 0,
                        jsonData[i]["48"] || 0,
                        jsonData[i]["48_1"] || 0,
                        jsonData[i]["48_2"] || 0,
                        centerName,
                        partName
                    ]);
                }
                const uploadSql = `insert into tb_upload_log_test (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, body.sawonCode, ip]);
                const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                const lastInsertId = rows[0]["LAST_INSERT_ID()"];
                
                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, '${body.year}${body.month}', '${body.title}', ${row.map(() => '?').join(',')})`).join(',');

                const query = `INSERT INTO tb_upload_calculate_log_test (upchaSeq, calYm, title, 담당자, 월매출액, 매출_이실장, 매출_포커스, 매출_프리미엄, 매출_enote, 매출_동기화, 매출_네이버검색광고, 매출_네이트검색광고, 매출_홈페이지, 매출_e분양, 매출_입주탐방, 매출_도메인, 관리자_이실장, 관리자_이실장외, 영업_이실장, 영업_포커스, 영업_프리미엄, 영업_enote, 영업_동기화, 영업_네이버검색광고, 영업_네이트검색광고, 영업_홈페이지, 영업_e분양, 영업_입주탐방, 영업_도메인, 지원금_주차비, 지원금_디바이스구매지원, 지원금_영업지원금, 지원금_기타, 정산액, 입금예정액, 선지급금, 실입금액, 인센티트_세액공제전, 인센티브_세액공제후, 지원금_기타사항, 차감선지급_반반쿠폰, 로켓등록수익쉐어, 이실장순종, 이실장구간, 거점지역, 취약지역, 센터, 파트) value ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());

                await executeQuery(`update tb_upload_log_test set succeseCount = ( select count(*) from tb_upload_sales_log_test where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);
                
                    //console.log(insertData, insertData.length);
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