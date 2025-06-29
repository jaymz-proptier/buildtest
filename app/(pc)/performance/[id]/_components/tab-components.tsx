"use client";
import style from "@/styles/pc.module.css";
import { useContext } from "react";
import { filterContext } from "../../providers/filterProvider";
import { useRouter, useSearchParams } from "next/navigation";

export default function TabComponents() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { tab, setTab } = useContext(filterContext);
    const tabMenu = [
        { code: "T01", title: "이실장회원" },
        { code: "T02", title: "포커스회원" },
        { code: "T03", title: "매출현황" },
        { code: "T04", title: "매출내역" },
    ];
    const handleTabClick = (code: string) => {
        router.replace(`?`);
        setTab(code);
    };
    return <div className={style.tab_wrap}>
        {tabMenu.map((item: any, index: number) => <button type="button" key={index} className={style.tab_btn} aria-selected={tab===item.code} onClick={() => handleTabClick(item.code)}>
            {item.title}
        </button>)}
    </div>
}