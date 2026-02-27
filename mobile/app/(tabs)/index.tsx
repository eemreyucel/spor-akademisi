import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { getPrimaryRole } from '@/lib/utils/role-helpers';
import { useChildren } from '@/hooks/use-children';
import { ChildCard } from '@/components/child-card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/lib/supabase';

function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ students: 0, groups: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);

    const [studentsRes, groupsRes, overdueRes] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('groups').select('*', { count: 'exact', head: true }).is('deleted_at', null),
      supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'overdue'),
    ]);

    setStats({
      students: studentsRes.count ?? 0,
      groups: groupsRes.count ?? 0,
      overdue: overdueRes.count ?? 0,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ padding: 16 }}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor="#3b82f6" />
      }
    >
      <Text className="text-2xl font-bold text-gray-900 mb-6">
        Hoş Geldiniz, {profile?.fullName}
      </Text>

      <View className="flex-row gap-3 mb-4">
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <Text className="text-sm text-gray-500">Öğrenci</Text>
          <Text className="text-3xl font-bold text-gray-900">{stats.students}</Text>
        </View>
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-4">
          <Text className="text-sm text-gray-500">Grup</Text>
          <Text className="text-3xl font-bold text-gray-900">{stats.groups}</Text>
        </View>
      </View>

      <View className="bg-white rounded-xl border border-gray-200 p-4">
        <Text className="text-sm text-gray-500">Gecikmiş Ödeme</Text>
        <Text className={`text-3xl font-bold ${stats.overdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>
          {stats.overdue}
        </Text>
      </View>
    </ScrollView>
  );
}

function ParentHome() {
  const { profile } = useAuth();
  const { children, loading, refetch } = useChildren();

  if (loading && children.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={children}
        keyExtractor={(item, index) => `${item.studentId}-${item.enrollmentId ?? index}`}
        renderItem={({ item }) => <ChildCard child={item} />}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Hoş Geldiniz, {profile?.fullName}
          </Text>
        }
        ListEmptyComponent={<EmptyState message="Kayıtlı öğrenci bulunamadı." />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      />
    </View>
  );
}

export default function HomeScreen() {
  const { profile } = useAuth();
  const role = profile ? getPrimaryRole(profile.roles) : 'parent';

  if (role === 'admin') return <AdminDashboard />;
  return <ParentHome />;
}
