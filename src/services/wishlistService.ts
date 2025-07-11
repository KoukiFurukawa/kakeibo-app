import { supabase } from "@/utils/manage_supabase";
import { IWishlistItem } from "@/types/wishlist";
import { retryWithBackoff } from "@/utils/retryWithBackoff";

export class WishlistService {
  static async fetchWishlist(userId: string): Promise<IWishlistItem[]> {
    const result = await retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .select("*")
        .eq("created_by", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    });

    return result || [];
  }

  static async addWishlistItem(
    userId: string,
    itemData: Omit<IWishlistItem, "id" | "created_by" | "created_at">,
  ): Promise<IWishlistItem | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("wishlist")
        .insert({
          created_by: userId,
          ...itemData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async updateWishlistItem(
    userId: string,
    id: string,
    itemData: Partial<IWishlistItem>,
  ): Promise<boolean> {
    const result = await retryWithBackoff(async () => {
      const { error } = await supabase
        .from("wishlist")
        .update(itemData)
        .eq("id", id)
        .eq("created_by", userId);

      if (error) throw error;
      return true;
    });

    return result || false;
  }

  static async deleteWishlistItem(
    userId: string,
    id: string,
  ): Promise<boolean> {
    const result = await retryWithBackoff(async () => {
      const { error } = await supabase
        .from("wishlist")
        .delete()
        .eq("id", id)
        .eq("created_by", userId);

      if (error) throw error;
      return true;
    });

    return result || false;
  }
}
