
import React, { useEffect, useState } from 'react';
import {View, Text, ScrollView, Image, StyleSheet, 
  TouchableOpacity, LayoutAnimation, UIManager, Platform, 
  Animated, Modal, TextInput, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelectedExercisesStore } from '@/app/HomeGym/SelectedExercises';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import ejerciciosDataRaw from '@/assets/data/ejercicios.json';
import { exerciseImages } from '@/assets/exerciseImages';
import { IMAGES } from '@/assets/images';


// Activar animaciones en Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

//Se define ejercicio como se tiene definido en nuestro JSON
type Ejercicio = {
  id: number;
  nombre: string;
  tipo: string;
  dificultad: string;
  requiereMaterial: string;
  imagen: string;  
  clasificacion: string;
};

const CrearRutina = () =>  {
  //Utilizaremos useNavigation para garantizar correctamente el navigation.goBack que no se garantiza con router.back
  const navigation = useNavigation();
  const { user } = useAuth();
  const ownerId = user?.id;
  //Utilizando la clase Selected exercises nos permitesaber que ejercicios esta seleccionados, limpiarlos etc
  const {
    selectedExerciseIds,
    toggleExercise,
    clearExercises
  } = useSelectedExercisesStore();


  const [showSaveModal, setShowSaveModal] = useState(false);
  //Modal animado para mostrar errores al hscer el guardado
  const [modalHeight] = useState(new Animated.Value(180));
  const [routineName, setRoutineName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

//Estado de agrupacion de ejercicios por el tipo
  const [ejerciciosByTipo, setEjerciciosByTipo] = useState<Record<string, Ejercicio[]>>({});

  //Agrupar ejercicios por 'tipo' al montar con el hook useEffect que garantiza que solo se monte una vez
  useEffect(() => {
    const all: Ejercicio[] = ejerciciosDataRaw as any; //Carga total de ejercicios
    const grouped: Record<string, Ejercicio[]> = {};// Array vacio pero por grupos de tipo muscular
    all.forEach(e => {//Recorrer todo e ir introduciendo
      if (!grouped[e.tipo]) grouped[e.tipo] = [];
      grouped[e.tipo].push(e);
    });
    setEjerciciosByTipo(grouped);
  }, []);

  //Otro useEffect encargado de reaccionar a cambios en errorMessage
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(modalHeight, {//el modal cambiara de tamaño cada vez que salga un error
      toValue: errorMessage ? 220 : 175,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [errorMessage]);

  //Funcion para cerrrar el modal
  const handleCloseModal = () => {
    setShowSaveModal(false);
    setErrorMessage(null);
    setRoutineName(''); //reseteamos lo que se haya puesto en el campo nombre para la rutina
  };

  //Funcion para enviar la rutina al servidor
  const handleRutina = async (): Promise<number> => {
    if (!routineName.trim()) throw new Error('Ingresa un nombre para la rutina.');//Error sin nombre
    if (!ownerId) throw new Error('No se encontró el usuario logueado.');//Error de usuario
    if (selectedExerciseIds.length === 0) throw new Error('Selecciona al menos un ejercicio.');//Error de no ejercicios

    const response = await fetch(`http://192.168.1.32:3000/Rutina`, {//petidicion al servidor con los ejercicios nombre etc
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner: ownerId,
        routine_name: routineName.trim(),
        exercises: selectedExerciseIds
      })
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Error al crear rutina');
    return data.routineId;

  };

  //Funcion para cuando se pulsa el boton de guardar rutina
  const onConfirmSave = async () => {
    try {
      setErrorMessage(null);
      await handleRutina(); //Ejecutamos el mandado a BBDD
      clearExercises();// eliminamos ejercicios
      setShowSaveModal(false);//Modal desaparece
      router.push('../Home');//mandamos de nuevo a HOME
    } catch (err: any) {
      setErrorMessage(err.message || 'Error desconocido');
    }
  };

  //Funcion enacargada de mostrar los elementos de manera horizontal segun el tipo
  const renderSection = (tipo: string, data: Ejercicio[]) => (
    <View key={tipo}>
      <Text style={styles.sectionTitle}>{tipo}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScroll}
      >
        {data.map((ej) => {
          const selected = selectedExerciseIds.includes(ej.id.toString());
          //Mapear nombre de archivo a la imagen importada
          const localImage = exerciseImages[ej.imagen];
          
          return (
            //Hacer mas grande los iconos en funcion de si esta o no seleccionado
            <Animated.View
              key={ej.id}
              style={[styles.exerciseCard, { transform: [{ scale: selected ? 1.05 : 1 }] }]}
            >
              <View style={[styles.imageWrapper, selected && styles.selectedImageWrapper]}>
                <TouchableOpacity
                  activeOpacity={1.0}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    toggleExercise(ej.id.toString());
                  }}
                  style={styles.cardTouchable}
                >
                  {localImage
                    ? <Image source={localImage} style={styles.exerciseImage} />
                    : <View style={styles.placeholder} />
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.infoButton}
                  //Mandamos a la siguiente pantalla para mostrar informacion del ejercicio, con los parametros del ejercicio
                  onPress={() =>
                    router.push({
                      pathname: '/HomeGym/InfoEjercicios',
                      params: { ejercicio: ej.nombre , clase: "CrearRutina" }
                    })
                  }
                >
                 <Image source={IMAGES.INFO_ICON}style={{ width: 20, height: 20 }} resizeMode="contain"/>
                </TouchableOpacity>
              </View>
              <Text style={styles.exerciseName}>{ej.nombre}</Text>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>
        <Modal visible={showSaveModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View style={[styles.modalBox, { height: modalHeight }]}>
              <TouchableOpacity style={styles.modalCloseIcon} onPress={handleCloseModal}>
                <Image
                  source={IMAGES.X_ICON}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {errorMessage && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              <TextInput
                style={styles.input}
                placeholder="Nombre rutina"
                placeholderTextColor="#999"
                value={routineName}
                onChangeText={setRoutineName}
              />

              <TouchableOpacity
                style={[styles.modalCloseButton, { opacity: routineName.trim() ? 1 : 0.5 }]}
                onPress={onConfirmSave}
                disabled={!routineName.trim()}
              >
                <Text style={styles.modalButtonText}>¡Guardar!</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
         {/*Boton de vuelta*/}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={28} color="#333" />
          </TouchableOpacity>
          
          {/*Texto principal*/}
          <View style={styles.header}>
            <Text style={styles.texth1}>ESCOGE TUS EJERCICIOS</Text>
          </View>

          {/*Poner los ejercicios por tipo*/}
          {Object.entries(ejerciciosByTipo).map(([tipo, items]) =>
            renderSection(tipo, items)
          )}

          {/*Boton de listoi para mostrar el modal que guarda la rutina*/}
          <View style={styles.saveButtonWrapper}>
            <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
              <Text style={styles.saveButtonText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}
export default CrearRutina;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingBottom: 30
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 15,
    zIndex: 10,
    padding: 8
  },
  header: {
    marginTop: 110,
    marginBottom: 20
  },
  texth1: {
    fontSize: 32,
    fontFamily: 'Poppins-ExtraBold',
    color: '#333',
    lineHeight: 40
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'Poppins-ExtraBold',
    color: '#333',
    marginVertical: 15,
    marginLeft: 5
  },
  horizontalScroll: {
    paddingBottom: 15
  },
  exerciseCard: {
    marginHorizontal: 10,
    marginTop: 10,
    width: 130,
    alignItems: 'center',
    borderRadius: 15
  },
  imageWrapper: {
    position: 'relative',
    width: 130,
    height: 130,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff'
  },
  selectedImageWrapper: {
    borderWidth: 3,
    borderColor: 'orange'
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15
  },
  cardTouchable: {
    width: '100%',
    height: '100%'
  },
  exerciseImage: {
    width: '100%',
    height: '100%'
  },
  infoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    borderRadius: 12,
    padding: 1,
    zIndex: 2
  },
  exerciseName: {
    fontFamily: 'Poppins-ExtraLight',
    fontSize: 16,
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 5
  },
  saveButtonWrapper: {
    alignItems: 'center',
    marginTop: 30
  },
  saveButton: {
    backgroundColor: 'rgba(212, 0, 255, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    justifyContent: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center'
  },
  input: {
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    fontFamily: 'Poppins-ExtraLight'
  },
  modalCloseButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgb(255,136,0)',
    borderRadius: 12
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
  modalCloseIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1
  },
  modalButtonText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 16,
   	color: 'white'
  },
  imageBackground: {
    flex: 1
  }
});
