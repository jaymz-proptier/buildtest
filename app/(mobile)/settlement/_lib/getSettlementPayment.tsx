import { getSession } from "next-auth/react";
interface Item {
  bnSeq: number;
}
export const getSettlementPayment = async ({ queryKey }: { queryKey: [string, string, number, string ]}) => {
  const session = await getSession();
  const token = session?.accessToken;
  const [_1, _2, sawonCode, calYm] = queryKey;
  const res = await fetch(`/api/mobile/settlement/payment?calYm=${calYm}`, {
    next: {
      tags: ["member", "settlement"],
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