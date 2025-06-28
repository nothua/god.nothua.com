import { writeFileSync } from "fs";
import { EMBLEMS, EMBLEM_TALENTS, SPELLS } from "../src/urls";
import { convertToHTML5, getServiceLocator } from "../src/utils";
import type EmblemRepository from "../src/repositories/EmblemRepository";
import axios from "axios";
import { getHeroesCount } from "./fetchHeroes";
import { Binary } from "mongodb";
import { ImageRepository } from "../src/classes/ImageRepository";
import * as cheerio from "cheerio";
import type TalentRepository from "../src/repositories/TalentRepository";

const serviceLocator = getServiceLocator();

async function fetchData(url: string) {
    const request = await axios.post(url, {
        pageSize: await getHeroesCount(),
        filters: [],
        sorts: [],
        pageIndex: 1,
        fields: [],
    });

    if (!request.data) {
        throw new Error("No data found");
    }

    return request.data.data.records;
}

export async function fetchEmblems() {
    const emblems = await fetchData(EMBLEMS());

    const parsedEmblems = [];
    for (const emblem of emblems) {
        const emblemIcon = emblem.data.emblem_icon;
        const emblemData = emblem.data.emblem_detail.data;

        const attributes = [];

        const emblemAttrs = emblemData.emblemattr.emblemattr.split("\n");

        for (const attr_ of emblemAttrs) {
            const percentage = attr_.includes("%");
            const attr_value = parseInt(attr_);
            const attr_name = attr_
                .replace(attr_value.toString(), "")
                .replace("+", "")
                .replace("%", "")
                .trim();

            if (!Number.isNaN(attr_value)) {
                attributes.push({
                    name: !percentage ? attr_name : attr_name + " %",
                    value: attr_value,
                });
            }
        }

        parsedEmblems.push({
            image: emblemIcon,
            name:
                emblemData.emblemname == "All"
                    ? "Common"
                    : emblemData.emblemname,
            attributes,
            _id: emblemData.emblemid,
        });
    }

    return parsedEmblems;
}

export async function fetchTalents() {
    const talents = await fetchData(EMBLEM_TALENTS());

    const parsedTalents = [];
    for (const talent of talents) {
        const talentTier = talent.data.gifttiers;
        const talentData = talent.data.emblemskill;
        const imageIcon = talentData.skillicon;

        const skilldesc = talentData.skilldesc;

        parsedTalents.push({
            image: imageIcon,
            tier: talentTier,
            name: talentData.skillname,
            description: (() => {
                const htmlContent = convertToHTML5(skilldesc);
                const $ = cheerio.load(htmlContent);

                $("br").replaceWith("\n");

                return $("body").text().trim();
            })(),
            _id: talentData.skillid,
        });
    }

    return parsedTalents;
}

export async function updateEmblems() {
    const emblems = await fetchEmblems();
    const imageRepo = ImageRepository.getInstance();
    const emblemsRepo =
        serviceLocator.resolve<EmblemRepository>("EmblemRepository");

    for (const emblem of emblems) {
        console.log("Updating emblem: ", emblem.name);

        const emblemImage = await axios.get(emblem.image, {
            responseType: "arraybuffer",
        });
        const emblemImageBinary = new Binary(Buffer.from(emblemImage.data));
        const emblemImageUrl = await imageRepo.uploadImage(
            "emblems/",
            emblem._id,
            emblemImageBinary
        );
        emblem.image = emblemImageUrl;

        const entry = await emblemsRepo.upsert(emblem);
        console.log("Emblem updated: ", entry);
    }
}


export async function updateTalents() {
    const talents = await fetchTalents();
    const imageRepo = ImageRepository.getInstance();
    const talentRepo =
        serviceLocator.resolve<TalentRepository>("TalentRepository");

    for (const talent of talents) {
        console.log("Updating talent: ", talent.name);

        const talentImage = await axios.get(talent.image, {
            responseType: "arraybuffer",
        });
        const talentImageBinary = new Binary(Buffer.from(talentImage.data));
        const talentImageUrl = await imageRepo.uploadImage(
            "talents/",
            talent._id,
            talentImageBinary
        );
        talent.image = talentImageUrl;

        const entry = await talentRepo.upsert(talent);
        console.log("Talent updated: ", entry);
    }
}