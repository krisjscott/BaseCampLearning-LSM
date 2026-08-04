export const levelMilestones = [
  { name: "Starter", minXp: 0, nextXp: 100 },
  { name: "Builder", minXp: 100, nextXp: 4000 },
  { name: "Achiever", minXp: 4000, nextXp: 7500 },
  { name: "Champion", minXp: 7500, nextXp: null },
] as const;

export function getLevelProgress(xpPoints: number) {
  let currentIndex = 0;

  levelMilestones.forEach((level, index) => {
    if (xpPoints >= level.minXp) currentIndex = index;
  });

  const current = levelMilestones[Math.max(currentIndex, 0)];
  const next = current.nextXp == null ? null : levelMilestones[currentIndex + 1] || null;
  const target = current.nextXp ?? current.minXp;
  const span = Math.max(target - current.minXp, 1);
  const earnedInLevel = Math.max(xpPoints - current.minXp, 0);
  const percentage = current.nextXp == null ? 100 : Math.min(Math.round((earnedInLevel / span) * 100), 100);
  const remaining = current.nextXp == null ? 0 : Math.max(current.nextXp - xpPoints, 0);

  return {
    current,
    currentIndex,
    next,
    target,
    percentage,
    remaining,
  };
}
