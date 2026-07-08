import F1SubNav from '@/components/F1SubNav'

export default function F1Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <F1SubNav />
            {children}
        </>
    )
}
