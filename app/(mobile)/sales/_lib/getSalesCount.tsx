import {QueryFunction} from "@tanstack/query-core";
interface Item {
  bnSeq: number;
}
export const getSalesCounts = async ({ queryKey }: { queryKey: [string, string, number, string ]}) => {
  const [_1, _2, sawonCode, filter] = queryKey;
  const res = await fetch(`/api/mobile/sales/count?sawonCode=${sawonCode}&type=${filter}`, {
    next: {
      tags: ["member", "salesCount"],
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