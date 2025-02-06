import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../common/api.js';
import { useNavigation } from '@react-navigation/native';

export default function KBLScreen() {
  const navigation = useNavigation(); // 네비게이션 객체 생성

  const [teams, setTeams] = useState([]); // 팀 목록
  const [players, setPlayers] = useState([]); // 전체 선수 목록
  const [selectedTeam, setSelectedTeam] = useState(''); // 선택된 팀
  const [filteredPlayers, setFilteredPlayers] = useState([]); // 선택된 팀의 선수 목록

  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 로직
  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamsAndPlayers(); // 데이터 리로드
    setTimeout(() => setRefreshing(false), 500);
  };

  // 데이터 가져오기
  const fetchTeamsAndPlayers = async () => {
    try {
      const teamsResponse = await api.get('/api/teams/kbl');
      const playersResponse = await api.get('/api/players/kbl');

      setTeams(teamsResponse.data);
      setPlayers(playersResponse.data);

      const initialTeamId = teamsResponse.data[0]?.id; // 최초 팀 ID
      if (initialTeamId) {
        setSelectedTeam(initialTeamId); // 최초 팀 설정
        const initialPlayers = playersResponse.data.filter((player) => player.teamId === initialTeamId);
        setFilteredPlayers(initialPlayers); // 초기 선수 데이터 설정
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // 팀 선택 시 선수 필터링
  const handleTeamSelect = (teamId) => {
    setSelectedTeam(teamId);
    const filtered = players.filter((player) => player.teamId === teamId);
    setFilteredPlayers(filtered);
  };

  useEffect(() => {
    if (players.length > 0 && selectedTeam) {
      const filtered = players.filter((player) => player.teamId === selectedTeam);
      setFilteredPlayers(filtered);
    }
  }, [players, selectedTeam]);

  useEffect(() => {
    fetchTeamsAndPlayers();
  }, []);

  return (
    <View style={styles.container}>
      {/* 콤보박스 영역 */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedTeam}
          onValueChange={(value) => handleTeamSelect(value)}
          style={styles.picker}
        >
          {teams.map((team) => (
            <Picker.Item key={team.id} label={team.fullName} value={team.id} style={styles.conferenceText}/>
          ))}
        </Picker>
      </View>

      {/* 선수 목록 출력 영역 */}
      {selectedTeam ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('PlayerDetail', { player: item, teamName: teams.find((team) => team.id === selectedTeam)?.fullName })}
            >
              <View style={styles.tableRow}>
                <Image 
                    source={{ uri: item.imagePath }}
                    style={styles.imageStyle}
                />
                <Text style={styles.tableLeftCell}>{item.firstName} {item.lastName}</Text>
              </View>
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={styles.placeholderText}>팀을 선택하면 선수가 표시됩니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //padding: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: "flex-end",
    //backgroundColor: '#f0f0f0',
    //marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
    //borderRadius: 5,
    //width: "50%"
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  picker: {
    flex: 1,
    //backgroundColor: '#fff',
    color: 'gray',
    borderRadius: 5,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center"
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  tableLeftCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 16,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  imageStyle: {
    width: 40,
    height: 40,
    borderRadius: 20, // 둥근 이미지(원형)
    marginRight: 10
  },
  conferenceText: {
    color: 'gray',
    fontSize: 14,
  },
});
