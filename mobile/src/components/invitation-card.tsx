import { View, Text, TouchableOpacity, Alert } from 'react-native';
import type { InvitationItem, InvitationStatus } from '@/hooks/use-invitations';

interface InvitationCardProps {
  invitation: InvitationItem;
  onCopy: () => void;
  onDelete: () => void;
  copied: boolean;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Yönetici',
  coach: 'Antrenör',
  parent: 'Veli',
};

const STATUS_CONFIG: Record<InvitationStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Aktif', bg: 'bg-green-100', text: 'text-green-700' },
  used: { label: 'Kullanıldı', bg: 'bg-blue-100', text: 'text-blue-700' },
  expired: { label: 'Süresi Doldu', bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function InvitationCard({ invitation, onCopy, onDelete, copied }: InvitationCardProps) {
  const statusConfig = STATUS_CONFIG[invitation.computedStatus];

  const handleDelete = () => {
    Alert.alert('Daveti Sil', 'Bu daveti silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-blue-50 px-2 py-0.5 rounded">
          <Text className="text-xs text-blue-700 font-medium">
            {ROLE_LABELS[invitation.role] ?? invitation.role}
          </Text>
        </View>
        <View className={`px-2 py-0.5 rounded ${statusConfig.bg}`}>
          <Text className={`text-xs font-medium ${statusConfig.text}`}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {invitation.email ? (
        <Text className="text-sm text-gray-600 mb-1">{invitation.email}</Text>
      ) : null}

      <Text className="text-xs text-gray-400 mb-3">
        {new Date(invitation.created_at).toLocaleDateString('tr-TR')}
      </Text>

      {invitation.computedStatus === 'active' && (
        <View className="flex-row gap-2">
          <TouchableOpacity
            className="flex-1 py-2 rounded-lg bg-blue-600"
            onPress={onCopy}
            activeOpacity={0.7}
          >
            <Text className="text-white text-center text-sm font-medium">
              {copied ? 'Kopyalandı!' : 'Linki Kopyala'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="py-2 px-4 rounded-lg border border-red-300"
            onPress={handleDelete}
            activeOpacity={0.7}
          >
            <Text className="text-red-600 text-sm font-medium">Sil</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
