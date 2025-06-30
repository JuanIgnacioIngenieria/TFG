import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, 
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, 
  Keyboard, Image, Animated,Dimensions,
  
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { IMAGES } from '@/assets/images';


// Utilizaremos esto para obtener las dimensiones de nuestro telefono
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const RegisterScreen = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [secondName, setSecondName] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    user: '',
    email: '',
    password: '',
    firstName: '',
    secondName: '',
    phoneNumber: '',
  });
 
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;


  //Funcion que valida los campos
  const validateFields = () => {
    let errors = {
      user: '',
      email: '',
      password: '',
      firstName: '',
      secondName: '', 
      phoneNumber: '',
    };
    let isValid = true;

    if (!user.trim()) {
      errors.user = 'Usuario es requerido';
      isValid = false;
    }
    if (!email.trim()) {
      errors.email = 'Email es requerido';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }
    if (!password) {
      errors.password = 'Contraseña es requerida';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Mínimo 6 caracteres';
      isValid = false;
    }
    if (!firstName.trim()) {
      errors.firstName = 'Nombre es requerido';
      isValid = false;
    }
    if (!secondName.trim()) {
      errors.secondName = 'Apellidos son requeridos';
      isValid = false;
    }
    if (!phoneNumber.trim()) {
      errors.phoneNumber = 'Teléfono es requerido';
      isValid = false;
    } else if (!/^\d{9}$/.test(phoneNumber)) {
      errors.phoneNumber = 'Debe tener 9 dígitos';
      isValid = false;
    }
    setFieldErrors(errors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateFields()) return;

    try {
      const response = await fetch('http://192.168.1.32:3000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user.trim(),
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          secondName: secondName.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Asignar el error al campo correspondiente
        const errMsg = data.error || 'Error al registrarse';
        let errors = { user: '', email: '', password: '', firstName: '', secondName: '', phoneNumber: '' };

        if (errMsg.toLowerCase().includes('email')) {
          errors.email = errMsg;
        } else if (errMsg.toLowerCase().includes('usuario') || errMsg.toLowerCase().includes('nombre de usuario')) {
          errors.user = errMsg;
        } else if
         (errMsg.toLowerCase().includes('telefono')){
          errors.phoneNumber = errMsg;
         }else{
          // En caso de otro error, mostrarlo bajo el campo de usuario
          errors.user = errMsg;
        }
        setFieldErrors(errors);
        return;
      }

       console.log('Registro exitoso, redireccionando al login…');
       router.replace('/InicioSesion');
      
      setTimeout(() => {
      setUser('');
      setEmail('');
      setPassword('');
      setFirstName('');
      setSecondName('');
      setPhoneNumber('');
      setFieldErrors({
        user: '', email: '', password: '', firstName: '', secondName: '', phoneNumber: '',
      });
    }, 500);

    } catch (error: any) {
      // Error de conexión
      const connErr = error.message.includes('Failed to fetch')
        ? 'No se puede conectar al servidor'
        : 'Error inesperado';
      setFieldErrors(prev => ({ ...prev, user: connErr }));
    }
  };

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [slideAnim]);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : 'height'}
          style={styles.inner}
        >
          <Animated.View
            style={[styles.registerBox, { transform: [{ translateY: slideAnim }] }]}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back-outline" size={28} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Regístrate</Text>

            {/* Usuario */}
            <View style={[styles.inputContainer, fieldErrors.user && styles.inputError]}>
              <Image
                source={IMAGES.USER_ICON}
                style={styles.iconLeft}
              />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={user}
                onChangeText={text => { setUser(text); setFieldErrors(prev => ({ ...prev, user: '' })); }}
              />
            </View>
            {fieldErrors.user ? <Text style={styles.fieldErrorText}>{fieldErrors.user}</Text> : null}

            {/* Email */}
            <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
              <Image source={IMAGES.MAIL_ICON} style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={text => { setEmail(text); setFieldErrors(prev => ({ ...prev, email: '' })); }}
              />
            </View>
            {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}

            {/* Contraseña */}
            <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
              <Image source={IMAGES.LOCK_ICON} style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={text => { setPassword(text); setFieldErrors(prev => ({ ...prev, password: '' })); }}
              />
            </View>
            {fieldErrors.password ? <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text> : null}

            {/* Nombre */}
            <View style={[styles.inputContainer, fieldErrors.firstName && styles.inputError]}>
              <Image source={IMAGES.NAME_ICON} style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={text => { setFirstName(text); setFieldErrors(prev => ({ ...prev, firstName: '' })); }}
              />
            </View>
            {fieldErrors.firstName ? <Text style={styles.fieldErrorText}>{fieldErrors.firstName}</Text> : null}

            {/* Apellidos */}
            <View style={[styles.inputContainer, fieldErrors.secondName && styles.inputError]}>
              <Image source={IMAGES.NAME_ICON} style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Apellidos"
                placeholderTextColor="#999"
                value={secondName}
                onChangeText={text => { setSecondName(text); setFieldErrors(prev => ({ ...prev, secondName: '' })); }}
              />
            </View>
            {fieldErrors.secondName ? <Text style={styles.fieldErrorText}>{fieldErrors.secondName}</Text> : null}

            {/* Telefono */}
            <View style={[styles.inputContainer, fieldErrors.phoneNumber && styles.inputError]}>
              <Image source={IMAGES.MOVIL_ICON} style={styles.iconLeft} />
              <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                placeholderTextColor="#999"
                value={phoneNumber}
                keyboardType="phone-pad"
                onChangeText={text => {
                  const formatted = text.replace(/[^0-9]/g, '');
                  setPhoneNumber(formatted);
                  setFieldErrors(prev => ({ ...prev, phoneNumber: '' }));
                }}
                maxLength={9}
              />
            </View>
            {fieldErrors.phoneNumber ? <Text style={styles.fieldErrorText}>{fieldErrors.phoneNumber}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>REGISTRARSE</Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: '#000' 
  },
  registerBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-ExtraBold',
    color: '#000',
    alignSelf: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245,245,245)',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 47,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff4d4f',
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 14,
    fontFamily: 'Poppins-ExtraBold',
  },
  fieldErrorText: {
    color: '#ff4d4f',
    fontSize: 10,
    marginTop: -5,
    marginBottom: 5,
    marginLeft: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 0, 255, 0.9)',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginTop: 10,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Poppins-ExtraBold',
  },
  iconLeft: {
    width: 40,
    height: 50,
    resizeMode: 'contain',
  },
  backButton: {
    position: 'absolute',
    top: 28,
    left: 15,
    zIndex: 10,
    padding: 8,
  },
});
