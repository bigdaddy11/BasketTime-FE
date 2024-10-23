import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Notice } from './home/Notice';
import { ComponentCard } from './home/ComponentCard';

const arrayJson = [
    {
        member_id: 1,
        member_name: "육계장",
        member_company: "대항병원",
        category_name: "블라블라",
        last_update: "1일전",
        board_key: 1,
        board_title: "새차사고싶다 내차가 젤 못생긴듯",
        board_text: "suv도 간지나는거많아 bmw x5 x7 이런애들봐. 넘 간지나지않냐 물론 카이엔은 넘 못생겼엉 줘도 타"
    },
    {
        member_id: 2,
        member_name: "거꾸로해도신유신",
        member_company: "만렙백수",
        category_name: "썸.연애",
        last_update: "2일전",
        board_key: 2,
        board_title: "KG모빌리티짱",
        board_text: "난 무조건 KG모빌리티만 본다. 현대기아는 타지않아 과독점은 발전에 독이될 뿐이야."
    },
    {
        member_id: 3,
        member_name: "세상아덤벼라",
        member_company: "신한DS",
        category_name: "부동산",
        last_update: "3일전",
        board_key: 3,
        board_title: "집값 무조건 오릅니다",
        board_text: "올라야해 제발 영끌올인박았어 살려줘.."
    },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
        <Notice></Notice>
        {
            arrayJson.map((string, index) => (
            <ComponentCard key={string.board_key} message={string}></ComponentCard>
            ))
        }
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //justifyContent: 'center',
    //alignItems: 'center',
  },
});
