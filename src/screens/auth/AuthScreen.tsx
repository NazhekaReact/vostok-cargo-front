import { Lock, Mail, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { loginRequest, registerRequest } from '../../api/auth';
import styles from '../../styles/appStyles';

const roles = [
  { id: 'CUSTOMER', label: 'Заказчик' },
  { id: 'LOGISTICIAN', label: 'Логист' },
  { id: 'DRIVER', label: 'Водитель' },
];

export default function AuthScreen({ onAuth, showToast }: any) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState('CUSTOMER');
  const [name, setName] = useState('Didar');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const submit = async () => {
    if (!email.trim() || !password.trim() || (isRegister && !name.trim())) {
      showToast('Заполните поля');
      return;
    }

    if (isRegister && role === 'DRIVER' && !phone.trim()) {
      showToast('Телефон обязателен для водителя');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = isRegister
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
            role,
            ...(phone.trim() ? { phone: phone.trim() } : {}),
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const data = isRegister ? await registerRequest(payload) : await loginRequest(payload);

      if (!data?._id) {
        showToast('Бэк не вернул пользователя');
        return;
      }

      onAuth(data);
      showToast(isRegister ? 'Аккаунт создан' : 'Вход выполнен');
    } catch (error: any) {
      console.log('AUTH ERROR:', error?.response?.data || error?.message || error);
      showToast(error?.response?.data?.message || 'Ошибка авторизации');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollPadding, styles.authContainer]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.authTitle}>Vostok Cargo</Text>
      <Text style={styles.authSubtitle}>
        {isRegister ? 'Создайте аккаунт под свою роль' : 'Войдите в аккаунт'}
      </Text>

      <View style={styles.authCard}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabBtnText, mode === 'login' && styles.tabBtnTextActive]}>
              Вход
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.tabBtnText, mode === 'register' && styles.tabBtnTextActive]}>
              Регистрация
            </Text>
          </TouchableOpacity>
        </View>

        {isRegister && (
          <View style={styles.inputIconWrap}>
            <User size={18} color="#9ca3af" />
            <TextInput
              style={styles.inputIcon}
              placeholder="Имя"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={styles.inputIconWrap}>
          <Mail size={18} color="#9ca3af" />
          <TextInput
            style={styles.inputIcon}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputIconWrap}>
          <Lock size={18} color="#9ca3af" />
          <TextInput
            style={styles.inputIcon}
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {isRegister && role === 'DRIVER' && (
          <View style={styles.inputIconWrap}>
            <Phone size={18} color="#9ca3af" />
            <TextInput
              style={styles.inputIcon}
              placeholder="Телефон"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        )}

        {isRegister && (
          <View style={styles.mb4}>
            <Text style={styles.inputLabel}>Роль</Text>
            <View style={styles.roleGrid}>
              {roles.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.rolePill, role === item.id && styles.rolePillActive]}
                  onPress={() => setRole(item.id)}
                >
                  <Text style={[styles.rolePillText, role === item.id && styles.rolePillTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.btnBlueShadow} onPress={submit} disabled={isSubmitting}>
          <Text style={styles.btnTextWhiteLg}>
            {isSubmitting ? 'Подождите...' : isRegister ? 'Создать аккаунт' : 'Войти'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
