import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../common/api';
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
            <Picker.Item key={team.id} label={team.fullName} value={team.id} />
          ))}
        </Picker>
      </View>

      {/* 선수 목록 출력 영역 */}
      {selectedTeam ? (
        <FlatList
          data={filteredPlayers}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.headerCell]}>이름</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>넘버</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>포지션</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>키</Text>
              <Text style={[styles.tableCell, styles.headerCell]}>몸무게</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => navigation.navigate('PlayerDetail', { player: item, teamName: teams.find((team) => team.id === selectedTeam)?.fullName })}
            >
              <View style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.tableCell}>{item.jerseyNumber || 'N/A'}</Text>
                <Text style={styles.tableCell}>{item.position || 'N/A'}</Text>
                <Text style={styles.tableCell}>{item.height || 'N/A'}</Text>
                <Text style={styles.tableCell}>{item.weight || 'N/A'}</Text>
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
    padding: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    //backgroundColor: '#f0f0f0',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    //borderRadius: 5,
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
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  tableLeftCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
  },
});
