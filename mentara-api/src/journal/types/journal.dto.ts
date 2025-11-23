export interface JournalEntryCreateInputDto {
  content: string;
}

export interface JournalEntryUpdateInputDto {
  content: string;
}

export interface JournalEntryResponseDto {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

