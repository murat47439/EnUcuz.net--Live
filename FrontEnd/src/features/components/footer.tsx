import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

const techStack = [
    { label: "React", src: "/react.svg", textClass: "text-gray-400" },
    { label: "Next.js", src: "/next.svg", textClass: "text-gray-400" },
    { label: "TypeScript", src: "/typescript.svg", textClass: "text-gray-400" },
    { label: "PostgreSQL", src: "/postgre.svg", textClass: "text-gray-400" },
    { label: "Vercel", src: "/vercel.svg", textClass: "text-gray-400" },
    { label: "", src: "/go.svg", textClass: "text-gray-400" },
    { label: "", src: "/gemini.svg", textClass: "text-gray-400", imgWidth: 72, imgHeight: 72 },
    { label: "", src: "/Cloudflare_Logo.svg", textClass: "text-gray-400", imgWidth: 72, imgHeight: 72 },
    { label: "", src: "/render.svg", textClass: "text-gray-400", imgWidth: 96, imgHeight: 96 },
]

export default function Footer() {
    const marqueeItems = [...techStack, ...techStack, ...techStack, ...techStack]

    return (
        <footer className="bg-[#1a1a2e] text-gray-300">
            {/* Üst Bölüm */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Logo & Açıklama */}
                    <div>
                        <Image
                            src="/logo-white.png"
                            alt="2pazar"
                            width={320}
                            height={100}
                            className="h-16 w-auto mb-3"
                        />
                        <p className="text-sm text-gray-400 leading-relaxed mt-2">
                            Türkiye&apos;nin en uygun 2. el ürün platformu. Binlerce ilan arasından aradığınızı bulun veya ürünlerinizi kolayca satışa çıkarın.
                        </p>
                    </div>

                    {/* Hızlı Linkler */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Hızlı Linkler</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">Anasayfa</Link></li>
                            <li><Link href="/profile/new-product" className="text-sm text-gray-400 hover:text-white transition-colors">Ürün Sat</Link></li>
                            <li><Link href="/profile" className="text-sm text-gray-400 hover:text-white transition-colors">Hesabım</Link></li>
                            <li><Link href="/profile/favories" className="text-sm text-gray-400 hover:text-white transition-colors">Favorilerim</Link></li>
                        </ul>
                    </div>

                    {/* İletişim */}
                    <div>
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">İletişim</h3>
                        <a
                            href="https://www.linkedin.com/in/muratt-turann"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-[#0077b5] hover:bg-[#006399] rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                            LinkedIn
                        </a>
                        <a
                            href="https://github.com/murat47439"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 rounded-lg px-4 py-2.5 text-white text-sm font-medium transition-colors ml-2 mt-2 sm:mt-0"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                        </a>
                    </div>
                </div>
            </div>

            {/* Alt çizgi */}
            <div className="border-t border-gray-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
                    {/* Teknoloji İkonları Marquee */}
                    <div className="overflow-hidden w-full mb-4">
                        <div className="flex animate-marquee gap-8 w-max opacity-40">
                            {marqueeItems.map((tech, index) => (
                                <div
                                    key={`${tech.label}-${index}`}
                                    className={`flex items-center space-x-1 ${tech.textClass} flex-shrink-0`}
                                >
                                    <Image
                                        src={tech.src}
                                        alt={tech.label}
                                        width={tech.imgWidth || 20}
                                        height={tech.imgHeight || 20}
                                    />
                                    <span className="text-xs">{tech.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            {/* Durum */}
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs text-gray-500">Geliştirme Aşamasında</span>
                            </div>
                            <span className="text-gray-600 text-xs">·</span>
                            <span className="text-xs text-gray-500">v0.1.4 Beta</span>
                        </div>

                        <p className="text-xs text-gray-500">
                            © 2025 2pazar. Tüm hakları saklıdır.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}