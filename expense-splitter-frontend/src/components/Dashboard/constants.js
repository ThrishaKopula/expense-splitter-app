// src/components/Dashboard/constants.js

export const EXPENSE_CATEGORIES = [
  "Housing", "Food", "Transportation", "Utilities", "Personal Care",
  "Debt", "Entertainment", "Income", "Other",
];

export const COLORS_LIST = [
  '#0cb0a9', '#f78c6b', '#06d6a0', '#ffd166', '#118ab2',
  '#ef476f', '#0c637f', '#83d483', '#073b4c',
];

export const FILTER_PERIODS = ['ALL TIME', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'];

export const CATEGORY_COLOR_MAP = EXPENSE_CATEGORIES.reduce((map, category, index) => {
  map[category] = COLORS_LIST[index % COLORS_LIST.length];
  return map;
}, {});

export const ITEMS_PER_PAGE = 5;