import { supabase } from '@/utils/manage_supabase';
import { IUserGroup, IGroupMember } from '@/types/user';
import { retryWithBackoff } from '@/utils/retryWithBackoff';

export class GroupService {
    static async fetchUserGroup(userId: string): Promise<IUserGroup | null> {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', userId)
                .single();

            if (userError || !userData.group_id) {
                return null;
            }

            const { data: groupData, error: groupError } = await supabase
                .from('groups')
                .select('*')
                .eq('id', userData.group_id)
                .single();

            if (groupError) {
                console.error('グループ情報取得エラー:', groupError);
                return null;
            }

            return groupData;
        } catch (error) {
            console.error('グループ情報取得中のエラー:', error);
            return null;
        }
    }

    static async createUserGroup(userId: string, groupData: Omit<IUserGroup, 'id' | 'created_at'>): Promise<IUserGroup | null> {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', userId)
                .single();

            if (userError) throw userError;

            if (userData.group_id) {
                throw new Error('すでにグループに所属しています');
            }

            const { data: newGroup, error: createError } = await supabase
                .from('groups')
                .insert({
                    ...groupData,
                    author_user_id: userId
                })
                .select()
                .single();

            if (createError) throw createError;

            const { error: updateError } = await supabase
                .from('users')
                .update({ group_id: newGroup.id })
                .eq('id', userId);

            if (updateError) throw updateError;

            return newGroup;
        } catch (error) {
            console.error('グループ作成エラー:', error);
            throw error;
        }
    }

    static async updateUserGroup(userId: string, groupId: string, updates: Partial<IUserGroup>): Promise<IUserGroup | null> {
        try {
            const { data, error } = await supabase
                .from('groups')
                .update(updates)
                .eq('id', groupId)
                .eq('author_user_id', userId)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('グループ更新エラー:', error);
            return null;
        }
    }

    static async fetchGroupMembers(groupId: string, author_user_id: string | null = null): Promise<IGroupMember[]> {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, created_at')
                .eq('group_id', groupId);

            if (error) throw error;

            if (author_user_id == null) {
                const { data: groupData } = await supabase
                    .from('groups')
                    .select('author_user_id')
                    .eq('id', groupId)
                    .single();
                author_user_id = groupData?.author_user_id || null;
            }

            const membersWithRole = data.map(member => ({
                ...member,
                isAdmin: member.id === author_user_id
            }));

            return membersWithRole;
        } catch (error) {
            console.error('グループメンバー取得エラー:', error);
            return [];
        }
    }

    static async generateInviteCode(userId: string, groupId: string): Promise<string | null> {
        try {
            const code = Math.random().toString(36).substring(2, 10).toUpperCase();
            
            const { error } = await supabase
                .from('group_invites')
                .insert({
                    group_id: groupId,
                    code: code,
                    created_by: userId,
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                });

            if (error) throw error;
            return code;
        } catch (error) {
            console.error('招待コード生成エラー:', error);
            return null;
        }
    }

    static async joinGroupWithInviteCode(userId: string, inviteCode: string): Promise<boolean> {
        try {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('group_id')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            
            if (userData.group_id) {
                throw new Error('すでにグループに所属しています');
            }

            const { data: inviteData, error: inviteError } = await supabase
                .from('group_invites')
                .select('id, group_id, expires_at')
                .eq('code', inviteCode)
                .gt('expires_at', new Date().toISOString())
                .is('used_by', null)
                .single();

            if (inviteError || !inviteData) {
                throw new Error('無効または期限切れの招待コードです');
            }

            const { error: updateUserError } = await supabase
                .from('users')
                .update({ group_id: inviteData.group_id })
                .eq('id', userId);

            if (updateUserError) throw updateUserError;

            const { error: updateInviteError } = await supabase
                .from('group_invites')
                .update({
                    used_by: userId,
                    used_at: new Date().toISOString()
                })
                .eq('id', inviteData.id);

            if (updateInviteError) throw updateInviteError;

            const { error: updateGroupError } = await supabase
                .from('groups')
                .update({
                    invited_user_id: userId
                })
                .eq('id', inviteData.group_id);

            if (updateGroupError) throw updateGroupError;

            return true;
        } catch (error) {
            console.error('グループ参加エラー:', error);
            throw error;
        }
    }

    static async removeGroupMember(adminUserId: string, groupId: string, memberId: string): Promise<boolean> {
        try {
            if (memberId === adminUserId) {
                throw new Error('自分自身を削除することはできません');
            }

            const { error } = await supabase
                .from('users')
                .update({ group_id: null })
                .eq('id', memberId)
                .eq('group_id', groupId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('メンバー削除エラー:', error);
            return false;
        }
    }

    static async leaveGroup(userId: string, userGroup: IUserGroup): Promise<boolean> {
        try {
            // 管理者(admin)の場合はグループ全体を削除
            if (userId === userGroup.author_user_id) {
                // グループに所属する全メンバーのgroup_idをnullに更新
                const { error: updateMembersError } = await supabase
                    .from('users')
                    .update({ group_id: null })
                    .eq('group_id', userGroup.id);

                if (updateMembersError) throw updateMembersError;

                // グループ自体を削除
                const { error: deleteGroupError } = await supabase
                    .from('groups')
                    .delete()
                    .eq('id', userGroup.id);

                if (deleteGroupError) throw deleteGroupError;
            } else {
                // 通常メンバーの場合は自分だけグループから離脱
                
                // 1. ユーザーテーブルのgroup_idをnullに更新
                const { error: updateUserError } = await supabase
                    .from('users')
                    .update({ group_id: null })
                    .eq('id', userId)
                    .eq('group_id', userGroup.id);
                    
                if (updateUserError) throw updateUserError;
                
                // 2. グループテーブルのinvited_user_idを更新
                // このユーザーがinvited_user_idに設定されている場合のみnullに更新
                const { error: updateGroupError} = await supabase
                    .from('groups')
                    .update({ invited_user_id: null })
                    .eq('id', userGroup.id)
                    .eq('invited_user_id', userId); // このユーザーが招待されたユーザーの場合のみ更新

                if (updateGroupError) throw updateGroupError;
            }

            return true;
        } catch (error) {
            console.error('グループ離脱エラー:', error);
            return false;
        }
    }
}
