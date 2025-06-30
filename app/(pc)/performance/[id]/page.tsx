import { auth } from "@/auth";
import style from "../pc.module.css";
import Footer from "../../../components/footer";
import Header from "../_components/header";
import TabComponents from "./_components/tab-components";
import PageComponents from "./_components/page-components";
import executeQuery from "@/lib/mysql";

export const metadata = {
    title: "실적관리",
};

export default async function PerformancePage({ params }: { params: { id: string } }) {  
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));

    const user = `select a.sawonCode, a.name, b.jobName from tb_pptn_sawon a inner join tb_pptn_jobcode b on a.jobCode = b.jobCode where a.useYn = 'Y' and b.jobName in ('센터장', '파트장') and a.sawonCode = ?`;
    const userResult = await executeQuery(user, [userData.user.sawonCode]) as any;
    const data = JSON.parse(JSON.stringify(userResult));

    const sql = `select a.sawonCode, a.name, b.centerName, b.partName from tb_pptn_sawon a inner join tb_pptn_jojikcode b on a.jojikCode = b.jojikCode where a.useYn = 'Y' and a.jojikCode > '200' and a.sawonCode = ?`;
    const result = await executeQuery(sql, [params.id]) as any;
    const getData = JSON.parse(JSON.stringify(result));

    if(userData.user.sosok==="컨설턴트" && (data[0]?.jobName==="센터장" || data[0]?.jobName==="파트장")) return <div id="wrap" className="pc_wrap">
        <Header me={userData} />
        <div className={style.list_wrap}>
            <div className={style.list_title}>
                <TabComponents />
            </div>
            <PageComponents params={params} data={getData[0]} />
        </div>
        <Footer />
    </div>
}