export const notesKeys = {
  all: ["notes"] as const,
  lists: () => [...notesKeys.all, "list"] as const,
  searches: () => [...notesKeys.all, "search"] as const,
  search: (query: string) => [...notesKeys.searches(), query] as const,
  details: () => [...notesKeys.all, "detail"] as const,
  detail: (id: string) => [...notesKeys.details(), id] as const,
  invites: (id: string) => [...notesKeys.detail(id), "invites"] as const,
};
