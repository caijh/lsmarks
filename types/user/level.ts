/**
 * 用户等级定义
 * 基于传统文化的等级体系设计
 */

export enum UserLevelEnum {
  LEVEL_1 = 1, // 初六
  LEVEL_2 = 2, // 九二
  LEVEL_3 = 3, // 六三
  LEVEL_4 = 4, // 九四
  LEVEL_5 = 5, // 六五
  LEVEL_6 = 6, // 上六
  LEVEL_7 = 7, // 用九
}

export interface UserLevelInfo {
  id: UserLevelEnum;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  hexagram: string; // 卦辞
  maxCollections: number; // 最大集合数
  maxBookmarks: number; // 最大书签数
  color: string; // 等级颜色
}

/**
 * 用户等级信息
 */
export const USER_LEVELS: UserLevelInfo[] = [
  {
    id: UserLevelEnum.LEVEL_1,
    name: "初六",
    nameEn: "Initial Six",
    description: "用拳如用脚，安贞吉",
    descriptionEn: "Using the fist as using the foot. Correctness brings good fortune.",
    hexagram: "初六",
    maxCollections: 1,
    maxBookmarks: 2000,
    color: "text-slate-500",
  },
  {
    id: UserLevelEnum.LEVEL_2,
    name: "九二",
    nameEn: "Nine in the Second",
    description: "田获三品，有功",
    descriptionEn: "Catching three foxes in the field. There is achievement.",
    hexagram: "九二",
    maxCollections: 1,
    maxBookmarks: 3000,
    color: "text-blue-500",
  },
  {
    id: UserLevelEnum.LEVEL_3,
    name: "六三",
    nameEn: "Six in the Third",
    description: "解而拇，朋至斯孚",
    descriptionEn: "Carrying burdens on the back, yet still riding in a carriage. This leads to bandits coming.",
    hexagram: "六三",
    maxCollections: 2,
    maxBookmarks: 5000,
    color: "text-emerald-500",
  },
  {
    id: UserLevelEnum.LEVEL_4,
    name: "九四",
    nameEn: "Nine in the Fourth",
    description: "解而拇，朋至斯孚",
    descriptionEn: "Dissolve your connection with your great toe. Then the companion comes, and you can trust him.",
    hexagram: "九四",
    maxCollections: 3,
    maxBookmarks: 6000,
    color: "text-amber-500",
  },
  {
    id: UserLevelEnum.LEVEL_5,
    name: "六五",
    nameEn: "Six in the Fifth",
    description: "君子维有解，吉；有孚于小人",
    descriptionEn: "The superior man dissolves the difficulties. Good fortune. He has confidence in the small people.",
    hexagram: "六五",
    maxCollections: 4,
    maxBookmarks: 7000,
    color: "text-purple-500",
  },
  {
    id: UserLevelEnum.LEVEL_6,
    name: "上六",
    nameEn: "Six at the Top",
    description: "公用射隼，于高墉之上，获之，无不利",
    descriptionEn: "The prince shoots a hawk on the high wall. He gets it. Everything serves to further.",
    hexagram: "上六",
    maxCollections: 5,
    maxBookmarks: 8000,
    color: "text-rose-500",
  },
  {
    id: UserLevelEnum.LEVEL_7,
    name: "用九",
    nameEn: "All Nines",
    description: "解卦之极，无不利",
    descriptionEn: "The ultimate release, everything serves to further.",
    hexagram: "用九",
    maxCollections: 999, // 实际上是无限
    maxBookmarks: 999999, // 实际上是无限
    color: "text-indigo-500",
  },
];

/**
 * 根据用户等级ID获取用户等级信息
 * @param levelId 用户等级ID
 * @returns 用户等级信息
 */
export function getUserLevelInfo(levelId: UserLevelEnum): UserLevelInfo {
  return USER_LEVELS.find((level) => level.id === levelId) || USER_LEVELS[0];
}

/**
 * 根据用户等级ID获取下一个用户等级信息
 * @param levelId 用户等级ID
 * @returns 下一个用户等级信息，如果已经是最高等级则返回null
 */
export function getNextUserLevelInfo(levelId: UserLevelEnum): UserLevelInfo | null {
  const nextLevelId = levelId + 1 as UserLevelEnum;
  return nextLevelId <= UserLevelEnum.LEVEL_7
    ? USER_LEVELS.find((level) => level.id === nextLevelId) || null
    : null;
}
