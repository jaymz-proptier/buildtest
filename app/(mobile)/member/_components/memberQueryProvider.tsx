import { Suspense } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import { getMembers } from "../_lib/getMembers";
import { MemberLoading } from "../../_components/member-loading";
import FilterProvider from "./filterProvider";
import MemberFilterBox from "./memberfilterBox";
import MembersList from "./membersList";
import MemberSortingBox from "./memberSortingBox";


export default async function MemberQueryProvider({ sawonCode }: { sawonCode: number }) {
    
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery({
        queryKey: ["member", "members", sawonCode],
        queryFn: getMembers,
        initialPageParam: 0,
    })
    const dehydratedState = dehydrate(queryClient);
    return <>
    <Suspense fallback={<MemberLoading />}>
        <HydrationBoundary state={dehydratedState}>
            <FilterProvider> 
                <MemberFilterBox />   
                <MemberSortingBox sawonCode={sawonCode} />       
                <MembersList sawonCode={sawonCode} />
            </FilterProvider>  
        </HydrationBoundary>
    </Suspense>
    </>

}