import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient, setQueryClient] = useState<QueryClient | null>(null)

  // Sadece client-side'da QueryClient oluştur
  useEffect(() => {
    setQueryClient(new QueryClient())
  }, [])

  if (!queryClient) return null // SSR sırasında hiçbir şey render etme

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
