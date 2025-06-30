// File: app/HomeGym/InfoEjercicios.tsx

import React, { useEffect, useRef } from 'react';
import {View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, Animated, } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelectedExercisesStore } from '@/app/HomeGym/SelectedExercises';
import { Video } from 'expo-av';
import ejerciciosDataRaw from '@/assets/data/ejercicios.json';
import { materialIcons, difficultyIcons, videoMap } from '@/assets/exerciseImages';

type JsonEjercicio = {
  id: number;
  nombre: string;
  tipo: string;
  descripcion?: string;
  repeticiones?: string;
  dificultad: string;
  numdificultad: string;
  requiereMaterial: 'Peso' | 'Gomas' | 'Ninguno';
  imagen?: string;
  clasificacion: string;
};

const InfoEjercicios = () => {
  // Lee el ejercicio de la ruta
  const { ejercicio, clase } = useLocalSearchParams<{ ejercicio: string; clase: string;}>();
  const navigation = useNavigation();

  // Accedede al store de ejercicios seleccionados
  const { toggleExercise, selectedExerciseIds } = useSelectedExercisesStore();

  // busca el ejercicio en el JSON por nombre
  const allEjercicios = ejerciciosDataRaw as JsonEjercicio[];
  const info = allEjercicios.find((e) => e.nombre === ejercicio);
  if (!info) return null;

  // Determinamos si esta seleccionado
  const isSelected = selectedExerciseIds.includes(info.id.toString());

  // Obtenemos el video
  const videoSource = videoMap[info.nombre] || null;

  // Obtenemos el icono de material usando la clave exacta

  const materialKey = info.requiereMaterial as keyof typeof materialIcons;
  const materialIcon = materialIcons[materialKey];

  // Obtenemos el icono de dificultad segun numdificultad
  const difficultyKey = info.numdificultad as keyof typeof difficultyIcons;
  const difficultyIcon = difficultyIcons[difficultyKey];

  // preparamos la animación de slide para el panel inferior
  const slideAnim = useRef(new Animated.Value(200)).current;
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.mainContainer}>
      {/*Video*/}
      <View style={styles.topContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back-outline" size={28} color="#333" />
        </TouchableOpacity>

        {videoSource ? (
          <Video
            source={videoSource}
            style={styles.exerciseMedia}
            shouldPlay
            isLooping
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* informacion */}
      <Animated.View
        style={[
          styles.bottomContainer,
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/*Titulo del ejercicio */}
        <Text style={styles.title}>{info.nombre}</Text>

        <ScrollView>
          {/* Descripcion */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Descripción:</Text>
            <Text style={styles.text}>{info.descripcion ?? '—'}</Text>
          </View>

          {/* Dificultad */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Dificultad:</Text>
            {difficultyIcon && (
              <Image
                source={difficultyIcon}
                style={styles.difficultyImage}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Material Requerido */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Material Requerido:</Text>
            {info.requiereMaterial === 'Ninguno' ? (
              <Text style={styles.text}>NO</Text>
            ) : (
              <Image
                source={materialIcon}
                style={styles.materialImage}
                resizeMode="contain"
              />
            )}
          </View>
        </ScrollView>

        {/*Botones de acción*/}
        {clase === "CrearRutina" && (
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              toggleExercise(info.id.toString());
              router.push('/HomeGym/CrearRutina');
            }}
          >
            <Text style={styles.buttonText}>
              {isSelected ? 'Eliminar' : 'Añadir a rutina'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button2}
            onPress={() => {
              toggleExercise(info.id.toString());
              router.push('/HomeGym/PoseScreen');
            }}
          >
            <Text style={styles.buttonText}>¡Practica!</Text>
          </TouchableOpacity>
        </View>
        )}
      </Animated.View>
    </View>
  );
}

export default InfoEjercicios;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topContainer: {
    height: '40%',
    paddingTop: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomContainer: {
    flexGrow: 1,
    backgroundColor: 'rgb(214, 214, 214)',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    fontFamily: 'Poppins-ExtraBold',
  },
  sectionContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
    color: '#333',
    marginRight: 8,
    width: 140,
  },
  text: {
    fontSize: 15,
    color: '#444',
    lineHeight: 20,
    fontFamily: 'Poppins-ExtraLight',
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    padding: 8,
  },
  exerciseMedia: {
    width: '167%',
    height: '167%',
    borderRadius: 10,
    marginVertical: 20,
  },
  placeholder: {
    width: '100%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginVertical: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(212, 0, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '49%',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button2: {
    backgroundColor: 'rgb(255,136,0)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '49%',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold',
  },
  difficultyImage: {
    width: 100,
    height: 40,
  },
  materialImage: {
    width: 60,
    height: 45,
  },
});
