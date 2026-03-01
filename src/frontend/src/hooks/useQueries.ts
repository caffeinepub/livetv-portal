import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Account,
  ApiSettings,
  Category,
  Channel,
  ChannelImport,
  SiteSettings,
} from "../backend.d.ts";
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

export function useGetMyRole(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["myRole", token],
    queryFn: async () => {
      if (!actor || !token) return "";
      return actor.getMyRole(token);
    },
    enabled: !!actor && !isFetching && !!token,
    staleTime: 60_000,
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
      return actor.addCategory(category.name, category.slug, token);
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

// ── Accounts ────────────────────────────────────────────────────────────────

export function useGetAccounts(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Account[]>({
    queryKey: ["accounts", token],
    queryFn: async () => {
      if (!actor || !token) return [];
      return actor.getAccounts(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

export function useAddAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      role,
      token,
    }: { username: string; password: string; role: string; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addAccount(username, password, role, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useUpdateAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      password,
      role,
      token,
    }: { username: string; password: string; role: string; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateAccount(username, password, role, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

export function useDeleteAccount() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      token,
    }: { username: string; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteAccount(username, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["accounts"] }),
  });
}

// ── Site Settings ────────────────────────────────────────────────────────────

export function useGetSiteSettings() {
  const { actor, isFetching } = useActor();
  return useQuery<SiteSettings>({
    queryKey: ["siteSettings"],
    queryFn: async () => {
      if (!actor) {
        return {
          siteName: "jagolive",
          tagline: "",
          logoUrl: "",
          contactEmail: "",
          footerText: "",
          maintenanceMode: false,
        };
      }
      return actor.getSiteSettings();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useUpdateSiteSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      settings,
      token,
    }: { settings: SiteSettings; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateSiteSettings(settings, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["siteSettings"] }),
  });
}

// ── API Settings ────────────────────────────────────────────────────────────

export function useGetApiSettings(token: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<ApiSettings>({
    queryKey: ["apiSettings", token],
    queryFn: async () => {
      if (!actor || !token) return { enabled: false, apiToken: "" };
      return actor.getApiSettings(token);
    },
    enabled: !!actor && !isFetching && !!token,
    staleTime: 30_000,
  });
}

export function useUpdateApiSettings() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      settings,
      token,
    }: { settings: ApiSettings; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateApiSettings(settings, token);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["apiSettings", variables.token] });
    },
  });
}

// ── Import Channels ──────────────────────────────────────────────────────────

export function useImportChannels() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      channelsToImport,
      token,
    }: { channelsToImport: Array<ChannelImport>; token: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.importChannels(channelsToImport, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["channels"] }),
  });
}

// ── Auth (Login/Logout) ──────────────────────────────────────────────────────

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

export type {
  Channel,
  Category,
  Account,
  SiteSettings,
  ApiSettings,
  ChannelImport,
};
