import Image from "next/image";

/**
 * fullPage: true  → ekranı kaplar (min-h-screen), sayfa yüklenirken
 * fullPage: false → sadece kapsayıcı alana göre ortalanır (bölüm yüklenirken)
 * size: "sm" | "md" | "lg" → logo + halka boyutu
 */
interface PageLoaderProps {
  fullPage?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function PageLoader({
  fullPage = true,
  size = "md",
  label = "Yükleniyor",
}: PageLoaderProps) {
  const sizes = {
    sm: { logo: 36, outer: 76, inner: 60 },
    md: { logo: 52, outer: 112, inner: 88 },
    lg: { logo: 64, outer: 136, inner: 108 },
  };

  const s = sizes[size];

  return (
    <div
      className={`flex flex-col items-center justify-center bg-white ${
        fullPage ? "min-h-screen fixed inset-0 z-[9999]" : "w-full py-16"
      }`}
    >
      {/* Logo + Halka */}
      <div className="relative flex items-center justify-center">
        {/* Dış dönen halka */}
        <div
          className="absolute rounded-full border-4 border-transparent"
          style={{
            width: s.outer,
            height: s.outer,
            borderTopColor: "#ff6000",
            borderRightColor: "#ff600040",
            animation: "spin 1s linear infinite",
          }}
        />
        {/* İç dönen halka (ters) */}
        <div
          className="absolute rounded-full border-2 border-transparent"
          style={{
            width: s.inner,
            height: s.inner,
            borderBottomColor: "#ff6000",
            borderLeftColor: "#ff600030",
            animation: "spin 1.4s linear infinite reverse",
          }}
        />
        {/* Logo */}
        <div style={{ animation: "logoPulse 1.8s ease-in-out infinite" }}>
          <Image
            src="/logo.png"
            alt="2pazar"
            width={s.logo}
            height={s.logo}
            className="rounded-xl"
            priority
          />
        </div>
      </div>

      {/* Nokta animasyonu + etiket */}
      <div
        className="mt-7 flex flex-col items-center gap-2"
        style={{ animation: "fadeInUp 0.5s ease-out forwards" }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff6000]"
              style={{
                animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 font-medium tracking-widest uppercase">
          {label}
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes logoPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(0.92); opacity: 0.85; }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
