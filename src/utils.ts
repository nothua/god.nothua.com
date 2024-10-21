import { readdirSync } from "fs";
import ServiceLocator from "./classes/ServiceLocator";
import { basename, join } from "path";

export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const pass = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return pass;
}

export async function comparePassword(
    password: string,
    hashedPassword: string
): Promise<Boolean> {
    const passwordHash = await hashPassword(password);

    return passwordHash === hashedPassword;
}

export const registerServicesFromDirectory = async () => {
    const dir = join(__dirname, "../src/repositories");
    const serviceLocator = getServiceLocator();

    const files = readdirSync(dir);

    const loadedRepo: { [key: string]: any } = {};
    const importPromises = files.map(async (file) => {
        if (!file.endsWith(".ts") && !file.endsWith(".js")) return;

        const filePath = join(dir, file);

        try {
            const module = await import(filePath);
            const dependencyName = basename(filePath, ".ts");

            for (const exportName in module) {
                const dependency = module[exportName];

                if (typeof dependency === "function") {
                    const instance = new dependency();
                    serviceLocator.register(
                        dependencyName,
                        () => instance,
                        true
                    );
                    loadedRepo[dependencyName] = instance;
                }
            }
        } catch (err) {
            console.error(`Failed to load module ${filePath}:`, err);
        }
    });
    await Promise.all(importPromises).then(() => {
        console.table(loadedRepo);
    });
};

export const getServiceLocator = () => {
    return ServiceLocator.getInstance();
};

export function parseSkills(skillString: string) {
    skillString = skillString.toLowerCase();
    const cdMatch = skillString.match(/cd:\s*(\d+)/);
    const manaMatch = skillString.match(/\b(?:energy|mana) cost:\s*(\d+)/);

    let cd, type, cost;

    if (cdMatch) {
        cd = parseInt(cdMatch[1], 10);
    }
    if (manaMatch) {
        type = manaMatch[0].split(" ")[0];
        cost = parseInt(manaMatch[1], 10);
    }

    return { cd, type, cost };
}

export function convertToHTML5(skillDesc: any) {
    return skillDesc
        .replace(
            /<font color="([^"]+)">(.*?)<\/font>/g,
            (match: any, color: any, text: any) => {
                return `<span style="color: ${color};">${text}</span>`;
            }
        )
        .replace(/\n/g, "<br>");
}

export function reform_string(str: String) {
    return str.replace(/[^A-Z0-9]+/gi, "_").toLowerCase();
}
