import type { ProductMedia } from "@/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ProductOptions {
  colors: { id: string; name: string; value: string }[];
  sizes: string[];
}

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          slug: string;
          name_he: string;
          name_en: string;
          sku: string;
          description: string;
          story: string;
          price: number;
          compare_at_price: number | null;
          stock: number;
          status: "active" | "draft" | "archived";
          category: string;
          gender: "women" | "men" | "unisex";
          material: string;
          color: string;
          gemstone: string;
          weight: string;
          is_new: boolean;
          is_featured: boolean;
          is_limited: boolean;
          image_url: string | null;
          images: string[];
          media: ProductMedia;
          options: ProductOptions;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name_he: string;
          name_en: string;
          sku: string;
          description?: string;
          story?: string;
          price: number;
          compare_at_price?: number | null;
          stock?: number;
          status?: "active" | "draft" | "archived";
          category: string;
          gender?: "women" | "men" | "unisex";
          material?: string;
          color?: string;
          gemstone?: string;
          weight?: string;
          is_new?: boolean;
          is_featured?: boolean;
          is_limited?: boolean;
          image_url?: string | null;
          images?: string[];
          media?: ProductMedia;
          options?: ProductOptions;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_email: string;
          customer_name: string;
          customer_phone: string;
          shipping_address: Json;
          items: Json;
          subtotal: number;
          shipping_cost: number;
          total: number;
          status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
          payment_status: "pending" | "paid" | "failed" | "refunded";
          payment_method: string;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_email: string;
          customer_name: string;
          customer_phone?: string;
          shipping_address?: Json;
          items?: Json;
          subtotal?: number;
          shipping_cost?: number;
          total?: number;
          status?: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_method?: string;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      product_relationships: {
        Row: {
          id: string;
          product_id: string;
          related_product_id: string;
          relationship_type: "related" | "matching" | "complete_the_look" | "frequently_bought_together";
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          related_product_id: string;
          relationship_type: "related" | "matching" | "complete_the_look" | "frequently_bought_together";
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["product_relationships"]["Insert"]>;
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          subject: string;
          message: string;
          status: "new" | "read" | "replied" | "archived";
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          subject: string;
          message: string;
          status?: "new" | "read" | "replied" | "archived";
        };
        Update: Partial<Database["public"]["Tables"]["contact_submissions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
