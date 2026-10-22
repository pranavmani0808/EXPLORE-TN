// src/components/layout/Footer.tsx
import { Link } from "@tanstack/react-router"

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between text-sm">
        <ul className="flex flex-wrap gap-4">
          <li>
            <Link to="/about" className="text-slate-600 dark:text-slate-400 hover:underline">
              About
            </Link>
          </li>
          <li>
            <Link to="/privacy" className="text-slate-600 dark:text-slate-400 hover:underline">
              Privacy
            </Link>
          </li>
          <li>
            <Link to="/terms" className="text-slate-600 dark:text-slate-400 hover:underline">
              Terms
            </Link>
          </li>
        </ul>
        <span className="mt-4 sm:mt-0 text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} ExplorerTN
        </span>
      </div>
    </footer>
  )
}
