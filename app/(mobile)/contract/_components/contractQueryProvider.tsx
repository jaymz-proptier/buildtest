import { Suspense } from "react";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import ContractList from "./newContractList";
import { getContracts } from "../_lib/getContracts";
import { MemberLoading } from "../../_components/member-loading";
import ContractFilterBox from "./contract-filter-box";
import FilterProvider from "./filterProvider";
import TabDecider from "./TabDecider";


export default async function ContractQueryProvider({ sawonCode }: { sawonCode: number }) {
    
    const queryClient = new QueryClient();
    await queryClient.prefetchInfiniteQuery({
        queryKey: ["member", "contract", sawonCode],
        queryFn: getContracts,
        initialPageParam: 0,
    })
    const dehydratedState = dehydrate(queryClient);
    return <>
    <Suspense fallback={<MemberLoading />}>
        <HydrationBoundary state={dehydratedState}>
            <FilterProvider> 
                <ContractFilterBox sawonCode={sawonCode} />                 
                <TabDecider sawonCode={sawonCode} />
            </FilterProvider>  
        </HydrationBoundary>
    </Suspense>
    </>

}