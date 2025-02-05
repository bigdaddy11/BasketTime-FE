import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const { width:CATEGORY_SCREEN_WIDTH } = Dimensions.get("window");

export function MatchCard( jsonString ){
    const navigation = useNavigation();

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const getSkillLevel = (level) => {
        const levels = {
            'B': '초보',
            'I': '중수',
            'A': '고수'
        };
        return levels[level] || '알 수 없는 수준'; // 치환되지 않는 값에 대한 기본 반환값
    };

    const getVs = (ins) => {
        const vs = {
            '1': '1 vs 1',
            '2': '2 vs 2',
            '3': '3 vs 3',
            '4': '4 vs 4',
            '5': '5 vs 5'
        };
        return vs[ins] || '알 수 없는 수준'; // 치환되지 않는 값에 대한 기본 반환값
    };

    const joinPeople = (count) => {
        return "참여인원 : " + count;
    };

    const handlePress = () => {
        navigation.navigate('MatchCreateScreen', {
            id: jsonString.message.id,
        });
    };

    useEffect(() => {
    }, []);
    return(
        <TouchableOpacity onPress={handlePress}>
            <View key={jsonString.id} style={{padding:10, backgroundColor: "white", borderRadius: 2, marginTop: 5, marginBottom: 5, flexDirection: "row", width: CATEGORY_SCREEN_WIDTH}}>
                <View style={{flex: 1}}>
                    <View style={{flexDirection: "row", justifyContent: "flex-start", flex: 1, marginBottom: 5}}>
                        <Text style={styles.textAttention}>{getSkillLevel(jsonString.message.classType)}</Text>
                        <Text style={styles.textAttention}>{getVs(jsonString.message.vs)}</Text>
                        <Text style={styles.textAttention}>{joinPeople(1)}</Text>
                    </View>
                    <View style={{ flex: 1}}>
                        <Text style={{ fontSize: 18, marginBottom: 5 }}>{"[" + formatDate(jsonString.message.matchDate) + "] " + jsonString.message.title}</Text>
                        <Text 
                            style={{ fontSize: 14, lineHeight: 20, minHeight: 40}}
                            numberOfLines={2} 
                            ellipsizeMode="tail"
                        >
                            {jsonString.message.content}
                        </Text>
                        {/* {jsonString.message.title} */}
                    </View>
                </View>
            </View> 
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    textAttention: {
        backgroundColor: "#FFD73C", 
        paddingLeft: 10,
        paddingRight: 10, 
        borderRadius: 10, 
        marginRight: 5
    },
});