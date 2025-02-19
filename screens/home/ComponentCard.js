import { StyleSheet, View, Image, Text, TouchableOpacity} from 'react-native';
import React, { useState, useContext, useEffect } from 'react';
import { Fontisto } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import api from '../common/api';
import { SessionContext } from '../../contexts/SessionContext';

export function ComponentCard(jsonString){
  const navigation = useNavigation();
  const { session } = useContext(SessionContext); // 세션 정보 가져오기
  
  const [likeCount, setLikeCount] = useState(jsonString.message.likeCount || 0);
  const [isLiked, setIsLiked] = useState(jsonString.message.isLiked || false);

  const [images, setImages] = useState(null);
  const [logoImage, setLogoImage] = useState(null);

  // 게시물 ID
  const relationId = jsonString.message.id;

  useEffect(() => {
      // baseURL 가져오기
      const baseURL = api.defaults.baseURL;
      const imagePath = jsonString.message.imageMainPath || null;
      const logoImage = jsonString.message.image || null;

      if (imagePath) {
        const normalizedImage = {
          uri: `${baseURL}/${imagePath.trim()}`, // baseURL과 imageMainPath를 결합
        };
    
        setImages(normalizedImage); // 이미지 상태 설정
      }

      if (logoImage) {
        const logoChangeImage = `${baseURL}/${logoImage}`; // baseURL과 imageMainPath를 결합
        setLogoImage(logoChangeImage); // 이미지 상태 설정
      }
  },[]);

  // 조회수 업데이트 함수
  const updateViewCount = async () => {
    try {
      // 서버로 조회수 업데이트 요청
      await api.post('/api/interactions/views', {
        relationId: relationId,
        userId: session.id,
        type: 'P', // Post 타입
      });
    } catch (error) {
      console.error('조회수 업데이트 중 오류 발생:', error);
    }
  };

  const handlePress = () => {
    updateViewCount(); // 조회수 업데이트
    navigation.navigate('SelectCommunity', {
      postId: relationId, // 게시글 ID 전달
    });
  };

  // 좋아요 버튼 클릭 이벤트 핸들러
  const handleLikeToggle = async () => {
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
        <View style={{padding: 2, borderBottomWidth: 1, borderBlockColor: "#eee", backgroundColor: "white"}}>
          <TouchableOpacity key={jsonString.message.id}
              onPress={handlePress}>
              <View style={{flexDirection: "row",  marginTop: 5, alignItems: "center"}}>
                {logoImage && ( // images가 null이 아닐 경우에만 렌더링
                  <Image 
                    source={{ uri: logoImage }} // 가로 200, 세로 300 크기의 랜덤 이미지
                    style={styles.BodyImage}
                  />
                )}
                <View style={{flexDirection: "column"}}>
                  <View style={{flexDirection: "row", alignItems: "flex-start" }}>
                    <Text style={styles.categoryinput}>{jsonString.message.categoryName}</Text>
                    <Text style={styles.timeAgo}>{jsonString.message.timeAgo}</Text>
                  </View>
                    <Text style={styles.nickName}>{jsonString.message.nickName}</Text>
                </View>
              </View>
              <View style={{ marginTop: 10, justifyContent: "space-between", flexDirection: "row", flex: 1, alignItems: "flex-start"}}>
                <View style={{ flex: 3 }}>
                  <Text style={styles.bodyTitle} numberOfLines={1}>{jsonString.message.title}</Text>
                  <Text style={styles.bodyMain} numberOfLines={4}>{jsonString.message.content}</Text>
                </View>
                {images && ( // images가 null이 아닐 경우에만 렌더링
                <View style={{ flex: 1, alignItems: "flex-end", marginRight: 10}}>
                  <Image 
                    source={{ uri: images.uri }} 
                    style={styles.image} 
                    //resizeMode="contain" // 이미지 원본 비율 유지
                  />
                </View>
                )}
              </View>
          </TouchableOpacity>
          <View style={{padding: 10, flexDirection: "row", justifyContent: "space-around", paddingBottom: 10}}>
            <TouchableOpacity onPress={handleLikeToggle} style={{ flexDirection: "row", alignItems: "center" }}>
              <Fontisto name="like" size={12} color={isLiked ? "#FFD73C" : "#999"} style={styles.icon}/>
              <Text style={[
                styles.CommentFont,
                  { color: isLiked ? "#FFD73C" : "#999" },]}>
                  {likeCount > 0 ? `${likeCount}` : "좋아요"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity key={`${jsonString.message.id}-comment`}
              onPress={handlePress}>
                <View style={{flexDirection: "row", alignItems:"center"}}>
                  <Fontisto name="comment" size={12} color="#999" style={styles.icon}/>
                  <Text style={styles.CommentFont}>{jsonString.message.commentCount > 0 ? `${jsonString.message.commentCount}` : "댓글"}</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity key={`${jsonString.message.id}-view`}
              onPress={handlePress}>
              <View style={{flexDirection: "row", alignItems:"center"}}>
                <Fontisto name="eye" size={12} color="#999" style={styles.icon}/>
                <Text style={styles.CommentFont}>{jsonString.message.viewCount > 0 ? `${jsonString.message.viewCount}` : "조회수"}</Text>
              </View>
            </TouchableOpacity>
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
    image: {
      width: 80,  // 원하는 이미지 가로 크기
      //height: 100,
      aspectRatio: 1,
      borderRadius: 8, // 이미지 모서리 둥글게
    },
});