import { Suspense } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import SalesList from "./salesList";
import { getSales } from "../_lib/getSales";
import { MemberLoading } from "../../_components/member-loading";
import SalesFilterBox from "./sales-filter-box";
import FilterProvider from "./filterProvider";


export default async function SalesQueryContents({ sawonCode }: { sawonCode: number }) {
    
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery({
        queryKey: ["member", "sales", sawonCode],
        queryFn: getSales,
        initialPageParam: 0,
    })
    const dehydratedState = dehydrate(queryClient);
    return <>
    <Suspense fallback={<MemberLoading />}>
        <HydrationBoundary state={dehydratedState}>
            <FilterProvider> 
                <SalesFilterBox sawonCode={sawonCode} />                 
                <SalesList sawonCode={sawonCode} />
            </FilterProvider>  
        </HydrationBoundary>
    </Suspense>
    </>

}