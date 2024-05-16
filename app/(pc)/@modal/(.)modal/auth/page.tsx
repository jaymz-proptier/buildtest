"use client";
import AuthWrite from "./_components/modal-auth-write";
import style from "@/styles/pc-modal.module.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
    const { data: me } = useSession();
    const router = useRouter();
    const data = {};
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    return <>
        <div className={style.modal_wrap} onClick={() => router.back()}>
            <div className={style.modal_body} onClick={(e) => e.stopPropagation()}>
                <div className={style.header}>계정관리</div>
                <AuthWrite data={data} me={me} />
            </div>
        </div>
    </>
}