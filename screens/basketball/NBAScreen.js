import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import api from '../common/api';

export default function NBAScreen() {
  const navigation = useNavigation();

  const [teams, setTeams] = useState([]); // 팀 목록
  const [players, setPlayers] = useState([]); // 전체 선수 목록
  const [selectedConference, setSelectedConference] = useState('East'); // 컨퍼런스 선택
  const [selectedTeam, setSelectedTeam] = useState(''); // 선택된 팀 ID
  const [filteredPlayers, setFilteredPlayers] = useState([]); // 필터링된 선수 목록
  const [refreshing, setRefreshing] = useState(false);

  // 새로고침 로직
  const onRefresh = () => {
    setRefreshing(true);
    fetchTeamsAndPlayers();
    setTimeout(() => setRefreshing(false), 500);
  };

  // API로 팀과 선수 데이터를 가져오는 함수
  const fetchTeamsAndPlayers = async () => {
    try {
      const teamsResponse = await api.get('/api/teams/nba');
      const playersResponse = await api.get('/api/players/nba');

      const nbaTeams = teamsResponse.data.filter((team) => team.conference === selectedConference);
      setTeams(nbaTeams);

      setPlayers(playersResponse.data);

      // 최초로 선택된 팀 (동부 컨퍼런스 첫 팀)
      if (nbaTeams.length > 0) {
        const initialTeamId = nbaTeams[0]?.id;
        setSelectedTeam(initialTeamId);
        filterPlayersByTeam(initialTeamId, playersResponse.data);
      }
    } catch (error) {
      console.error('Error fetching NBA teams/players:', error);
    }
  };

  // 팀 선택 시 선수 필터링
  const filterPlayersByTeam = (teamId, allPlayers) => {
    const filtered = allPlayers.filter((player) => player.teamId === teamId);
    setFilteredPlayers(filtered);
  };

  const handleTeamChange = (teamId) => {
    setSelectedTeam(teamId);
    filterPlayersByTeam(teamId, players);
  };

  useEffect(() => {
    fetchTeamsAndPlayers();
  }, [selectedConference]);

  function convertHeightToMeters(height) {
    const [feet, inches] = height.split('-').map(Number);
    const meters = (feet * 0.3048) + (inches * 0.0254);
    return meters.toFixed(2);
  }

  function convertWeightToKg(weight) {
    const kilograms = weight * 0.453592;
    return kilograms.toFixed(1);
  }

  return (
    <View style={styles.container}>
      {/* 컨퍼런스 선택 영역 */}
      {/* <View style={styles.conferenceContainer}>
        <TouchableOpacity onPress={() => setSelectedConference('East')} style={styles.conferenceButton}>
          <Text style={selectedConference === 'East' ? styles.selectedText : styles.conferenceText}>동부 컨퍼런스</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedConference('West')} style={styles.conferenceButton}>
          <Text style={selectedConference === 'West' ? styles.selectedText : styles.conferenceText}>서부 컨퍼런스</Text>
        </TouchableOpacity>
      </View> */}

      {/* 팀 선택 콤보박스 */}
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedTeam} onValueChange={(value) => setSelectedConference(value)} style={styles.picker}>
            <Picker.Item label="동부" value="East" style={styles.conferenceText}/>
            <Picker.Item label="서부" value="West" style={styles.conferenceText}/>
        </Picker>
        <Picker selectedValue={selectedTeam} onValueChange={(value) => handleTeamChange(value)} style={styles.pickerTeam }>
          {teams.map((team) => (
            <Picker.Item key={team.id} label={team.fullName} value={team.id} />
          ))}
        </Picker>
      </View>

      {/* 선수 목록 출력 */}
      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.tableHeader}>
            <Text style={[styles.tableLeftCell, styles.headerCell]}>이름</Text>
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
              <Text style={styles.tableLeftCell}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.tableCell}>{item.jerseyNumber || 'N/A'}</Text>
              <Text style={styles.tableCell}>{item.position || 'N/A'}</Text>
              <Text style={styles.tableCell}>{convertHeightToMeters(item.height) + "m" || 'N/A'}</Text>
              <Text style={styles.tableCell}>{convertWeightToKg(item.weight) + "kg"|| 'N/A'}</Text>
            </View>
          </TouchableOpacity>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
  },
  conferenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  conferenceButton: {
    padding: 10,
  },
  conferenceText: {
    color: 'gray',
    fontSize: 16,
  },
  selectedText: {
    color: '#FFD73C',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    //borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    //height: 50,
    //margin: 5,
    flex: 1,
  },
  pickerTeam: {
    //height: 50,
    //margin: 5,
    color: 'gray',
    flex: 2
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
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  tableLeftCell: {
    flex: 1,
    textAlign: 'left',
    fontSize: 14,
  },
});
