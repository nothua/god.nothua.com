import { writeFileSync } from "fs";
import {
      HERO_WINRATE_AND_COUNTERS,
      HERO_COMPATIBILITY,
      HEROES,
} from "../src/urls";
import { getServiceLocator } from "../src/utils";
import { RANK, Relation } from "../src/models/Stat";
import type StatRepository from "../src/repositories/StatRepository";
import axios from "axios";
import { getHeroesCount } from "./fetchHeroes";

type RankKey = keyof typeof RANK;

const RANKS: { [key in RankKey]: string } = {
      All: "101",
      Epic: "5",
      Legend: "6",
      Mythic: "7",
      MythicHonor: "8",
      MythicGlory: "9",
};

const serviceLocator = getServiceLocator();

async function fetchData(url: string, rank: string) {
      return await axios.post(url, {
            pageSize: await getHeroesCount(),
            filters: [
                  {
                        field: "bigrank",
                        operator: "eq",
                        value: RANKS[rank as RankKey],
                  },
                  { field: "match_type", operator: "eq", value: "0" },
            ],
            sorts: [
                  {
                        data: { field: "main_heroid", order: "asc" },
                        type: "sequence",
                  },
            ],
            pageIndex: 1,
            fields: [
                  "main_heroid",
                  "main_hero_appearance_rate",
                  "main_hero_ban_rate",
                  "main_hero_win_rate",
                  "data.sub_hero.heroid",
                  "data.sub_hero.increase_win_rate",
                  "data.sub_hero_last.heroid",
                  "data.sub_hero_last.increase_win_rate",
            ],
      });
}

export async function fetchDailyWinrate() {
      const heroes: any[] = [];
      const ranks: { [key: string]: any } = {
            All: [],
            Epic: [],
            Legend: [],
            Mythic: [],
            MythicHonor: [],
            MythicGlory: [],
      };

      for (const rank in RANKS) {
            const winrate_and_counters_request = await fetchData(
                  HERO_WINRATE_AND_COUNTERS(),
                  rank
            );
            const hero_compatibility_request = await fetchData(
                  HERO_COMPATIBILITY(),
                  rank
            );

            const winrate_and_counters =
                  winrate_and_counters_request.data.data.records;
            const hero_compatibilities =
                  hero_compatibility_request.data.data.records;

            winrate_and_counters.forEach((hero_data: any, i: any) => {
                  const hero_compatibility = hero_compatibilities[i].data;

                  const hero = {
                        heroid: hero_data.data.main_heroid,
                        pickrate:
                              hero_data.data.main_hero_appearance_rate * 100,
                        winrate: hero_data.data.main_hero_win_rate * 100,
                        banrate: hero_data.data.main_hero_ban_rate * 100,
                        counteredby: hero_data.data.sub_hero_last.map(
                              (data: any) => ({
                                    heroid: data.heroid,
                                    winrate: data.increase_win_rate * 100,
                                    type: "counteredby",
                              })
                        ),
                        counters: hero_data.data.sub_hero.map((data: any) => ({
                              heroid: data.heroid,
                              winrate: data.increase_win_rate * 100,
                              type: "counters",
                        })),
                        compatabilities: [
                              ...hero_compatibility.sub_hero.map(
                                    (data: any) => ({
                                          heroid: data.heroid,
                                          winrate: data.increase_win_rate * 100,
                                          type: "counters",
                                    })
                              ),
                              ...hero_compatibility.sub_hero_last.map(
                                    (data: any) => ({
                                          heroid: data.heroid,
                                          winrate: data.increase_win_rate * 100,
                                          type: "counteredby",
                                    })
                              ),
                        ],
                  };

                  ranks[rank as RankKey].push(hero);
            });
      }

      for (const rank in RANKS) {
            for (const heroData of ranks[rank]) {
                  let existingHero = heroes.find(
                        (h) => h.hero === heroData.heroid
                  ) || {
                        hero: heroData.heroid,
                        ranks: [],
                        date: Date.now(),
                  };

                  if (!heroes.includes(existingHero)) {
                        heroes.push(existingHero);
                  }

                  const relations = [
                        ...heroData.counteredby.map((counter: any) => ({
                              hero: parseInt(counter.heroid),
                              type: Relation.CounteredBy,
                              winrate: counter.winrate,
                        })),
                        ...heroData.counters.map((counter: any) => ({
                              hero: parseInt(counter.heroid),
                              type: Relation.Counters,
                              winrate: counter.winrate,
                        })),
                        ...heroData.compatabilities.map((comp: any) => ({
                              hero: parseInt(comp.heroid),
                              type: Relation.Compatability,
                              winrate: comp.winrate,
                        })),
                  ];

                  existingHero.ranks.push({
                        rank: RANK[rank as RankKey],
                        pickrate: heroData.pickrate,
                        winrate: heroData.winrate,
                        banrate: heroData.banrate,
                        relations: relations,
                  });
            }
      }

      return heroes;
}

export async function updateDailyWinrate() {
      const heroes = await fetchDailyWinrate();
      const statRepo = serviceLocator.resolve<StatRepository>("StatRepository");

      for (const hero of heroes) {
            try {
                  await statRepo.create(hero);
                  console.log(`Updating hero ${hero.hero} ${hero.date}`);
            } catch (ex) {
                  console.error("Error creating hero:", ex);
            }
      }
}
