"use client";
import style from "@/styles/pc.module.css";
import EmployeeSelectBox from "../../_components/employeeSelectBox";
import { useContext, useEffect } from "react";
import { filterContext } from "../../providers/filterProvider";
import AiMemberList from "./aiMemberList";
import SalesComponents from "./salesComponents";
import SalesList from "./salesList";

export default function PageComponents({ params, data }: { params: { id: string }, data: any }) {
    const { id } = params;
    const { centerName, partName, setSawonCode, tab } = useContext(filterContext);
    useEffect(() => {
        setSawonCode(id);
    }, [id, setSawonCode]);
    return <div className={style.list_contents}>
        <div className={style.list_header}>
            <div className={style.index_wrap}>
                <div className={style.index}>{data?.centerName}{data?.partName ? ` > ${data?.partName}` : ""}</div>
                <div className={`${style.filter_wrap} `}>
                    <EmployeeSelectBox />
                </div>
            </div>
        </div>
        {(tab==="T01" || tab==="T02") && <AiMemberList />}
        {tab==="T03" && <SalesComponents />}
        {tab==="T04" && <SalesList />}
    </div>
}