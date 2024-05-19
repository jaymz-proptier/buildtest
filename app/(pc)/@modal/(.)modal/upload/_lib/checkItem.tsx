import { getSession } from "next-auth/react";

export async function checkItem(dataGubun: string, year: string, month: string) {
    
    const session = await getSession();
    const token = session?.accessToken;

    const formData = new FormData();
    formData.append("dataGubun", dataGubun);
    formData.append("year", year);
    formData.append("month", month);

    const res = await fetch(`/api/pc/upload-check`, {
        method: "post",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return data;
}