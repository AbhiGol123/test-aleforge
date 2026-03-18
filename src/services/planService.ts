let fetchPromise: Promise<any> | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getAllPlansData() {
  try {
    if (fetchPromise && Date.now() - cacheTime < CACHE_DURATION) {
      return await fetchPromise;
    }

    fetchPromise = (async () => {
      const res = await fetch(
        "https://plans-api.aleforge-llc.workers.dev/v2?handler=pulldata&file=plans.json"
      );
      if (!res.ok) throw new Error("Failed to fetch plans");
      const allPlans = await res.json();
      const allPlansData = allPlans?.data || {};
      
      cacheTime = Date.now();
      return allPlansData;
    })();

    return await fetchPromise;
  } catch (err) {
    console.error("Error fetching plans data:", err);
    fetchPromise = null; // reset on error so it retries
    return null;
  }
}
