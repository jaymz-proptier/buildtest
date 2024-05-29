import Footer from "@/app/components/footer";
import MobileHeader from "../_components/header";
import style from "@/styles/mobile.module.css";
import { auth } from "@/auth";
import RQProvider from "../_components/RQProvider";
import FilterProvider from "./_components/filterProvider";
import SettlementTitle from "./_components/settlementTitle";
import SettlementMainPayment from "./_components/settlementMainPayment";

export const metadata = {
    title: "정산내역",
};
export default async function SalesPage() {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <MobileHeader />
                <div className={style.mobile_wrap}>
                    <FilterProvider>
                        <SettlementTitle sawonCode={userData.user.sawonCode} />
                        <SettlementMainPayment sawonCode={userData.user.sawonCode} />
                    </FilterProvider>
                </div>
            <Footer />
        </div>
    </RQProvider>
}