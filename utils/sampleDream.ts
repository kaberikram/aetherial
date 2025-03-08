// Initialize empty dreams array if none exists
export function addSampleDreamIfEmpty() {
  if (typeof window !== "undefined") {
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    
    // If there are no dreams, initialize with empty array
    if (dreams.length === 0) {
      localStorage.setItem("dreams", JSON.stringify([]))
    }
  }
}

// Function to reset dreams to empty state
export function forceResetWithAllSampleDreams() {
  if (typeof window !== "undefined") {
    localStorage.setItem("dreams", JSON.stringify([]))
    // Force a page reload to show the empty state
    window.location.reload()
  }
}

