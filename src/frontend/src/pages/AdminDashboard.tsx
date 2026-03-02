import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  Copy,
  Download,
  Eye,
  EyeOff,
  Globe,
  LayoutGrid,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Tag,
  Trash2,
  Tv,
  Upload,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAddAccount,
  useAddCategory,
  useAddChannel,
  useAdminLogout,
  useAllChannels,
  useCategories,
  useDeleteAccount,
  useDeleteCategory,
  useDeleteChannel,
  useGetAccounts,
  useGetApiSettings,
  useGetMyRole,
  useGetSiteSettings,
  useImportChannels,
  useUpdateAccount,
  useUpdateApiSettings,
  useUpdateCategory,
  useUpdateChannel,
  useUpdateSiteSettings,
  useValidateSession,
} from "../hooks/useQueries";
import type {
  Account,
  ApiSettings,
  Category,
  Channel,
  SiteSettings,
} from "../hooks/useQueries";

// ─── Channel Form ────────────────────────────────────────────────────────────

interface ChannelFormData {
  name: string;
  logoUrl: string;
  streamUrl: string;
  category: string;
  description: string;
  isActive: boolean;
  order: string;
}

const emptyChannelForm = (): ChannelFormData => ({
  name: "",
  logoUrl: "",
  streamUrl: "",
  category: "",
  description: "",
  isActive: true,
  order: "0",
});

function channelToForm(ch: Channel): ChannelFormData {
  return {
    name: ch.name,
    logoUrl: ch.logoUrl,
    streamUrl: ch.streamUrl,
    category: ch.category,
    description: ch.description,
    isActive: ch.isActive,
    order: ch.order.toString(),
  };
}

interface ChannelModalProps {
  open: boolean;
  onClose: () => void;
  initial: ChannelFormData;
  channelId?: bigint;
  token: string;
  categories: Category[];
}

function ChannelModal({
  open,
  onClose,
  initial,
  channelId,
  token,
  categories,
}: ChannelModalProps) {
  const [form, setForm] = useState<ChannelFormData>(initial);
  const addChannel = useAddChannel();
  const updateChannel = useUpdateChannel();
  const isPending = addChannel.isPending || updateChannel.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `open` resets form when modal opens
  useEffect(() => {
    setForm(initial);
  }, [initial, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const channel: Channel = {
      id: channelId ?? BigInt(0),
      name: form.name,
      logoUrl: form.logoUrl,
      streamUrl: form.streamUrl,
      category: form.category,
      description: form.description,
      isActive: form.isActive,
      order: BigInt(Number.parseInt(form.order) || 0),
    };

    try {
      if (channelId !== undefined) {
        await updateChannel.mutateAsync({ channel, token });
        toast.success("Channel updated successfully");
      } else {
        await addChannel.mutateAsync({ channel, token });
        toast.success("Channel added successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save channel");
    }
  };

  const set = (field: keyof ChannelFormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-tv-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {channelId !== undefined ? "Edit Channel" : "Add Channel"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Channel Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. ATN Bangla"
                required
                className="bg-input border-tv-border"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Stream URL (HLS/M3U8) *</Label>
              <Input
                value={form.streamUrl}
                onChange={(e) => set("streamUrl", e.target.value)}
                placeholder="https://example.com/stream.m3u8"
                required
                className="bg-input border-tv-border font-mono text-xs"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Logo URL</Label>
              <Input
                value={form.logoUrl}
                onChange={(e) => set("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
                className="bg-input border-tv-border"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v)}
                required
              >
                <SelectTrigger className="bg-input border-tv-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-tv-border">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id.toString()} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  {/* Fallback built-in categories */}
                  {categories.length === 0 && (
                    <>
                      <SelectItem value="bangla-tv">Bangla TV</SelectItem>
                      <SelectItem value="news">News</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="international">
                        International
                      </SelectItem>
                      <SelectItem value="radio">Radio</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Input
                type="number"
                value={form.order}
                onChange={(e) => set("order", e.target.value)}
                min="0"
                className="bg-input border-tv-border"
              />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Brief description of the channel"
                className="bg-input border-tv-border resize-none"
                rows={2}
              />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => set("isActive", v)}
                id="isActive"
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active (visible to users)
              </Label>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-tv-red hover:bg-tv-red-bright text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {channelId !== undefined ? "Update Channel" : "Add Channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Form ───────────────────────────────────────────────────────────

interface CatFormData {
  name: string;
  slug: string;
}
const emptyCatForm = (): CatFormData => ({ name: "", slug: "" });

interface CategoryModalProps {
  open: boolean;
  onClose: () => void;
  initial: CatFormData;
  categoryId?: bigint;
  token: string;
}

function CategoryModal({
  open,
  onClose,
  initial,
  categoryId,
  token,
}: CategoryModalProps) {
  const [form, setForm] = useState<CatFormData>(initial);
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const isPending = addCategory.isPending || updateCategory.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `open` resets form when modal opens
  useEffect(() => {
    setForm(initial);
  }, [initial, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const category: Category = {
      id: categoryId ?? BigInt(0),
      name: form.name,
      slug: form.slug,
    };
    try {
      if (categoryId !== undefined) {
        await updateCategory.mutateAsync({ category, token });
        toast.success("Category updated");
      } else {
        await addCategory.mutateAsync({ category, token });
        toast.success("Category added");
      }
      onClose();
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-tv-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground">
            {categoryId !== undefined ? "Edit Category" : "Add Category"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  name,
                  slug:
                    prev.slug ||
                    name
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                      .replace(/[^a-z0-9-]/g, ""),
                }));
              }}
              placeholder="e.g. Bangla TV"
              required
              className="bg-input border-tv-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="e.g. bangla-tv"
              required
              className="bg-input border-tv-border font-mono text-sm"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-tv-red hover:bg-tv-red-bright text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {categoryId !== undefined ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Account Form ─────────────────────────────────────────────────────────────

interface AccountFormData {
  username: string;
  password: string;
  role: string;
}

const emptyAccountForm = (): AccountFormData => ({
  username: "",
  password: "",
  role: "channel_manager",
});

interface AccountModalProps {
  open: boolean;
  onClose: () => void;
  initial: AccountFormData;
  isEditing: boolean;
  token: string;
}

function AccountModal({
  open,
  onClose,
  initial,
  isEditing,
  token,
}: AccountModalProps) {
  const [form, setForm] = useState<AccountFormData>(initial);
  const addAccount = useAddAccount();
  const updateAccount = useUpdateAccount();
  const isPending = addAccount.isPending || updateAccount.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: `open` resets form when modal opens
  useEffect(() => {
    setForm(initial);
  }, [initial, open]);

  const isAdminAccount = isEditing && initial.username === "admin";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateAccount.mutateAsync({
          username: form.username,
          password: form.password,
          role: isAdminAccount ? "admin" : form.role,
          token,
        });
        toast.success("Account updated successfully");
      } else {
        await addAccount.mutateAsync({
          username: form.username,
          password: form.password,
          role: form.role,
          token,
        });
        toast.success("Account created successfully");
      }
      onClose();
    } catch {
      toast.error("Failed to save account");
    }
  };

  const set = (field: keyof AccountFormData, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="bg-card border-tv-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-tv-red" />
            {isEditing ? "Edit Account" : "Add Account"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label>Username *</Label>
            <Input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="e.g. manager1"
              required
              disabled={isEditing}
              className="bg-input border-tv-border disabled:opacity-60"
            />
            {isEditing && (
              <p className="text-muted-foreground text-xs">
                Username cannot be changed after creation.
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Password *</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder={isEditing ? "Enter new password" : "Enter password"}
              required
              className="bg-input border-tv-border"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role *</Label>
            {isAdminAccount ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded border border-tv-border">
                <Shield className="w-4 h-4 text-tv-red" />
                <span className="text-sm text-foreground">
                  Admin (cannot change)
                </span>
              </div>
            ) : (
              <Select
                value={form.role}
                onValueChange={(v) => set("role", v)}
                required
              >
                <SelectTrigger className="bg-input border-tv-border">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-tv-border">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="channel_manager">
                    Channel Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-tv-red hover:bg-tv-red-bright text-white"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isEditing ? "Update Account" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Site Settings Form ───────────────────────────────────────────────────────

interface SiteSettingsFormProps {
  token: string;
}

function SiteSettingsForm({ token }: SiteSettingsFormProps) {
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  const [form, setForm] = useState<SiteSettings>({
    siteName: "jagolive",
    tagline: "",
    logoUrl: "",
    contactEmail: "",
    footerText: "",
    maintenanceMode: false,
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const set = (field: keyof SiteSettings, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings.mutateAsync({ settings: form, token });
      toast.success("Site settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-tv-border rounded-lg p-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-card border border-tv-border rounded-lg overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-tv-border flex items-center gap-2">
        <Settings className="w-4 h-4 text-tv-red" />
        <span className="font-semibold text-sm text-foreground">
          Site Settings
        </span>
      </div>

      <div className="p-6 space-y-5">
        {/* Maintenance mode warning */}
        {form.maintenanceMode && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold text-sm">
                Maintenance Mode is ON
              </p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Public visitors will see a maintenance page instead of the
                normal site.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
              placeholder="jagolive"
              className="bg-input border-tv-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="Watch Live TV Online"
              className="bg-input border-tv-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="logoUrl">Logo URL</Label>
            <Input
              id="logoUrl"
              value={form.logoUrl}
              onChange={(e) => set("logoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              className="bg-input border-tv-border"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={(e) => set("contactEmail", e.target.value)}
              placeholder="admin@jagolive.com"
              className="bg-input border-tv-border"
            />
          </div>

          <div className="col-span-full space-y-1.5">
            <Label htmlFor="footerText">Footer Text</Label>
            <Textarea
              id="footerText"
              value={form.footerText}
              onChange={(e) => set("footerText", e.target.value)}
              placeholder="© 2025 jagolive. All rights reserved."
              className="bg-input border-tv-border resize-none"
              rows={2}
            />
          </div>

          <div className="col-span-full flex items-center justify-between p-4 bg-muted/50 border border-tv-border rounded-lg">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Maintenance Mode
                </p>
                <p className="text-xs text-muted-foreground">
                  Hide site from public and show a maintenance message
                </p>
              </div>
            </div>
            <Switch
              checked={form.maintenanceMode}
              onCheckedChange={(v) => set("maintenanceMode", v)}
              id="maintenanceMode"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="bg-tv-red hover:bg-tv-red-bright text-white gap-2"
          >
            {updateSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {updateSettings.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── API Management Tab ───────────────────────────────────────────────────────

interface ApiManagementTabProps {
  token: string;
}

function ApiManagementTab({ token }: ApiManagementTabProps) {
  const { data: apiSettings, isLoading } = useGetApiSettings(token);
  const updateApiSettings = useUpdateApiSettings();

  const [enabled, setEnabled] = useState(false);
  const [apiToken, setApiToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [_saved, setSaved] = useState(false);

  useEffect(() => {
    if (apiSettings) {
      setEnabled(apiSettings.enabled);
      // Prefer the backend token, but also persist to localStorage as cache
      if (apiSettings.apiToken) {
        setApiToken(apiSettings.apiToken);
        localStorage.setItem("apiToken", apiSettings.apiToken);
        localStorage.setItem("apiEnabled", String(apiSettings.enabled));
      } else {
        // Fallback: restore from localStorage if backend has empty token
        const cached = localStorage.getItem("apiToken");
        if (cached) setApiToken(cached);
        const cachedEnabled = localStorage.getItem("apiEnabled");
        if (cachedEnabled !== null) setEnabled(cachedEnabled === "true");
      }
    }
  }, [apiSettings]);

  const generateToken = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const newToken = Array.from({ length: 48 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join("");
    setApiToken(newToken);
    setSaved(false);
  };

  const apiUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/channels?token=${apiToken}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(apiUrl).then(() => {
      toast.success("API URL copied to clipboard");
    });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const settings: ApiSettings = { enabled, apiToken };
      await updateApiSettings.mutateAsync({ settings, token });
      // Persist to localStorage so token survives page refresh
      localStorage.setItem("apiToken", apiToken);
      localStorage.setItem("apiEnabled", String(enabled));
      setSaved(true);
      toast.success("API settings saved");
    } catch {
      toast.error("Failed to save API settings");
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-tv-border rounded-lg p-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-card border border-tv-border rounded-lg overflow-hidden"
    >
      <div className="px-4 py-3 border-b border-tv-border flex items-center gap-2">
        <Globe className="w-4 h-4 text-tv-red" />
        <span className="font-semibold text-sm text-foreground">
          API Management
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Enable / Disable */}
        <div className="flex items-center justify-between p-4 bg-muted/50 border border-tv-border rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Enable Public API
              </p>
              <p className="text-xs text-muted-foreground">
                Allow external access to all active channels in JSON format
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            id="apiEnabled"
          />
        </div>

        {!enabled && (
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <WifiOff className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-400 font-semibold text-sm">
                API is Disabled
              </p>
              <p className="text-amber-400/70 text-xs mt-0.5">
                Enable the API above to allow external JSON access to channels.
              </p>
            </div>
          </div>
        )}

        {/* API Token */}
        <div className="space-y-2">
          <Label htmlFor="apiToken">API Token (Security Key)</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="apiToken"
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="Enter a secure token..."
                className="bg-input border-tv-border font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={generateToken}
              className="border-tv-border gap-1.5 shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Anyone with this token can read your channel list via the API.
          </p>
        </div>

        {/* API URL */}
        <div className="space-y-2">
          <Label>API URL</Label>
          <div className="flex gap-2 items-stretch">
            <code className="flex-1 px-3 py-2 bg-muted border border-tv-border rounded-md font-mono text-xs text-foreground break-all leading-relaxed">
              {apiUrl}
            </code>
            <Button
              type="button"
              variant="outline"
              onClick={copyUrl}
              className="border-tv-border gap-1.5 shrink-0 self-start"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Use this URL to access all active channels in JSON format. Returns
            an array of channel objects.
          </p>
        </div>

        {/* Example response */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Example Response</Label>
          <pre className="p-3 bg-muted border border-tv-border rounded-md text-xs font-mono text-muted-foreground overflow-x-auto">
            {`[
  {
    "id": 1,
    "name": "Channel Name",
    "logoUrl": "https://...",
    "streamUrl": "https://...m3u8",
    "category": "bangla-tv",
    "description": "...",
    "isActive": true,
    "order": 0
  }
]`}
          </pre>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={updateApiSettings.isPending}
            className="bg-tv-red hover:bg-tv-red-bright text-white gap-2"
          >
            {updateApiSettings.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            {updateApiSettings.isPending ? "Saving..." : "Save API Settings"}
          </Button>
        </div>
      </div>
    </form>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken") ?? "";
  const { data: sessionValid, isLoading: sessionLoading } =
    useValidateSession(token);

  // Role-based access
  const { data: myRole } = useGetMyRole(token);
  const isAdmin = myRole === "admin";

  // Channel state — use getAllChannels so inactive channels remain visible in admin
  const { data: channels, isLoading: channelsLoading } = useAllChannels(token);
  const deleteChannel = useDeleteChannel();
  const importChannels = useImportChannels();
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deletingChannelId, setDeletingChannelId] = useState<bigint | null>(
    null,
  );
  const importFileRef = useRef<HTMLInputElement>(null);

  // Category state
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<bigint | null>(null);

  // Account state (admin only)
  const { data: accounts, isLoading: accountsLoading } = useGetAccounts(
    isAdmin ? token : null,
  );
  const deleteAccount = useDeleteAccount();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [deletingAccountUsername, setDeletingAccountUsername] = useState<
    string | null
  >(null);

  const { mutateAsync: adminLogout, isPending: loggingOut } = useAdminLogout();

  // Redirect if session invalid
  useEffect(() => {
    if (!token) {
      navigate({ to: "/admin/login", replace: true });
      return;
    }
    if (!sessionLoading && sessionValid === false) {
      localStorage.removeItem("adminToken");
      navigate({ to: "/admin/login", replace: true });
    }
  }, [token, sessionValid, sessionLoading, navigate]);

  const handleLogout = async () => {
    try {
      await adminLogout(token);
    } finally {
      localStorage.removeItem("adminToken");
      navigate({ to: "/admin/login", replace: true });
    }
  };

  const handleDeleteChannel = async () => {
    if (!deletingChannelId) return;
    try {
      await deleteChannel.mutateAsync({ id: deletingChannelId, token });
      toast.success("Channel deleted");
    } catch {
      toast.error("Failed to delete channel");
    }
    setDeletingChannelId(null);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCatId) return;
    try {
      await deleteCategory.mutateAsync({ id: deletingCatId, token });
      toast.success("Category deleted");
    } catch {
      toast.error("Failed to delete category");
    }
    setDeletingCatId(null);
  };

  const handleDeleteAccount = async () => {
    if (!deletingAccountUsername) return;
    try {
      await deleteAccount.mutateAsync({
        username: deletingAccountUsername,
        token,
      });
      toast.success("Account deleted");
    } catch {
      toast.error("Failed to delete account");
    }
    setDeletingAccountUsername(null);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("Invalid JSON file");
        if (importFileRef.current) importFileRef.current.value = "";
        return;
      }
      if (!Array.isArray(parsed)) {
        toast.error("JSON must be an array of channels");
        if (importFileRef.current) importFileRef.current.value = "";
        return;
      }
      const channelsToImport = parsed.map((ch: Record<string, unknown>) => ({
        name: String(ch.name ?? ""),
        logoUrl: String(ch.logoUrl ?? ""),
        streamUrl: String(ch.streamUrl ?? ""),
        category: String(ch.category ?? ""),
        description: String(ch.description ?? ""),
        isActive: ch.isActive !== false,
        order: BigInt(Number(ch.order) || 0),
      }));
      const count = await importChannels.mutateAsync({
        channelsToImport,
        token,
      });
      toast.success(`Imported ${count} channels successfully`);
    } catch {
      toast.error("Failed to import channels");
    }
    if (importFileRef.current) importFileRef.current.value = "";
  };

  const handleExportJson = () => {
    if (!channels || channels.length === 0) {
      toast.error("No channels to export");
      return;
    }
    const exportData = channels.map((ch) => ({
      id: Number(ch.id),
      name: ch.name,
      logoUrl: ch.logoUrl,
      streamUrl: ch.streamUrl,
      category: ch.category,
      description: ch.description,
      isActive: ch.isActive,
      order: Number(ch.order),
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jagolive-channels.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${exportData.length} channels`);
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-tv-red" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      {/* Admin header */}
      <header className="bg-card border-b border-tv-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="w-px h-5 bg-tv-border" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-tv-red rounded flex items-center justify-center">
                <Settings className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-display font-bold text-foreground">
                Admin Panel
              </span>
              {myRole && (
                <Badge
                  className={
                    isAdmin
                      ? "bg-tv-red/20 text-tv-red border-tv-red/30 text-[10px] uppercase tracking-wider"
                      : "bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] uppercase tracking-wider"
                  }
                >
                  {isAdmin ? "Admin" : "Channel Manager"}
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-muted-foreground hover:text-destructive gap-1.5"
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {[
            {
              label: "Total Channels",
              value: channels?.length ?? 0,
              icon: Tv,
              color: "text-tv-red",
            },
            {
              label: "Live Channels",
              value: channels?.filter((c) => c.isActive).length ?? 0,
              icon: Check,
              color: "text-green-400",
            },
            {
              label: "Inactive",
              value: channels?.filter((c) => !c.isActive).length ?? 0,
              icon: X,
              color: "text-muted-foreground",
            },
            isAdmin
              ? {
                  label: "Total Users",
                  value: accounts?.length ?? 0,
                  icon: Users,
                  color: "text-blue-400",
                }
              : {
                  label: "Categories",
                  value: categories?.length ?? 0,
                  icon: Tag,
                  color: "text-blue-400",
                },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-tv-border rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-muted-foreground text-xs">
                  {stat.label}
                </span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="font-display font-bold text-2xl text-foreground">
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="channels">
          <TabsList className="bg-muted mb-4 flex-wrap h-auto">
            <TabsTrigger
              value="channels"
              className="data-[state=active]:bg-tv-red data-[state=active]:text-white gap-1.5"
            >
              <Tv className="w-3.5 h-3.5" />
              Channels
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-tv-red data-[state=active]:text-white gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              Categories
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-tv-red data-[state=active]:text-white gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                Users
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="settings"
                className="data-[state=active]:bg-tv-red data-[state=active]:text-white gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                Settings
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger
                value="api"
                className="data-[state=active]:bg-tv-red data-[state=active]:text-white gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                API
              </TabsTrigger>
            )}
          </TabsList>

          {/* Channels tab */}
          <TabsContent value="channels">
            <div className="bg-card border border-tv-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-tv-border flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-tv-red" />
                  <span className="font-semibold text-sm text-foreground">
                    Channels
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {channels?.length ?? 0}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Hidden file input for JSON import */}
                  <input
                    ref={importFileRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJson}
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-tv-border gap-1.5"
                    onClick={() => importFileRef.current?.click()}
                    disabled={importChannels.isPending}
                  >
                    {importChannels.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Upload className="w-3.5 h-3.5" />
                    )}
                    Import JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-tv-border gap-1.5"
                    onClick={handleExportJson}
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                    onClick={() => {
                      setEditingChannel(null);
                      setChannelModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Channel
                  </Button>
                </div>
              </div>

              {channelsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : channels && channels.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tv-border bg-muted/50">
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden sm:table-cell">
                          Category
                        </th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider hidden md:table-cell">
                          Stream URL
                        </th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Status
                        </th>
                        <th className="text-right px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tv-border">
                      {channels.map((ch) => (
                        <tr
                          key={ch.id.toString()}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-black rounded border border-tv-border flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {ch.logoUrl ? (
                                  <img
                                    src={ch.logoUrl}
                                    alt={ch.name}
                                    className="w-full h-full object-contain p-0.5"
                                    onError={(e) => {
                                      (
                                        e.currentTarget as HTMLImageElement
                                      ).style.display = "none";
                                    }}
                                  />
                                ) : (
                                  <Tv className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                              <span className="font-medium text-foreground truncate max-w-[120px]">
                                {ch.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                            <Badge
                              variant="outline"
                              className="border-tv-border text-xs"
                            >
                              {ch.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                            <span className="font-mono text-xs truncate max-w-[200px] block">
                              {ch.streamUrl.length > 50
                                ? `${ch.streamUrl.slice(0, 50)}…`
                                : ch.streamUrl}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              className={
                                ch.isActive
                                  ? "bg-green-500/10 text-green-400 border-green-500/30 text-xs"
                                  : "bg-muted text-muted-foreground border-tv-border text-xs"
                              }
                            >
                              {ch.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setEditingChannel(ch);
                                  setChannelModalOpen(true);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeletingChannelId(ch.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Tv className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">
                    No channels yet. Add your first channel.
                  </p>
                  <Button
                    size="sm"
                    className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                    onClick={() => {
                      setEditingChannel(null);
                      setChannelModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Channel
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Categories tab */}
          <TabsContent value="categories">
            <div className="bg-card border border-tv-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-tv-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-tv-red" />
                  <span className="font-semibold text-sm text-foreground">
                    Categories
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {categories?.length ?? 0}
                  </Badge>
                </div>
                <Button
                  size="sm"
                  className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                  onClick={() => {
                    setEditingCat(null);
                    setCatModalOpen(true);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </Button>
              </div>

              {categoriesLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : categories && categories.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-tv-border bg-muted/50">
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Slug
                        </th>
                        <th className="text-right px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tv-border">
                      {categories.map((cat) => (
                        <tr
                          key={cat.id.toString()}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3 font-medium text-foreground">
                            {cat.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                            {cat.slug}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  setEditingCat(cat);
                                  setCatModalOpen(true);
                                }}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => setDeletingCatId(cat.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Tag className="w-10 h-10 text-muted-foreground/40" />
                  <p className="text-muted-foreground text-sm">
                    No categories yet. Add your first category.
                  </p>
                  <Button
                    size="sm"
                    className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                    onClick={() => {
                      setEditingCat(null);
                      setCatModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Category
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users tab (admin only) */}
          {isAdmin && (
            <TabsContent value="users">
              <div className="bg-card border border-tv-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-tv-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-tv-red" />
                    <span className="font-semibold text-sm text-foreground">
                      User Accounts
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {accounts?.length ?? 0}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                    onClick={() => {
                      setEditingAccount(null);
                      setAccountModalOpen(true);
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Account
                  </Button>
                </div>

                {accountsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : accounts && accounts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-tv-border bg-muted/50">
                          <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                            Username
                          </th>
                          <th className="text-left px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                            Role
                          </th>
                          <th className="text-right px-4 py-2.5 text-muted-foreground font-medium text-xs uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-tv-border">
                        {accounts.map((acc) => (
                          <tr
                            key={acc.username}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center border border-tv-border">
                                  {acc.role === "admin" ? (
                                    <Shield className="w-4 h-4 text-tv-red" />
                                  ) : (
                                    <Users className="w-4 h-4 text-blue-400" />
                                  )}
                                </div>
                                <span className="font-medium text-foreground">
                                  {acc.username}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  acc.role === "admin"
                                    ? "bg-tv-red/20 text-tv-red border-tv-red/30 text-xs"
                                    : "bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs"
                                }
                              >
                                {acc.role === "admin"
                                  ? "Admin"
                                  : "Channel Manager"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    setEditingAccount(acc);
                                    setAccountModalOpen(true);
                                  }}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                {acc.username !== "admin" && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() =>
                                      setDeletingAccountUsername(acc.username)
                                    }
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Users className="w-10 h-10 text-muted-foreground/40" />
                    <p className="text-muted-foreground text-sm">
                      No accounts found.
                    </p>
                    <Button
                      size="sm"
                      className="bg-tv-red hover:bg-tv-red-bright text-white gap-1.5"
                      onClick={() => {
                        setEditingAccount(null);
                        setAccountModalOpen(true);
                      }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Account
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          {/* Settings tab (admin only) */}
          {isAdmin && (
            <TabsContent value="settings">
              <SiteSettingsForm token={token} />
            </TabsContent>
          )}

          {/* API tab (admin only) */}
          {isAdmin && (
            <TabsContent value="api">
              <ApiManagementTab token={token} />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Channel Modal */}
      <ChannelModal
        open={channelModalOpen}
        onClose={() => {
          setChannelModalOpen(false);
          setEditingChannel(null);
        }}
        initial={
          editingChannel ? channelToForm(editingChannel) : emptyChannelForm()
        }
        channelId={editingChannel?.id}
        token={token}
        categories={categories ?? []}
      />

      {/* Category Modal */}
      <CategoryModal
        open={catModalOpen}
        onClose={() => {
          setCatModalOpen(false);
          setEditingCat(null);
        }}
        initial={
          editingCat
            ? { name: editingCat.name, slug: editingCat.slug }
            : emptyCatForm()
        }
        categoryId={editingCat?.id}
        token={token}
      />

      {/* Account Modal */}
      <AccountModal
        open={accountModalOpen}
        onClose={() => {
          setAccountModalOpen(false);
          setEditingAccount(null);
        }}
        initial={
          editingAccount
            ? {
                username: editingAccount.username,
                password: "",
                role: editingAccount.role,
              }
            : emptyAccountForm()
        }
        isEditing={!!editingAccount}
        token={token}
      />

      {/* Delete channel confirmation */}
      <AlertDialog
        open={!!deletingChannelId}
        onOpenChange={(o) => !o && setDeletingChannelId(null)}
      >
        <AlertDialogContent className="bg-card border-tv-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Channel
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the channel. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-tv-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChannel}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteChannel.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete category confirmation */}
      <AlertDialog
        open={!!deletingCatId}
        onOpenChange={(o) => !o && setDeletingCatId(null)}
      >
        <AlertDialogContent className="bg-card border-tv-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the category. Channels in this
              category may become uncategorised.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-tv-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteCategory.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account confirmation */}
      <AlertDialog
        open={!!deletingAccountUsername}
        onOpenChange={(o) => !o && setDeletingAccountUsername(null)}
      >
        <AlertDialogContent className="bg-card border-tv-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete the account{" "}
              <span className="font-mono text-foreground">
                {deletingAccountUsername}
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-tv-border">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deleteAccount.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
