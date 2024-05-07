import style from "@/styles/mobile.module.css";
import MobileHeader from "../_components/header";
import Footer from "../../components/footer";
import RQProvider from "../_components/RQProvider";
import { auth } from "@/auth";
import NoticeList from "./_components/noticeList";
import TabProvider from "./_components/TabProvider";
import Tab from "./_components/tab";

export const metadata = {
    title: "공지사항",
};
export default async function NoticeHome({ searchParams }: { searchParams: any }) {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <MobileHeader />
            <div className={style.mobile_wrap}>
                <h5 className={style.notice_header}><button type="button" className={style.close}></button>공지사항</h5>
                <TabProvider>                    
                    <Tab />
                    <NoticeList searchParams={searchParams} />
                </TabProvider>
            </div>
            <Footer />
        </div>
    </RQProvider>
}