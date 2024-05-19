import { getSession } from "next-auth/react";

type Props = { pageParam?: number, queryKey: any };
export async function getMembers({pageParam, queryKey}: Props) {
    const session = await getSession();
    const token = session?.accessToken;

    const [_1, _2, sawonCode, filter, search, sort] = queryKey;
    const res = await fetch(`/api/mobile/member/list?page=${pageParam}&sawonCode=${queryKey[2]}&product_type=${queryKey[3]}&query=${queryKey[4]}&sort=${queryKey[5]}`, {
        next: {
            tags: ["member", "member"],
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return data.data;
}