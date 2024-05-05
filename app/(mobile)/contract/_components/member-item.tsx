import style from "@/styles/mobile-member.module.css";

export default function MemberItem({ data }: { data: any }) {
    return <>
        <div className={style.item_wrap}>
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
            <div className={style.table_wrap}>
                <table>
                    <thead>
                        <tr>
                            <th>결제일</th>
                            <th>결제금액</th>
                            <th>계약구분</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{data.결제일}</td>
                            <td>{Number(data.결제금액).toLocaleString()}</td>
                            <td>{data.계약구분}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </>
}