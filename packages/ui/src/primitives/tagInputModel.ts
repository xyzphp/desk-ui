export type TagRejectionReason = 'duplicate' | 'limit' | 'length' | 'invalid';
export interface TagRejection { value: string; reason: TagRejectionReason }
export interface TagInputLabels {
  placeholder: string;
  required: string;
  duplicate: (value: string) => string;
  limit: (limit: number) => string;
  length: (limit: number) => string;
  invalid: (value: string) => string;
  added: (count: number) => string;
}
export interface TagValidation {
  maxTags?: number;
  maxTagLength?: number;
  validateTag?: (value: string) => boolean;
}

export const tagLimit = (value?: number) => value !== undefined && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : Infinity;
export const splitTags = (text: string) => text.split(/[,，\r\n]+/).map((value) => value.trim()).filter(Boolean);

export function addTags(current: readonly string[], candidates: string[], options: TagValidation) {
  const next = [...current];
  const accepted: string[] = [];
  const rejected: TagRejection[] = [];
  const seen = new Set(current);
  for (const value of candidates) {
    const reason: TagRejectionReason | undefined = seen.has(value) ? 'duplicate'
      : Array.from(value).length > tagLimit(options.maxTagLength) ? 'length'
        : options.validateTag && !options.validateTag(value) ? 'invalid'
          : next.length >= tagLimit(options.maxTags) ? 'limit' : undefined;
    if (reason) rejected.push({ value, reason });
    else { next.push(value); seen.add(value); accepted.push(value); }
  }
  return { next, accepted, rejected };
}
