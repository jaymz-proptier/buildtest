import Footer from "@/app/components/footer";
import MobileHeader from "../components/header";
import style from "@/styles/mobile.module.css";
import { auth } from "@/auth";
import RQProvider from "../_components/RQProvider";
import FilterProvider from "../sales/_components/filterProvider";
import SettlementTitle from "./_components/settlementTitle";
import SettlementMainPayment from "./_components/settlementMainPayment";

export const metadata = {
    title: "정산내역",
};
export default async function SalesPage() {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    
    return <RQProvider>
        <div id="wrap">
            <MobileHeader />
                <div className={style.mobile_wrap}>
                    <FilterProvider>
                        <SettlementTitle />
                        <SettlementMainPayment sawonCode={userData.user.sawonCode} />
                    </FilterProvider>
                </div>
            <Footer />
        </div>
    </RQProvider>
}