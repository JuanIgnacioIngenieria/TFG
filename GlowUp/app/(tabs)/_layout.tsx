
import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, ImageBackground, Image } from 'react-native';
import { Asset } from 'expo-asset';
import { AuthProvider } from '../context/AuthContext';
import { IMAGES } from '@/assets/images';

export default function TabsLayout() {
  
  return (
    <AuthProvider>
      {/*Error con esta linea al no displayearse el background igual que con el layaout del inicio sesion y registro  */}
      <ImageBackground source={IMAGES.BACKGROUND2} style={styles.background}>
        <Tabs
          screenOptions={({ route }) => {
            {/*Nombres displayeados en funcion de la ruta que sea */}
            let label = '';
            switch (route.name) {
              case 'Feed': label = 'Inicio'; break;
              case 'Home': label = 'HomeGym'; break;
              case 'Profile': label = 'Perfil'; break;
              default: label = route.name;
            }
            {/*Estilos para la tapBar*/}
            return {
              headerShown: false,
              tabBarStyle: styles.tapBar,
              tabBarShowLabel: true,
              tabBarLabel: label,
              cardStyle: { backgroundColor: 'transparent' },
              tabBarLabelStyle: {
                fontSize: 11,
                marginBottom: 4,
                fontFamily: 'Poppins-ExtraBold',
              },

              //Eleccion de icono en funcion de la ruta
              tabBarIcon: ({ focused }) => {
                  let iconSource = 
                    route.name === 'Feed'    ? IMAGES.FEED_ICON
                  : route.name === 'Home'    ? IMAGES.HOME_ICON
                  : route.name === 'Profile' ? IMAGES.PROFILE_ICON
                  : undefined;
                {/*Iconos mas grandes al ser selecionados*/}
                  return (
                    <Image  
                    source={iconSource} 
                    style={[
                      styles.icon, 
                      {transform: [{ scale: focused ? 1.4 : 1}]}
                    ]}
                  resizeMode="contain" />
                  );
                },
              //Colores para las letras
              tabBarActiveTintColor: 'rgba(116, 116, 116, 0.9)',
              tabBarInactiveTintColor: 'rgba(180, 180, 180, 0.9)',
            };
          }}
        > {/*orden de aparicion de los iconos */}
          <Tabs.Screen name="Feed" />
          <Tabs.Screen name="Home" />
          <Tabs.Screen name="Profile" />
        </Tabs>
       </ImageBackground>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  tapBar: {
    backgroundColor: '#fff',
    height: 65,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,

    
  },
  icon: {
    width: 24,
    height: 24
  },

  
});
