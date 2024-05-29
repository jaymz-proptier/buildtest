import Footer from "@/app/components/footer";
import MobileHeader from "../_components/header";
import style from "@/styles/mobile.module.css";
import { auth } from "@/auth";
import RQProvider from "../_components/RQProvider";
import TabProvider from "./_components/TabProvider";
import Tab from "./_components/tab";
import ContractFilterBox from "./_components/contract-filter-box";
import ContractQueryProvider from "./_components/contractQueryProvider";

export const metadata = {
    title: "계약관리",
};
export default async function SalesPage() {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <MobileHeader />
                <div className={style.mobile_wrap}>
                    <TabProvider>
                        <Tab />
                        <ContractQueryProvider sawonCode={userData.user.sawonCode} />
                    </TabProvider>
                </div>
            <Footer />
        </div>
    </RQProvider>
}