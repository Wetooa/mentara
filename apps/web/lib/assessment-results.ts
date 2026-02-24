import type { AurisStateDto, AurisResultDto } from "api-client";

const STATE_KEY = "auris_appstate";
const RESULTS_KEY = "auris_results";

/** Persists appState + results to sessionStorage before navigating to /client/results */
export function storeAssessmentResults(
    appState: AurisStateDto | null,
    results: AurisResultDto | null,
) {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(STATE_KEY, JSON.stringify(appState ?? {}));
    sessionStorage.setItem(RESULTS_KEY, JSON.stringify(results ?? {}));
}

/** Reads the stored assessment state from sessionStorage */
export function readAssessmentState(): AurisStateDto | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(STATE_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AurisStateDto; } catch { return null; }
}

/** Reads the stored assessment results from sessionStorage */
export function readAssessmentResults(): AurisResultDto | null {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(RESULTS_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AurisResultDto; } catch { return null; }
}
