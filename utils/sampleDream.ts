export const sampleDream = {
  id: "sample_dream_001",
  title: "Flying Over a Magical City",
  date: new Date().toISOString(),
  location: "A fantastical cityscape",
  emotion: "Excited",
  summary:
    "I found myself soaring high above a breathtaking city of crystal spires and floating gardens. The sky was a tapestry of vibrant colors, with two moons visible on the horizon. As I flew, I could feel the cool wind against my face and hear the distant chimes of celestial music. Below, I saw people with iridescent wings flitting between the towers, and great sky whales gracefully gliding through the air. The entire scene was bathed in a soft, ethereal light that seemed to emanate from the very air itself.",
}

export const additionalSampleDreams = [
  {
    id: "sample_dream_002",
    title: "Lost in the Ancient Library",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    location: "Endless library with impossible architecture",
    emotion: "Confused",
    summary:
      "I was wandering through an impossibly vast library with shelves that reached up beyond sight. The books were bound in materials I'd never seen before—some seemed to be made of light, others of water or smoke. As I walked, the corridors shifted and rearranged themselves. I was searching for a specific book that contained an important secret, but every time I thought I found it, the words would rearrange themselves on the page. An elderly librarian with eyes that reflected galaxies kept appearing at different corners, watching me but never speaking.",
  },
  {
    id: "sample_dream_003",
    title: "Underwater Civilization",
    date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    location: "Deep ocean city",
    emotion: "Peaceful",
    summary:
      "I was breathing underwater, exploring a magnificent city built from coral and bioluminescent materials. The inhabitants had features of both humans and sea creatures—webbed hands, gills along their necks, and eyes that could see in the darkest depths. They welcomed me to their celebration, a festival of lights where thousands of tiny glowing creatures were released into the water, creating constellations that told ancient stories. The music was unlike anything I'd heard before, felt more than heard, vibrating through the water and into my bones.",
  },
  {
    id: "sample_dream_004",
    title: "The Endless Staircase",
    date: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    location: "Surreal staircase between realities",
    emotion: "Anxious",
    summary:
      "I was climbing a spiral staircase that seemed to have no end. Each floor I passed showed glimpses of different versions of my life—choices I might have made, paths not taken. Some were wonderful, others terrifying. The higher I climbed, the more unstable the staircase became, with steps disappearing behind me. I knew I couldn't go back, only forward. There was someone or something chasing me from below, its footsteps getting closer. The walls around the staircase were covered in clocks, all showing different times, their ticking growing louder until it was almost deafening.",
  },
  {
    id: "sample_dream_005",
    title: "The Forgotten Garden",
    date: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
    location: "Overgrown garden with sentient plants",
    emotion: "Happy",
    summary:
      "I discovered a hidden garden behind an old stone wall covered in ivy. The plants seemed to respond to my presence—flowers turned to follow me, vines gently reached out to touch my hands. In the center was a fountain with water that glowed with a soft blue light. When I drank from it, I could suddenly understand the language of the plants. They told me stories of people who had visited the garden over centuries, secrets they had shared, and promises made. Time moved differently here; what felt like hours was only moments in the outside world. As the sun began to set, the entire garden began to sing a haunting melody.",
  },
  {
    id: "sample_dream_006",
    title: "The Time Market",
    date: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
    location: "Bazaar outside of time",
    emotion: "Scared",
    summary:
      "I was wandering through a strange marketplace where vendors were selling time in various forms—hourglasses containing specific moments, watches that could rewind small events, calendars with days you could live twice. The merchants had featureless faces except for their eyes, which were clock faces with hands that spun at different speeds. I realized with horror that I had accidentally traded away something important—a future memory I hadn't experienced yet. I was desperately trying to find the merchant who had bought it, but the market stalls kept rearranging themselves. The sky above was divided into day and night simultaneously, and occasionally time would freeze for everyone except me.",
  }
];

// Check if the dreams in localStorage include all sample dreams
export function checkForAllSampleDreams() {
  if (typeof window !== "undefined") {
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    
    // Check if all sample dream IDs are present
    const allSampleIds = [sampleDream.id, ...additionalSampleDreams.map(dream => dream.id)]
    const existingIds = dreams.map((dream: any) => dream.id)
    
    // If any sample dream is missing, we need to reset
    const needsReset = allSampleIds.some(id => !existingIds.includes(id))
    
    return !needsReset
  }
  return false
}

export function addSampleDreamIfEmpty() {
  if (typeof window !== "undefined") {
    const dreams = JSON.parse(localStorage.getItem("dreams") || "[]")
    
    // If there are no dreams at all, add all sample dreams
    if (dreams.length === 0) {
      const allDreams = [sampleDream, ...additionalSampleDreams]
      localStorage.setItem("dreams", JSON.stringify(allDreams))
      return
    }
    
    // If there are some dreams but not all sample dreams, check if they're the sample ones
    // and add any missing ones
    if (!checkForAllSampleDreams()) {
      // Get existing dream IDs
      const existingIds = dreams.map((dream: any) => dream.id)
      
      // Add any missing sample dreams
      if (!existingIds.includes(sampleDream.id)) {
        dreams.push(sampleDream)
      }
      
      // Add any missing additional sample dreams
      additionalSampleDreams.forEach(dream => {
        if (!existingIds.includes(dream.id)) {
          dreams.push(dream)
        }
      })
      
      localStorage.setItem("dreams", JSON.stringify(dreams))
    }
  }
}

// Function to force reset dreams with all sample dreams
export function forceResetWithAllSampleDreams() {
  if (typeof window !== "undefined") {
    const dreams = []
    // Add the original sample dream and the new ones
    dreams.push(sampleDream)
    additionalSampleDreams.forEach(dream => dreams.push(dream))
    localStorage.setItem("dreams", JSON.stringify(dreams))
    // Force a page reload to show the new dreams
    window.location.reload()
  }
}

