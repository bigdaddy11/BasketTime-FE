import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// 댓글 하나를 출력하는 컴포넌트
export function CommentItem({ nickName, timeAgo, content }) {
  return (
    <View style={styles.container}>
      {/* 닉네임과 작성 시간 */}
      <View style={styles.header}>
        <Text style={styles.nickName}>{nickName || '익명'}</Text>
        <Text style={styles.timeAgo}>{timeAgo}</Text>
      </View>
      {/* 댓글 내용 */}
      <Text style={styles.content}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    
    padding: 10,
    backgroundColor: 'white',

    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  nickName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  timeAgo: {
    fontSize: 11,
    color: '#999',
  },
  content: {
    fontSize: 14,
    color: '#444',
  },
});
