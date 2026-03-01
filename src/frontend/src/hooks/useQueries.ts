import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Category, Channel } from "../backend.d.ts";
import { useActor } from "./useActor";

// ── Auth ────────────────────────────────────────────────────────────────────

export function useValidateSession(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["session", token],
    queryFn: async () => {
      if (!actor || !token) return false;
      return actor.validateSession(token);
    },
    enabled: !!actor && !isFetching && !!token,
    staleTime: 30_000,
  });
}

// ── Channels ────────────────────────────────────────────────────────────────

export function useChannels() {
  const { actor, isFetching } = useActor();
  return useQuery<Channel[]>({
    queryKey: ["channels"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getChannels();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllChannels(token: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Channel[]>({
    queryKey: ["channels", "all", token],
    queryFn: async () => {
      if (!actor || !token) return [];
      return actor.getAllChannels(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useChannelById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Channel | null>({
    queryKey: ["channel", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return actor.getChannelById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useChannelsByCategory(slug: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Channel[]>({
    queryKey: ["channels", "category", slug],
    queryFn: async () => {
      if (!actor || !slug) return [];
      return actor.getChannelsByCategory(slug);
    },
    enabled: !!actor && !isFetching && !!slug,
  });
}

export function useAddChannel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channel,
      token,
    }: { channel: Channel; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addChannel(channel, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channels"] }),
  });
}

export function useUpdateChannel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channel,
      token,
    }: { channel: Channel; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateChannel(channel, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channels"] }),
  });
}

export function useDeleteChannel() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: bigint; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteChannel(id, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channels"] }),
  });
}

// ── Categories ──────────────────────────────────────────────────────────────

export function useCategories() {
  const { actor, isFetching } = useActor();
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      token,
    }: { category: Category; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addCategory(category, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      category,
      token,
    }: { category: Category; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateCategory(category, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, token }: { id: bigint; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteCategory(id, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
  });
}

export function useAdminLogin() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: { username: string; password: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminLogin(username, password);
    },
  });
}

export function useAdminLogout() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.adminLogout(token);
    },
  });
}

export type { Channel, Category };
