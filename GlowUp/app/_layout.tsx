
import React, { useEffect, useState } from 'react';
import { StyleSheet, ImageBackground } from 'react-native';
import { Slot } from 'expo-router';
import { Asset } from 'expo-asset';
import { AuthProvider } from './context/AuthContext'; 
import {useFonts} from 'expo-font';
import { IMAGES } from '@/assets/images';
import { exerciseImages, materialIcons, difficultyIcons, videoMap } from '@/assets/exerciseImages';



export default function RootLayout() {

  const [ready, setReady] = useState(false);  //Estado para controlar precarga

  useEffect(() => {
    (async () => {
      //Obtiene todos los assets de imágenes de UI
      const uiAssets = Object.values(IMAGES);
      //todos los assets de ejercicios
      const exerciseAssets = Object.values(exerciseImages);
      const materialAssets = Object.values(materialIcons);
      const difficultyAssets = Object.values(difficultyIcons);
      const videoAssets = Object.values(videoMap);
      

      //Precarga ambos arrays juntos
      await Asset.loadAsync([...uiAssets, ...exerciseAssets, ...materialAssets, ...difficultyAssets, ...videoAssets]);
      setReady(true);
    })();
  }, []);

  const [fontsLoaded] = useFonts({
      'Poppins-ExtraBold': require('@/assets/fonts/Poppins-ExtraBold.ttf'),
      'Poppins-ExtraLight': require('@/assets/fonts/Poppins-ExtraLight.ttf'),
    });
  
  return (
    <AuthProvider>
      <ImageBackground source={IMAGES.BACKGROUND} style={styles.background}>
        <Slot />
      </ImageBackground>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
