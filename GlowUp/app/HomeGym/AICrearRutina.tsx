import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ScrollView, ImageBackground, Image, } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { IMAGES } from '@/assets/images';

//Declara tipos de musculos
const tiposMusculares = [ 'Pecho', 'Espalda alta', 'Espalda baja',
  'Pierna', 'Glúteo', 'Abdomen', 'Brazo', 'Hombro', 'Antebrazo'];

//Declara dificultades
const dificultades = ['Baja', 'Media', 'Alta'] as const;

//Declara Materiales
const materialesOpcionales = ['Ninguno', 'Peso', 'Gomas'] as const;
type Material = typeof materialesOpcionales[number];

const AICrearRutina = () =>  {
  //Estados para guardar todas las selecciones del ususario
  const [numeroTotal, setNumeroTotal] = useState('0');
  const [tiposSeleccionados, setTiposSeleccionados] = useState<string[]>([tiposMusculares[0]]);
  const [prioridad, setPrioridad] = useState<string | undefined>(undefined);
  const [dificultadDeseada, setDificultadDeseada] = useState<typeof dificultades[number]>('Media');
  const [materialesDisponibles, setMaterialesDisponibles] = useState<Material[]>([ materialesOpcionales[0]]);
  const [prioridadMaterial, setPrioridadMaterial] = useState<Material | undefined>(undefined);

  const router = useRouter();

  //Se utiliza para añadir o quitar un elemento de un array de estados
  const toggleList = <T extends string>(
  item: T,
  list: T[],
  setter: React.Dispatch<React.SetStateAction<T[]>>
) => {
  if (list.includes(item)) {
    //solo eliminamos si tras quitarlo quedaria al menos 1
    if (list.length > 1) {
      setter(list.filter(i => i !== item));
    }
    //Si solo hay uno, no hacemos nada
  } else {
    setter([...list, item]);
  }
};


//Funcion para mandar a generar la rutina
  const generarRutina = () => {
    //hacemos que sea let y no const para pdoer cambiarle el valor y evitar que el usuario introduxca 0, 1 o 2
    let num = parseInt(numeroTotal, 10);
    //Comprobaciones para meter al menos 2 ejercicios y ver si ha introducido valor
    if (isNaN(num) || num <= 2) {
      num = 3;
      setNumeroTotal('3');
    }
    else if (isNaN(num) || num >= 9) {
      num = 9;
      setNumeroTotal('9');
    }
    //mandamos los parametros a la siguiente clase 
    router.push({
      pathname: '../HomeGym/Generador',
      params: {
        numeroTotal: num.toString(),
        tiposSeleccionados: JSON.stringify(tiposSeleccionados),
        prioridad: prioridad ?? undefined,
        dificultadDeseada,
        materialesDisponibles: JSON.stringify(materialesDisponibles),
        prioridadMaterial: prioridadMaterial ?? undefined,
      },
    });
  };

  return (
    <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.superTitle}>ESCOGE TUS PREFERENCIAS</Text>

        {/* Numero de ejercicios */}
        <View style={styles.sectionBox}>
          <Text style={styles.label}>Número de ejercicios</Text>
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={numeroTotal}
            onChangeText={setNumeroTotal}
            placeholder="5"
            placeholderTextColor="#999"
          />
        </View>

        {/* Musculos a trabajar */}
        <View style={styles.sectionBox}>
          <Image source={IMAGES.MUSCULO_ICON} style={styles.cornerIcon} />
          <Text style={styles.label}>Músculos a trabajar</Text>
          <View style={styles.chipContainer}>
            {tiposMusculares.map(tipo => (
              <TouchableOpacity
                key={tipo}
                style={[styles.chip, tiposSeleccionados.includes(tipo) && styles.chipSelected]}
                onPress={() => toggleList(tipo, tiposSeleccionados, setTiposSeleccionados)}>
                <Text
                  style={[styles.chipText, tiposSeleccionados.includes(tipo) && styles.chipTextSelected]}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Prioridad musculo */}
          </View>
          <Text style={[styles.label, {marginTop: 10}]}>Prioridad (opcional)</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, prioridad === undefined && styles.chipSelected]}
              onPress={() => setPrioridad(undefined)}>
              <Text
                style={[styles.chipText, prioridad === undefined && styles.chipTextSelected]}>
                Sin prioridad
              </Text>
            </TouchableOpacity>
            {tiposSeleccionados.map(tipo => (
              <TouchableOpacity
                key={tipo}
                style={[styles.chip, prioridad === tipo && styles.chipSelected]}
                onPress={() => setPrioridad(tipo)}>
                <Text
                  style={[styles.chipText, prioridad === tipo && styles.chipTextSelected]}>
                  {tipo}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dificultad */}
        <View style={styles.sectionBox}>
          <Image source={IMAGES.SEMAFORO_ICON} style={styles.cornerIcon} />
          <Text style={styles.label}>Dificultad</Text>
          <View style={styles.chipContainer}>
            {dificultades.map(nivel => (
              <TouchableOpacity
                key={nivel}
                style={[styles.chip, dificultadDeseada === nivel && styles.chipSelected]}
                onPress={() => setDificultadDeseada(nivel)}>
                <Text
                  style={[styles.chipText, dificultadDeseada === nivel && styles.chipTextSelected]}>
                  {nivel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Material disponible */}
        <View style={styles.sectionBox}>
          <Image source={IMAGES.PESA_ICON} style={styles.cornerIcon} />
          <Text style={styles.label}>Material disponible</Text>
          <View style={styles.chipContainer}>
            {materialesOpcionales.map(mat => (
              <TouchableOpacity
                key={mat}
                style={[styles.chip, materialesDisponibles.includes(mat) && styles.chipSelected]}
                onPress={() => toggleList(mat, materialesDisponibles, setMaterialesDisponibles)}>
                <Text
                  style={[styles.chipText, materialesDisponibles.includes(mat) && styles.chipTextSelected]}>
                  {mat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Prioridad de material */}
  
         <Text style={[styles.label, {marginTop: 10}]}>Prioridad de material (opcional)</Text>
          <View style={styles.chipContainer}>
            <TouchableOpacity
              style={[styles.chip, prioridadMaterial === undefined && styles.chipSelected]}
              onPress={() => setPrioridadMaterial(undefined)}>
              <Text
                style={[styles.chipText, prioridadMaterial === undefined && styles.chipTextSelected]}>
                Sin prioridad
              </Text>
            </TouchableOpacity>
            {materialesDisponibles.map(mat => (
              <TouchableOpacity
                key={mat}
                style={[styles.chip, prioridadMaterial === mat && styles.chipSelected]}
                onPress={() => setPrioridadMaterial(mat)}>
                <Text
                  style={[styles.chipText, prioridadMaterial === mat && styles.chipTextSelected]}>
                  {mat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Botón generar */}
        <TouchableOpacity style={styles.button} onPress={generarRutina}>
          <Text style={styles.buttonText}>Generar Rutina</Text>
        </TouchableOpacity>
      </ScrollView>
    </ImageBackground>
  );
}
export default AICrearRutina;

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  backButton: { position: 'absolute', top: 50, left: 15, zIndex: 10, padding: 8 },
  superTitle: {
    marginTop: 70,
    fontSize: 30,
    fontWeight: '800',
    color: '#000',
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center',
  },
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,    
    overflow: 'visible',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-ExtraBold',
    marginBottom: 8,
    alignSelf: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgb(255,136,0)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 18,
    backgroundColor: '#fff',
  },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    margin: 4,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  chipSelected: {
    backgroundColor: 'rgb(255,136,0)',
    borderColor: 'rgb(255,136,0)',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Poppins-ExtraLight',
    color: '#333',
  },
  chipTextSelected: {
    color: '#fff',
    fontFamily: 'Poppins-ExtraBold',
  },
  button: {
    backgroundColor: 'rgba(212, 0, 255, 0.9)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: '60%',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Poppins-ExtraBold',
    
  },
  imageBackground: { flex: 1 },
  cornerIcon: {
    position: 'absolute',
    top: -15,
    left: -15,
    width: 64,
    height: 64,
    opacity: 0.9,
  },
});