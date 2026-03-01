import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
export interface Category {
    id: bigint;
    name: string;
    slug: string;
}
export interface backendInterface {
    addCategory(category: Category, token: string): Promise<void>;
    addChannel(channel: Channel, token: string): Promise<void>;
    adminLogin(username: string, password: string): Promise<string>;
    adminLogout(token: string): Promise<boolean>;
    deleteCategory(id: bigint, token: string): Promise<void>;
    deleteChannel(id: bigint, token: string): Promise<void>;
    getAllChannels(token: string): Promise<Array<Channel>>;
    getCategories(): Promise<Array<Category>>;
    getChannelById(id: bigint): Promise<Channel>;
    getChannels(): Promise<Array<Channel>>;
    getChannelsByCategory(categorySlug: string): Promise<Array<Channel>>;
    updateCategory(category: Category, token: string): Promise<void>;
    updateChannel(channel: Channel, token: string): Promise<void>;
    validateSession(token: string): Promise<boolean>;
}
