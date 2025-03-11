import axios from 'axios';
import Constants from 'expo-constants';

const isFCM = Constants.expoConfig.extra.useFCM;
const baseURL = isFCM ? 'https://baskettime.co.kr' : 'http://192.168.219.113:8080';

const api = axios.create({
    baseURL: baseURL,  // 기본 서버 URL
    timeout: 10000,  // 요청 제한 시간 설정 (선택 사항)
    headers: { 'Content-Type': 'application/json' }  // 공통 헤더 설정 (필요에 따라)
});

export default api;
