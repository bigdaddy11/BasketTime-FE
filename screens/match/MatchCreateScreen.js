import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import api from '../common/api.js';

export default function MatchCreateScreen({ route }) {
    const navigation = useNavigation();

    const { id, Court } = route.params || {};

    const [courtName, setCourtName] = useState(Court ? Court.name : '');
    const [courtId, setCourId] = useState(Court ? Court.place_id : '');

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedClass, setSelectedClass] = useState('I');
    const [selectedVs, setSelectedVs] = useState('3');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const isEditable = !id; // `id`가 없을 때 수정 가능

    // id가 있을 경우 데이터 로드
    useEffect(() => {
        if (id) {
            api.get(`/api/matches/${id}`)
                .then(response => {
                    const matchData = response.data;
                    setTitle(matchData.title);
                    setContent(matchData.content);
                    setSelectedClass(matchData.classType);
                    setSelectedVs(matchData.vs);
                    setSelectedDate(new Date(matchData.matchDate));
                    setCourtName(matchData.courtName);
                })
                .catch(error => {
                    Alert.alert('Error', '매칭 정보를 불러오는데 실패했습니다.');
                });
        }
    }, [id]);

    useEffect(() => {
    }, []);

    const validateFields = () => {
        if (!title) {
          Alert.alert('Validation Error', '제목을 입력해주세요.');
          return false;
        }
        if (!content) {
          Alert.alert('Validation Error', '내용을 입력해주세요.');
          return false;
        }
        if (!selectedClass) {
          Alert.alert('Validation Error', '플레이어 난이도를 선택해주세요.');
          return false;
        }
        if (!selectedVs) {
          Alert.alert('Validation Error', '인원수를 선택해주세요.');
          return false;
        }
        if (!selectedDate) {
          Alert.alert('Validation Error', '날짜를 선택해주세요.');
          return false;
        }
    
        return true;
      };

    const handleCreateMatch = async () => {
        if (validateFields()) {
            const data = {
              title,
              content,
              classType: selectedClass,
              vs: selectedVs,
              courtId: courtId,
              courtName: courtName,
              matchDate: selectedDate
        };
        
        api.post('/api/matches', data)
        .then(response => {
          Alert.alert('Success', '경기 매칭이 생성되었습니다!');
          // 필요한 경우 초기화
          navigation.goBack();
        })
        .catch(error => {
          Alert.alert('Error', '경기 매칭 생성에 실패했습니다.');
        });
    }};

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
        <View style={styles.container}>
            <View style={{ borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 10}}>
                <Text style={{fontSize: 24, padding: 5}}>{courtName}</Text>
                {/* <Text>{Court.place_id}</Text> */}
                {/* <Text style={{fontSize: 14, padding: 5}}>{Court.vicinity}</Text> */}
                
            </View>
            
            <View style={styles.pickerContainer}>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedClass}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedClass(itemValue)}
                        enabled={isEditable} // 수정 모드일 때만 활성화
                    >
                        <Picker.Item label="초보" value="B" style={styles.pickerItem}/>
                        <Picker.Item label="중수" value="I" style={styles.pickerItem}/>
                        <Picker.Item label="고수" value="A" style={styles.pickerItem}/>
                    </Picker>
                </View>
                <View style={styles.pickerWrapper}>
                    <Picker
                        selectedValue={selectedVs}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedVs(itemValue)}
                        enabled={isEditable} // 수정 모드일 때만 활성화
                    >
                        <Picker.Item label="1 vs 1" value="1" style={styles.pickerItem}/>
                        <Picker.Item label="2 vs 2" value="2" style={styles.pickerItem}/>
                        <Picker.Item label="3 vs 3" value="3" style={styles.pickerItem}/>
                        <Picker.Item label="4 vs 4" value="4" style={styles.pickerItem}/>
                        <Picker.Item label="5 vs 5" value="5" style={styles.pickerItem}/>
                    </Picker>
                </View>
            </View>

            <View style={{padding: 10, borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 10}}>
                <TouchableOpacity onPress={isEditable ? showDatePicker : null}>
                    <Text style={styles.dateText}>
                        {selectedDate.toLocaleDateString('ko-KR',
                            {   year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                weekday:'short',
                                hour: 'numeric',
                                minute: 'numeric',
                            }
                        )}
                    </Text>
                </TouchableOpacity>
                <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="datetime"  // 'time' 또는 'datetime'으로 변경 가능
                    date={selectedDate}
                    onConfirm={handleConfirm}
                    onCancel={hideDatePicker}
                />
            </View>
            
            <View style={{ flex: 1 }}>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="제목을 입력해주세요."
                    editable={isEditable} // 수정 모드일 때만 활성화
                />
                <TextInput
                    style={styles.inputMain}
                    value={content}
                    onChangeText={setContent}
                    placeholder="내용을 입력해주세요."
                    multiline
                    editable={isEditable} // 수정 모드일 때만 활성화
                />
            </View>
            {isEditable && <Button title="생성" onPress={handleCreateMatch} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    dateText: {
        fontSize: 18,
        color: "black"
    },
    input: {
        //borderWidth: 1,
        //borderColor: '#ccc',
        borderRadius: 5,
        //padding: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        marginBottom: 2,
        fontSize: 14,
    },
    inputMain: {
        //borderWidth: 1,
        //borderColor: '#ccc',
        borderRadius: 5,
        //padding: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 10,
        marginBottom: 2,
        height: "50%",
        flex: 1,
        textAlignVertical: 'top',  // 텍스트 상단 정렬
        fontSize: 12,
    },
    pickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    pickerWrapper: {
        flex: 1,
        //borderWidth: 1,
        //marginHorizontal: 5,
        //borderBottomWidth: 1,
        //borderColor: '#ccc',
        //bottom: 10,
    },
    picker: {
        height: 'auto',
        width: '100%',
        
    },
    pickerItem: {
        fontSize: 14, // Picker.Item의 폰트 크기를 조정
    },
});