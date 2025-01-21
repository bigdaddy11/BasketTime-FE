import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import api from '../common/api.js';
import { SessionContext } from '../../contexts/SessionContext';
import { showToast } from '../common/toast';

export default function MessageInbox({ navigation }) {
  const [sentMessages, setSentMessages] = useState([]); // 보낸 쪽지 데이터
  const [receivedMessages, setReceivedMessages] = useState([]); // 받은 쪽지 데이터
  const [index, setIndex] = useState(0); // 현재 탭 인덱스
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  const [routes] = useState([
    { key: 'received', title: '받은 쪽지함' },
    { key: 'sent', title: '보낸 쪽지함' },
  ]);

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
        position: 'bottom'
      });
    }
  };

  const renderMessageItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.messageItem, activeTab === 'received' && item.isRead ? styles.readMessage : styles.unreadMessage]}
      onPress={() => navigation.navigate('MessageDetail', { message: item })}
    >
     <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 5}}>
        <Text style={styles.messageRecipient}>{item.nickName}</Text>
        <Text style={styles.messageDate}>{item.timeAgo}</Text>
     </View>
      <Text style={styles.messageContent} numberOfLines={1}>
        {item.content}
      </Text>
    </TouchableOpacity>
  );

  const Messages = ({ tab }) => (
    <FlatList
      data={tab === 'received' ? receivedMessages : sentMessages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
            style={[styles.messageItem, tab === 'received' && !item.isRead ? styles.unreadMessage : styles.readMessage]}
            onPress={() => navigation.navigate('MessageCompose', { message: item })}
            >
            <View style={{flexDirection: "row", justifyContent: "space-between", marginBottom: 5}}>
                <Text style={styles.messageRecipient}>{item.nickName}</Text>
                <Text style={styles.messageDate}>{item.timeAgo}</Text>
            </View>
            <Text style={styles.messageContent} numberOfLines={1}>
                {item.content}
            </Text>
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<Text style={styles.emptyText}>{tab === 'received' ? '받은 쪽지가 없습니다.' : '보낸 쪽지가 없습니다.'}</Text>}
    />
  );


  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'received':
        return <Messages tab="received" />;
      case 'sent':
        return <Messages tab="sent" />;
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={styles.indicatorStyle}
          activeColor='#FFD73C'
          inactiveColor='#888'
          style={styles.tabBar}
          labelStyle={styles.tabLabel}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  listContainer: {
    //padding: 10,
  },
  messageItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  readMessage: {
    backgroundColor: '#eee', // 읽은 쪽지의 배경색
  },
  unreadMessage: {
    backgroundColor: '#ffffff', // 읽지 않은 쪽지의 배경색
  },
  messageRecipient: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  messageContent: {
    fontSize: 14,
    color: '#555',
  },
  messageDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 14,
  },
  tabBar: {
    backgroundColor: '#FFF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
  indicatorStyle: {
    backgroundColor: '#FFD73C',
    height: 2,
  },
});
