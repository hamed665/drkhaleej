import { getPublicInternalLinkBudgetPolicy } from './link-budget-policy';
import {
  isProjectablePublicInternalLink,
  type PublicInternalLinkCandidate,
  type PublicInternalLinkProjection,
  type PublicInternalLinkSourcePageType,
} from './types';

export type PublicInternalLinkFixtureInput = {
  sourcePageType: PublicInternalLinkSourcePageType;
  sourceEntityId: string;
  candidates: PublicInternalLinkCandidate[];
};

function candidateKey(candidate: PublicInternalLinkCandidate): string {
  return `${candidate.targetPageType}:${candidate.targetEntityType}:${candidate.targetEntityId}`;
}

function anchorKey(candidate: PublicInternalLinkCandidate): string {
  return `${candidate.anchorEn.trim().toLocaleLowerCase()}|${candidate.anchorAr.trim().toLocaleLowerCase()}`;
}

function isImportedHospitalHeldCandidate(candidate: PublicInternalLinkCandidate): boolean {
  return candidate.targetEntityType === 'hospital' && candidate.reason.includes('imported_hospital_held');
}

export function buildInternalLinkCandidatesFromFixture(
  input: PublicInternalLinkFixtureInput,
): PublicInternalLinkProjection[] {
  const budget = getPublicInternalLinkBudgetPolicy(input.sourcePageType);
  const seenTargets = new Set<string>();
  const seenAnchors = new Set<string>();

  return input.candidates
    .filter((candidate) => candidate.sourcePageType === input.sourcePageType)
    .filter((candidate) => candidate.sourceEntityId === input.sourceEntityId)
    .filter((candidate) => !isImportedHospitalHeldCandidate(candidate))
    .filter(isProjectablePublicInternalLink)
    .sort((a, b) => b.priority - a.priority)
    .filter((candidate) => {
      const key = candidateKey(candidate);
      if (seenTargets.has(key)) return false;
      seenTargets.add(key);
      return true;
    })
    .filter((candidate) => {
      const key = anchorKey(candidate);
      if (seenAnchors.has(key)) return false;
      seenAnchors.add(key);
      return true;
    })
    .slice(0, budget.maxTotal);
}
