"use client";
import style from "@/styles/mobile-contract.module.css";
import { useContext } from "react";
import { TabContext } from "./TabProvider";

export default function Tab() {
    const { tab, setTab } = useContext(TabContext);
    return <>
        <div className={style.tab_wrap}>
            <div className={style.tab}>
                <div className={style.tab_item} aria-selected={tab==="new"} onClick={() => setTab("new")}>신규</div>
                <div className={style.tab_item} aria-selected={tab==="expire"} onClick={() => setTab("expire")}>만기</div>
            </div>
        </div>
    </>
}