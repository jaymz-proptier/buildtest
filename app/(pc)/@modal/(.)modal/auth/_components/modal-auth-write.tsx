import style from "@/styles/pc-modal.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getJojikCenter } from "../_lib/getJojikCenter";
import { getCenterPart } from "../_lib/getCenterPart";
import { getJobCode } from "../_lib/getJobCode";
interface Item {
    data: any,
    status: string,
    message: string
}
export default function AuthWrite({ data, me, searchParams }: { data: any, me: any, searchParams?: any }) {

    const sosokCode = [
        { code: "직원", title: "직원" },
        { code: "컨설턴트", title: "컨설턴트" },
    ];
    
    const [sosok, setSosok] = useState(data?.sosok || "컨설턴트");  
    const {data: jojikCenter, isLoading, error} = useQuery<Item, Object, Item, [_1: string, _2: string]>({
        queryKey: ['jojikCenter', sosok ? sosok : "컨설턴트"],
        queryFn: getJojikCenter,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;

    
    const {data: jobCodeList} = useQuery<Item, Object, Item, [_1: string, _2: string]>({
        queryKey: ['jobCode', sosok],
        queryFn: getJobCode,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;

    const [modify, setModify] = useState(data?.sawonCode ? false :true);
    const [openSelectBox, setOpenSelectBox] = useState<string | null>(null);
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
    const [centerCode, setCenterCode] = useState(data?.centerCode ? data.centerCode : jojikCenter?.data[0]?.code);
    const [partCode, setPartCode] = useState<any | []>([]);
    const [jojikCode, setJojikCode] = useState(data?.jojikCode ? data.jojikCode : `${jojikCenter?.data[0]?.code}1`);
    const [jobCode, setJobCode] = useState(data?.jobCode ? Number(data.jobCode) : jobCodeList?.data[0]?.code);
    const [swId, setSwId] = useState(data?.swId || "");
    const [swPwd, setSwPwd] = useState("");
    const [name, setName] = useState(data?.name || "");
    const router = useRouter();

    const {data: centerPartData, isLoading: isCenterPartDataLoading} = useQuery<Item, Object, Item, [_1: string, _2: string]>({
        queryKey: ['centerPart', centerCode ? centerCode : jojikCenter?.data[0]?.code],
        queryFn: getCenterPart,
        staleTime: 60 * 1000, // fresh -> stale, 5분이라는 기준
        gcTime: 300 * 1000,
    }) as any;


    const queryClient = useQueryClient();

    const mutation = useMutation({        
        mutationFn: (e:any) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append("sawonCode", data?.sawonCode || "");
            formData.append("sosok", sosok || "");
            formData.append("swId", swId || "");
            formData.append("swPwd", swPwd);
            formData.append("jojikCode", jojikCode);
            formData.append("jobCode", jobCode);
            formData.append("name", name);
            return fetch(`/api/pc/auth-write`, {
                method: 'post',
                credentials: 'include',
                body: formData,
            });
        },
        async onSuccess() {   
            queryClient.invalidateQueries({ queryKey: ["posts", "search"] });
            router.back();
        },
    });

    const handleSubmit = useCallback(async (e: any) => {
        if(name===undefined || name==="") {
            alert("이름을 입력해주세요.");
        } else if(swId===undefined || swId==="") {
            alert("아이디를 입력해주세요.");
        } else if(data?.sawonCode==="" && (swPwd===undefined || swPwd==="")) {
            alert("비밀번호를 입력해주세요.");
        } else {
            mutation.mutate(e);
        }
    }, [centerCode, name, swId, swPwd]);
    
    const handleInputChange = (e: any) => {
        if(e.target.name==="name") setName(e.target.value);
        else if(e.target.name==="swId") setSwId(e.target.value);
        else if(e.target.name==="swPwd") setSwPwd(e.target.value);
    };

    const handleClose = () => {
        router.back();
    }
    useEffect(() => {
        setCenterCode(data?.centerCode ? data.centerCode : jojikCenter?.data[0]?.code);
        setPartCode(centerPartData?.data);
    }, [sosok, jojikCenter]);
    useEffect(() => {
        if(!isCenterPartDataLoading && centerPartData?.data) {
            //if(centerPartData?.data.length > 0 ) {
                setPartCode(centerPartData?.data);
                //console.log(centerPartData?.data);
            //}
            setJojikCode(jojikCode ? jojikCode : centerPartData?.data[0]?.code);
        }
    }, [centerCode, isCenterPartDataLoading, centerPartData]);
    useEffect(() => {
        setJobCode(data?.jobCode ? Number(data.jobCode) : jobCodeList?.data[0]?.code);
    }, [jobCodeList]);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (selectBoxRef.current && !selectBoxRef.current.contains(event.target as Node)) {
                setOpenSelectBox(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    return <div className={style.contents}>
        { modify ? (
        <div className={style.write_form}>
            <div className={style.input_div}>
                <label className={style.input_label}>이름</label>
                <input type="text" name="name" className={style.input_title} value={name || ""} onChange={handleInputChange} />
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>구분</label>
                <span ref={selectBoxRef}>
                    
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="sosok"} onClick={() => setOpenSelectBox(openSelectBox==="sosok" ? null : "sosok")}>{sosokCode?.find((item: any) => item.code===sosok)?.title}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {sosokCode.map((item: any, index: number) => (
                                <li key={index} onClick={() => { setOpenSelectBox(null); setSosok(item.code); }}>{item.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="jojikCenter"} onClick={() => setOpenSelectBox(openSelectBox==="jojikCenter" ? null : "jojikCenter")}>{jojikCenter?.data.find((item: any) => item.code===centerCode)?.title}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {jojikCenter?.data.map((item: any, index: number) => (
                                <li key={index} onClick={() => { setOpenSelectBox(null); setCenterCode(item.code); }}>{item.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {partCode && partCode.length > 0 && 
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="jojikCode"} onClick={() => setOpenSelectBox(openSelectBox==="jojikCode" ? null : "jojikCode")}>{partCode?.find((item: any) => item.code===jojikCode)?.title || "-"}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                <li onClick={() => { setOpenSelectBox(null); setJojikCode(`${centerCode}0`); }}>-</li>
                                {partCode && partCode?.map((item: any, index: number) => (
                                <li key={index} onClick={() => { setOpenSelectBox(null); setJojikCode(item.code); }}>{item.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>}
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="jobCode"} onClick={() => setOpenSelectBox(openSelectBox==="jobCode" ? null : "jobCode")}>{jobCodeList?.data.find((item: any) => item.code===jobCode)?.title || "-"}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {jobCodeList?.data.map((item: any, index: number) => (
                                <li key={index} onClick={() => { setOpenSelectBox(null); setJobCode(item.code); }}>{item.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </span>
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>아이디</label>
                <input type="text" name="swId" className={style.input_title} value={swId || ""} onChange={handleInputChange} />
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>비밀번호</label>
                <input type="text" name="swPwd" className={style.input_title} onChange={handleInputChange} />
            </div>
        </div>
        ) : (            
        <div className={style.write_form}>
            <div className={style.view_div}>
                <h5>{data?.name} {data?.jobName}</h5>
                {data?.centerName} {data?.partName}
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>아이디</label>
                {data?.swId}
            </div>
        </div>                    
        )}
        { modify ? (
        <div className={style.btn_wrap}>
            <button type="button" className={style.submit} onClick={handleSubmit} disabled={!mutation.isIdle && !mutation.isError && !mutation.isSuccess}>완료</button>
            <button type="button" className={style.cancel} onClick={() => { if(data?.bnSeq) setModify(false); else handleClose(); }}>취소</button>
        </div>
        ) : ( 
        <div className={style.btn_wrap}>
            <button type="button" className={style.list} onClick={handleClose}>목록</button>
            <button type="button" className={style.modify} onClick={() => setModify(true)}>수정</button>
            <button type="button" className={style.cancel} onClick={handleClose}>취소</button>
        </div>    
        )}
    </div>
}