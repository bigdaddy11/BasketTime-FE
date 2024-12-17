import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import axios from 'axios';
import ImagePath from '../common/ImagePath';
import { useNavigation } from '@react-navigation/native';
import api from '../common/api';

export default function NBAScreen() {
    const navigation = useNavigation();

    const [standings, setStandings] = useState([]);
    const [selectedScreen, setSelectedScreen] = useState('East'); // 현재 선택된 화면 상태
    const [selectedTeam, setSelectedTeam] = useState(null); // 현재 선택된 팀
    const [players, setPlayers] = useState({});

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = () => {
      setRefreshing(true);
      setTimeout(() => setRefreshing(false), 500); // 새로고침 로직 (예: 데이터 로드)
    };

    const handlePlayerPress = (player, teamName) => {
      // 선수 클릭 시, 선수의 데이터를 파라미터로 전달하며 상세 정보 화면으로 이동
      navigation.navigate('PlayerDetail', { player, teamName });
    };

    function getPlayersByTeam(teamId, allPlayers) {
      return allPlayers.filter((player) => player.teamId === teamId);
    }

    useEffect(() => {
        const fetchTeamsAndPlayers = async () => {
          try {
            // 팀 정보 가져오기
            const teamsResponse = await api.get('/api/teams/nba');
            setStandings(teamsResponse.data); // 데이터가 data 필드에 있다고 가정

            // 전체 플레이어 데이터 가져오기
            const playersResponse = await api.get('/api/players/nba');
              
            const allPlayers = playersResponse.data;
            // 팀별로 플레이어를 분류
            const playersByTeam = {};
            teamsResponse.data.forEach((team) => {
              playersByTeam[team.id] = getPlayersByTeam(team.id, allPlayers);
            });
            
            setPlayers(playersByTeam);
          } catch (error) {
            console.error(error);
          }
        };
            fetchTeamsAndPlayers();
        }, []);

        // 팀을 클릭했을 때 선수 목록을 보여주는 함수
        const handleTeamPress = (teamId) => {
            setSelectedTeam(selectedTeam === teamId ? null : teamId);  // 이미 선택한 팀이면 닫기
        };

    return (
      <ScrollView style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        
      <View style={styles.conference}>
        <TouchableOpacity style={styles.conferenceText} onPress={() => setSelectedScreen('East')}>
          <Image source={ImagePath["eastern"]} style={styles.smalllogo}/>
          <Text style={{color: selectedScreen === 'East' ? '#FFD73C' : 'gray'}}>동부 컨퍼런스</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.conferenceText} onPress={() => setSelectedScreen('West')}>
          <Image source={ImagePath["western"]} style={styles.smalllogo}/>
          <Text style={{color: selectedScreen === 'West' ? '#FFD73C' : 'gray'}}>서부 컨퍼런스</Text>
        </TouchableOpacity>
      </View>
      
      <View>
      {standings.map((item) => {
      // 비교를 문자열로 변환하여 일관성 있게 처리
      if (item.conference === selectedScreen) {
        return (
          <TouchableOpacity 
            key={item.id} 
            style={{flex: 1, justifyContent: "center"}}
            onPress={() => handleTeamPress(item.id)}
          >
            <View key={item.id + "-view"} style={styles.standingsItem}>
              <Image 
                source={ImagePath[item.fullName]} 
                style={styles.logo}
              />
              <Text style={{fontSize: 16}}>{item.fullName}</Text>
            </View>

            {/* 선수 목록을 표시하는 부분 */}
            {selectedTeam === item.id && (
                <View style={styles.playersList}>
                  {players[item.id] && players[item.id].length > 0 ? (
                      players[item.id].map((player) => (
                        <TouchableOpacity
                          key={player.id} 
                          onPress={() => handlePlayerPress(player, item.fullName)}
                        >
                          <View style={{ flexDirection: "row", padding: 5, alignItems: "center"}} key={player.id + "-view"} >
                            <Image
                              source={ImagePath["defaultIcon"]} 
                              style={styles.playerlogo}
                            />
                            <Text style={styles.playerName}>
                            {player.firstName} {player.lastName} 
                            </Text>
                          </View>
                        </TouchableOpacity>
                        ))
                      ) : (
                        <Text>No players found for this team</Text>
                    )}
                  </View>
                )}
                    </TouchableOpacity>
                  );
                } else {
                  return null;
                }
              })}
    </View>
  </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    //padding: 20,
    backgroundColor: 'white',
  },
  conference: {
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 10,
    borderBottomColor: "whitesmoke", 
    borderBottomWidth: 1
  },
  conferenceText: {
    //marginRight: 0,
    flexDirection: "row",
    padding: 5,
    //borderRightColor: "whitesmoke", 
    //borderRightWidth: 1
  },
  standingsItem: {
    padding: 10,
    //marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "whitesmoke", 
    borderBottomWidth: 1
  },
  logo: {
      width: 90,
      height: 60,
      resizeMode: 'cover',
      borderRadius: 30,
      marginRight: 10,
  },
  playerlogo: {
    width: 40,
    height: 40,
    resizeMode: 'cover',
    borderRadius: 30,
    marginRight: 10,
  },
  smalllogo: {
      width: 20,
      height: 20,
      resizeMode: 'cover',
      borderRadius: 30,
      marginRight: 3,
  },
  playersList: {
    marginLeft: 40,
    paddingBottom: 10,
  },
  playerName: {
    fontSize: 16,
    paddingVertical: 2,
  },
});
