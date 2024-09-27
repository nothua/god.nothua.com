import axios from "axios";
import { HEROES } from "../src/urls";
import { convertToHTML5, getServiceLocator, parseSkills } from "../src/utils";
import type HeroRepository from "../src/repositories/HeroRepository";

export async function getHeroesCount() {
      const heroes = await axios.post(HEROES(), {
            pageSize: 1,
            filters: [],
            sorts: [],
            pageIndex: 1,
            fields: ["main_heroid"],
      });

      return heroes.data.data.total;
}

export async function fetchHeroes() {
      const heroes_req = await axios.post(HEROES(), {
            pageSize: await getHeroesCount(),
            sorts: [
                  {
                        data: { field: "hero_id", order: "asc" },
                        type: "sequence",
                  },
            ],
            pageIndex: 1,
            fields: [
                  "hero_id",
                  "hero.data.name",
                  "hero.data.smallmap",
                  "hero.data.heroskilllist",
                  "hero.data.painting",
                  "hero.data.head",
                  "hero.data.sortlabel",
                  "hero.data.head",
                  "hero.data.story",
            ],
            object: [],
      });

      const heroes_res = heroes_req.data.data.records;

      return heroes_res;
}

export async function updateHeroes() {
      const heroes_ = await fetchHeroes();

      const heroRepo =
            getServiceLocator().resolve<HeroRepository>("HeroRepository");
      for (const hero_ of heroes_) {
            const hero = {} as any;
            const hero_data = hero_.data.hero.data;
            hero["_id"] = hero_.data.hero_id;

            hero["name"] = hero_data.name;

            const sortlabel = hero_data.sortlabel;

            hero["role"] = {
                  primary: sortlabel[0].toLowerCase(),
                  secondary: sortlabel[1].toLowerCase(),
            };

            hero["story"] = hero_data.story;

            hero["painting"] = hero_data.painting;
            hero["thumbnail"] = hero_data.head;

            hero["skills"] = [];

            for (const _ of hero_data.heroskilllist) {
                  for (const skill_ of _.skilllist) {
                        let skill = hero["skills"].find(
                              (s: any) =>
                                    s.id === skill_.skillid &&
                                    s.name === skill_.skillname
                        ) || {
                              id: skill_.skillid,
                              name: skill_.skillname,
                              description: await convertToHTML5(
                                    skill_["skilldesc"]
                              ),
                              images: [
                                    {
                                          icon: skill_["skillicon"],
                                          default: true,
                                    },
                              ],
                              tags: skill_["skilltag"].map((tag: any) => {
                                    return tag.tagname
                                          .toLowerCase()
                                          .replace(" ", "_");
                              }),
                        };

                        const { cd, type, cost }: any = parseSkills(
                              skill_["skillcd&cost"]
                        );

                        if (!hero["resource"] && type) hero["resource"] = type;

                        if (!hero["skills"].includes(skill))
                              hero["skills"].push(skill);
                  }
            }

            heroRepo.upsert(hero);
      }
}
