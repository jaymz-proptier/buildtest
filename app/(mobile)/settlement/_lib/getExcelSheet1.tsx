import { getSession } from "next-auth/react";

interface Item {
    bnSeq: number;
}
export const getExcelSheet1 = async ({ queryKey }: { queryKey: [string, string, string, string ]}) => {
  const session = await getSession();
  const token = session?.accessToken;
    const [_1, _2, _3, calYm] = queryKey;
    console.log(queryKey[3]);
    const res = await fetch(`/api/mobile/saveAs/sheet1?calYm=${queryKey[3]}`, {
      next: {
        tags: ["member", "saveAs", "sheet1", queryKey[3]],
      },
      headers: {
          Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });
    const data = await res.json();
    // The return value is *not* serialized
    // You can return Date, Map, Set, etc.
    if (!res.ok) {
      // This will activate the closest `error.js` Error Boundary
      throw new Error('Failed to fetch data')
    }
  
    return data;
  }