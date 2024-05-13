import Footer from "@/app/components/footer";
import MobileHeader from "../_components/header";
import style from "@/styles/mobile.module.css";
import { auth } from "@/auth";
import RQProvider from "../_components/RQProvider";
import MemberQueryProvider from "./_components/memberQueryProvider";

export const metadata = {
    title: "회원관리",
};
export default async function MemberPage() {
    const session = await auth();
    const userData = JSON.parse(JSON.stringify(session));
    
    return <RQProvider>
        <div id="wrap" className="mobile_wrap">
            <MobileHeader />
            <div className={style.mobile_wrap}>
                <MemberQueryProvider sawonCode={userData.user.sawonCode} />
            </div>
            <Footer />
        </div>
    </RQProvider>
}