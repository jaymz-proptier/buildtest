import executeQuery from "@/lib/mysql";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
    const getToken = req.headers.get("authorization")?.split(' ')[1];
    if(getToken===null || getToken===undefined) return NextResponse.json({ status: "Fail", message: "로그인이 필요합니다." });
    
    const { searchParams } = new URL(req.url);

    try {
        const token = process.env.AUTH_SECRET ? jwt.verify(getToken, process.env.AUTH_SECRET) : "";
        const userData = token as jwt.JwtPayload;
        
        let sqlWhere = " sawonCode = ?";
        const paramsArray = [userData.sawonCode];
        if (searchParams.has("type") && searchParams.get("type")!=="") {
            sqlWhere += " and 상품유형 = ? ";
            paramsArray.push(searchParams.get("type"));
        }
        const countSql = `select calYm, title, 매출_이실장, round((영업_이실장 / 매출_이실장) * 100, 1) as 이실장_수수료율, 영업_이실장, 
        매출_포커스, round((영업_포커스 / 매출_포커스) * 100, 1) as 포커스_수수료율, 영업_포커스, 
        매출_프리미엄, round((영업_프리미엄 / 매출_프리미엄) * 100, 1) as 프리미엄_수수료율, 영업_프리미엄, 
        매출_enote, round((영업_enote / 매출_enote) * 100, 1) as enote_수수료율, 영업_enote, 
        매출_동기화, round((영업_동기화 / 매출_동기화) * 100, 1) as 동기화_수수료율, 영업_동기화, 
        (매출_네이버검색광고) as 검색광고, round(((영업_네이버검색광고) / (매출_네이버검색광고)) * 100, 1) as 검색광고_수수료율, (영업_네이버검색광고) as 영업_검색광고,
        (매출_네이트검색광고) as 안심케어, round(((영업_네이트검색광고) / (매출_네이트검색광고)) * 100, 1) as 안심케어_수수료율, (영업_네이트검색광고) as 영업_안심케어,
        매출_홈페이지, round((영업_홈페이지 / 매출_홈페이지) * 100, 1) as 홈페이지_수수료율, 영업_홈페이지,  
        매출_e분양, round((영업_e분양 / 매출_e분양) * 100, 1) as e분양_수수료율, 영업_e분양,
        매출_입주탐방, round((영업_입주탐방 / 매출_입주탐방) * 100, 1) as 입주탐방_수수료율, 영업_입주탐방, 
        매출_도메인, round((영업_도메인 / 매출_도메인) * 100, 1) as 도메인_수수료율, 영업_도메인,  
        (관리자_이실장 + 관리자_이실장외) as 직책수당, (매출_이실장 + 매출_포커스 + 매출_프리미엄 + 매출_enote + 매출_동기화 + 매출_네이버검색광고 + 매출_네이트검색광고 + 매출_홈페이지 + 매출_e분양 + 매출_입주탐방 + 매출_도메인) as 매출합계, 
        (영업_이실장 + 영업_포커스 + 영업_프리미엄 + 영업_enote + 영업_동기화 + 영업_네이버검색광고 + 영업_네이트검색광고 + 영업_홈페이지 + 영업_e분양 + 영업_입주탐방 + 영업_도메인) as 영업합계, 
        round(((영업_이실장 + 영업_포커스 + 영업_프리미엄 + 영업_enote + 영업_동기화 + 영업_네이버검색광고 + 영업_네이트검색광고 + 영업_홈페이지 + 영업_e분양 + 영업_입주탐방 + 영업_도메인) / (매출_이실장 + 매출_포커스 + 매출_프리미엄 + 매출_enote + 매출_동기화 + 매출_네이버검색광고 + 매출_네이트검색광고 + 매출_홈페이지 + 매출_e분양 + 매출_입주탐방 + 매출_도메인)) * 100, 1) as 수수료합계,
        지원금_주차비, 지원금_디바이스구매지원, 지원금_영업지원금, 지원금_기타, 지원금_기타사항, 지원금_반반쿠폰, 정산액, 입금예정액, 선지급금, 실입금액, (관리자_이실장 + 관리자_이실장외 + 지원금_주차비 + 지원금_디바이스구매지원 + 지원금_영업지원금 + 지원금_기타 - 지원금_반반쿠폰) as 기타합계 from tb_data_calculate where sawonCode = ? and calYm = ? and useYn = 'Y'`;
        const result = await executeQuery(countSql, [userData.sawonCode, searchParams.get("calYm")]) as unknown[];
        
        return NextResponse.json({ status: "OK", data: result });

    } catch (error) {
        console.error("읽기 오류 : ", error);
        return NextResponse.json({ status: "Fail", message: error });
    }
}