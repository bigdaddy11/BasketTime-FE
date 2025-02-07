import { StyleSheet, View, Image, Dimensions, Text } from 'react-native';

const { width:CATEGORY_SCREEN_WIDTH } = Dimensions.get("window");

export function Notice(){
    return(
        <View style={styles.banner}>
            <Image 
              source={{ uri: 'https://picsum.photos/300/250' }} 
              style={styles.BodyImage}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    banner: {
        //borderBlockColor: "#3A3D40",
        //padding: 10,
        
    },
    BodyImage: {
        height: 250,
        resizeMode: 'cover',
        //borderRadius: 10,
    },
    Text: {
        color: "black",
        fontSize: 16,
        padding: 3,
        marginBottom: 5
    }
});