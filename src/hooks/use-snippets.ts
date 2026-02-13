import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Stub types for snippet functionality (actual backend not implemented)
type InsertSnippet = {
  id?: string;
  title?: string;
  code: string;
  language?: string;
  createdAt?: Date;
};

const api = {
  snippets: {
    list: {
      path: "/api/snippets",
      responses: { 200: { parse: (x: any) => x } },
    },
    create: {
      path: "/api/snippets",
      responses: { 201: { parse: (x: any) => x } },
    },
  },
};

// Using snippets for potential future "save code" features,
// though the main app focuses on client-side execution.

export function useSnippets() {
  return useQuery({
    queryKey: [api.snippets.list.path],
    queryFn: async () => {
      const res = await fetch(api.snippets.list.path);
      if (!res.ok) throw new Error("Failed to fetch snippets");
      return api.snippets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertSnippet) => {
      const res = await fetch(api.snippets.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create snippet");
      return api.snippets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.snippets.list.path] });
    },
  });
}
