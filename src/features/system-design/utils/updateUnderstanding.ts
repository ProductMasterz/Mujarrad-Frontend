import type { SystemUnderstanding } from '../types/layer1.types';

export function mergeUnderstanding(oldU: SystemUnderstanding, newU: SystemUnderstanding): SystemUnderstanding {
  return {
    ...oldU,
    ...newU
  };
}
