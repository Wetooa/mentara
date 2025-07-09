import { AxiosInstance } from 'axios';
import {
  SessionCreateDto,
  SessionUpdateDto,
  Session,
  SessionListParams,
  SessionListResponse,
  SessionStats,
} from '@/types/api/sessions';

export interface SessionService {
  // Session CRUD operations
  create(data: SessionCreateDto): Promise<Session>;
  getById(sessionId: string): Promise<Session>;
  update(sessionId: string, data: SessionUpdateDto): Promise<Session>;
  delete(sessionId: string): Promise<{ deleted: boolean }>;
  
  // Session listing and filtering
  getList(params?: SessionListParams): Promise<SessionListResponse>;
  getByClient(clientId: string, params?: Omit<SessionListParams, 'clientId'>): Promise<SessionListResponse>;
  getByTherapist(therapistId: string, params?: Omit<SessionListParams, 'therapistId'>): Promise<SessionListResponse>;
  
  // Session management
  start(sessionId: string): Promise<Session>;
  complete(sessionId: string, data: { actualDuration: number; notes?: string; outcomes?: string[] }): Promise<Session>;
  cancel(sessionId: string, reason?: string): Promise<Session>;
  markNoShow(sessionId: string): Promise<Session>;
  
  // Session analytics
  getStats(params?: { clientId?: string; therapistId?: string; startDate?: string; endDate?: string }): Promise<SessionStats>;
  
  // Session notes and outcomes
  updateNotes(sessionId: string, notes: string): Promise<Session>;
  addOutcome(sessionId: string, outcome: string): Promise<Session>;
  setHomework(sessionId: string, homework: string[]): Promise<Session>;
  setNextSessionPlan(sessionId: string, plan: string): Promise<Session>;
}

export const createSessionService = (client: AxiosInstance): SessionService => ({
  // Session CRUD operations
  create: (data: SessionCreateDto): Promise<Session> =>
    client.post('/sessions', data),

  getById: (sessionId: string): Promise<Session> =>
    client.get(`/sessions/${sessionId}`),

  update: (sessionId: string, data: SessionUpdateDto): Promise<Session> =>
    client.put(`/sessions/${sessionId}`, data),

  delete: (sessionId: string): Promise<{ deleted: boolean }> =>
    client.delete(`/sessions/${sessionId}`),

  // Session listing and filtering
  getList: (params: SessionListParams = {}): Promise<SessionListResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.clientId) searchParams.append('clientId', params.clientId);
    if (params.therapistId) searchParams.append('therapistId', params.therapistId);
    if (params.sessionType) searchParams.append('sessionType', params.sessionType);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/sessions${queryString}`);
  },

  getByClient: (clientId: string, params: Omit<SessionListParams, 'clientId'> = {}): Promise<SessionListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('clientId', clientId);
    
    if (params.sessionType) searchParams.append('sessionType', params.sessionType);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return client.get(`/sessions?${searchParams.toString()}`);
  },

  getByTherapist: (therapistId: string, params: Omit<SessionListParams, 'therapistId'> = {}): Promise<SessionListResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.append('therapistId', therapistId);
    
    if (params.sessionType) searchParams.append('sessionType', params.sessionType);
    if (params.status) searchParams.append('status', params.status);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);
    if (params.limit) searchParams.append('limit', params.limit.toString());
    if (params.offset) searchParams.append('offset', params.offset.toString());
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    return client.get(`/sessions?${searchParams.toString()}`);
  },

  // Session management
  start: (sessionId: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/start`),

  complete: (sessionId: string, data: { actualDuration: number; notes?: string; outcomes?: string[] }): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/complete`, data),

  cancel: (sessionId: string, reason?: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/cancel`, { reason }),

  markNoShow: (sessionId: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/no-show`),

  // Session analytics
  getStats: (params: { clientId?: string; therapistId?: string; startDate?: string; endDate?: string } = {}): Promise<SessionStats> => {
    const searchParams = new URLSearchParams();
    
    if (params.clientId) searchParams.append('clientId', params.clientId);
    if (params.therapistId) searchParams.append('therapistId', params.therapistId);
    if (params.startDate) searchParams.append('startDate', params.startDate);
    if (params.endDate) searchParams.append('endDate', params.endDate);

    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return client.get(`/sessions/stats${queryString}`);
  },

  // Session notes and outcomes
  updateNotes: (sessionId: string, notes: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/notes`, { notes }),

  addOutcome: (sessionId: string, outcome: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/outcomes`, { outcome }),

  setHomework: (sessionId: string, homework: string[]): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/homework`, { homework }),

  setNextSessionPlan: (sessionId: string, plan: string): Promise<Session> =>
    client.patch(`/sessions/${sessionId}/next-plan`, { nextSessionPlan: plan }),
});

export type { SessionCreateDto, SessionUpdateDto, Session, SessionListParams, SessionListResponse, SessionStats };