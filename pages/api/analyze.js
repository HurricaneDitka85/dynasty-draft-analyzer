export default async function handler(req, res) {
  const userId = process.env.SLEEPER_USER_ID || "911578685892915200";
  const leagueId = process.env.SLEEPER_LEAGUE_ID || "1180303867694456832";

  try {
    const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    const league = await leagueRes.json();

    const usersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    const users = await usersRes.json();

    const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    const rosters = await rostersRes.json();

    const draftsRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/drafts`);
    const drafts = await draftsRes.json();

    const ownerStats = await analyzeAllOwners(drafts, rosters, users, userId);
    const userStats = ownerStats.find(stat => stat.isYou);

    res.status(200).json({
      league,
      drafts,
      ownerStats,
      userStats
    });
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
}

async function analyzeAllOwners(drafts, rosters, users, currentUserId) {
  const ownerMap = new Map();

  for (const draft of drafts) {
    const picksRes = await fetch(`https://api.sleeper.app/v1/draft/${draft.draft_id}/picks`);
    const picks = await picksRes.json();

    for (const pick of picks) {
      if (!pick.roster_id) continue;

      const roster = rosters.find(r => r.roster_id === pick.roster_id);
      if (!roster) continue;

      const ownerId = roster.owner_id;
      
      if (!ownerMap.has(ownerId)) {
        const user = users.find(u => u.user_id === ownerId);
        ownerMap.set(ownerId, {
          id: ownerId,
          name: user?.display_name || user?.username || 'Unknown',
          picks: [],
          hits: 0,
          retained: 0,
          totalPoints: 0,
          isYou: ownerId === currentUserId
        });
      }

      const ownerData = ownerMap.get(ownerId);
      const isRetained = roster.players?.includes(pick.player_id);
      const isHit = isRetained;
      
      ownerData.picks.push(pick);
      if (isHit) ownerData.hits++;
      if (isRetained) ownerData.retained++;
    }
  }

  const ownerStats = Array.from(ownerMap.values()).map(owner => ({
    ...owner,
    totalPicks: owner.picks.length,
    hitRate: owner.picks.length > 0 ? Math.round((owner.hits / owner.picks.length) * 100) : 0,
    retentionRate: owner.picks.length > 0 ? Math.round((owner.retained / owner.picks.length) * 100) : 0,
    avgPointsPerPick: owner.picks.length > 0 ? Math.round(owner.totalPoints / owner.picks.length) : 0
  }));

  ownerStats.sort((a, b) => b.hitRate - a.hitRate);

  ownerStats.forEach((owner, idx) => {
    owner.leagueRank = idx + 1;
    
    if (owner.isYou) {
      owner.strengths = [];
      owner.weaknesses = [];
      owner.tradeRecommendations = [];

      const avgHitRate = ownerStats.reduce((sum, o) => sum + o.hitRate, 0) / ownerStats.length;
      const avgRetention = ownerStats.reduce((sum, o) => sum + o.retentionRate, 0) / ownerStats.length;

      if (owner.hitRate > avgHitRate) {
        owner.strengths.push(`Your ${owner.hitRate}% hit rate is above league average (${Math.round(avgHitRate)}%)`);
      } else {
        owner.weaknesses.push(`Your ${owner.hitRate}% hit rate is below league average (${Math.round(avgHitRate)}%)`);
        owner.tradeRecommendations.push("Consider trading future picks to more successful drafters in your league");
      }

      if (owner.retentionRate > avgRetention) {
        owner.strengths.push(`You retain players well (${owner.retentionRate}% vs ${Math.round(avgRetention)}% avg)`);
      } else {
        owner.weaknesses.push(`You drop picks too quickly (${owner.retentionRate}% retention vs ${Math.round(avgRetention)}% avg)`);
      }

      if (owner.leagueRank <= 3) {
        owner.strengths.push("You're a top-3 drafter in your league!");
      } else if (owner.leagueRank >= ownerStats.length - 2) {
        owner.tradeRecommendations.push("Focus on trading for proven players rather than relying on your draft picks");
      }
    }
  });

  return ownerStats;
}
