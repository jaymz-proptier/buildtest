import { auth } from "@/auth";
import MobileHome from "../(mobile)/mobile-home";
import PcHome from "../(pc)/notice/page";

export default async function Home({ searchParams }: { searchParams: any }) {
    const session = await auth();
    const getdata = JSON.parse(JSON.stringify(session));
    return getdata.user.sosok==="직원" ? <PcHome searchParams={searchParams} /> : <MobileHome userData={getdata.user} />
}