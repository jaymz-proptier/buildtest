import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
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
            const file = body.file;
            const files = formData.getAll('file') as File[];
            const fileToStorage = files[0];
            const fileName = Buffer.from(fileToStorage.name, "latin1").toString("utf8");
            const data = new Uint8Array(await new Response(file).arrayBuffer());
            const workbook = XLSX.read(data, { type: "buffer", cellDates: true, dateNF: "YYYY-MM-DD" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet) as any;

            const insertData = [];
            if(body.dataGubun==="1") {
                for (let i = 0; i < jsonData.length; i++) {
                    insertData.push([
                        jsonData[i]["상품유형"],
                        jsonData[i]["상품명"],
                        //jsonData[i]["멤버십 종류"],
                        //jsonData[i]["이실장회원번호"],
                        jsonData[i]['회원번호'],
                        jsonData[i]['상호명'],
                        jsonData[i]['사업자번호'],
                        jsonData[i]['대표자명'],
                        jsonData[i]['휴대폰'],
                        jsonData[i]['시도'],
                        jsonData[i]['시군구'],
                        jsonData[i]['읍면동'],
                        jsonData[i]['상세주소'],
                        jsonData[i]['계약구분'],
                        jsonData[i]['결제일'],
                        jsonData[i]['시작일'],
                        //new Date(jsonData[i]['시작일']).toLocaleDateString('en-CA'),
                        //jsonData[i]['멤버십시작일'],
                        jsonData[i]['종료일'],
                        //new Date(jsonData[i]['종료일']).toLocaleDateString('en-CA'),
                        //jsonData[i]['멤버십종료일'],
                        jsonData[i]['담당자'],
                        //jsonData[i]['멤버십상태'],
                        jsonData[i]['상태'],
                        jsonData[i]['계약전송수'],
                        jsonData[i]['전송수'],
                        jsonData[i]['계약상품'] 
                        //upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 시작일, 종료일, 담당자, 상태, 계약전송수, 전송수
                    ]);
                }
                /* await executeQuery("UPDATE tb_upload_log SET statusGubun='D', useYn='N' WHERE dataGubun='1' AND statusGubun='W' AND useYn='Y';", []);
                await executeQuery("TRUNCATE TABLE tb_upload_member_log;", []);
                await executeQuery("UPDATE tb_upload_member_log SET useYn='N' WHERE useYn='Y';", []);
                const uploadSql = `insert into tb_upload_log (dataGubun, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                await executeQuery(uploadSql, [body.dataGubun, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                const lastInsertId = rows[0]["LAST_INSERT_ID()"]; */

                let lastInsertId = 0;
                if(body.modifyId || body.upchaSeq) {
                    lastInsertId = body.modifyId ? Number(body.modifyId) : body.upchaSeq ? Number(body.upchaSeq) : 0;

                    let sqlSet = " title = ?,";
                    const setArray = [body.title];
                    sqlSet += " contents = ?,";
                    setArray.push(body.contents);            
                    sqlSet += " fileName = ?,";
                    setArray.push(fileToStorage.name);
                    sqlSet += " totalCount = ?,";
                    setArray.push(insertData.length.toString());     
                    sqlSet += " workSawonNo = ?,";
                    setArray.push(userData.sawonCode);          
                    sqlSet += " workIp = ? ";
                    setArray.push(ip);
                    setArray.push(lastInsertId.toString());
                    
                    const query = `update tb_upload_log set ${sqlSet}, statusGubun = 'W', modDate = now() where upchaSeq = ?`;
                    await executeQuery(query, setArray);
                    await executeQuery("TRUNCATE TABLE tb_upload_member_log;", []);
                    await executeQuery("UPDATE tb_upload_member_log SET useYn='N' WHERE useYn='Y';", []);
                } else {
                    await executeQuery("UPDATE tb_upload_log SET statusGubun='D', useYn='N' WHERE dataGubun='1' AND statusGubun='W' AND useYn='Y';", []);
                    await executeQuery("TRUNCATE TABLE tb_upload_member_log;", []);
                    await executeQuery("UPDATE tb_upload_member_log SET useYn='N' WHERE useYn='Y';", []);
                    const uploadSql = `insert into tb_upload_log (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                    await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                    const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                    lastInsertId = rows[0]["LAST_INSERT_ID()"];
                }

                const placeholders = Array.from({ length: 20 }, () => '?').join(',');
                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')})`).join(',');
                const query = `INSERT INTO tb_upload_member_log (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 시작일, 종료일, 담당자, 상태, 계약전송수, 전송수, 계약단지명) VALUES ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());
                
                //await executeQuery(`update tb_upload_log set succeseCount = ( select count(*) from tb_upload_member_log where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);
                
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
                        jsonData[i]['시군구'],
                        jsonData[i]['읍면동'],
                        jsonData[i]['상세주소'],
                        jsonData[i]['계약구분'],
                        jsonData[i]['결제일'],
                        jsonData[i]['결제금액'] ? jsonData[i]['결제금액'] : jsonData[i][' 결제금액'] ? jsonData[i][' 결제금액'] : jsonData[i][' 결제금액 '],
                        jsonData[i]['시작일'],
                        jsonData[i]['종료일'],
                        jsonData[i]['환불일'],
                        jsonData[i]['환불금액'] || 0,
                        jsonData[i]['담당자'],
                        jsonData[i]['상태']
                    ]);
                }
                /* await executeQuery("UPDATE tb_upload_log SET statusGubun='D', useYn='N' WHERE dataGubun='2' AND statusGubun='W' AND useYn='Y';", []);
                await executeQuery("TRUNCATE TABLE tb_upload_sales_log;", []);
                await executeQuery("UPDATE tb_upload_sales_log SET useYn='N' WHERE useYn='Y';", []);
                const uploadSql = `insert into tb_upload_log (dataGubun, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                await executeQuery(uploadSql, [body.dataGubun, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                const lastInsertId = rows[0]["LAST_INSERT_ID()"]; */


                let lastInsertId = 0;
                if(body.modifyId || body.upchaSeq) {
                    lastInsertId = body.modifyId ? Number(body.modifyId) : body.upchaSeq ? Number(body.upchaSeq) : 0;

                    let sqlSet = " title = ?,";
                    const setArray = [body.title];
                    sqlSet += " contents = ?,";
                    setArray.push(body.contents);            
                    sqlSet += " fileName = ?,";
                    setArray.push(fileToStorage.name);
                    sqlSet += " totalCount = ?,";
                    setArray.push(insertData.length.toString());     
                    sqlSet += " workSawonNo = ?,";
                    setArray.push(userData.sawonCode);          
                    sqlSet += " workIp = ? ";
                    setArray.push(ip);
                    setArray.push(lastInsertId.toString());
                    
                    const query = `update tb_upload_log set ${sqlSet}, statusGubun = 'W', modDate = now() where upchaSeq = ?`;
                    await executeQuery(query, setArray);
                    await executeQuery("TRUNCATE TABLE tb_upload_sales_log;", []);
                    await executeQuery("UPDATE tb_upload_sales_log SET useYn='N' WHERE useYn='Y';", []);
                } else {
                    await executeQuery("UPDATE tb_upload_log SET statusGubun='D', useYn='N' WHERE dataGubun='2' AND statusGubun='W' AND useYn='Y';", []);
                    await executeQuery("TRUNCATE TABLE tb_upload_sales_log;", []);
                    await executeQuery("UPDATE tb_upload_sales_log SET useYn='N' WHERE useYn='Y';", []);
                    const uploadSql = `insert into tb_upload_log (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                    await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                    const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                    lastInsertId = rows[0]["LAST_INSERT_ID()"];
                }

                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')})`).join(',');

                const query = `INSERT INTO tb_upload_sales_log (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 환불일, 환불금액, 담당자, 상태) VALUES ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());

                //await executeQuery(`update tb_upload_log set succeseCount = ( select count(*) from tb_upload_sales_log_test where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);

            } else if(body.dataGubun==="3") {
                
                const sheetName2 = workbook.SheetNames[1];
                const sheet2 = workbook.Sheets[sheetName2];
                const jsonData2 = XLSX.utils.sheet_to_json(sheet2) as any;
                const sheetName3 = workbook.SheetNames[2];
                const sheet3 = workbook.Sheets[sheetName3];
                const jsonData3 = XLSX.utils.sheet_to_json(sheet3) as any;

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
                        jsonData[i]["41"],
                        centerName,
                        partName
                    ]);
                }
                let lastInsertId = 0;
                if(body.modifyId || body.upchaSeq) {
                    lastInsertId = body.modifyId ? Number(body.modifyId) : body.upchaSeq ? Number(body.upchaSeq) : 0;

                    let sqlSet = " title = ?,";
                    const setArray = [body.title];
                    sqlSet += " contents = ?,";
                    setArray.push(body.contents);            
                    sqlSet += " fileName = ?,";
                    setArray.push(fileToStorage.name);
                    sqlSet += " totalCount = ?,";
                    setArray.push(insertData.length.toString());     
                    sqlSet += " workSawonNo = ?,";
                    setArray.push(userData.sawonCode);          
                    sqlSet += " workIp = ? ";
                    setArray.push(ip);
                    setArray.push(lastInsertId.toString());
                    
                    const query = `update tb_upload_log set ${sqlSet}, statusGubun = 'W', modDate = now() where upchaSeq = ?`;
                    await executeQuery(query, setArray);
                    await executeQuery("delete from tb_upload_calculate_log where upchaSeq = ? and calYm = ? ", [lastInsertId, `${body.year}${body.month}`]);
                    await executeQuery("delete from tb_upload_calculate_sales_log where upchaSeq = ? and calYm = ? ", [lastInsertId, `${body.year}${body.month}`]);
                    await executeQuery("delete from tb_upload_calculate_etc_log where upchaSeq = ? and calYm = ? ", [lastInsertId, `${body.year}${body.month}`]);
                } else {
                    const uploadSql = `insert into tb_upload_log (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                    await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                    const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                    lastInsertId = rows[0]["LAST_INSERT_ID()"];
                }
                

                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, '${body.year}${body.month}', '${body.title}', ${row.map(() => '?').join(',')})`).join(',');

                const query = `INSERT INTO tb_upload_calculate_log (upchaSeq, calYm, title, 담당자, 월매출액, 매출_이실장, 매출_포커스, 매출_프리미엄, 매출_enote, 매출_동기화, 매출_네이버검색광고, 매출_네이트검색광고, 매출_홈페이지, 매출_e분양, 매출_입주탐방, 매출_도메인, 관리자_이실장, 관리자_이실장외, 영업_이실장, 영업_포커스, 영업_프리미엄, 영업_enote, 영업_동기화, 영업_네이버검색광고, 영업_네이트검색광고, 영업_홈페이지, 영업_e분양, 영업_입주탐방, 영업_도메인, 지원금_주차비, 지원금_디바이스구매지원, 지원금_영업지원금, 지원금_기타, 지원금_반반쿠폰, 정산액, 입금예정액, 지원금_기타사항, 센터, 파트) value ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());

                //await executeQuery(`update tb_upload_log set succeseCount = ( select count(*) from tb_upload_sales_log_test where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);

                
                const insertData2 = [];
                for(let i = 0; i < jsonData2.length; i++) {
                    insertData2.push([
                        jsonData2[i]["상품구분"],
                        jsonData2[i]["상품명"],
                        jsonData2[i]["계약단지"],
                        jsonData2[i]["계약구분"],
                        jsonData2[i]["중개사명"],
                        jsonData2[i]["결제일자"],
                        jsonData2[i]["매출액"] ? jsonData2[i]["매출액"] : jsonData2[i][" 매출액 "] ? jsonData2[i][" 매출액 "] : 0,
                        jsonData2[i]["유치수수료"] ? jsonData2[i]["유치수수료"] : jsonData2[i][" 유치수수료 "] ? jsonData2[i][" 유치수수료 "] : 0,
                        jsonData2[i]["관리수수료"] ? jsonData2[i]["관리수수료"] : jsonData2[i][" 관리수수료 "] ? jsonData2[i][" 관리수수료 "] : 0,
                        jsonData2[i]["추가수수료"] ? jsonData2[i]["추가수수료"] : jsonData2[i][" 추가수수료 "] ? jsonData2[i][" 추가수수료 "] : 0,
                        jsonData2[i]["결제수수료"] ? jsonData2[i]["결제수수료"] : jsonData2[i][" 결제수수료 "] ? jsonData2[i][" 결제수수료 "] : 0,
                        jsonData2[i]["쿠폰원가"] ? jsonData2[i]["쿠폰원가"] : jsonData2[i][" 쿠폰원가 "] ? jsonData2[i][" 쿠폰원가 "] : 0,
                        jsonData2[i]["정산수수료"] ? jsonData2[i]["정산수수료"] : jsonData2[i][" 정산수수료 "] ? jsonData2[i][" 정산수수료 "] : 0,
                        jsonData2[i]["담당자"],
                        jsonData2[i]["소속1"],
                        jsonData2[i]["소속2"],
                        jsonData2[i]["관리자메모"]
                    ]);
                }
                const valuePlaceholders2 = insertData2.map(row => `(${lastInsertId}, '${body.year}${body.month}', ${row.map(() => '?').join(',')})`).join(',');

                const query2 = `insert into tb_upload_calculate_sales_log (upchaSeq, calYm, 상품구분, 상품명, 계약단지, 계약구분, 중개사명, 결제일자, 매출액, 유치수수료, 관리수수료, 추가수수료, 결제수수료, 쿠폰원가, 정산수수료, 담당자, 소속1, 소속2, 관리자메모) value ${valuePlaceholders2}`;
                await executeQuery(query2, insertData2.flat());


                
                const insertData3 = [];
                for(let i = 0; i < jsonData3.length; i++) {
                    insertData3.push([
                        jsonData3[i]["구분"],
                        jsonData3[i]["내용"],
                        jsonData3[i]["상품구분"],
                        jsonData3[i]["계약구분"],
                        jsonData3[i]["중개사명"],
                        jsonData3[i]["결제일"] ? jsonData3[i]["결제일"] : jsonData3[i][" 결제일 "],
                        jsonData3[i]["매출액"] ? jsonData3[i]["매출액"] : jsonData3[i][" 매출액 "] ? jsonData3[i][" 매출액 "] : 0,
                        jsonData3[i]["본인부담금"] ? jsonData3[i]["본인부담금"] : jsonData3[i][" 본인부담금 "] ? jsonData3[i][" 본인부담금 "] : 0,
                        jsonData3[i]["담당자"],
                        jsonData3[i]["소속1"],
                        jsonData3[i]["소속2"],
                        jsonData3[i]["관리자메모"]
                    ]);
                }
                const valuePlaceholders3 = insertData3.map(row => `(${lastInsertId}, '${body.year}${body.month}', ${row.map(() => '?').join(',')})`).join(',');

                const query3 = `insert into tb_upload_calculate_etc_log (upchaSeq, calYm, 구분, 내용, 상품구분, 계약구분, 중개사명, 결제일, 매출액, 본인부담금, 담당자, 소속1, 소속2, 관리자메모) value ${valuePlaceholders3}`;
                await executeQuery(query3, insertData3.flat());
                
            } else if(body.dataGubun==="4") {
                const sheetName2 = workbook.SheetNames[1];
                const sheet2 = workbook.Sheets[sheetName2];
                const jsonData2 = XLSX.utils.sheet_to_json(sheet2) as any;

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
                        jsonData[i]['시군구'],
                        jsonData[i]['읍면동'],
                        jsonData[i]['상세주소'],
                        jsonData[i]['계약구분'],
                        jsonData[i]['결제일'],
                        jsonData[i]['결제금액'],                        
                        jsonData[i]['시작일'],
                        jsonData[i]['종료일'],
                        jsonData[i]['담당자'],
                        jsonData[i]['상태']
                    ]);
                }
                let lastInsertId = 0;
                if(body.modifyId || body.upchaSeq) {
                    lastInsertId = body.modifyId ? Number(body.modifyId) : body.upchaSeq ? Number(body.upchaSeq) : 0;

                    let sqlSet = " title = ?,";
                    const setArray = [body.title];
                    sqlSet += " contents = ?,";
                    setArray.push(body.contents);            
                    sqlSet += " fileName = ?,";
                    setArray.push(fileToStorage.name);
                    sqlSet += " totalCount = ?,";
                    setArray.push(insertData.length.toString());     
                    sqlSet += " workSawonNo = ?,";
                    setArray.push(userData.sawonCode);          
                    sqlSet += " workIp = ? ";
                    setArray.push(ip);
                    setArray.push(lastInsertId.toString());
                    
                    const query = `update tb_upload_log set ${sqlSet}, statusGubun = 'W', modDate = now() where upchaSeq = ?`;
                    await executeQuery(query, setArray);
                    await executeQuery("delete from tb_upload_newcontracts_log where upchaSeq = ? ", [lastInsertId.toString()]);
                    await executeQuery("delete from tb_upload_expirecontracts_log where upchaSeq = ? ", [lastInsertId.toString()]);
                } else {
                    const uploadSql = `insert into tb_upload_log (dataGubun, calYm, title, contents, fileName, filePath, totalCount, succeseCount, statusGubun, resultMessage, regDate, modDate, useYn, workSawonNo, workIp) values (?, ?, ?, ?, ?, '', ?, 0, 'W', '', sysdate(), SYSDATE(), 'Y', ?, ?)`;
                    await executeQuery(uploadSql, [body.dataGubun, `${body.year}${body.month}`, body.title, body.contents, fileToStorage.name, insertData.length, userData.sawonCode, ip]);
                    const rows = await executeQuery("SELECT LAST_INSERT_ID()",[]) as any[];
                    lastInsertId = rows[0]["LAST_INSERT_ID()"];
                }    
                
                const valuePlaceholders = insertData.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')})`).join(',');

                const query = `insert into tb_upload_newcontracts_log (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 담당자, 상태) value ${valuePlaceholders}`;
                await executeQuery(query, insertData.flat());

                //await executeQuery(`update tb_upload_log set succeseCount = ( select count(*) from tb_upload_newcontracts_log where upchaSeq = ?) where upchaSeq = ?`, [lastInsertId, lastInsertId]);

                
                const insertData2 = [];
                for(let i = 0; i < jsonData2.length; i++) {
                    insertData2.push([
                        jsonData2[i]["상품유형"],
                        jsonData2[i]["상품명"],
                        jsonData2[i]['회원번호'],
                        jsonData2[i]['상호명'],
                        jsonData2[i]['사업자번호'],
                        jsonData2[i]['대표자명'],
                        jsonData2[i]['휴대폰'],
                        jsonData2[i]['시도'],
                        jsonData2[i]['시군구'],
                        jsonData2[i]['읍면동'],
                        jsonData2[i]['상세주소'],
                        jsonData2[i]['계약구분'],
                        jsonData2[i]['결제일'],
                        jsonData2[i]['결제금액'],
                        jsonData2[i]['시작일'],
                        jsonData2[i]['종료일'],
                        jsonData2[i]['담당자'],
                        jsonData2[i]['상태']
                    ]);
                }
                const valuePlaceholders2 = insertData2.map(row => `(${lastInsertId}, ${row.map(() => '?').join(',')})`).join(',');

                const query2 = `insert into tb_upload_expirecontracts_log (upchaSeq, 상품유형, 상품명, 회원번호, 상호명, 사업자번호, 대표자명, 휴대폰, 시도, 시군구, 읍면동, 상세주소, 계약구분, 결제일, 결제금액, 시작일, 종료일, 담당자, 상태) value ${valuePlaceholders2}`;
                await executeQuery(query2, insertData2.flat());

            }



            return NextResponse.json({ status: "OK", message: "정상적으로 등록했습니다." });
        } catch (error: any) {
            console.error('데이터 업로드 오류:', error.sqlMessage ? error.sqlMessage : error);
            return NextResponse.json({ status: "Fail", message: error });
        }
  } else {
    console.log(req.method);
  }
}