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
  LayoutGrid,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Tag,
  Trash2,
  Tv,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddCategory,
  useAddChannel,
  useAdminLogout,
  useAllChannels,
  useCategories,
  useDeleteCategory,
  useDeleteChannel,
  useUpdateCategory,
  useUpdateChannel,
  useValidateSession,
} from "../hooks/useQueries";
import type { Category, Channel } from "../hooks/useQueries";

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

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken") ?? "";
  const { data: sessionValid, isLoading: sessionLoading } =
    useValidateSession(token);

  // Channel state — use getAllChannels so inactive channels remain visible in admin
  const { data: channels, isLoading: channelsLoading } = useAllChannels(token);
  const deleteChannel = useDeleteChannel();
  const [channelModalOpen, setChannelModalOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [deletingChannelId, setDeletingChannelId] = useState<bigint | null>(
    null,
  );

  // Category state
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const deleteCategory = useDeleteCategory();
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [deletingCatId, setDeletingCatId] = useState<bigint | null>(null);

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
            {
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
          <TabsList className="bg-muted mb-4">
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
          </TabsList>

          {/* Channels tab */}
          <TabsContent value="channels">
            <div className="bg-card border border-tv-border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-tv-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-tv-red" />
                  <span className="font-semibold text-sm text-foreground">
                    Channels
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {channels?.length ?? 0}
                  </Badge>
                </div>
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
        </Tabs>
      </main>

      {/* Modals */}
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
    </div>
  );
}
