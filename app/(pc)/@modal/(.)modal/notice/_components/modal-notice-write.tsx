import style from "@/styles/pc-modal.module.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function NoticeWrite({ data, me }: { data: any, me: any }) {
    const noticeCode: {
        code: string,
        title: string
    }[] = [
        { code: "네이버", title: "네이버"},
        { code: "이실장", title: "이실장"},
        { code: "매경", title: "매경"},
        { code: "PPTN", title: "PPTN"},
    ];
    const [modify, setModify] = useState(data?.bnSeq ? false :true);
    const [openSelectBox, setOpenSelectBox] = useState<string | null>(null);
    const selectBoxRef = useRef<HTMLDivElement | null>(null);
    const [selectBox, setSelectBox] = useState(false);
    const [noticeGubun, setNoticeGubun] = useState(data?.noticeGubun ? data?.noticeGubun : noticeCode[0].code);
    const [title, setTitle] = useState(data?.title || "");
    const [contents, setContents] = useState(data?.contents || "");
    const [dispYn, setDispYn] = useState(data?.dispYn==="Y" ? true : false);
    const [topYn, setTopYn] = useState(data?.topYn==="0" ? true : false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const router = useRouter();

    const handleSelectBox = (value: string) => {
        setSelectBox(false);
        setNoticeGubun(value)
    }

    const handleInputChange = (e: any) => {
        if(e.target.type==="text") setTitle(e.target.value);
        else if(e.target.type==="textarea") setContents(e.target.value);
    };

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
        setSelectedFile(e.target.files[0]);
        }
    }, []);
    const queryClient = useQueryClient();

    const mutation = useMutation({        
        mutationFn: (e: any) => {
            e.preventDefault();
            const formData = new FormData();
            if(selectedFile) {
                formData.append("file", selectedFile);
            }
            formData.append("sawonCode", me?.user?.sawonCode || "");
            formData.append("bnSeq", data.bnSeq || "");
            formData.append("bnFileSeq", data.bnFileSeq || "");
            formData.append("noticeGubun", noticeGubun);
            formData.append("title", title);
            formData.append("contents", contents);
            formData.append("dispYn", dispYn ? "Y" : "N");
            formData.append("topYn", topYn ? "Y" : "N");
            return fetch(`/api/pc/notice-write`, {
                method: 'post',
                credentials: 'include',
                body: formData,
            });
        },
        async onSuccess(response) {              
            const req = await response.json(); 
            if(req.status==="Fail") alert(req.message);
            queryClient.invalidateQueries({ queryKey: ["admin", "notice"] });
            queryClient.invalidateQueries({ queryKey: ["noticeLoad"] });
            router.back();
        },
    });


    const handleSubmit = useCallback(async (e: any) => {
        if(title===undefined || title==="") {
            alert("제목을 입력해주세요.");
        } else if(contents===undefined || contents==="") {
            alert("내용을 입력해주세요.");
        } else {
            mutation.mutate(e);
        }
    }, [noticeGubun, title, contents, dispYn, topYn, selectedFile]);

    const deleteMutation = useMutation({        
        mutationFn: (e: any) => {
            e.preventDefault();
            const formData = new FormData();
            formData.append("sawonCode", me?.user?.sawonCode || "");
            formData.append("bnSeq", data?.bnSeq || "");
            formData.append("fileName", data?.fileName || "");
            return fetch(`/api/pc/notice-delete`, {
                method: 'post',
                credentials: 'include',
                body: formData,
            });
        },
        async onSuccess(response) {              
            const req = await response.json(); 
            if(req.status==="Fail") alert(req.message);
            queryClient.invalidateQueries({ queryKey: ["admin", "notice"] });
            queryClient.invalidateQueries({ queryKey: ["noticeLoad"] });
            router.back();
        },
    });
    const handleDelete = useCallback(async (e: any) => {
        if(confirm("처리를 진행하시겠습니까?")) {
            deleteMutation.mutate(e);
        }
    }, []);

    const handleClose = () => {
        router.back();
    }
    
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
                <label className={style.input_label}>구분</label>
                <div className={style.select_box} ref={selectBoxRef}>
                    <button type="button" aria-selected={openSelectBox==="noticeGubun"} onClick={() => setOpenSelectBox(openSelectBox==="noticeGubun" ? null : "noticeGubun")}>{noticeCode.find((item) => item.code===noticeGubun)?.title}</button>
                    <div className={style.select_box_list}>
                        <ul>
                            {noticeCode.map((item, index) => (
                            <li key={index} onClick={() => { setOpenSelectBox(null); setNoticeGubun(item.code); }}>{item.title}</li>
                            ))}
                        </ul>
                    </div>
                </div>
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
                <label className={style.input_label}>게시유무</label>
                <div className={style.checkbox_wrap}>
                    <input id="dispYn" type="checkbox" checked={dispYn} onChange={(e) => { setDispYn(!dispYn); }} />
                    <label htmlFor="dispYn" className={style.checkbox_label}>게시</label>
                </div>
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>상단고정</label>
                <div className={style.checkbox_wrap}>
                    <input id="topYn" type="checkbox" checked={topYn} onChange={(e) => { setTopYn(!topYn); }} />
                    <label htmlFor="topYn" className={style.checkbox_label}>고정</label>
                </div>
            </div>
            <div className={style.input_div}>
                <label className={style.input_label}>파일첨부</label>
                <div className={style.file_box}>
                    <input type="file" id="file1" onChange={handleFileChange} />
                    <label htmlFor="file1" className={style.file_name}>{data?.fileYn==="Y" && data?.filePath ? `${data?.filePath}(${data?.fileName})` : "선택된 파일이 없습니다."}</label>
                    <label className={style.file_label}>파일선택</label>
                </div>
            </div>
        </div>
        ) : (            
        <div className={style.write_form}>
            <div className={style.input_div}>
                <label className={style.input_label}>제목</label>
                {data?.title}
            </div>
            <div className={`${style.input_div} ${style.detail}`}>
                <label className={style.input_label}>내용</label>
                <div className={style.detail_contents} dangerouslySetInnerHTML={{ __html: data.contents.replace(/\n/g, '<br />') }} />
            </div>
            {data?.fileYn==="Y" && data?.filePath ? (
            <div className={style.input_div}>
                <label className={style.input_label}>첨부파일</label>
                <a href={`${data?.filePath}`} download={data?.filePath}>{data?.filePath}</a>
            </div>
            ) : null}
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
            <button type="button" className={style.cancel} onClick={handleDelete}>삭제</button>
            <button type="button" className={style.cancel} onClick={handleClose}>취소</button>
        </div>    
        )}
    </div>
}