import type { FormulaCategory, Gearbox } from 'shared';

const API_URL = import.meta.env.API_URL ?? 'http://localhost:4000/api/v1';

export interface Formula {
  _id: string;
  slug: string;
  nom: string;
  categorie: FormulaCategory;
  boite: Gearbox;
  heuresConduite?: number;
  dureeJours: number;
  prix: number;
  mensualiteAffichee?: number;
  pointsCles: string[];
  badge?: string;
  actif: boolean;
  ordre: number;
}

export interface City {
  _id: string;
  slug: string;
  nom: string;
  actif: boolean;
}

export interface MeetingPoint {
  _id: string;
  nom: string;
  adresse: string;
  boites: Gearbox[];
}

export interface PublicSession {
  _id: string;
  formulaId: { slug: string; nom: string; prix: number };
  meetingPointId: { nom: string };
  dates: Array<{ jour: string }>;
  placesRestantes: number;
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Echec de l'appel API au build : ${path} (HTTP ${response.status})`);
  }

  const body = (await response.json()) as { data: T };
  return body.data;
}

export function getFormulas(): Promise<Formula[]> {
  return apiGet<Formula[]>('/formulas');
}

export function getFormula(slug: string): Promise<Formula> {
  return apiGet<Formula>(`/formulas/${slug}`);
}

export function getCities(): Promise<City[]> {
  return apiGet<City[]>('/cities');
}

export function getMeetingPoints(citySlug: string): Promise<MeetingPoint[]> {
  return apiGet<MeetingPoint[]>(`/cities/${citySlug}/meeting-points`);
}

export function getSessions(filters: {
  formula?: string;
  city?: string;
  boite?: string;
}): Promise<PublicSession[]> {
  const params = new URLSearchParams();
  if (filters.formula) params.set('formula', filters.formula);
  if (filters.city) params.set('city', filters.city);
  if (filters.boite) params.set('boite', filters.boite);

  return apiGet<PublicSession[]>(`/sessions?${params.toString()}`);
}
