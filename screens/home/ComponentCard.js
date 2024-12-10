import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import React, { useEffect, useState, useContext } from 'react';
import { Fontisto } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';

export function ComponentCard(jsonString){
  const navigation = useNavigation();
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  
  const [likeCount, setLikeCount] = useState(jsonString.message.likeCount || 0);
  const [isLiked, setIsLiked] = useState(jsonString.message.isLiked || false);

  // 게시물 ID
  const relationId = jsonString.message.id;

  useEffect(() => {
    //console.log("isLiked : " + isLiked);
    //console.log("relationId : " + relationId);
  }, [isLiked]);

  // 좋아요 버튼 클릭 이벤트 핸들러
  const handleLikeToggle = async () => {
    console.log(isLiked);
    try {
      const payload = {
        relationId: relationId || null,
        userId: session.id,
        type: "P",
      };

      if (isLiked) {
        // 좋아요 취소 (DELETE 요청)
        await api.delete(`/api/interactions/likes`, { data: payload });
        setLikeCount(likeCount - 1); // 좋아요 개수 감소
      } else {
        // 좋아요 추가 (POST 요청)
        await api.post(`/api/interactions/likes`, payload);
        setLikeCount(likeCount + 1); // 좋아요 개수 증가
      }
      setIsLiked(!isLiked); // 좋아요 상태 토글
    } catch (error) {
      console.error('좋아요 처리 중 오류 발생:', error);
    }
  };

    return(
        <View style={{padding: 2, borderTopWidth: 1, borderBlockColor: "#ccc", backgroundColor: "white"}}>
          <TouchableOpacity key={jsonString.message.id}
              onPress={() =>
              navigation.navigate('SelectCommunity', {
                postId: postId, // 게시글 ID 전달
              })
              }>
              <View style={{flexDirection: "row",  marginTop: 5, alignItems: "center"}}>
                <Image 
                  source={{ uri: 'https://picsum.photos/35/35' }} // 가로 200, 세로 300 크기의 랜덤 이미지
                  style={styles.BodyImage}
                />
                <View style={{flexDirection: "column"}}>
                  <View style={{flexDirection: "row", alignItems: "flex-start" }}>
                    <Text style={styles.categoryinput}>{jsonString.message.categoryName}</Text>
                    <Text style={styles.timeAgo}>{jsonString.message.timeAgo}</Text>
                  </View>
                    <Text style={styles.nickName}>{jsonString.message.nickName}</Text>
                </View>
              </View>
              <View style={{marginTop: 10}}>
                <Text style={styles.bodyTitle} numberOfLines={1}>{jsonString.message.title}</Text>
                <Text style={styles.bodyMain} numberOfLines={4}>{jsonString.message.content}</Text>
              </View>
          </TouchableOpacity>
          <View style={{padding: 10, flexDirection: "row", justifyContent: "space-around", paddingBottom: 10}}>
            <TouchableOpacity onPress={handleLikeToggle} style={{ flexDirection: "row", alignItems: "center" }}>
              <Fontisto name="like" size={12} color={isLiked ? "#FFD73C" : "#999"} style={styles.icon}/>
              <Text style={[
                styles.CommentFont,
                  { color: isLiked ? "#FFD73C" : "#999" },]}>
                  {jsonString.likeCount > 0 ? `${jsonString.likeCount}` : "좋아요"}
              </Text>
            </TouchableOpacity>
            {/* <View style={{flexDirection: "row", alignItems:"center"}}>
              
            </View> */}
            <View style={{flexDirection: "row", alignItems:"center"}}>
              <Fontisto name="comment" size={12} color="#999" style={styles.icon}/>
              <Text style={styles.CommentFont}>{jsonString.commentCount > 0 ? `${jsonString.commentCount}` : "댓글"}</Text>
            </View>
            <View style={{flexDirection: "row", alignItems:"center"}}>
              <Fontisto name="eye" size={12} color="#999" style={styles.icon}/>
              <Text style={styles.CommentFont}>{jsonString.viewCount > 0 ? `${jsonString.viewCount}` : "조회수"}</Text>
            </View>
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
    BodyImage: {
        width: 35,
        height: 35,
        resizeMode: 'cover',
        borderRadius: 30,
        margin: 10, // 텍스트와 이미지 간격
        //paddingTop: 5
      },
    bodyText: {
        fontSize: 12,
        color: "black",
        padding: 5,
        paddingLeft: 10,
        paddingRight: 20,
        paddingBottom: 0,
    },
    bodyTitle: {
        fontSize: 18,
        color: "black",
        marginLeft: 10
    },
    bodyMain: {
        fontSize: 13,
        color: "black",
        marginLeft: 10,
        marginTop: 5,
    },
    CommentFont:{
        fontSize: 13,
        color: "#999",
    },
    icon: {
        padding: 10,
        justifyContent: 'center',
    },
    categoryinput: {
      marginBottom: 2,
      fontSize: 13,
      marginRight: 10,
      fontWeight: 'bold',
    },
    nickName: {
      fontSize: 13,
      color: '#333',
    },
    timeAgo: {
      marginTop: 1,
      fontSize: 11,
      color: '#999',
    },
});