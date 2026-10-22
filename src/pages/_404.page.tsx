// src/pages/_404.page.tsx
export default function Page404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">\n      <h1 className="text-5xl font-bold text-indigo-600 mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-700 dark:text-gray-300">The page you’re looking for doesn’t exist.</p>
      <a href="/" className="text-indigo-600 hover:underline">Go back home</a>
    </div>
  )
}
