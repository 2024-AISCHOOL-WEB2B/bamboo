import React, { useState } from 'react';
import { View, Text, TextInput, Switch, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router'; // useRouter 임포트

const SettingsScreen = () => {
  const router = useRouter(); // useRouter 훅 사용
  const [nickname, setNickname] = useState('천동이부');
  const [email, setEmail] = useState('sun1003@gmail.com');
  const [password, setPassword] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const toggleSwitch = () => setNotificationsEnabled(previousState => !previousState);

  const handleSave = () => {
    alert('설정이 저장되었습니다.');
  };

  const handleLogout = () => {
    alert('로그아웃 되었습니다.');
    router.push('../(init)'); // 로그아웃 시 ../(init)으로 이동
  };

  return (
    <View style={styles.container}>
      {/* 닉네임 */}
      <Text style={styles.label}>닉네임</Text>
      <TextInput
        style={styles.input}
        value={nickname}
        onChangeText={setNickname}
      />

      {/* 이메일 */}
      <Text style={styles.label}>이메일</Text>
      <TextInput
        style={styles.input}
        value={email}
        editable={false} // 이메일은 수정하지 않도록 비활성화
      />

      {/* 비밀번호 수정 */}
      <Text style={styles.label}>비밀번호 수정</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        placeholder="새 비밀번호 입력"
      />

      {/* 알림 받기 */}
      <View style={styles.toggleContainer}>
        <Text style={styles.label}>알림 받기</Text>
        <Switch
          onValueChange={toggleSwitch}
          value={notificationsEnabled}
          trackColor={{ false: '#767577', true: '#c6fdbf' }} // 트랙 색상 설정
          thumbColor={notificationsEnabled ? '#4a9960' : '#f4f3f4'} // 손잡이 색상 설정
        />
      </View>

      {/* 저장 및 로그아웃 버튼 */}
      <View style={styles.buttonContainer}>
        <View style={styles.button}>
          <Button title="저장" onPress={handleSave} color="#4a9960" />
        </View>
        <View style={styles.button}>
          <Button title="로그아웃" onPress={handleLogout} color="#4a9960" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 10,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: '45%',
  },
});

export default SettingsScreen;
