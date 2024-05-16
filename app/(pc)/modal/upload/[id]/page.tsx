"use client";
import style from "@/styles/pc-modal.module.css";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getItem } from "@/app/(pc)/@modal/(.)modal/upload/_lib/getItem";
import { useSession } from "next-auth/react";
import UploadWrite from "@/app/(pc)/@modal/(.)modal/upload/_components/modal-upload-write";
interface Item {
    data: any,
    status: string,
    message: string
}
type Props = {
  params: { id: string }
}
export default function Page({params}: Props) {
    const { data: me } = useSession();
    const router = useRouter();
    const { id } = params;
    const {data, isLoading, error} = useQuery<Item, Object, Item, [_1: string, _2: string, _3: string]>({
        queryKey: ["uploadLoad", id, ""],
        queryFn: getItem,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    });
    
    useEffect(() => {
        if(!isLoading && data?.status==="Fail") alert(data?.message);
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);
    return <>
        <div className={style.modal_wrap} onClick={() => router.back()}>
            <div className={style.modal_body} onClick={(e) => e.stopPropagation()}>
                <div className={style.header}>자료업로드</div>
                {(!isLoading && data?.status==="OK") && <UploadWrite data={data?.data} me={me} />}
            </div>
        </div>
    </>
}