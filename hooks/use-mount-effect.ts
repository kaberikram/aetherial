import { useEffect } from "react"

/**
 * Sync with an external system on mount only.
 * Valid uses: DOM APIs, third-party widgets, browser subscriptions.
 */
export function useMountEffect(callback: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(callback, [])
}
