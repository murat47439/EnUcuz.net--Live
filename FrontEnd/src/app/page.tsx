import { Suspense } from "react"
import HomePageContent from "@/features/components/content/homePageContent"
import PageLoader from "@/features/components/pageLoader"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <Suspense fallback={<PageLoader label="Sayfa yükleniyor" />}>
      <HomePageContent />
    </Suspense>
  )
}
