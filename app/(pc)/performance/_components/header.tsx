"use client";
import style from "@/styles/pc-header.module.css";
import { signOut } from "next-auth/react";
import Link from "next/link";

export default function Header({ me }: { me: any }) {
    return <div className={style.header}>
        <div className={style.header_wrap}>
            <div className={style.gnb_wrap}>
                <Link href="/" className={style.home_link}>
                    <i>프로퍼티파트너스</i>
                </Link>
                <ul className={style.menu}>
                    <li aria-selected="true">
                        <Link href="/performance" className={style.link}>실적관리</Link>
                    </li>
                </ul>
            </div>
            <div className={style.user_section}>
                <button className={style.logout} onClick={async (e) => { e.preventDefault(); await signOut(); }}><i>로그아웃</i></button>
                <span className={style.photo}></span>
                <strong>{me.user.name}</strong>님, 반갑습니다.
            </div>
        </div>
    </div>
}