import {Suspense } from "react"
import HomePageContent from "@/features/components/content/homePageContent"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <Suspense fallback={<div className="w-full text-center py-10 text-gray-500">Yükleniyor...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
