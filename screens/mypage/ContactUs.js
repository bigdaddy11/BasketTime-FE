import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity
} from 'react-native';
import { useLoading } from '../../contexts/LoadingContext';
import emailjs from 'emailjs-com';

export default function ContactUs({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { showLoading, hideLoading } = useLoading(); // 로딩 상태 함수 가져오기

  useEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <TouchableOpacity onPress={handleSendEmail} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>전송</Text>
          </TouchableOpacity>
        ),
      });
    }, [name, email, message]);

  const handleSendEmail = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Error', '모든 필드를 입력해주세요.');
      return;
    }

    showLoading(); // 로딩 시작

    try {
      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
      };

      const result = await emailjs.send(
        'service_x5ku9bb', // EmailJS에서 생성한 Service ID
        'template_0uwyccc', // EmailJS에서 생성한 Template ID
        templateParams,
        'dbzx4n4V7Kh4rwVTr', // EmailJS에서 생성한 Public Key
      );

      if (result.status === 200) {
        Alert.alert('Success', '문의가 성공적으로 전송되었습니다.');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error('Email sending failed');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      Alert.alert('Error', '이메일 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
        hideLoading(); // 로딩 종료
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inputContainer}>
        <Text style={styles.label}>문의하기</Text>
        <TextInput
          style={styles.input}
          placeholder="이름"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.textArea}
          placeholder="문의 내용을 입력해주세요."
          value={message}
          onChangeText={setMessage}
          multiline
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flex: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 7,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
  },
  textArea: {
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
    fontSize: 14,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 20
  },
});
