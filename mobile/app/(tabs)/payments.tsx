import { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { getPrimaryRole } from '@/lib/utils/role-helpers';
import { usePayments } from '@/hooks/use-payments';
import { useAdminPayments } from '@/hooks/use-admin-payments';
import { PaymentRow } from '@/components/payment-row';
import { AdminPaymentRow } from '@/components/admin-payment-row';
import { PaymentFilter, type FilterValue } from '@/components/payment-filter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmptyState } from '@/components/ui/empty-state';

function AdminPayments() {
  const { payments, loading, refetch, markAsPaid, markingId } = useAdminPayments();
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter((p) => p.status === filter);
  }, [payments, filter]);

  if (loading && payments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mx-4">
            <AdminPaymentRow
              studentName={item.studentName}
              groupName={`${item.sportName} — ${item.groupName}`}
              periodMonth={item.periodMonth}
              amount={item.amount}
              status={item.status}
              onMarkPaid={() => markAsPaid(item.id)}
              marking={markingId === item.id}
            />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        ListHeaderComponent={<PaymentFilter value={filter} onChange={setFilter} />}
        ListEmptyComponent={<EmptyState message="Ödeme kaydı bulunamadı." />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      />
    </View>
  );
}

function ParentPayments() {
  const { payments, loading, refetch } = usePayments();
  const [filter, setFilter] = useState<FilterValue>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return payments;
    return payments.filter((p) => p.status === filter);
  }, [payments, filter]);

  if (loading && payments.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View className="flex-1 bg-gray-50">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mx-4">
            <PaymentRow
              periodMonth={item.periodMonth}
              amount={item.amount}
              status={item.status}
              dueDate={item.dueDate}
              studentName={item.studentName}
              groupName={`${item.sportName} — ${item.groupName}`}
            />
          </View>
        )}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        ListHeaderComponent={<PaymentFilter value={filter} onChange={setFilter} />}
        ListEmptyComponent={<EmptyState message="Ödeme kaydı bulunamadı." />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} tintColor="#3b82f6" />
        }
      />
    </View>
  );
}

export default function PaymentsScreen() {
  const { profile } = useAuth();
  const role = profile ? getPrimaryRole(profile.roles) : 'parent';

  if (role === 'admin') return <AdminPayments />;
  return <ParentPayments />;
}
