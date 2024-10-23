import { StyleSheet, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MatchCard } from './MatchCard';

export default function ListScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    const showDatePicker = () => {
        setDatePickerVisibility(true);
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);
    };

    const handleConfirm = (date) => {
        // 날짜 선택 후 호출되는 함수
        setSelectedDate(date);
        hideDatePicker();
    };

    const arrayJson = [
        {
            match_id: 1,
            match_title: "3대3 초보분들 모집해요",
            match_body: "제목그대로 3VS3 하실분 구합니다. 적당히 즐기면서 뛰실분, 너무 모나지 않으신분들 모집해요.",
            time_title: "19:00",
            member_id: 1,
            member_name: "휴직맨",
            class_id: 1,
            class_name: "초보",
            vs_id: 1,
            vs_name: "3 VS 3",
            join_id: 1,
            join_name: "참여인원 : 5"
        },
        {
            match_id: 2,
            match_title: "5대5 엘리트 체육인들만 오세요",
            match_body: "다칩니다",
            time_title: "20:00",
            member_id: 2,
            member_name: "휴직맨",
            class_id: 2,
            class_name: "중수",
            vs_id: 2,
            vs_name: "5 VS 5",
            join_id: 2,
            join_name: "참여인원 : 8"
        },
    ];
  return (
    <View>
        <View style={{backgroundColor: "#1478CD", padding: 10,}}>
            <TouchableOpacity onPress={showDatePicker}>
                <Text style={styles.dateText}>
                    {selectedDate.toLocaleDateString('ko-KR',{year: 'numeric', month: 'long', day: 'numeric',weekday:'short'})}
                </Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"  // 'time' 또는 'datetime'으로 변경 가능
                date={selectedDate}
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />
        </View>
        <ScrollView 
            contentContainerStyle={{alignItems: "flex-start", margin: 10}}
            >
            {
                arrayJson.map((string, index) => (
                    <MatchCard key={string.match_id} message={string}></MatchCard>
                ))
            }
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
    dateText: {
        fontSize: 18,
        color: "white",
        marginTop: 10,
        marginBottom: 10
    },
});
