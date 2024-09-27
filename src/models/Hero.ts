import { Document, Schema, model } from "mongoose";
import { split } from "postcss/lib/list";

export enum Resource {
      "Mana" = "mana",
      "Energy" = "energy",
      "Rage" = "rage",
      "None" = "none",
}

export enum RoleType {
      "Fighter" = "fighter",
      "Tank" = "tank",
      "Assasssin" = "assassin",
      "Mage" = "mage",
      "Marksman" = "marksman",
      "Support" = "support",
}

export enum Position {
      "EXP" = "exp",
      "Mid" = "mid",
      "Gold" = "gold",
      "Jungle" = "jungle",
      "Roam" = "roam",
}

export enum SkillTags {
      "Buff" = "buff",
      "Damage" = "damage",
      "Heal" = "heal",
      "Shield" = "shield",
      "AOE" = "aoe",
      "CC" = "cc",
      "Morph" = "morph",
      "Mobility" = "mobility",
      "Speed Up" = "speed_up",
      "Teleport" = "teleport",
      "Burst" = "burst",
      "Slow" = "slow",
      "Conceal" = "conceal",
      "Summon" = "summon",
      "Charge" = "charge",
      "Attach" = "attach",
      "Invincible" = "invincible",
      "CC Immune" = "cc_immune",
      "Death Immunity" = "death_immunity",
      "Remove CC" = "remove_cc",
      "Reduce DMG" = "reduce_dmg",
      "Debuff" = "debuff",
      "Camouflage" = "camouflage",
}

export enum SkillType {
      "Active" = "active",
      "Passive" = "passive",
}

const schema = new Schema({
      _id: { type: Number, required: true },
      name: { type: String, required: true },
      thumbnail: { type: String, required: true },
      painting: { type: String, required: true },
      story: { type: String, required: true },
      resource: {
            type: String,
            enum: Object.values(Resource),
            default: Resource.None,
      },
      skins: [
            {
                  name: { type: String },
                  image: { type: String },
                  banner: { type: String },
                  thumbnail: { type: String },
                  default: { type: Boolean },
            },
      ],
      role: {
            primary: {
                  type: String,
                  enum: RoleType,
                  required: true,
            },
            secondary: {
                  type: String,
                  enum: RoleType,
                  default: null,
            },
      },
      skills: [
            {
                  id: {
                        type: Number,
                  },
                  name: String,
                  description: String,
                  images: [
                        {
                              icon: String,
                              default: Boolean,
                        },
                  ],
                  scaling: [
                        {
                              level: Number,
                              name: String,
                              value: String,
                        },
                  ],
                  level_priority: [Number],
                  tags: [
                        {
                              type: String,
                              enum: SkillTags,
                        },
                  ],
                  type: {
                        type: String,
                        enum: SkillType,
                  },
                  video: String,
                  replace: {
                        type: Number,
                  },
            },
      ],
      builds: [
            {
                  position: {
                        type: String,
                        enum: Position,
                        required: true,
                  },
                  items: [
                        {
                              item: {
                                    type: Number,
                                    ref: "Item",
                              },
                        },
                  ],
                  pathing: [
                        {
                              item: {
                                    type: Number,
                                    ref: "Item",
                              },
                        },
                  ],
                  emblem: [
                        {
                              emblem: {
                                    type: Number,
                                    ref: "Emblem",
                              },
                        },
                  ],
                  spells: [
                        {
                              spell: {
                                    type: Number,
                                    ref: "Spell",
                              },
                        },
                  ],
                  blessings: [
                        {
                              blessing: {
                                    type: Number,
                                    ref: "Blessing",
                              },
                        },
                  ],
            },
      ],
      gameplan: [
            {
                  title: String,
                  description: String,
            },
      ],
      attributes: {
            hp: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            resource: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            hpRegen: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            resourceRegen: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            physicalAttack: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            magicPower: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            physicalDefense: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            magicDefense: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            attackSpeed: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            attackSpeedRatio: {
                  percentage: { type: Number, default: 0 },
            },
            movementSpeed: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            cooldownReduction: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            criticalChance: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            criticalDamage: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            lifesteal: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            spellVamp: {
                  base: { type: Number, required: true, default: 0 },
                  growth: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            resilience: {
                  base: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            damageReduction: {
                  base: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            healingEffect: {
                  base: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            healingReceived: {
                  base: { type: Number, required: true, default: 0 },
                  percentage: { type: Number, default: 0 },
            },
            basicAttackRange: {
                  base: { type: Number, required: true, default: 0 },
            },
      },
      ratings: {
            durability: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            offense: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            crowd_effects: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            difficulty: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            early_game: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            mid_game: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            late_game: {
                  type: Number,
                  required: true,
                  default: 0,
            },
            mobility: {
                  type: Number,
                  required: true,
                  default: 0,
            },
      },
});

export default model<Document>("Hero", schema);
