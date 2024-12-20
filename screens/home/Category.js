import React, { useEffect, useState } from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, Text, View, Image } from "react-native";
import api from '../common/api';

export function Category({ onSelectCategory }) {
    const [categories, setCategories] = useState([]);

    // 서버에서 카테고리 데이터를 가져오는 함수
    const fetchCategories = async () => {
        try {
            const response = await api.get('/api/category'); // 서버로 GET 요청
            setCategories(response.data); // 응답 데이터를 상태에 저장
        } catch (error) {
            console.error('Error fetching categories:', error);
            Alert.alert('Error', '카테고리를 불러오는 중 문제가 발생했습니다.');
        }
    };

    // 컴포넌트 마운트 시 카테고리 데이터 로드
    useEffect(() => {
        fetchCategories();
    }, []);

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
            <TouchableOpacity style={[styles.fixedStyle]} onPress={() => onSelectCategory(null)}>
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
        backgroundColor: "whitesmoke", // 배경색
        borderRadius: 30,
        paddingHorizontal: 10,
        height: 35,
        marginVertical: 5,
        marginHorizontal: 5,
    },
    imageStyle: {
        width: 25,
        height: 25,
        borderRadius: 15, // 이미지 둥글게
        marginRight: 0, // 텍스트와 이미지 간격
        left: -5
    },
    textStyle: {
        fontSize: 12,
        color: "#000",
    },
    fixedStyle: {
        backgroundColor: "transparent", // '전체'의 배경색 설정
        width: 50,
    },
    fixedText: {
        color: "#007BFF", // 파란색 텍스트
        fontWeight: "bold",
        textAlign: "center"
    },
});
