import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChannelImport {
    order: bigint;
    name: string;
    description: string;
    isActive: boolean;
    logoUrl: string;
    category: string;
    streamUrl: string;
}
export interface SiteSettings {
    tagline: string;
    maintenanceMode: boolean;
    siteName: string;
    logoUrl: string;
    contactEmail: string;
    footerText: string;
}
export interface Channel {
    id: bigint;
    order: bigint;
    name: string;
    description: string;
    isActive: boolean;
    logoUrl: string;
    category: string;
    streamUrl: string;
}
export interface ApiSettings {
    enabled: boolean;
    apiToken: string;
}
export interface Account {
    id: bigint;
    username: string;
    password: string;
    role: string;
}
export interface Category {
    id: bigint;
    name: string;
    slug: string;
}
export interface backendInterface {
    addAccount(username: string, password: string, role: string, token: string): Promise<void>;
    addCategory(name: string, slug: string, token: string): Promise<void>;
    addChannel(channel: Channel, token: string): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(token: string): Promise<boolean>;
    deleteAccount(username: string, token: string): Promise<void>;
    deleteCategory(id: bigint, token: string): Promise<void>;
    deleteChannel(id: bigint, token: string): Promise<void>;
    getAccounts(token: string): Promise<Array<Account>>;
    getAccountsDebug(): Promise<Array<[string, Account]>>;
    getAllChannels(token: string): Promise<Array<Channel>>;
    getApiSettings(token: string): Promise<ApiSettings>;
    getCategories(): Promise<Array<Category>>;
    getCategoriesDebug(): Promise<Array<[string, Category]>>;
    getChannelById(id: bigint): Promise<Channel>;
    getChannels(): Promise<Array<Channel>>;
    getChannelsApi(apiToken: string): Promise<Array<Channel>>;
    getChannelsByCategory(categorySlug: string): Promise<Array<Channel>>;
    getChannelsDebug(): Promise<Array<[string, Channel]>>;
    getMyRole(token: string): Promise<string>;
    getSiteSettings(): Promise<SiteSettings>;
    importChannels(channelsToImport: Array<ChannelImport>, token: string): Promise<bigint>;
    updateAccount(username: string, password: string, role: string, token: string): Promise<void>;
    updateApiSettings(settings: ApiSettings, token: string): Promise<void>;
    updateCategory(category: Category, token: string): Promise<void>;
    updateChannel(channel: Channel, token: string): Promise<void>;
    updateSiteSettings(newSettings: SiteSettings, token: string): Promise<void>;
    validateSession(token: string): Promise<boolean>;
}
