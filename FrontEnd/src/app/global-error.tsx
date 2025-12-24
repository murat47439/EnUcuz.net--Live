"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kritik Hata</h1>
            <p className="text-gray-600 mb-6">
              Uygulamada kritik bir hata oluştu. Lütfen sayfayı yenileyin.
            </p>
            <button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sayfayı Yenile
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}





