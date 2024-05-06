import style from "@/styles/mobile-contract.module.css";
import { useEffect, useRef, useState } from "react";

export default function MemberItem({ data }: { data: any }) {
    const [openSelectBox, setOpenSelectBox] = useState<string | null>(null);
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
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
    const sendDataToServer = async (expireContSeq: string, type: string, value: string) => {
        try {
            const formData = new FormData();
            formData.append('expireContSeq', expireContSeq);
            formData.append(type, value);

            const response = await fetch('/api/mobile/contract/expire/update', {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const jsonResponse = await response.json();
            console.log('Server response:', jsonResponse);
        } catch (error) {
            console.error('Error:', error);
        }
    };
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
                setOpenSelectBox(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return <>
        <div className={style.item_wrap}>
            <div className={style.select_wrap} ref={selectBoxRef}>
                <div className={style.select_box}>
                    <button type="button" aria-selected={openSelectBox==="expire"} onClick={() => setOpenSelectBox("expire")}>{expireCode.find((item) => item.code===expireInfo)?.title}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {expireCode.map((item: any, index: number) => (
                            <li key={index} onClick={() => { setOpenSelectBox(null); setExpireInfo(item.code); sendDataToServer(data.expireContSeq, "expireInfo", item.code); }}>{item.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>
                {expireInfo==="타사이동" && <div className={style.select_box}>
                    <button type="button" aria-selected={openSelectBox==="cp"} onClick={() => setOpenSelectBox("cp")}>{cpCode.find((item) => item.code===cpName)?.title}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {cpCode.map((item: any, index: number) => (
                            <li key={index} onClick={() => { setOpenSelectBox(null); setCpName(item.code);  sendDataToServer(data.expireContSeq, "cpName", item.code); }}>{item.title}</li>
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