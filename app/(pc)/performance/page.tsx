import { auth } from "@/auth";
import style from "./pc.module.css";
import Footer from "../../components/footer";
import Header from "./_components/header";
import MemberList from "./_components/member-list";
import executeQuery from "@/lib/mysql";

export const metadata = {
    title: "실적관리",
};

export default async function PerformancePage({ searchParams }: { searchParams: any }) {  
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    
    const sql = `select a.sawonCode, a.name, b.jobName from tb_pptn_sawon a inner join tb_pptn_jobcode b on a.jobCode = b.jobCode where a.useYn = 'Y' and b.jobName in ('센터장', '파트장') and a.sawonCode = ?`;
    const result = await executeQuery(sql, [userData.user.sawonCode]) as any;
    const getData = JSON.parse(JSON.stringify(result));
    if(userData.user.sosok==="컨설턴트" && (getData[0]?.jobName==="센터장" || getData[0]?.jobName==="파트장")) return <div id="wrap" className="pc_wrap">
        <Header me={userData} />
        <div className={style.list_wrap}>
            <div className={style.list_title}>
                <h5 className={style.title}>실적관리</h5>
            </div>
            <MemberList searchParams={searchParams} />
        </div>
        <Footer />
    </div>
}