import style from "@/styles/mobile-member.module.css";

export default function MemberItem({ data }: { data: any }) {
    return data && <>
        <div className={style.item_wrap}>
            <div className={style.company}>{data.상호명}({data.회원번호})</div>
            <div className={style.user}>
                {data.대표자명}
                <a href={`tel:${data.휴대폰}`}><span className={style.phone}>{data.휴대폰}</span></a>
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
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>계약구분</th>
                            <th>상태</th>
                            <th>{data.상품유형==="프리미엄" ? "계약상품" : data.상품유형==="포커스" ? "쿠폰사용현황" : ""}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.계약구분}</td>
                            <td>{data.상태}</td>
                            <td className={style.overflow}>{data.상품유형==="프리미엄" ? `${data.계약단지명}` : data.상품유형==="포커스" ? `${data.계약전송수.toLocaleString()}/${data.전송수.toLocaleString()}` : ""}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
}