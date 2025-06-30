import React, { useState, useRef, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,KeyboardAvoidingView,
Platform,TouchableWithoutFeedback,Keyboard,ActivityIndicator,Image,Animated,Dimensions,
} from 'react-native';

import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './context/AuthContext';
import { IMAGES } from '@/assets/images';



//Utilizaremos esto para obtener las dimensiones de nuestro telefono
const{height: SCREEN_HEIGHT} = Dimensions.get('window');



const LoginScreen = () => {
  //Router se usarara para avanzar en pantallas cuando tenemos logica adicional
  const router = useRouter();

  //utilizaremos la funcion login de nuestro contexto de autenticacion
  const { login } = useAuth();


  //Constantes de estados y de valores (inputs)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() =>{ //Con esto activamos la animacion del container
    Animated.timing(slideAnim, {
      toValue: 0, //Desde abajo
      duration: 600, //600ms
      useNativeDriver: true,
    }).start();
  },[slideAnim]);

  //FUNCION PRINCIPAL se encarga de manejar el login
  const handleLogin = async () => {
    //Resetea errores
    setError('');

    //1ºERROR valorado (campos vacios)
    if (!email || !password) {
      setError('Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.32:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      const data = await response.json();
       //Lanzar excepcion con el tipo de error para mostrarlo abajo
      if (!response.ok || !data.token) {
        throw new Error(data.error || 'Error de autenticación');
      }

      //Hacer login e iniciar la aplicacion guardando el usuario y token 
      await login(data.user, data.token);
      router.replace('../Feed');


      //Captura de errores
    } catch (err: unknown) {
      let errorMessage = 'Error inesperado';
      if (err instanceof Error) {
        if (err.message.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar al servidor';//2ºERROR cuando no hay conexion con el servidor
        } else {
          errorMessage = err.message; //3ERROR como contraseña incorrecta, usuario no encontrado etc..
        }
      }
      setError(errorMessage);
    } finally {//Una vez gestionado el error desactivamos la carga
      setLoading(false);
    }
  };

  return (
    <View style = {styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView behavior= {Platform.OS === 'ios' ? 'position' : 'height'} style={styles.inner}>
            <Animated.View style={[styles.loginBox, {transform:[{translateY: slideAnim}]},]}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back-outline" size={28} color="#333" />
              </TouchableOpacity>
              <Text style={styles.title}>Inicia sesión</Text>

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/*email*/}
              <View style={styles.inputContainer}>
                <Image source={IMAGES.MAIL_ICON}
                      style={styles.iconLeft}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
              
              {/*Contraseña*/}
              <View style={styles.inputContainer}>
                <Image source={IMAGES.LOCK_ICON}
                      style={styles.iconLeft}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contraseña"
                  placeholderTextColor="#999"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                ) : (
                  <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                )}
                <Text style={styles.buttonText}>INICIA SESIÓN</Text>
              </TouchableOpacity>
              </Animated.View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    backgroundColor: '#000' 
  },

  loginBox: {
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
  inner:{
    flex:1,
    justifyContent: 'flex-end'
  },
  title: {
    fontSize: 30,
    fontFamily: 'Poppins-ExtraBold',
    color: '#000',
    marginBottom: 25,
    alignSelf: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(245,245,245)',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: '100%',
    height: 50,
  },
  input: { 
    flex: 1, 
    color: '#000', 
    fontSize: 14, 
    fontFamily: 'Poppins-ExtraBold'
   },
  
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgb(255,136,0)', 
    borderRadius: 10, 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    marginTop: 20,
    alignSelf: 'center'
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 15, 
    fontFamily: 'Poppins-ExtraBold' 
  },
  bottomLinkContainer: {
    marginTop: 20,
    alignSelf: 'center'
  },
  volverLinkText: {
    color: '#666', 
    fontSize: 14, 
    textDecorationLine: 'underline' 
  },
  errorContainer: { 
    backgroundColor: '#FFF2F0', 
    borderWidth: 1, 
    borderColor: '#FFCCC7', 
    borderRadius: 4, 
    padding: 12, 
    marginBottom: 16, 
    width: '100%' 
  },
  errorText: { 
    color: '#FF4D4F', 
    fontSize: 14, 
    textAlign: 'center', 
    fontWeight: '500' 
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
    padding: 8 
  },
});
