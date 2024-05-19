import { getSession } from "next-auth/react";

export async function postItem(formData: FormData) {
    
    const session = await getSession();
    const token = session?.accessToken;

    const res = await fetch(`/api/pc/upload-write`, {
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