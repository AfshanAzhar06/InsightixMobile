import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import API from '../src/Services/api';
import { Ionicons } from '@expo/vector-icons';

const LoginRegisterScreen = () => {
  const [action, setAction] = useState('login'); // 'login', 'register', 'forgot'

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    organizationName: '',
    email: '',
    password: ''
  });
  const [forgotData, setForgotData] = useState({ email: '', newPassword: '' });

  const [errors, setErrors] = useState({}); // { email: '', password: '' }

  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 8;

  const handleLogin = async () => {
    let tempErrors = {};
    if (!loginData.email) tempErrors.email = 'Email is required';
    else if (!validateEmail(loginData.email)) tempErrors.email = 'Invalid email';

    if (!loginData.password) tempErrors.password = 'Password is required';
    else if (!validatePassword(loginData.password)) tempErrors.password = 'Password must be at least 8 characters';

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      const res = await API.post('/auth/login', loginData);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('role', res.data.role);

      if (res.data.role === 'admin') router.replace('/organization');
      else router.replace('/dashboard');
    } catch {
      setErrors({ general: 'Invalid credentials' }); 
    }
  };

  const handleRegister = async () => {
    let tempErrors = {};
    if (!registerData.organizationName) tempErrors.organizationName = 'Organization Name is required';
    if (!registerData.email) tempErrors.email = 'Email is required';
    else if (!validateEmail(registerData.email)) tempErrors.email = 'Invalid email';

    if (!registerData.password) tempErrors.password = 'Password is required';
    else if (!validatePassword(registerData.password)) tempErrors.password = 'Password must be at least 8 characters';

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      await API.post('/auth/register', registerData);
      setAction('login');
    } catch {
      setErrors({ general: 'Registration failed' });
    }
  };

  const handleForgotPassword = async () => {
    let tempErrors = {};
    if (!forgotData.email) tempErrors.email = 'Email is required';
    else if (!validateEmail(forgotData.email)) tempErrors.email = 'Invalid email';
    if (!forgotData.newPassword) tempErrors.newPassword = 'New Password is required';
    else if (!validatePassword(forgotData.newPassword)) tempErrors.newPassword = 'Password must be at least 8 characters';

    setErrors(tempErrors);
    if (Object.keys(tempErrors).length > 0) return;

    try {
      await API.post('/auth/forgot-password', forgotData);
      setAction('login');
      setForgotData({ email: '', newPassword: '' });
      setErrors({});
    } catch {
      setErrors({ general: 'Failed to reset password' });
    }
  };

  const PasswordInput = ({ value, onChangeText, placeholder, visible, toggleVisible, error }) => (
    <View style={{ marginBottom: 10 }}>
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#999"
          style={styles.inputPassword}
          secureTextEntry={!visible}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={toggleVisible} style={styles.eyeIcon}>
          <Ionicons name={visible ? "eye" : "eye-off"} size={24} color="#999" />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  const InputField = ({ value, onChangeText, placeholder, error }) => (
    <View style={{ marginBottom: 10 }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#999"
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f4f7f6' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo2.jpg')}
              style={styles.logo}
            />
            <Text style={styles.logoText}>INSIGHTIX</Text>
          </View>

          <View style={styles.card}>
            {errors.general && <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>{errors.general}</Text>}

            {action === 'login' && (
              <>
                <Text style={styles.title}>Login</Text>

                <InputField
                  placeholder="Email"
                  value={loginData.email}
                  onChangeText={(v) => setLoginData({ ...loginData, email: v })}
                  error={errors.email}
                />

                <PasswordInput
                  placeholder="Password"
                  value={loginData.password}
                  onChangeText={(v) => setLoginData({ ...loginData, password: v })}
                  visible={loginPasswordVisible}
                  toggleVisible={() => setLoginPasswordVisible(!loginPasswordVisible)}
                  error={errors.password}
                />

                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                  <Text style={styles.buttonText}>Login</Text>
                </TouchableOpacity>

                <Text style={styles.link} onPress={() => setAction('forgot')}>
                  Forgot Password?
                </Text>
                <Text style={styles.link} onPress={() => setAction('register')}>
                  Create Account
                </Text>
              </>
            )}

            {action === 'register' && (
              <>
                <Text style={styles.title}>Create Account</Text>

                <InputField
                  placeholder="Organization Name"
                  value={registerData.organizationName}
                  onChangeText={(v) => setRegisterData({ ...registerData, organizationName: v })}
                  error={errors.organizationName}
                />

                <InputField
                  placeholder="Email"
                  value={registerData.email}
                  onChangeText={(v) => setRegisterData({ ...registerData, email: v })}
                  error={errors.email}
                />

                <PasswordInput
                  placeholder="Password"
                  value={registerData.password}
                  onChangeText={(v) => setRegisterData({ ...registerData, password: v })}
                  visible={registerPasswordVisible}
                  toggleVisible={() => setRegisterPasswordVisible(!registerPasswordVisible)}
                  error={errors.password}
                />

                <TouchableOpacity style={styles.button} onPress={handleRegister}>
                  <Text style={styles.buttonText}>Register</Text>
                </TouchableOpacity>

                <Text style={styles.link} onPress={() => setAction('login')}>
                  Back to Login
                </Text>
              </>
            )}

            {action === 'forgot' && (
              <>
                <Text style={styles.title}>Forgot Password</Text>

                <InputField
                  placeholder="Email"
                  value={forgotData.email}
                  onChangeText={(v) => setForgotData({ ...forgotData, email: v })}
                  error={errors.email}
                />

                <PasswordInput
                  placeholder="New Password"
                  value={forgotData.newPassword}
                  onChangeText={(v) => setForgotData({ ...forgotData, newPassword: v })}
                  visible={forgotPasswordVisible}
                  toggleVisible={() => setForgotPasswordVisible(!forgotPasswordVisible)}
                  error={errors.newPassword}
                />

                <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
                  <Text style={styles.buttonText}>Reset Password</Text>
                </TouchableOpacity>

                <Text style={styles.link} onPress={() => setAction('login')}>
                  Back to Login
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginRegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  logo: { width: 50, height: 50, resizeMode: 'contain', marginRight: 1 },
  logoText: { fontSize: 30, fontWeight: 'bold', color: '#125049' ,marginRight: 30},
  card: { backgroundColor: '#fff', padding: 25, borderRadius: 16, elevation: 6 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 20, color: '#125049' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, fontWeight: '500', color: '#333' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 12 : 0 },
  inputPassword: { flex: 1, fontSize: 16, fontWeight: '500', color: '#333', paddingVertical: 14 },
  eyeIcon: { marginLeft: 10 },
  button: { backgroundColor: '#125049', paddingVertical: 15, borderRadius: 30, marginTop: 10 },
  buttonText: { color: '#fff', textAlign: 'center', fontSize: 17, fontWeight: '700' },
  link: { textAlign: 'center', marginTop: 14, color: '#125049', fontWeight: '600' },
  errorText: { color: 'red', marginTop: 4, fontSize: 16 }
});
