interface Item {
    bnSeq: number;
}
export const getExcelSheet2 = async ({ queryKey }: { queryKey: [string, string, number, string ]}) => {
    const [_1, _2, sawonCode, calYm] = queryKey;
    const res = await fetch(`/api/mobile/saveAs/sheet2?sawonCode=${sawonCode}`, {
      next: {
        tags: ["member", "saveAs"],
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