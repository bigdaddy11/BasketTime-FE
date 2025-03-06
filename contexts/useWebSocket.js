import { useEffect, useState, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import { SessionContext } from './SessionContext';
import api from '../screens/common/api';
import { showToast } from '../screens/common/toast';

const useWebSocket = (roomId) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false); // 연결 상태 관리
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  // 개발 환경 확인
  
  const SOCKET_SERVER_URL = api.defaults.baseURL.replace(/^http/, "ws");

  //console.log(SOCKET_SERVER_URL + "/ws");
  useEffect(() => {
    //const brokerURL = "wss://baskettime.co.kr/ws";
    const brokerURL = SOCKET_SERVER_URL + "/ws";
    const client = new Client({
      brokerURL,
      reconnectDelay: 5000, // 자동 재연결 (5초 후)
      forceBinaryWSFrames: true,  // 바이트 전송 허용
      appendMissingNULLonIncoming: true,  // 메시지 끝에 NULL 추가 방지
      //debug: (msg) => console.log(`[STOMP Debug]: ${msg}`), // 디버깅 로그

      onConnect: () => {
        console.log('✅ WebSocket 연결 성공');
        setConnected(true);

        // 채팅방 별 구독
        const topic = `/topic/chat/${roomId}`;
        client.subscribe(topic, (message) => {
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },

      onStompError: (error) => {
        showToast
        ({
            type: 'error',
            text1: '❌ STOMP 오류',
            position: 'bottom',
         });
      },

      onDisconnect: () => {
        setConnected(false);
      },
    });

    client.activate(); // STOMP 클라이언트 실행
    setStompClient(client);

    return () => {
      client.deactivate(); // 컴포넌트 언마운트 시 연결 해제
    };
  }, [roomId]);

  // 메시지 보내기 함수 (연결 확인 후 전송)
  const sendMessage = (message) => {
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({ message: message, sender : session.id }),
      });
    } else {
      showToast
      ({
          type: 'error',
          text1: '⏳ 연결 대기 중... 1초 후 재시도',
          position: 'bottom',
      });
      
      // STOMP 연결이 완전히 이루어질 때까지 재시도 (최대 3초 대기)
      setTimeout(() => {
        if (stompClient && stompClient.connected) {
          stompClient.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify({ message: message, sender : session.id }),
          });
        } else {
          showToast
          ({
              type: 'error',
              text1: '🚨메시지 전송 불가',
              position: 'bottom',
          });
        }
      }, 1000);
    }
  };

  return { messages, sendMessage, connected };
};

export default useWebSocket;
