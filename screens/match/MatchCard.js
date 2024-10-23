import { View, Text, StyleSheet } from 'react-native';

export function MatchCard(jsonString){
    return(
        <View style={{backgroundColor: "white", padding: 5, borderRadius: 2, marginTop: 5, marginBottom: 5, alignItems: "flex-start", width: "100%"}}>
            <View style={{width: "100%"}}>
                <View style={{marginBottom: 10}}>
                    <Text style={{}}>{"[" + jsonString.message.time_title + "] "} {jsonString.message.match_title}</Text>
                </View>
                <View style={{flexDirection: "row", justifyContent: "space-between"}}>
                    <Text style={styles.textAttention}>{jsonString.message.class_name}</Text>
                    <Text style={styles.textAttention}>{jsonString.message.vs_name}</Text>
                    <Text style={styles.textAttention}>{jsonString.message.join_name}</Text>
                </View>
            </View>
        </View> 
    );
}

const styles = StyleSheet.create({
    textAttention: {
        backgroundColor: "#FFD73C", 
        paddingLeft: 20,
        paddingRight: 20, 
        borderRadius: 10, 
    },
});