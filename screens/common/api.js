import axios from 'axios';

const api = axios.create({
    baseURL: 'https://baskettime.co.kr',  // 운영서버
    //baseURL: 'http://192.168.219.113:8080',  // 기본 서버 URL
    timeout: 10000,  // 요청 제한 시간 설정 (선택 사항)
    headers: { 'Content-Type': 'application/json' }  // 공통 헤더 설정 (필요에 따라)
});

export default api;
