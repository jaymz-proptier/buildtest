import { getSession } from "next-auth/react";

export async function postStatus(formData: FormData) {
    
    const session = await getSession();
    const token = session?.accessToken;

    const res = await fetch(`/api/pc/upload-status`, {
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