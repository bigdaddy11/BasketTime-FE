import { StyleSheet, ScrollView, TouchableOpacity, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { MatchCard } from './MatchCard';

export default function ListScreen() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [matchs, setMatchs] = useState([]);

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
            {matchs && matchs.length > 0 ? (
                    <ScrollView 
                        horizontal 
                        pagingEnabled
                        showsHorizontalScrollIndicator={false} 
                        contentContainerStyle={{ alignItems: "flex-start", flexDirection: "row" }}
                    >
                        {matchs.map((string, index) => (
                            <MatchCard key={string.id + index} message={string} />
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={{padding:10, backgroundColor: "white", borderRadius: 2, marginTop: 5, marginBottom: 5, flexDirection: "row", flex: 1, }}>경기일정이 없습니다.</Text>
                )}
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
