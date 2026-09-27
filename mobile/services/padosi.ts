import { del, get, post, put } from './api';

export interface User {
  id: string;
  email: string;
  mobile: string;
  emailVerified: boolean;
  profileComplete: boolean;
}

export interface Profile {
  id: string;
  fullName: string;
  mobile: string;
  address: string;
  city: string;
  society?: string | null;
  flatUnit?: string | null;
  gateNotes?: string | null;
  businessName?: string | null;
}

export interface Category {
  title: string;
  description: string;
  icon: string;
  comingSoon: boolean;
  kinds: string[];
  servicesByKind: Record<string, string[]>;
}

export interface ServiceRequest {
  id: string;
  category: string;
  service?: string | null;
  helpKind?: string | null;
  urgency?: string | null;
  details?: string | null;
  status: string;
}

export const authService = {
  register: (email: string, mobile: string) =>
    post<{ ok: boolean; message: string; devOtp?: string }>('/auth/register', { email, mobile }),
  sendOtp: (email: string) => post<{ ok: boolean; message: string; devOtp?: string }>('/auth/send-otp', { email }),
  verifyOtp: (email: string, code: string) =>
    post<{ ok: boolean; token: string; user: User; profile: Profile | null }>('/auth/verify-otp', { email, code }),
  login: (identifier: string) =>
    post<{ ok: boolean; message: string; devOtp?: string; email?: string }>('/auth/login', { identifier }),
  me: () => get<{ ok: boolean; user: User; profile: Profile | null }>('/auth/me'),
  logout: () => post<{ ok: boolean }>('/auth/logout'),
};

export const profileService = {
  fetch: () => get<{ ok: boolean; profile: Profile | null }>('/profile'),
  save: (data: Omit<Profile, 'id' | 'mobile'>) =>
    put<{ ok: boolean; message: string; profile: Profile }>('/profile', data),
};

export const taskService = {
  list: () => get<{ ok: boolean; tasks: Category[] }>('/tasks'),
  createRequest: (data: { category: string; service?: string; helpKind?: string; urgency?: string; details?: string }) =>
    post<{ ok: boolean; message: string; request: ServiceRequest }>('/requests', data),
};

export interface HouseholdMember {
  id: string;
  name: string;
  relation: string;
  notes?: string | null;
}

export const RELATIONS = ['Parent', 'Spouse', 'Child', 'Sibling', 'Pet', 'Other'] as const;

export const householdService = {
  list: () => get<{ ok: boolean; members: HouseholdMember[] }>('/household'),
  add: (data: { name: string; relation: string; notes?: string }) =>
    post<{ ok: boolean; member: HouseholdMember }>('/household', data),
  remove: (id: string) => del<{ ok: boolean }>(`/household/${id}`),
};
