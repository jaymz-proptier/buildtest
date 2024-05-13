import {QueryFunction} from "@tanstack/query-core";
interface Item {
  bnSeq: number;
}
export const getMembersCount = async ({ queryKey }: { queryKey: [string, string, number, string, string, string ]}) => {
  const [_1, _2, sawonCode, filter, search, sort] = queryKey;
  const res = await fetch(`/api/mobile/member/count?sawonCode=${sawonCode}&product_type=${filter}&query=${queryKey[4]}&sort=${queryKey[5]}`, {
    next: {
      tags: ["member", "membersCount"],
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