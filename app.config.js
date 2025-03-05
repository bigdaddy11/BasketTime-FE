export default ({ config }) => {
    return {
      ...config,
      extra: {
        websocketUrl:
          process.env.EXPO_PUBLIC_ENV === "production"
            ? "wss://baskettime.co.kr/ws" // 운영용 WebSocket
            : "ws://192.168.219.113:8080/ws",  // 개발용 WebSocket
      },
    };
  };
  