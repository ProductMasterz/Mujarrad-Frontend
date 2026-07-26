import type {
  Layer1GraphState,
} from '../types/graph.types';

import type {
  MujarradSaveDestination,
} from '../types/layer1.types';

import {
  buildLayer1MujarradPayload,
} from '../utils/layer1MujarradPayload';

export interface SaveLayer1ToMujarradResult {
  ok: boolean;
  backendNodeId?: string;
  error?: string;
}

export async function saveLayer1ToMujarrad(
  state: Layer1GraphState,
  destination: MujarradSaveDestination,
): Promise<SaveLayer1ToMujarradResult> {
  const payload = buildLayer1MujarradPayload(state);

  void payload;
  void destination;

  return {
    ok: false,
    error:
      'Mujarrad backend save endpoint is not configured yet. Provide the endpoint to enable this action.',
  };
}
