import executeQuery from "@/lib/mysql";
import style from "@/styles/mobile-notice.module.css";
import Link from "next/link";


export default async function HomeNoticeList() {
    const sql = `select bnSeq, noticeGubun, title from tb_board_notice where dispYn = 'Y' and useYn = 'Y' order by (case when topYn = 'Y' then 0 else 99 end), regDate desc, title desc`;
    const result = await executeQuery(sql, []) as any;
    const getData = JSON.parse(JSON.stringify(result));
    
    return <>
        <div className={style.home_notice_wrap}>
            <div className={style.header} aria-label="공지사항">
                공지사항
                <Link href="/announce" className={style.more}>+ 더보기</Link>
            </div>
            <div className={style.list_wrap}>
                <ul>
                    {getData.map((item: any, index: number) => (
                    <li key={index}>
                        <Link href={`/announce?bnSeq=${item.bnSeq}`} className={style.link}>[{item.noticeGubun}] {item.title}</Link>
                    </li>
                    ))}
                </ul>
            </div>
        </div>
    </>
}