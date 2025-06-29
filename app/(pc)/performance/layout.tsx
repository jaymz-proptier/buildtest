import FilterProvider from "./providers/filterProvider";

type Props = { children: React.ReactNode }
export default function PerformanceLayout({ children }: Props) {
    return (
        <FilterProvider>
            {children}
        </FilterProvider>
    );
}