import style from "@/styles/pc-modal.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { checkItem } from "../_lib/checkItem";
import { postItem } from "../_lib/postItem";
import { postStatus } from "../_lib/postStatus";

export default function UploadWrite({ data, me, searchParams }: { data: any, me: any, searchParams?: any }) {    
    const dataCode: {
        code: string,
        title: string
    }[] = [
        { code: "1", title: "회원내역"},
        { code: "2", title: "매출내역"},
        { code: "3", title: "정산내역"},
        { code: "4", title: "신규리스트"},
        { code: "5", title: "만기리스트"},
        { code: "9", title: "기타"},
    ];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [modify, setModify] = useState(data?.upchaSeq ? false :true);
    const [modifyId, setModifyId] = useState("");
    const [openSelectBox, setOpenSelectBox] = useState<string | null>(null);
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
    const [dataGubun, setDataGubun] = useState(data?.dataGubun ? data?.dataGubun : dataCode[0].code);
    const [year, setYear] = useState(data?.calYm?.substr(0, 4) || currentYear);
    const [month, setMonth] = useState(data?.calYm?.substr(4, 2) || currentMonth.toString().padStart(2, "0"));
    const [title, setTitle] = useState(data?.title || "");
    const [contents, setContents] = useState(data?.contents || "");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState(data?.fileName || "선택된 파일이 없습니다.");
    const [status, setStatus] = useState(data?.statusGubun || "");
    const [tostMessage, setTostMessage] = useState(false);
    const router = useRouter();


    const handleInputChange = (e: any) => {
        if(e.target.type==="text") setTitle(e.target.value);
        else if(e.target.type==="textarea") setContents(e.target.value);
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTostMessage(true);
        if (e.target.files && e.target.files.length > 0) {
            console.log(e.target.files[0]);
            setSelectedFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
            setTostMessage(false);
        }
    }, []);

    const queryClient = useQueryClient();

    const mutation = useMutation({        
        mutationFn: (e:any) => {
            e.preventDefault();
            const formData = new FormData();
            if(selectedFile) {
                formData.append("file", selectedFile);
            }
            formData.append("modifyId", modifyId);
            formData.append("upchaSeq", data.upchaSeq || "");
            formData.append("dataGubun", dataGubun);
            formData.append("year", year);
            formData.append("month", month);
            formData.append("title", title);
            formData.append("contents", contents);
            return postItem(formData);
        },
        async onSuccess() {   
            queryClient.invalidateQueries({ queryKey: ["posts", "search"] });
            router.back();
        },
    });

    const handleSubmit = useCallback(async (e: any) => {
        if(title===undefined || title==="") {
            alert("제목을 입력해주세요.");
        } else if(contents===undefined || contents==="") {
            alert("내용을 입력해주세요.");
        } else if(!selectedFile) {
            alert("첨부파일을 선택해주세요.");
        } else {
            mutation.mutate(e);
        }
    }, [dataGubun, title, contents, year, month, selectedFile]);

    const statusMutation = useMutation({        
        mutationFn: (e:any) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append("upchaSeq", data.upchaSeq || "");
            formData.append("dataGubun", dataGubun);
            formData.append("year", year);
            formData.append("month", month);
            formData.append("status", status);
            return postStatus(formData);
        },
        async onSuccess() {   
            //queryClient.invalidateQueries({ queryKey: ["uploadLoad", data.upchaSeq, status] }); 
            queryClient.invalidateQueries({ queryKey: ["posts", "search"] });
            router.back();
        },
    });
    const handleStatus = useCallback(async (e: any) => {
        if(confirm("처리를 진행하시겠습니까?")) {
            if(status==="") {
                alert("처리상태를 선택주세요.");
            } else {
                statusMutation.mutate(e);
            }
        }
    }, [status]);

    const handleClose = () => {
        router.back();
    }

    async function handleButtonClick() {
        try {
            const response1 = await fetch(`/api/pc/saveAs/sheet1`);
            const sheet1 = await response1.json();
            const response2 = await fetch(`/api/pc/saveAs/sheet2`);
            const sheet2 = await response2.json();

            const wb = XLSX.utils.book_new();
            const ws1 = XLSX.utils.json_to_sheet(sheet1?.data);
            const ws2 = XLSX.utils.json_to_sheet(sheet2?.data);
        
            XLSX.utils.book_append_sheet(wb, ws1, "매출");
            XLSX.utils.book_append_sheet(wb, ws2, "기타");
        
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
            const buf = new ArrayBuffer(wbout.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < wbout.length; i++) view[i] = wbout.charCodeAt(i) & 0xFF;
        
            saveAs(new Blob([buf], { type: 'application/octet-stream' }), `정산내역_${year}년${month}월.xlsx`);

        } catch (error) {
            console.error('Failed to download data', error);
        }
    }
    const checkMutation = useMutation({        
        mutationFn: () => {
            return checkItem(dataGubun, year, month);
        },
        async onSuccess(data: any) {  
            if(data?.status==="Fail") {
                alert(data?.message);
            } else {
                if(data?.data.length>0) {
                    alert(`이미 ${year}년${month}월 ${data.data.map((item: any) => `${item.statusGubun}(업로드차수: ${item.upchaSeq})`).join(", ")}인 자료가 있습니다.\n\r계속진행하면 기존 자료에 덮어씌워집니다.`);
                    setModifyId(data?.data[0].upchaSeq);
                } else setModifyId("");
            }
        },
    });
    useEffect(() => {
        if(modify && dataGubun==="3") {
            checkMutation.mutate();
        }
    }, [dataGubun, year, month]);
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
        {tostMessage && <div className={style.tost_message_wrap}>
            <div className={style.tost_message}>테스트중</div>
        </div>}
        { modify ? (
        <div className={style.write_form}>
            <div className={style.input_div}>
                <label className={style.input_label}>구분</label>
                <span ref={selectBoxRef}>
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="dataGubun"} onClick={() => setOpenSelectBox("dataGubun")}>{dataCode.find((item) => item.code===dataGubun)?.title}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {dataCode.map((item, index) => (
                                <li key={index} onClick={() => { setOpenSelectBox(null); setDataGubun(item.code); }}>{item.title}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {!(dataGubun==="1" || dataGubun==="2") && 
                    <>
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="year"} onClick={() => setOpenSelectBox("year")}>{year}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {Array.from({ length: currentYear - 2019 }, (_, index) => currentYear - index).map((item) => (
                                <li key={item} onClick={() => { setOpenSelectBox(null); setYear(item); }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className={style.select_box}>
                        <button type="button" aria-selected={openSelectBox==="month"} onClick={() => setOpenSelectBox("month")}>{month}</button>
                        <div className={style.select_box_list}>
                            <ul>
                                {Array.from({ length: 12 }, (_, index) => (index + 1).toString().padStart(2, "0")).map((item) => (
                                <li key={item} onClick={() => { setOpenSelectBox(null); setMonth(item); }}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    </> }
                </span>
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>제목</label>
                <input type="text" className={style.input_title} value={title || ""} onChange={handleInputChange} />
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>내용</label>
                <textarea className={style.textarea} value={contents} onChange={handleInputChange}></textarea>
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>파일첨부</label>
                <div className={style.file_box}>
                    <input type="file" onChange={handleFileChange} />
                    <label className={style.file_label}>파일선택</label>
                    <span className={style.file_name}>{fileName}</span>
                </div>
            </div>
        </div>
        ) : (            
        <div className={style.write_form}>
            <div className={style.input_div}>
                <label className={style.input_label}>구분</label>
                {dataCode.find((item) => item.code===dataGubun)?.title} {data?.calYm ? `${data?.calYm.substr(0, 4)}년 ${data?.calYm.substr(4, 2)}월` : ""}
                {data?.dataGubun==="3" && <button type="button" className={style.download} onClick={handleButtonClick}>{year}년{month}월 정산내역 다운로드</button>}
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>제목</label>
                {data?.title}
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>내용</label>
                {data?.contents}
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>첨부파일</label>
                {data?.fileName}
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>처리결과</label>
                <span className={style.item}>자료총건수: {data?.totalCount.toLocaleString()}</span> 
                <span className={style.item}>성공건수: {data?.succeseCount.toLocaleString()}</span>
                <span className={style.item}>진행상태: {data?.statusGubunName}</span>
                <div className={style.function_wrap} ref={selectBoxRef}>
                    <button type="button" className={style.function} aria-selected={openSelectBox==="function"} onClick={() => setOpenSelectBox("function")}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" style={{flexShrink: 0}}>
                            <path fill="currentColor" d="M6 11h2v2H6v-2Zm5 0h2v2h-2v-2Zm7 0h-2v2h2v-2Z" fillRule="evenodd" clipRule="evenodd"></path>
                        </svg>
                    </button>
                    <div className={style.function_list}>
                        <ul>
                            <li onClick={(e) => { setOpenSelectBox(null); setStatus("W"); handleStatus(e); }}>처리대기</li>
                            <li onClick={(e) => { setOpenSelectBox(null); setStatus("Y"); handleStatus(e); }}>처리완료</li>
                            <li onClick={(e) => { setOpenSelectBox(null); setStatus("N"); handleStatus(e); }}>처리실패</li>
                            <li onClick={(e) => { setOpenSelectBox(null); setStatus("D"); handleStatus(e); }}>삭제</li>
                        </ul>
                    </div>
                </div>
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