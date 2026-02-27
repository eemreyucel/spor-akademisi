import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

interface ManagementCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}

function ManagementCard({ title, description, icon, onPress }: ManagementCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl border border-gray-200 p-4 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <Text style={{ fontSize: 28 }}>{icon}</Text>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">{title}</Text>
          <Text className="text-sm text-gray-500">{description}</Text>
        </View>
        <Text className="text-gray-400 text-lg">›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ManagementScreen() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ padding: 16 }}>
      <ManagementCard
        icon="👤"
        title="Öğrenci Ekle"
        description="Yeni öğrenci kaydı oluştur"
        onPress={() => router.push('/admin/student-create')}
      />
      <ManagementCard
        icon="👥"
        title="Gruplar"
        description="Grupları görüntüle ve yönet"
        onPress={() => router.push('/admin/groups')}
      />
      <ManagementCard
        icon="✉️"
        title="Davetler"
        description="Davet oluştur ve yönet"
        onPress={() => router.push('/admin/invitations')}
      />
    </ScrollView>
  );
}
