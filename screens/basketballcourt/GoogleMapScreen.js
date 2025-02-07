import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TextInput, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import PlaceModal from "./PlaceModal";

//const GOOGLE_MAPS_API_KEY = "AIzaSyCiP64B8lfsCRHNDa94JRJJ0JI1qd8kXuQ"; // API 키를 여기에 입력하세요.
const GOOGLE_MAPS_API_KEY = "AIzaSyD5TbdDeXOaL2B5V7tPv7TNIEZo0V2pJtI";

const GoogleMapScreen = () => {
  const mapViewRef = useRef(null);
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

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("위치 권한이 거부되었습니다.");
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

      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });

      setRegion(userRegion);

      // 현 위치 기준으로 검색 실행
      searchPlaces("농구장", userRegion.latitude, userRegion.longitude);
    })();
    
    // 최초 로딩 시 기본 좌표로 검색
    searchPlaces(region.latitude, region.longitude);

  }, []);

  const searchPlaces = async (query, latitude, longitude) => {
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&location=${latitude},${longitude}&radius=5000&key=${GOOGLE_MAPS_API_KEY}`;

    try {
      let response = await fetch(url);
      let data = await response.json();
      //console.log("전체 데이터:", JSON.stringify(data, null, 2));

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
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
  };
  const handleMarkerPress = (place) => {
    console.log(place);
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
        ref={mapViewRef}
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

      {/* 장소 정보 모달 */}
      <PlaceModal
        isVisible={isModalVisible}
        place={selectedPlace}
        onClose={() => setIsModalVisible(false)}
      />
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
});

export default GoogleMapScreen;
