import style from "@/styles/mobile.module.css";
import Footer from "../../components/footer";
import RQProvider from "../_components/RQProvider";
import { auth } from "@/auth";
import NoticeList from "./_components/noticeList";
import TabProvider from "./_components/TabProvider";
import Tab from "./_components/tab";
import NoticeHeader from "./_components/header";

export const metadata = {
    title: "공지사항",
};
export default async function NoticeHome({ searchParams }: { searchParams: any }) {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <div className={style.header}>
                <div className={style.header_bar}></div>
            </div>
            <div className={style.mobile_wrap}>
                <NoticeHeader />
                <TabProvider>                    
                    <Tab />
                    <NoticeList searchParams={searchParams} />
                </TabProvider>
            </div>
            <Footer />
        </div>
    </RQProvider>
}