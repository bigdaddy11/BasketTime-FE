import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SortPicker = ({ onSortChange }) => {
  const [selectedSort, setSelectedSort] = useState('latest');

  const handleSortChange = (value) => {
    setSelectedSort(value);
    if (onSortChange) {
      onSortChange(value);
    }
  };

  return (
    <View style={{ justifyContent: "center", backgroundColor: "#eee",}}>
      <Picker
        selectedValue={selectedSort}
        onValueChange={handleSortChange}
        style={{ width: 100, height: 30}}
        
      >
        <Picker.Item label="최신순" value="latest" style={styles.pickerItem}/>
        <Picker.Item label="인기순" value="popular" style={styles.pickerItem}/>
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
    pickerItem: {
      fontSize: 13,
    },
  });

export default SortPicker;
