import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';
import { showToast } from '../common/toast';

export default function MessageInbox({ navigation }) {
  const [activeTab, setActiveTab] = useState('received'); // 활성 탭 상태
  const [sentMessages, setSentMessages] = useState([]); // 보낸 쪽지 데이터
  const [receivedMessages, setReceivedMessages] = useState([]); // 받은 쪽지 데이터
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const sentResponse = await api.get('/api/paper-plan/sent', {
        params: { sUserId: session.id }, // 쿼리 파라미터로 전달
      }); // 보낸 쪽지 데이터

      const receivedResponse = await api.get('/api/paper-plan/received', {
        params: { rUserId: session.id }, // 쿼리 파라미터로 전달
      }); // 받은 쪽지 데이터

      setSentMessages(sentResponse.data);
      setReceivedMessages(receivedResponse.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showToast({
        type: 'error',
        text1: '쪽지를 불러오는 중 문제가 발생했습니다.',
        position: 'bottom',
      });
    }
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        activeTab === 'received' && !item.isRead ? styles.unreadMessage : styles.readMessage,
      ]}
      onPress={() => navigation.navigate('MessageCompose', { message: item })}
    >
      <View style={styles.messageHeader}>
        <Text style={styles.messageRecipient}>{item.nickName}</Text>
        <Text style={styles.messageDate}>{item.timeAgo}</Text>
      </View>
      <Text style={styles.messageContent} numberOfLines={1}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const getMessageData = () => {
    return activeTab === 'received' ? receivedMessages : sentMessages;
  };

  return (
    <View style={styles.container}>
      {/* 상단 탭 버튼 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>
            받은 쪽지함
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>
            보낸 쪽지함
          </Text>
        </TouchableOpacity>
      </View>

      {/* 쪽지 리스트 */}
      <FlatList
        data={getMessageData()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {activeTab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD73C',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#FFD73C',
  },
  listContainer: {
    //addingHorizontal: 10,
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  readMessage: {
    backgroundColor: '#eee',
  },
  unreadMessage: {
    backgroundColor: '#FFF',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  messageRecipient: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
  },
  messageContent: {
    fontSize: 14,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 14,
  },
});
