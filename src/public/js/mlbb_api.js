const base_url = `https://api.gms.moontontech.com/api/gms/source`;

// const HEROES = `${base_url}/2669606/2756564`;

// const HEROES_WINRATE = `${base_url}/2669606/2674709`;
const SPELLS = `${base_url}/2713644/2718122`;
const EMBLEM_TALENTS = `${base_url}/2713644/2718121`;
const EMBLEMS = `${base_url}/2713644/2740642`;

const TOTAL_HEROES = 129;

const RANKS = {
    All: "101",
    Epic: "5",
    Legend: "6",
    Mythic: "7",
    MythicHonor: "8",
    MythicGlory: "9",
};

/**
 * Mapping of days to corresponding heroes win rate data URL.
 *
 * @type {Object.<number, string>}
 * @example
 * // Get the 7-day heroes win rate URL
 * const url = HEROES_WINRATE[7];
 */
const HEROES_WINRATE = {
    1: `${base_url}/2713644/2755180`,
    3: `${base_url}/2713644/2755181`,
    7: `${base_url}/2713644/2755182`,
    15: `${base_url}/2713644/2755183`,
    30: `${base_url}/2713644/2755184`,
}

/**
 * Mapping of days to corresponding heroes trend win rates data URL.
 *
 * @type {Object.<number, string>}
 * @example
 * // Get the 15-day heroes trend win rate URL
 * const url = HERO_TREND_WINRATES[15];
 */
const HERO_TREND_WINRATES = {
    7: `${base_url}/2713644/2755185`,
    15: `${base_url}/2713644/2755186`,
    30: `${base_url}/2713644/2755187`,
}

const HERO_WINRATE = `${base_url}/2713644/2777391`;
const HERO_WINRATE_BY_LANE = `${base_url}/2713644/2777027`;


const HEROES = "/api/heroes/list";
/**
 * Fetches heroes image name and id
 */
async function getHeroes() {
    try {
        const response = await axios.get(HEROES);
        return { status: 200, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}

/**
 * Fetches heroes win rate data for the given rank and time period.
 * @param {string} [rank="All"]
 * @param {number} [days=1]
 * @returns {Promise<{ status: number, data?: any, message?: string }>}
 */
async function fetchHeroesWinrate(rank = "All", days = 1) {
    try {
        const response = await axios.post(HEROES_WINRATE[days], {
            filters: [
                { field: "bigrank", operator: "eq", value: RANKS[rank] },
                { field: "match_type", operator: "eq", value: "0" },
            ],
            sorts: [
                { data: { field: "main_heroid", order: "asc" }, type: "sequence" },
            ],
            pageSize: TOTAL_HEROES,
            pageIndex: 1,
            fields: [
                "main_heroid",
                "main_hero_appearance_rate",
                "main_hero_ban_rate",
                "main_hero_win_rate",
            ],
        });

        return { status: 200, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}


/**
 * Fetches heroes win rate data for the given rank and time period.
 * @param {int} [hero_id=1]
 * @param {string} [rank="All"]
 * @param {number} [days=7]
 * @returns {Promise<{ status: number, data?: any, message?: string }>}
 */
async function fetchHeroesTrendWinrate(hero_id = 1, rank = "All", days = 7) {
    try {
        const response = await axios.post(HERO_TREND_WINRATES[days],
            {
                "pageSize": 20,
                "pageIndex": 1,
                "filters": [
                    { "field": "main_heroid", "operator": "eq", "value": hero_id },
                    { "field": "bigrank", "operator": "eq", "value": RANKS[rank] },
                    { "field": "match_type", "operator": "eq", "value": 1 }
                ],
                "sorts": []
            }
        );

        return { status: 200, data: response.data };
    } catch (error) {

        console.log(error);
        return {
            status: error.response?.status || 500,
            message: error.response?.data?.message || error.message,
        };
    }
}


/**
 * Combines hero data with their win rates, pick rates, and ban rates.
 * It fetches all heroes and their winrate statistics for a given rank and time period,
 * then merges the relevant statistics into each hero object.
 *
 * @param {string} [rank="All"] - The rank to filter winrate data (e.g., "All", "Legend").
 * @param {number} [days=1] - The number of days to consider for winrate data (e.g., 1, 7, 30).
 * @returns {Promise<{ status: number, data?: Array<Object>, message?: string }>}
 * A promise that resolves to an object containing the status,
 * the combined hero data (if successful), or an error message.
 */
async function getHeroesWinrate(rank = "All", days = 1) {
    try {
        const heroesResponse = await getHeroes();
        if (heroesResponse.status !== 200) {
            return {
                status: heroesResponse.status,
                message: `Failed to fetch heroes: ${heroesResponse.message}`,
            };
        }

        const heroes = heroesResponse.data;

        const winrateResponse = await fetchHeroesWinrate(rank, days);
        if (winrateResponse.status !== 200) {
            return {
                status: winrateResponse.status,
                message: `Failed to fetch hero win rates: ${winrateResponse.message}`,
            };
        }
        const winrateRecords = winrateResponse.data.data.records;

        const winrateMap = new Map();
        winrateRecords.forEach(record => {
            winrateMap.set(record.data.main_heroid, {
                win_rate: record.data.main_hero_win_rate * 100,
                appearance_rate: record.data.main_hero_appearance_rate * 100,
                ban_rate: record.data.main_hero_ban_rate * 100,
            });
        });

        const combinedHeroes = heroes.map(hero => {
            const stats = winrateMap.get(hero._id);

            if (stats) {
                return {
                    ...hero,
                    win_rate: stats.win_rate,
                    pick_rate: stats.appearance_rate,
                    ban_rate: stats.ban_rate,
                };
            }
            return hero;
        });

        return { status: 200, data: combinedHeroes };
    } catch (error) {
        console.error("Error in combineHeroData:", error);
        return {
            status: 500,
            message: `An unexpected error occurred: ${error.message}`,
        };
    }
}


/**
 * Parses the response from fetchHeroesTrendWinrate into a format suitable for charting.
 * It extracts the daily win rate, pick rate (appearance rate), and ban rate data.
 *
 * @param {Object} responseData - The raw response data object from fetchHeroesTrendWinrate.
 * @returns {Array<Object>} An array of objects, where each object represents a daily trend
 * with 'date', 'win_rate', 'pick_rate', and 'ban_rate' properties.
 * Returns an empty array if the data structure is not as expected.
 */
function parseHeroTrendWinrateForChart(responseData) {
    if (
        responseData &&
        responseData.data &&
        responseData.data.records &&
        responseData.data.records.length > 0 &&
        responseData.data.records[0].data &&
        responseData.data.records[0].data.win_rate
    ) {
        const trendData = responseData.data.records[0].data.win_rate;

        return trendData.map(dayData => ({
            date: dayData.date,
            win_rate: dayData.win_rate,
            pick_rate: dayData.app_rate,
            ban_rate: dayData.ban_rate,
        }));
    } else {
        console.warn("Invalid or empty responseData for parsing hero trend winrate.");
        return [];
    }
}
