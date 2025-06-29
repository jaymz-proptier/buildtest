import {QueryFunction} from "@tanstack/query-core";
import { getSession } from "next-auth/react";
interface Item {
  page: number;
}
export const getList: QueryFunction<Item[], [_1: string, _2: string, searchParams: { p: string, q?: string }]>
  = async ({ queryKey }) => {
    const session = await getSession();
    const token = session?.accessToken;

    const [_1, _2, searchParams] = queryKey;
    const urlSearchParams = new URLSearchParams(searchParams);
    const res = await fetch(`/api/pc/member-list?${urlSearchParams.toString()}`, {
        next: {
        tags: ['admin', 'member', searchParams.p],
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        cache: 'no-store',
    });
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}

export async function aiMemberList({queryKey}: { queryKey: any }) {

    const [_1, _2, tab, sawonCode, page] = queryKey;
    
    const formData = new FormData();
    formData.append("type", queryKey[2]);
    formData.append("sawonCode", queryKey[3]);
    formData.append("page", queryKey[4]);
    const res = await fetch(`/api/pc/aipartner`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AUTH_SECRET}`,
        },
        credentials: "include",
        cache: "no-store",
        body: formData,
    });
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return res.json();
}
export async function salesList({queryKey}: { queryKey: any }) {

    const [_1, _2, tab, sawonCode, page] = queryKey;
    
    const formData = new FormData();
    formData.append("sawonCode", queryKey[3]);
    formData.append("page", queryKey[4]);
    const res = await fetch(`/api/pc/sales/list`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AUTH_SECRET}`,
        },
        credentials: "include",
        cache: "no-store",
        body: formData,
    });
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return res.json();
}
export async function sales({queryKey}: { queryKey: any }) {

    const [_1, _2, tab, sawonCode] = queryKey;
    
    const formData = new FormData();
    formData.append("sawonCode", queryKey[3]);
    const res = await fetch(`/api/pc/sales`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.AUTH_SECRET}`,
        },
        credentials: "include",
        cache: "no-store",
        body: formData,
    });
    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }
    return res.json();
}


export const getEmployeeList: QueryFunction<Item[], [_1: string, _2: string, _3: string]>
  = async ({ queryKey }) => {
    const session = await getSession();
    const token = session?.accessToken;

    const [_1, _2, _3] = queryKey;
    const res = await fetch(`/api/pc/employee-list`, {
        next: {
        tags: ['admin', 'employee', "selectBox"],
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        cache: 'no-store',
    });
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.

    if (!res.ok) {
        // This will activate the closest `error.js` Error Boundary
        throw new Error('Failed to fetch data')
    }

    return res.json()
}