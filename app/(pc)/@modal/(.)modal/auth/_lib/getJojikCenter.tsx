import {QueryFunction} from "@tanstack/query-core";
interface Item {
  bnSeq: number;
}
export const getJojikCenter = async ({ queryKey }: { queryKey: [_1: string, _2: string ]}) => {
  const [_1, _2] = queryKey;
  const res = await fetch(`/api/pc/jojik/center?sosok=${queryKey[1]}`, {
    next: {
      tags: ["jojikCenter", queryKey[1]],
    },
    credentials: 'include',
  });
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }

  return res.json()
}