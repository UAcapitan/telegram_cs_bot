export type PersistedState = {
  spinCount: number;
  lastWonItemId: string | null;
  hasWon: boolean;
};

const STORAGE_KEY = 'case_opening_state_v1';

const DEFAULT_STATE: PersistedState = {
  spinCount: 0,
  lastWonItemId: null,
  hasWon: false,
};

export function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    return {
      spinCount: Math.max(0, Math.min(3, Number(parsed.spinCount) || 0)),
      lastWonItemId: parsed.lastWonItemId ?? null,
      hasWon: Boolean(parsed.hasWon),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): void {
  localStorage.removeItem(STORAGE_KEY);
}
