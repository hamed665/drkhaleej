import { getPublicInternalLinkBudgetPolicy } from './link-budget-policy';
import {
  isProjectablePublicInternalLink,
  type PublicInternalLinkCandidate,
  type PublicInternalLinkProjection,
  type PublicInternalLinkSourcePageType,
} from './types';

export type PublicInternalLinkProjectionInput = {
  sourcePageType: PublicInternalLinkSourcePageType;
  sourceEntityId: string;
  candidates: PublicInternalLinkCandidate[];
};

function projectionTargetKey(candidate: PublicInternalLinkCandidate): string {
  return `${candidate.targetPageType}:${candidate.targetEntityType}:${candidate.targetEntityId}`;
}

function projectionAnchorKey(candidate: PublicInternalLinkCandidate): string {
  return `${candidate.anchorEn.trim().toLocaleLowerCase()}|${candidate.anchorAr.trim().toLocaleLowerCase()}`;
}

function violatesImportedHospitalHold(candidate: PublicInternalLinkCandidate): boolean {
  return candidate.targetEntityType === 'hospital' && candidate.reason.includes('imported_hospital_held');
}

export function projectPublicInternalLinks(
  input: PublicInternalLinkProjectionInput,
): PublicInternalLinkProjection[] {
  const budget = getPublicInternalLinkBudgetPolicy(input.sourcePageType);
  const seenTargets = new Set<string>();
  const seenAnchors = new Set<string>();

  const projected: PublicInternalLinkProjection[] = [];

  for (const candidate of [...input.candidates].sort((a, b) => b.priority - a.priority)) {
    if (candidate.sourcePageType !== input.sourcePageType) continue;
    if (candidate.sourceEntityId !== input.sourceEntityId) continue;
    if (violatesImportedHospitalHold(candidate)) continue;
    if (!isProjectablePublicInternalLink(candidate)) continue;

    const targetKey = projectionTargetKey(candidate);
    if (seenTargets.has(targetKey)) continue;

    const anchorKey = projectionAnchorKey(candidate);
    if (seenAnchors.has(anchorKey)) continue;

    seenTargets.add(targetKey);
    seenAnchors.add(anchorKey);
    projected.push(candidate);

    if (projected.length >= budget.maxTotal) break;
  }

  return projected;
}

export function hasMinimumPublicInternalLinkCoverage(
  input: PublicInternalLinkProjectionInput,
  minimumCount: number,
): boolean {
  if (minimumCount <= 0) return true;
  return projectPublicInternalLinks(input).length >= minimumCount;
}
