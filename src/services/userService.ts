import { supabase } from "@/utils/manage_supabase";
import { IUserProfile, IUserNotificationSettings } from "@/types/user";
import { retryWithBackoff } from "@/utils/retryWithBackoff";

export class UserService {
  static async fetchUserProfile(userId: string): Promise<IUserProfile | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async updateUserProfile(
    userId: string,
    updates: Partial<IUserProfile>,
  ): Promise<IUserProfile | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("users")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async fetchNotificationSettings(
    userId: string,
  ): Promise<IUserNotificationSettings | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return data;
    });
  }

  static async updateNotificationSettings(
    userId: string,
    updates: Partial<IUserNotificationSettings>,
  ): Promise<IUserNotificationSettings | null> {
    return retryWithBackoff(async () => {
      const { data, error } = await supabase
        .from("notification_settings")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }
}
