import { useEffect } from "react"

/**
 * Sync with an external system once, when the component mounts.
 * Valid uses: DOM APIs, browser storage, and third-party subscriptions.
 */
export function useMountEffect(callback: () => void | (() => void)) {
  // The empty dependency list is the point of this hook.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [])
}
