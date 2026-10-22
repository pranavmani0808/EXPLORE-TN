// src/components/ui/EmptyState.tsx
import { Panel } from "@/components/ui/panel"

export function EmptyState({ title = "Nothing here yet", description }): JSX.Element {
  return (
    <Panel className="p-8 text-center">
      <p className="text-3xl font-medium text-gray-900 dark:text-white mb-2">{title}</p>
      <p className="text-lg text-gray-600 dark:text-gray-300">{description}</p>
    </Panel>
  )
}
