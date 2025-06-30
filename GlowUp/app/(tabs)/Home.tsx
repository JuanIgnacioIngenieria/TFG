import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Link } from 'expo-router';
import { IMAGES } from '@/assets/images';


const Home = () => {
  
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>
        {/*Primera Imagen decorativa abajo*/}
        <Image
          source={IMAGES.DECORACION}
          style={styles.Effect}
          resizeMode="cover"
        />

        {/*Textos tanto HomeGym como texto secundario*/}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitleBlack}>HOMEGYM</Text>
          </View>

          <Text style={styles.subTitle}>
            Hola {user?.handle ?? 'Usuario'},{"\n"}
            ¿Qué te apetece hacer hoy?
          </Text>
        </View>


        {/*Seccion botones*/}
        <View style={styles.bottomSection}>

          {/*Boton crear rutina manual*/}
          <Link href="../HomeGym/CrearRutina" asChild>
            <TouchableOpacity style={styles.button}>
              <Image
                source={IMAGES.LAPIZ_ICON}
                style={styles.iconLeft}
              />
              <Text style={styles.buttonText}>Crear rutina manual</Text>
            </TouchableOpacity>
          </Link>

          {/*Boton crear rutina AI*/}
          <Link href="../HomeGym/AICrearRutina" asChild>
            <TouchableOpacity style={styles.button}>
              <Image
                source={IMAGES.ROBOT_ICON}
                style={[styles.iconLeft, { marginLeft: 20 }]} 
              />
              <Text style={styles.buttonText}>Crear rutina asistente</Text>
            </TouchableOpacity>
          </Link>

          {/* Botón consultar rutinas*/}
          <Link href="../HomeGym/RutinasGuardadas" asChild>
          <TouchableOpacity style={styles.button}>
            <Image
              source={IMAGES.LIBRETA_ICON}
              style={styles.iconLeft}
            />
            <Text style={styles.buttonText}>Rutinas guardadas</Text>
          </TouchableOpacity>
        </Link>

        </View>

      </ImageBackground>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  Effect: {
    position: 'absolute',
    left: 0,
    top: '73%',
    width: '120%',
    height: 200,
    opacity: 0.9,
    zIndex: 1,
  },
  header: {
    marginTop: 60,
  },
  titleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 30,
    alignItems: 'center',
    alignSelf: 'center',
  },
  mainTitleBlack: {
    fontSize: 60,
    fontFamily: 'Poppins-ExtraBold',
    color: '#333',
    lineHeight: 75,
    alignSelf: 'center',
  },
  subTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-ExtraLight',
    color: '#333',
    lineHeight: 28,
    marginTop: 30,
    alignSelf: 'center',
    textAlign: 'center',
  },
  bottomSection: {
    marginTop: 200,
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 8,
    width: '68%',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: 'rgba(0, 0, 0, 0.9)',
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold',
    marginLeft: 10,
  },
  iconLeft: {
    width: 40,
    height: 50,
    resizeMode: 'contain',
  },
 
  imageBackground: {
    flex: 1,
  },
});
