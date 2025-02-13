import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import PlaceModal from "./PlaceModal";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import * as SecureStore from 'expo-secure-store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { showToast } from "../common/toast";

const GoogleMapScreen = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState({
    latitude: 37.5665,
    longitude: 126.9780,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [markers, setMarkers] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null); // 선택된 장소 정보
  const [isModalVisible, setIsModalVisible] = useState(false); // 모달 상태

  const [apiKey, setApiKey] = useState(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const key = await SecureStore.getItemAsync("GOOGLE_MAPS_API_KEY");
        if (key) {
          setApiKey(key);
        } else {
          console.error("❌ API Key가 저장되지 않았습니다.");
        }
      } catch (error) {
        console.error("❌ API Key 불러오기 실패:", error);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        showToast({
                    type: "error",
                    text1: "위치 권한이 거부되었습니다.",
                    position: "bottom",
                });
        // 위치 권한 거부 시 기본 좌표로 검색
        searchPlaces("농구장", region.latitude, region.longitude);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
     
      const userRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setRegion(userRegion);

      // 현 위치 기준으로 검색 실행
      searchPlaces("농구장", userRegion.latitude, userRegion.longitude);
    })();
    
    // 최초 로딩 시 기본 좌표로 검색
    searchPlaces(region.latitude, region.longitude);

  }, [apiKey]);

    const moveToCurrentLocation = async () => {
        // 위치 권한 요청
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            setErrorMsg('위치 권한이 거부되었습니다.');
            return;
        }

        // 현재 위치 가져오기
        let location = await Location.getCurrentPositionAsync({});
        const userRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
        setRegion(userRegion);
    }

  const searchPlaces = async (query, latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${latitude},${longitude}&radius=5000&key=${apiKey}`;
    try {
      let response = await fetch(url);
      let data = await response.json();

      if (data.results) {
        const places = data.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
          address: place.formatted_address || "주소 정보 없음",
          rating: place.rating || "평점 없음",
          image: place.photos ? getPhotoUrl(place.photos[0].photo_reference) : null,
        }));
        setMarkers(places);
      }
    } catch (error) {
      console.error("장소 검색 실패:", error);
    }
  };

  // 구글 장소 사진 URL 생성 함수
  const getPhotoUrl = (photoReference) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}`;
  };
  const handleMarkerPress = (place) => {
    setSelectedPlace(place);
    setIsModalVisible(true);
  };

  // 맵 이동 시 이벤트
  const handleRegionChangeComplete = (newRegion) => {
    // 이전 지역과 비교
    const isSameRegion =
    Math.abs(newRegion.latitude - region.latitude) < 0.001 &&
    Math.abs(newRegion.longitude - region.longitude) < 0.001;

    if (!isSameRegion) {
        setRegion(newRegion); // 지역 상태 업데이트
        searchPlaces(searchQuery || "농구장", newRegion.latitude, newRegion.longitude); // 검색 실행
    }
  };
 
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={moveToCurrentLocation}>
            <MaterialIcons name="my-location" size={24} color="#FFD73C" />
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.searchBox}
        placeholder="우리 동네 농구장 검색"
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={() => searchPlaces(searchQuery || "농구장", region.latitude, region.longitude)}
      />
      <MapView 
        style={styles.map} 
        region={region} 
        onRegionChangeComplete={handleRegionChangeComplete} // 맵 이동 완료 시 이벤
        >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={marker.name}
            onPress={() => handleMarkerPress(marker)} // 마커 클릭 이벤트
          />
        ))}
      </MapView>
 
      {/* 모달이 정상적으로 열리는지 확인 */}
      {isModalVisible && selectedPlace && (
        <PlaceModal
          isVisible={isModalVisible}
          place={selectedPlace}
          onClose={() => {
            setIsModalVisible(false);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBox: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  map: { flex: 1 },
  buttonContainer: {
    position: 'absolute',
    top: 20,
    left: 10,
    weight: 20,
    borderRadius: 30,
    marginRight: 2,
    padding: 8,
    backgroundColor: "white",
    zIndex: 1,
},
});

export default GoogleMapScreen;
