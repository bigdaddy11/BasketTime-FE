import Toast from 'react-native-toast-message';

export const showToast = ({ 
  type = 'info', 
  text1 = '', 
  text2 = '', 
  position = 'bottom',
  visibilityTime = 1500 // 기본 지속 시간: 1.5초
}) => {
  Toast.show({
    type,       
    text1,      
    text2,      
    position,   
    visibilityTime, // 지속 시간 설정 추가
  });
};
