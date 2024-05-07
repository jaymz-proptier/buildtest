import style from "@/styles/mobile.module.css";
import MobileHeader from "../_components/header";
import HomeSummary from "./_components/home-summary";
import Footer from "../../components/footer";
import RQProvider from "../_components/RQProvider";
import { auth } from "@/auth";
import SalesProductSummary from "./_components/salesProductSummary";
import HomeNoticeList from "./_components/homeNoticeList";

export const metadata = {
    title: "홈",
};
export default async function MobileHome() {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <MobileHeader />
            <div className={style.mobile_wrap}>
                <h5 className={style.user_name}><strong>{userData.user.name}</strong>님, 반갑습니다.</h5>
                <HomeSummary sawonCode={userData.user.sawonCode} />
                <SalesProductSummary sawonCode={userData.user.sawonCode} />
                <div className={style.home_summary2}>
                    <div className={style.summary_wrap}>
                        <div className={style.item_wrap}>
                            <strong className={style.count}>이실장</strong>
                            <h5 className={style.title}>단말기 결제대기</h5>
                        </div>
                        <div className={style.item_wrap}>
                            <strong className={style.count}>매경</strong>
                            <h5 className={style.title}>단말기 결제대기</h5>
                        </div>
                    </div>
                </div>
                <HomeNoticeList />
            </div>
            <Footer />
        </div>
    </RQProvider>
}