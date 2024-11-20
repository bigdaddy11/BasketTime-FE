import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Text, View, Image } from "react-native";

export function Category({ onSelectCategory }) {
    const categories = [
        { id: 1, name: "IT서비스 라운지", image: "https://via.placeholder.com/50" }, // 대체 이미지 URL
        { id: 2, name: "IT 엔지니어", image: "https://via.placeholder.com/50" },
        { id: 3, name: "블라블라", image: "https://via.placeholder.com/50" },
        { id: 4, name: "부동산", image: "https://via.placeholder.com/50" },
    ];

    return (
        <View style={styles.wrapper}>
            {/* 스크롤 가능한 카테고리들 */}
            <ScrollView
                style={styles.scrollView}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
            >
                {categories.map((category) => (
                    <TouchableOpacity 
                        key={category.id} 
                        style={styles.touchStyle}
                        onPress={() => onSelectCategory(category.id)}
                    >
                        {category.image && (
                            <Image
                                source={{ uri: category.image }}
                                style={styles.imageStyle}
                            />
                        )}
                        <Text style={styles.textStyle}>{category.name}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* 우측 고정된 '전체' */}
            <TouchableOpacity style={[styles.fixedStyle]}>
                <Text style={[styles.fixedText]}>전체</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: "row", // 스크롤뷰와 고정된 항목을 가로 배치
        alignItems: "center",
        paddingHorizontal: 10,
    },
    scrollView: {
        flex: 1, // 스크롤뷰가 최대한 너비를 차지하도록 설정
    },
    touchStyle: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "white", // 배경색
        borderRadius: 30,
        //paddingVertical: 10,
        paddingHorizontal: 4,
        //borderColor: "black",
        //borderWidth: 1,
        height: 35,
        marginVertical: 10,
        marginHorizontal: 5,
    },
    imageStyle: {
        width: 25,
        height: 25,
        borderRadius: 15, // 이미지 둥글게
        marginRight: 5, // 텍스트와 이미지 간격
    },
    textStyle: {
        fontSize: 12,
        color: "#000",
    },
    fixedStyle: {
        backgroundColor: "transparent", // '전체'의 배경색 설정
        width: 50,
        
        //borderWidth: 1,
        //borderColor: "#007BFF", // 파란색 테두리
        
    },
    fixedText: {
        color: "#007BFF", // 파란색 텍스트
        fontWeight: "bold",
        textAlign: "center"
        //width: 40,
    },
});
