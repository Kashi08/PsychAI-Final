export const AVATAR_SEEDS = [
  // Human-like Micah avatars
  'Felix', 'Aneka', 'Jasper', 'Milo', 'Luna', 'Cleo', 'Leo', 'Mia',
  'Oliver', 'Noah', 'Emma', 'Ava', 'Sophia', 'Isabella', 'Lucas', 'Mason',
  'Elijah', 'Logan', 'Aiden', 'Chloe', 'Zoe', 'Lily', 'Ella', 'Amelia',
  'Henry', 'Liam', 'Evelyn', 'Abigail', 'Harper', 'Emily', 'Avery', 'Madison'
];

export const getAvatarUrl = (seed: string) => {
  if (!seed) return 'https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=transparent';
  
  // All seeds now use the Micah style to keep them human-like. Enforce happy mouths.
  return `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=transparent&mouth=smile,smirk,laughing,pucker`;
};
