import style from "@/styles/pc.module.css";
import { useRouter } from "next/navigation";

export default function UploadItem({ item }: { item: any }) {
    const router = useRouter();
    return <tr onClick={() => router.push(`/modal/notice/${item.bnSeq}`)}>
        <td>{item.bnSeq}</td>
        <td>{item.noticeGubun}</td>
        <td className={style.title}>{item.title}</td>
        <td>{item.regDateView}</td>
        <td>{item.viewCount}</td>        
    </tr>
}