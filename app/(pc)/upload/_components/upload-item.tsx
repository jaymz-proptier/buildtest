import style from "@/styles/pc.module.css";
import { useRouter } from "next/navigation";

export default function UploadItem({ item }: { item: any }) {
    const router = useRouter();
    return <tr onClick={() => router.push(`/modal/upload/${item.upchaSeq}`)}>
        <td>{item.dataGubun}</td>
        <td className={style.title}>{item.title}</td>
        <td>{item.regDate}</td>
        <td>{item.name}</td>
    </tr>
}