/**
 * AwardHub Scoring Calculator
 * Computes transparent, hybrid weighted rankings based on judge evaluations and public votes
 */

export function calculateCategoryResults(category, nominations, judgeScores, votes) {
  if (!category) return [];

  // Filter approved nominations in this category
  const categoryNominations = nominations.filter(
    (n) => n.categoryId === category.id && n.status === 'Approved'
  );

  // Filter votes in this category
  const categoryVotes = votes.filter((v) => v.categoryId === category.id);
  const totalCategoryVotes = categoryVotes.length;

  const results = categoryNominations.map((nom) => {
    // 1. Calculate Judge Evaluation Score
    const evaluations = judgeScores.filter((e) => e.nominationId === nom.id);
    let judgeAvgScore = 0;

    if (evaluations.length > 0) {
      const sumScores = evaluations.reduce((acc, evalItem) => {
        if (evalItem.weightedScore) {
          return acc + Number(evalItem.weightedScore);
        }
        // Fallback: calculate from criteria
        let itemScore = 0;
        category.rubric.forEach((crit) => {
          const score = evalItem.criteriaScores?.[crit.id] || 0;
          itemScore += (score / crit.maxScore) * (crit.weight / 100) * 10;
        });
        return acc + itemScore;
      }, 0);

      judgeAvgScore = Number((sumScores / evaluations.length).toFixed(2));
    }

    // Convert judge score (out of 10) to 100-point scale
    const judgeNormalized100 = Number((judgeAvgScore * 10).toFixed(2));

    // 2. Calculate Public Vote Metrics
    const nomVotesCount = categoryVotes.filter((v) => v.nomineeId === nom.id).length;
    const publicVoteSharePct = totalCategoryVotes > 0
      ? Number(((nomVotesCount / totalCategoryVotes) * 100).toFixed(2))
      : 0;

    // 3. Apply Category Weighting Configuration
    const judgeWeight = category.weights?.judge || 0;
    const publicWeight = category.weights?.public || 0;

    let finalScore = 0;
    if (category.evaluationMode === 'judge_only') {
      finalScore = judgeNormalized100;
    } else if (category.evaluationMode === 'public_only') {
      finalScore = publicVoteSharePct;
    } else {
      // Hybrid evaluation: W_j * Judge% + W_p * Public%
      const judgePart = judgeNormalized100 * (judgeWeight / 100);
      const publicPart = publicVoteSharePct * (publicWeight / 100);
      finalScore = Number((judgePart + publicPart).toFixed(2));
    }

    return {
      nominationId: nom.id,
      anonymousId: nom.anonymousId,
      nomineeName: nom.nomineeName,
      title: nom.title,
      institution: nom.institution,
      evaluationCount: evaluations.length,
      judgeAvgScore, // out of 10
      judgeNormalized100, // out of 100
      publicVotes: nomVotesCount,
      publicVoteSharePct,
      judgeWeight,
      publicWeight,
      finalScore,
      isWinner: category.winnerId === nom.id
    };
  });

  // Sort descending by finalScore
  results.sort((a, b) => b.finalScore - a.finalScore);

  // Assign ranks and identify ties
  let currentRank = 1;
  for (let i = 0; i < results.length; i++) {
    if (i > 0 && results[i].finalScore === results[i - 1].finalScore) {
      results[i].rank = results[i - 1].rank;
      results[i].isTie = true;
      results[i - 1].isTie = true;
    } else {
      results[i].rank = currentRank;
      results[i].isTie = false;
    }
    currentRank++;
  }

  return results;
}
