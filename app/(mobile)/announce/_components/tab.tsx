"use client";
import style from "@/styles/mobile-notice.module.css";
import { useContext } from "react";
import { TabContext } from "./TabProvider";
import { useRouter } from "next/navigation";

type TabType = "" | "네이버" | "이실장" | "매경" | "PPTN";

export default function Tab() {
    const { tab, setTab } = useContext(TabContext);
    const router = useRouter();
    const noticeType: TabType[] = ["네이버",  "이실장", "매경", "PPTN"];
    const handleTabClick = (item: TabType) => {
        setTab(item);
        router.push(`/announce`);
    };
    return <>
        <div className={style.tab_wrap}>
            <div className={style.tab}>
                <div className={style.tab_item} aria-selected={tab===""} onClick={() => handleTabClick("")}>전체</div>
                {noticeType.map((item: any, index: number) => (
                <div key={index} className={style.tab_item} aria-selected={tab===item} onClick={() => handleTabClick(item)}>{item}</div>
                ))}
            </div>
        </div>
    </>
}