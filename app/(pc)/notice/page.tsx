import { auth } from "@/auth";
import Footer from "../../components/footer";
import PcHeader from "../components/header";
import NoticeList from "./_components/notice-list";
import style from "@/styles/pc.module.css";

export const metadata = {
    title: "공지관리",
};

export default async function PcHome({ searchParams }: { searchParams: any }) {    
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session)) as any | [];
    if(userData.user.sosok==="직원") return <div id="wrap" className="pc_wrap">
        <PcHeader me={userData} />
        <div className={style.list_wrap}>
            <div className={style.list_title}>
                <h5 className={style.title}>공지관리</h5>
            </div>
            <NoticeList searchParams={searchParams} />
        </div>
        <Footer />
    </div>
}