import axios from "axios";
import { HEROES } from "../src/urls";
import { convertToHTML5, getServiceLocator, parseSkills } from "../src/utils";
import type HeroRepository from "../src/repositories/HeroRepository";
import { ImageRepository } from "../src/classes/ImageRepository";
import { Binary } from "mongodb";
import * as cheerio from "cheerio";

export async function getHeroesCount() {
    // const heroes = await axios.post(HEROES(), {
    //     pageSize: 1,
    //     filters: [],
    //     sorts: [],
    //     pageIndex: 1,
    //     fields: ["main_heroid"],
    // },  {
    //     headers: {
    //       "accept": "application/json, text/plain, */*",
    //       "content-type": "application/json;charset=UTF-8",
    //       "origin": "https://m.mobilelegends.com",
    //       "referer": "https://m.mobilelegends.com/",
    //       "sec-ch-ua": '"Chromium";v="136", "Google Chrome";v="136", "Not.A/Brand";v="99"',
    //       "sec-ch-ua-mobile": "?0",
    //       "sec-ch-ua-platform": '"Windows"',
    //       "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36",
    //       "x-appid": "2669606",
    //       "x-actid": "2669607",
    //       "x-lang": "en",
    //     }
    // });
    const heroes = await fetch(HEROES(), {
        method: "POST"  ,
        body: JSON.stringify(
            {
                pageSize: 1,
                filters: [],
                sorts: [],
                pageIndex: 1,
                fields: ["main_heroid"],
            }
        ),
        headers: [
            ["Content-Type", "application/json"],
            [
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            ],
        ],
    });

    return (await heroes.json()).data.total;
}

export async function fetchHeroes() {
    const heroes_req = await fetch(HEROES(), {
        method: "POST"  ,
        body: JSON.stringify(
            {
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
            }
        ),
        headers: [
            ["Content-Type", "application/json"],
            [
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
            ],
        ],
    });

    const heroes_res = (await heroes_req.json()).data.records;

    return heroes_res;
}

export async function updateHeroes() {
    const heroes_ = await fetchHeroes();
    const imageRepo = ImageRepository.getInstance();

    const heroRepo =
        getServiceLocator().resolve<HeroRepository>("HeroRepository");

    for (const hero_ of heroes_) {
        console.log("Updating hero: ", hero_.data.hero.data.name);
        const hero = {} as any;
        const hero_data = hero_.data.hero.data;

        hero["_id"] = hero_.data.hero_id;

        hero["name"] = hero_data.name;

        const sortlabel = hero_data.sortlabel;

        hero["role"] = {
            primary: sortlabel[0].toLowerCase(),
            secondary: sortlabel[1].toLowerCase(),
        };

        if(hero_data.painting != "" && hero_data.painting != null){
            const painting = await axios.get(hero_data.painting, {
                responseType: "arraybuffer",
            });
            const paintingBinary = new Binary(Buffer.from(painting.data));

            const paitingUrl = await imageRepo.uploadImage(
                "heroes/painting/",
                hero["_id"],
                paintingBinary
            );
            hero["painting"] = paitingUrl;
        }

        if(hero_data.head != "" && hero_data.head != null){
            const head = await axios.get(hero_data.head, {
                responseType: "arraybuffer",
            });

            const headBinary = new Binary(Buffer.from(head.data));

            const thumbnailUrl = await imageRepo.uploadImage(
                "heroes/thumbnail/",
                hero["_id"],
                headBinary
            );
            hero["thumbnail"] = thumbnailUrl;
        }

        hero["skills"] = [];

        for (const _ of hero_data.heroskilllist) {
            for (const skill_ of _.skilllist) {
                let skill = hero["skills"].find(
                    (s: any) =>
                        s.id === skill_.skillid && s.name === skill_.skillname
                ) || {
                    id: skill_.skillid,
                    name: skill_.skillname,
                    description: (() => {
                        const htmlContent = convertToHTML5(skill_["skilldesc"]);
                        const $ = cheerio.load(htmlContent);

                        $("br").replaceWith("\n");

                        return $("body").text().trim();
                    })(),
                    images: "toadd",
                    tags: skill_["skilltag"].map((tag: any) => {
                        return tag.tagname.toLowerCase().replace(" ", "_");
                    }),
                };

                if (skill.images === "toadd") {
                    if(skill_["skillicon"] != ""){
                        const skillImage = await axios.get(skill_["skillicon"], {
                            responseType: "arraybuffer",
                        });
                        const skillImageBinary = new Binary(
                            Buffer.from(skillImage.data)
                        );
                        const skillImageUrl = await imageRepo.uploadImage(
                            "heroes/skills/",
                            skill_.skillid,
                            skillImageBinary
                        );
                        skill.images = [
                            {
                                icon: skillImageUrl,
                                default: true,
                            },
                        ];
                    }else{
                        skill.images = [];
                    }
                }

                const { cd, type, cost }: any = parseSkills(
                    skill_["skillcd&cost"]
                );

                if (!hero["resource"] && type) hero["resource"] = type;

                if (!hero["skills"].includes(skill)) hero["skills"].push(skill);
            }
        }

        heroRepo.upsert(hero);
    }

    console.log("Heroes updated");
}

//update a singular hero
export async function updateHero(id: number) {
    const heroes = await fetchHeroes();
    const imageRepo = ImageRepository.getInstance();
    const hero_ = heroes.find((h: any) => h.data.hero_id === id);

    console.log("Updating hero: ", hero_.data.hero.data.name);
    const heroRepo =
        getServiceLocator().resolve<HeroRepository>("HeroRepository");
    const hero_data = hero_.data.hero.data;
    const hero = {} as any;
    hero["_id"] = hero_.data.hero_id;

    hero["name"] = hero_data.name;

    const sortlabel = hero_data.sortlabel;

    hero["role"] = {
        primary: sortlabel[0].toLowerCase(),
        secondary: sortlabel[1].toLowerCase(),
    };

    try {
        const painting = await axios.get(hero_data.painting, {
            responseType: "arraybuffer",
        });
        const paintingBinary = new Binary(Buffer.from(painting.data));

        const paitingUrl = await imageRepo.uploadImage(
            "heroes/painting/",
            hero["_id"],
            paintingBinary
        );
        hero["painting"] = paitingUrl;
    } catch (ex) {}

    const head = await axios.get(hero_data.head, {
        responseType: "arraybuffer",
    });

    const headBinary = new Binary(Buffer.from(head.data));

    const thumbnailUrl = await imageRepo.uploadImage(
        "heroes/thumbnail/",
        hero["_id"],
        headBinary
    );
    hero["thumbnail"] = thumbnailUrl;

    hero["skills"] = [];

    for (const _ of hero_data.heroskilllist) {
        for (const skill_ of _.skilllist) {
            let skill = hero["skills"].find(
                (s: any) =>
                    s.id === skill_.skillid && s.name === skill_.skillname
            ) || {
                id: skill_.skillid,
                name: skill_.skillname,
                description: (() => {
                    const htmlContent = convertToHTML5(skill_["skilldesc"]);
                    const $ = cheerio.load(htmlContent);

                    $("br").replaceWith("\n");

                    return $("body").text().trim();
                })(),
                images: "toadd",
                tags: skill_["skilltag"].map((tag: any) => {
                    return tag.tagname.toLowerCase().replace(" ", "_");
                }),
            };

            if (skill.images === "toadd") {
                const skillImage = await axios.get(skill_["skillicon"], {
                    responseType: "arraybuffer",
                });
                const skillImageBinary = new Binary(
                    Buffer.from(skillImage.data)
                );
                const skillImageUrl = await imageRepo.uploadImage(
                    "heroes/skills/",
                    skill_.skillid,
                    skillImageBinary
                );
                skill.images = [
                    {
                        icon: skillImageUrl,
                        default: true,
                    },
                ];
            }

            const { cd, type, cost }: any = parseSkills(skill_["skillcd&cost"]);

            if (!hero["resource"] && type) hero["resource"] = type;

            if (!hero["skills"].includes(skill)) hero["skills"].push(skill);
        }
    }

    heroRepo.upsert(hero);
}
