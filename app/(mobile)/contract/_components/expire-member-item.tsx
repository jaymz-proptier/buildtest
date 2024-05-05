import style from "@/styles/mobile-member.module.css";
import { useState } from "react";

export default function MemberItem({ data }: { data: any }) {
    const [selectBox, setSelectBox] = useState(false);
    const [selectBox2, setSelectBox2] = useState(false);
    const [expireInfo, setExpireInfo] = useState(data.expireInfo);
    const [cpName, setCpName] = useState(data.cpName);
    const expireCode: {
        code: string,
        title: string
    }[] = [
        { code: "", title: "탈락사유선택" },
        { code: "타사이동", title: "타사이동"},
        { code: "시스템불안정", title: "시스템불안정"},
        { code: "서비스불만족", title: "서비스불만족"},
        { code: "가격불만", title: "가격불만"},
        { code: "기타", title: "기타"},
    ];
    const cpCode: {
        code: string,
        title: string
    }[] = [
        { code: "", title: "이동CP 선택" },
        { code: "매경", title: "매경"},
        { code: "써브", title: "써브"},
        { code: "뱅크", title: "뱅크"},
        { code: "한경", title: "한경"},
        { code: "부동산114", title: "부동산114"},
        { code: "아실", title: "아실"},
        { code: "선방", title: "선방"},
        { code: "기타", title: "기타"},
    ];
    return <>
        <div className={style.item_wrap}>
            <div className={style.select_wrap}>
                <div className={style.select_box}>
                    <button type="button" aria-selected={selectBox} onClick={() => setSelectBox(!selectBox)}>{expireCode.find((item) => item.code===expireInfo)?.title}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {expireCode.map((item: any, index: number) => (
                            <li key={index} onClick={() => { setSelectBox(false); setExpireInfo(item.code); }}>{item.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                {expireInfo==="타사이동" && <div className={style.select_box}>
                    <button type="button" aria-selected={selectBox2} onClick={() => setSelectBox2(!selectBox2)}>{cpCode.find((item) => item.code===cpName)?.title}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {cpCode.map((item: any, index: number) => (
                            <li key={index} onClick={() => { setSelectBox2(false); setCpName(item.code); }}>{item.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>}
            </div>
            <div className={style.company}>{data.상호명}({data.회원번호})</div>
            <div className={style.user}>
                {data.대표자명}
                <span className={style.phone}>{data.휴대폰}</span>
            </div>
            <div className={style.address}>{data.주소}</div>
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>상품명</th>
                            <th>시작일</th>
                            <th>종료일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.상품명}</td>
                            <td>{data.시작일}</td>
                            <td>{data.종료일}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
}