import Toast from 'react-native-toast-message';

export const showToast = ({ type = 'info', text1 = '', text2 = '', position = 'bottom' }) => {
  Toast.show({
    type,       // 'success', 'error', 'info' 등 Toast 타입
    text1,      // 제목 또는 주요 메시지
    text2,      // 부가 설명
    position,   // 'top', 'bottom' 위치 지정
  });
};
