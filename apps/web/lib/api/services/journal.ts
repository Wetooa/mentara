import { AxiosInstance } from "axios";

export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntryCreateInput {
  content: string;
}

export interface JournalEntryUpdateInput {
  content: string;
}

export interface JournalEntriesResponse {
  entries: JournalEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function createJournalService(axios: AxiosInstance) {
  return {
    async createEntry(data: JournalEntryCreateInput): Promise<JournalEntry> {
      const { data: response } = await axios.post("/journal/entries", data);
      return response;
    },

    async getEntries(page: number = 1, limit: number = 20): Promise<JournalEntriesResponse> {
      const { data } = await axios.get("/journal/entries", {
        params: { page, limit },
      });
      return data;
    },

    async getEntry(id: string): Promise<JournalEntry> {
      const { data } = await axios.get(`/journal/entries/${id}`);
      return data;
    },

    async updateEntry(id: string, data: JournalEntryUpdateInput): Promise<JournalEntry> {
      const { data: response } = await axios.put(`/journal/entries/${id}`, data);
      return response;
    },

    async deleteEntry(id: string): Promise<void> {
      await axios.delete(`/journal/entries/${id}`);
    },
  };
}

export type JournalService = ReturnType<typeof createJournalService>;

