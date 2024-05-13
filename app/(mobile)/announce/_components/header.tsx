"use client";
import style from "@/styles/mobile.module.css";
import { useRouter } from "next/navigation";

export default function NoticeHeader() {
    const router = useRouter();
    return <h5 className={style.notice_header}><button type="button" onClick={() => router.push("/home")} className={style.close}></button>공지사항</h5>
}