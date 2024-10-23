import { StyleSheet, View, Image, Text, ScrollView } from 'react-native';
import { Fontisto } from "@expo/vector-icons";

export function ComponentCard(jsonString){
    return(
        <View style={{marginBottom: 0, borderTopWidth: 1, borderBlockColor: "#3A3D40", }}>
          <View style={{flexDirection: "row", flex: 1, marginTop: 10}}>
            <Image 
              source={{ uri: 'https://picsum.photos/50/50' }} // 가로 200, 세로 300 크기의 랜덤 이미지
              style={styles.BodyImage}
            />
            <View style={{flexDirection: "column", flexWrap: "wrap"}}>
              <Text style={styles.bodyText}>{jsonString.message.category_name}</Text>
              <Text style={styles.bodyText}>{jsonString.message.member_company}</Text>
            </View>
            <View style={{flexDirection: "column", flexWrap: "wrap"}}>
              <Text style={styles.bodyText}>{jsonString.message.last_update}</Text>
              <Text style={styles.bodyText}>{jsonString.message.member_name}</Text>
            </View>
          </View>
          <View style={{marginTop: 10}}>
            <Text style={styles.bodyTitle}>{jsonString.message.board_title}</Text>
            <Text style={styles.bodyMain}>{jsonString.message.board_text}</Text>
          </View>
          <View style={{marginTop: 15, flexDirection: "row", justifyContent: "space-around", paddingBottom: 10, marginLeft: -15}}>
            <View style={{flexDirection: "row", alignItems:"center"}}>
              <Fontisto name="like" size={15} color="black" style={styles.icon}/>
              <Text style={styles.CommentFont}>좋아요</Text>
            </View>
            <View style={{flexDirection: "row", alignItems:"center"}}>
              <Fontisto name="comment" size={15} color="black" style={styles.icon}/>
              <Text style={styles.CommentFont}>댓글</Text>
            </View>
            <View style={{flexDirection: "row", alignItems:"center"}}>
              <Fontisto name="eye" size={15} color="black" style={styles.icon}/>
              <Text style={styles.CommentFont}>조회수</Text>
            </View>
          </View>
        </View>
    );
}

const styles = StyleSheet.create({
    BodyImage: {
        width: 40,
        height: 40,
        resizeMode: 'cover',
        borderRadius: 30,
        marginRight: 2,
        marginLeft: 20
      },
    bodyText: {
        fontSize: 10,
        color: "black",
        padding: 5,
        paddingLeft: 10,
        paddingRight: 20,
        paddingBottom: 0,
    },
    bodyTitle: {
        fontSize: 18,
        color: "black",
        marginLeft: 20
    },
    bodyMain: {
        fontSize: 13,
        color: "black",
        marginLeft: 20,
        marginTop: 5,
    },
    CommentFont:{
        fontSize: 13,
        color: "black",
    },
    icon: {
        padding: 10,
        justifyContent: 'center',
    },
});