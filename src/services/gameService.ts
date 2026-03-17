import { sanity } from "src/lib/sanity";

let cache: any[] | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ----------------------------
// Price calculation helper
// ----------------------------
function calculateMinPrice(minRam: number) {
  // Example:
  // 2GB → 1.99
  // 4GB → 3.99
  return Number((minRam * 1 - 0.01).toFixed(2));
}

// ----------------------------
// Main
// ----------------------------
export async function getGamesWithMinPrice() {
  debugger;
  try {
    // ✅ Cache
    if (cache && Date.now() - cacheTime < CACHE_DURATION) {
      return cache;
    }

    // ✅ Fetch CMS games (source of truth)
    const cmsGames = await sanity.fetch(`
      *[_type == "game"]{
        _id,
        name,
        game_id,
        coverImg,
        character1Img,
        character2Img,
        game_description,
        hero_features,
        whatsIncluded,
        about,
         hasBudget
      }
    `);

    if (!Array.isArray(cmsGames) || cmsGames.length === 0) {
      console.warn("⚠️ No games found in CMS");
      return [];
    }

    // ✅ Fetch API games
    const apiRes = await fetch(
      "plans-api.aleforge-llc.workers.dev/v2?handler=pulldata&file=games.json"
    );

    if (!apiRes.ok) {
      throw new Error("Games API failed");
    }

    const apiJson = await apiRes.json();
    const apiGames = apiJson?.data || [];

    // ----------------------------
    // Merge CMS + API
    // ----------------------------
    const mergedGames = cmsGames
      .map((cmsGame: any) => {
        const apiGame = apiGames.find(
          (api: any) => Number(api.game_id) === Number(cmsGame.game_id)
        );

        if (!apiGame) {
          console.warn("⚠️ Missing API data for game_id:", cmsGame.game_id);
          return null;
        }

        const minRam = Number(apiGame?.serverConfig?.minRam) || 1;
        const minPrice = calculateMinPrice(minRam);

        return {
          // CMS FIRST (source of truth)
          ...cmsGame,

          // API enrichment
          api: apiGame,

          minRam,
          minPrice,
        };
      })
      .filter(Boolean); // remove nulls

    // ✅ Cache
    cache = mergedGames;
    cacheTime = Date.now();

    return mergedGames;
  } catch (err) {
    console.error("❌ Game merge error:", err);
    return [];
  }
}

// --------------------------------
// Get single game from merged list
// --------------------------------
export async function getGameBySlug(slug: string) {
  debugger;
  const games = await getGamesWithMinPrice();

  if (!Array.isArray(games) || games.length === 0) {
    console.warn("⚠️ No merged games available");
    return null;
  }

  const normalize = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

  const game = games.find((g: any) => {
    const cmsSlug = g.slug?.current || g.slug || g.name;
    return normalize(cmsSlug) === normalize(slug);
  });

  if (!game) {
    console.warn("⚠️ Game not found for slug:", slug);
    return null;
  }

  return game;
}
