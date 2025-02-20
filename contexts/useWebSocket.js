import { useEffect, useState, useContext } from 'react';
import { Client } from '@stomp/stompjs';
import { SessionContext } from './SessionContext';

const useWebSocket = (roomId) => {
  const [stompClient, setStompClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false); // 연결 상태 관리
  const { session } = useContext(SessionContext); // 세션 정보 가져오기

  useEffect(() => {
    const brokerURL = 'ws://192.168.219.113:8080/ws';
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
          console.log("메시지 수신 : " + message.body);
          const receivedMessage = JSON.parse(message.body);
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });
      },

      onStompError: (error) => {
        console.error('❌ STOMP 오류:', error);
      },

      onDisconnect: () => {
        console.log('❌ WebSocket 연결 종료');
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
      console.log('📤 메시지 전송:', message);
      stompClient.publish({
        destination: `/app/chat/${roomId}`,
        body: JSON.stringify({ message: message, sender : session.nickName }),
      });
    } else {
      console.warn('⏳ WebSocket 연결 대기 중... 1초 후 재시도');
      
      // STOMP 연결이 완전히 이루어질 때까지 재시도 (최대 3초 대기)
      setTimeout(() => {
        if (stompClient && stompClient.connected) {
          stompClient.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify({ message: message, sender : session.nickName }),
          });
        } else {
          console.error('🚨 WebSocket 연결 실패. 메시지 전송 불가');
        }
      }, 1000);
    }
  };

  return { messages, sendMessage, connected };
};

export default useWebSocket;
