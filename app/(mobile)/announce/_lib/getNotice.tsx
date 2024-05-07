type Props = { queryKey: any };
export async function getNotice({queryKey}: Props) {
    const [_1, _2, tab] = queryKey;
    const res = await fetch(`/api/mobile/notice/?noticeGubun=${queryKey[2]}`, {
        next: {
            tags: ["member", "notice"],
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return data;
}