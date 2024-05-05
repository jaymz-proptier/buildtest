"use client";

import { useContext } from "react";
import { TabContext } from "./TabProvider";
import NewContractList from "./newContractList";
import ExpireContractList from "./expireContractList";

export default function TabDecider({ sawonCode }: { sawonCode: number }) {
    const { tab } = useContext(TabContext);
    if (tab==="new") {
        return <NewContractList sawonCode={sawonCode} />
    }
    return <ExpireContractList sawonCode={sawonCode} />;
}