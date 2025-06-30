// File: app/HomeGym/Generador.tsx
import React, { useEffect, useState, useMemo} from 'react';
import {View, Text, ScrollView, Image, StyleSheet,TouchableOpacity, 
  ImageBackground, Modal, TextInput} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ejerciciosDataRaw from '@/assets/data/ejercicios.json';
import { Ionicons } from '@expo/vector-icons';
import {Animated} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '@/assets/images';
import { exerciseImages } from '@/assets/exerciseImages';

//Declarar La dificultad y el material
type Dificultad = 'Baja' | 'Media' | 'Alta';
type Material = 'Peso' | 'Gomas' | 'Ninguno';

//Declarar la forma del objeto en el JSON
type Ejercicio = {
  id: number;
  nombre: string;
  tipo: string;
  dificultad: Dificultad;
  requiereMaterial: Material;
  imagen: string;
  clasificacion: string; 
};


//Parametros mandados desde la clase AICrearRutina.tsx
type Params = {
  numeroTotal: string;
  tiposSeleccionados: string;
  prioridad?: string;
  dificultadDeseada: Dificultad;
  materialesDisponibles: string;
  prioridadMaterial?: Material;
};
 

const Generador = () => {
  const router = useRouter();
  const { user } = useAuth();                 
  const ownerId = user?.id; 

  //Declarar un estado para la rutina final
  const [rutina, setRutina] = useState<Ejercicio[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [routineName, setRoutineName] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //Para animar el boton
  const buttonAnim = useMemo<Animated.Value>( () => new Animated.Value(0),  [] );

  const handleCloseModal = () => {
      setShowSaveModal(false);
      setRoutineName(''); //reseteamos lo que se haya puesto en el campo nombre para la rutina
      setErrorMessage(null);
    };


  const handleRutina = async (): Promise<number> => {

      if (!ownerId) {
        throw new Error('Usuario no autenticado');
      }

      const res = await fetch('http://192.168.1.32:3000/Rutina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner: ownerId,
          routine_name: routineName.trim(),
          exercises: rutina.map(e => e.id),}),
      });

      if (!res.ok) {
        let errMsg = 'Error al guardar la rutina';
        try {
          const errData = await res.json();
          errMsg = errData.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const data: { success: boolean; routineId?: number; error?: string } = await res.json();
      if (!data.success || typeof data.routineId !== 'number') {
        throw new Error(data.error || 'La API devolvió un error desconocido');
      }

      return data.routineId;
};
  
  const onConfirmSave = async () => {
       try {
        setErrorMessage(null);
        await handleRutina();
        setShowSaveModal(false); //ocultar modal y limpiar estado
        setRoutineName('');
        router.push('../Home');//Dirigir a la clase anterior
        } catch (err: any) {
        setErrorMessage(err.message || 'Error desconocido');
      }
    };

  
  //Para animar los ejercicios
  const animValues = useMemo<Animated.Value[]>(() => {
    return rutina.map(() => new Animated.Value(0));
  }, [rutina]);


  useEffect(() => {
    // Resetear valores al iniciar (importante para re-trigger de animaciones)
    animValues.forEach(av => av.setValue(0));
    buttonAnim.setValue(0);

    // Crear nuevas instancias de animación cada vez
    const newAnimations = animValues.map(av => 
      Animated.timing(av, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      })
    );

    const newButtonAnimation = Animated.timing(buttonAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    });

    // Controlar la secuencia correctamente
    let animationController: Animated.CompositeAnimation;

    animationController = Animated.sequence([
      Animated.stagger(150, newAnimations),
      newButtonAnimation
    ]);
    
    animationController.start();
    // Limpieza al desmontar o actualizar
    return () => {
      animationController.stop();
      animValues.forEach(av => av.setValue(0));
      buttonAnim.setValue(0);
    };
  }, [rutina]);




 //LOGICA GENERADOR



  //Colocar dentro de la estructura los parametros mandados
  const {
    numeroTotal,
    tiposSeleccionados: tiposJson,
    prioridad,
    dificultadDeseada,
    materialesDisponibles: materiasJson,
    prioridadMaterial,
  } = useLocalSearchParams<Params>();


  //Parsear los datos e indicar si ha habido error en el proceso
  const nTotal = parseInt(numeroTotal, 10) || 0;
  //creacion de dos arrays vacios
  let tipos: string[] = [];
  let materiales: Material[] = [];

  try {
    tipos = JSON.parse(tiposJson);
    materiales = JSON.parse(materiasJson) as Material[];
  } catch {
    
    return <View><Text>Error al cargar</Text></View>;
  }

  //1ºPASO Mapear desde el JSON todos los campos necesarios en un array, recorrer el JSON y crear el array
  const ejercicios: Ejercicio[] = (ejerciciosDataRaw as any[]).map((e) => ({
    id: e.id,
    nombre: e.nombre,
    tipo: e.tipo,
    dificultad: e.dificultad as Dificultad,
    requiereMaterial: e.requiereMaterial as Material,
    imagen: e.imagen,
    clasificacion: e.clasificacion, 
  }));

  //2ºPASO crear funciones auxiliares

  //Esta funcion devolvera la distancia entre 2 niveles de dificultad(0 para identicos, 1 para adyacente y 2 para extremos)
  const diffDistance = (d: Dificultad, target: Dificultad) => {
    const order: Dificultad[] = ['Baja', 'Media', 'Alta'];
    return Math.abs(order.indexOf(d) - order.indexOf(target));
  };

  //Esta funcion devolvera la puntuacion asignada al ejercicio siguiendo las reglas
  const scoreExercise = (e: Ejercicio) => {
    let score = 0;

    // 1) Músculo
    if (e.tipo === prioridad) score += 40; //Si el tipo es prioritario +40
    else if (tipos.includes(e.tipo)) score += 25;// Si no es prioritario solo +25
    //En cualquier otro caso 0

    // 2) Dificultad
    const dist = diffDistance(e.dificultad, dificultadDeseada);
    if (dist === 0) score += 30;//Si la distancia es 0 es decir coincide, +30
    else if (dist === 1) score += 10;//Si la distancia es 1 es no coincide pero casi +10
    //En cualquier otro caso 0

    // 3) Material
    if (e.requiereMaterial === prioridadMaterial) score += 30; //Si el material es prioritario +30
    else if (materiales.includes(e.requiereMaterial)) score += 10; // Si el material no es prioritario +10
    //En cualquier otro caso 0

    return score;
  };

  //3ºPASO Empezar a construir la rutina con el hook useeffect(hook que ejecuta la fruncion despues del primer render, y siempre que se modifiquen los parametros de entrada que debera recalcular)
  useEffect(() => {
    //ORDEN PRIORIDAD 1 MUSCULOS(Si es prioritario o no) 2 MATERIAL(SI tiene o no y si es prioritario) 3 DIFICULTAD
  
    //4ºPASO Filtrar por musculo y material
    const valid = ejercicios.filter(e =>
      tipos.includes(e.tipo) && materiales.includes(e.requiereMaterial) //que sean de este tipo y material
    );

    //Pese a los scorings, los que puntuaron 0 osea es decir cuyo material y tipo de musculo no fue 
    //seleccionado por el usuario se descartaran ya que no queremos ni ejercicios de otros tipos ni con un 
    //material que no tiene el usuario
  
    //5ºPASO Crear un array y ordenarlo de manera descendente en funcion del score
    const scored = valid
      .map(e => ({ e, score: scoreExercise(e) }))//crea el array con los puntajes de haber ido a todos los ejercicios que cumplian musuclo y material
      .sort((a, b) => b.score - a.score);//lo ordena descendentemente
  
    //6ºPASO Preparar lista de músculos en orden
    const otros = tipos.filter(t => t !== prioridad); //array de prioritarios
    const musculos = prioridad ? [prioridad, ...otros] : tipos.slice();//poner el musuculo prioritario al principio
    const k = musculos.length; 
  
    //7ºPASO Repartir la cantidad de ejercicios
    //minimo es el numero de ejs que debe tener los musculos es decir como minimo 6js/3musc = 2
    //ntotal = numero ejs que quiere el usuario, k = cuantos musculos requiere el usuario
    const minimo = Math.floor(nTotal / k);
    const sobrante = nTotal - minimo * k;//sobrante es si al ser impar podemos darle mas prioridad
    const muscleCounts: Record<string, number> = {};//el array que se ira rellenando de ejercicios
    musculos.forEach(m => { muscleCounts[m] = minimo; });
  
    if (prioridad) {
      // Si hay prioridad, todo el sobrante va a prioridad
      muscleCounts[prioridad] += sobrante;
    } else {
      // Si no hay, repartir sobrante entre los primeros 'sobrante' músculos
      for (let i = 0; i < sobrante; i++) {
        muscleCounts[musculos[i]]++;
      }
    }
  
    //8ºPASO Intentamos cumplir ahora con el siguiente requerimiento en la piramide de prioridades que es el material
    const materialCounters: Record<Material, number> = { Peso: 0, Gomas: 0, Ninguno: 0 };
    const usedClasifs = new Set<string>();
    const result: Ejercicio[] = [];

    
    for (const { e } of scored) {
      
      if (result.length >= nTotal) 
        break;

      const { tipo, requiereMaterial, clasificacion } = e;
      if ((muscleCounts[tipo] ?? 0) <= 0) continue; //Asegurarnos para añadir de que aun quedan ejercicios de su material
      if (!materiales.includes(requiereMaterial)) continue; //Solo permitidos, si es material no seleccionado no se añade
      if (usedClasifs.has(clasificacion)) continue; //Comprobar atributo clasificacion para evitar ejercicios "iguales"

      result.push(e); //Añadimos
      muscleCounts[tipo]!--; //Reducimos la cantidad de musculos de este tipo
      materialCounters[requiereMaterial]++; //Aumentamos el material
      usedClasifs.add(clasificacion); //Añadimos su clasificacion para llevar un control de los ejs "iguales"
    }

    // 10ºPASO ¿faltan ejercicios? relajar la cuota de material, pero NUNCA usar uno no permitido
    if (result.length < nTotal) {
      const restantes = scored.filter(({ e }) =>
        !usedClasifs.has(e.clasificacion) && //Siempre sin repetir clasificacion
        (muscleCounts[e.tipo] ?? 0) > 0 && //Siempre que tenga espacio de musculo
        materiales.includes(e.requiereMaterial) //Siempre materiales permitidos
      );

      for (const { e } of restantes) {
        if (result.length >= nTotal) 
          break;
        result.push(e);
        muscleCounts[e.tipo]!--;
        usedClasifs.add(e.clasificacion);
      }
    }
  
    setRutina(result);
    

  }, [
    numeroTotal,
    tiposJson,
    prioridad,
    dificultadDeseada,
    materiasJson,
    prioridadMaterial,
  ]

);
  

  return (
    <View style={styles.container}>
      <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>

        <Modal visible={showSaveModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <TouchableOpacity style={styles.modalCloseIcon} onPress={handleCloseModal}>
                  <Image
                    source={IMAGES.X_ICON}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

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
              </View>
            </View>
        </Modal>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={28} color="#333" />
        </TouchableOpacity>

        {/*Titulo*/}
        <Text style={styles.header}>Tu Rutina Generada</Text>

          {/*Lista de ejercicios*/}
        <ScrollView contentContainerStyle={styles.cardsContainer}>
          {rutina.map((item, index) => {
            const av = animValues[index];
            const opacity = av;
            const translateY = av.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            });
            const localImage = exerciseImages[item.imagen];

            return (
              <Animated.View
                key={item.id.toString()}
                style={[
                  styles.card,
                  { opacity, transform: [{ translateY }] },
                ]}
              >
                {localImage
                  ? <Image source={localImage} style={styles.image} />
                  : <Image source={{ uri: item.imagen }} style={styles.image} />
                }
                <View style={styles.info}>
                  <Text style={styles.name}>{item.nombre}</Text>
                  <Text style={styles.subName}>Tipo: {item.tipo}</Text>
                  <Text style={styles.subName}>Dificultad: {item.dificultad}</Text>
                  <Text style={styles.subName}>Material: {item.requiereMaterial}</Text>
                  
                </View>
                 <TouchableOpacity
                  style={styles.infoButton}
                      //Mandamos a la siguiente pantalla para mostrar informacion del ejercicio, con los parametros del ejercicio
                      onPress={() =>
                      router.push({ pathname: '/HomeGym/InfoEjercicios', params: { ejercicio: item.nombre , clase: "Generador"}})}>
                  <Image source={IMAGES.INFO_ICON}style={{ width: 24, height: 24 }} resizeMode="contain"/>
                </TouchableOpacity>
                </Animated.View>
                )
              })}
             <Animated.View
                style={{
                  opacity: buttonAnim,
                  transform: [{
                    translateY: buttonAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0]
                    })
                  }],
                  alignSelf: 'center',
                }}
              >
                   {/* Botón de guardar que aparece siempre al final */}
              {rutina.length === 0 ? (
                  <Text style={styles.subName}>No se han encontrado ejercicios.</Text>
              ) : (
              <TouchableOpacity style={styles.saveButton} onPress={() => setShowSaveModal(true)}>
                <Text style={styles.saveButtonText}>Listo</Text>
              </TouchableOpacity>
              )}
            </Animated.View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

export default Generador;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    
  },
  imageBackground: {
    flex: 1
  },
  backButton: { 
    position: 'absolute', 
    top: 60, 
    left: 20, 
    zIndex: 10 
  },
  header: {
    fontSize: 22,
    marginTop: 60,
    fontFamily: 'Poppins-ExtraBold',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: 'rgb(255, 255, 255)',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    marginLeft: 20,
    marginRight: 20,

  },
  image: { 
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginLeft: 20,
    
  },
  info: { 
    flex: 1, 
    padding: 20
  },
  name: { 
    fontSize: 16,
    fontFamily: 'Poppins-ExtraBold',
  },
  subName: { 
    fontSize: 14,
    fontFamily: 'Poppins-ExtraLight',
  },
  empty: { 
    textAlign: 'center', 
    marginTop: 50, 
    color: '#666' 
  },
  infoButton: {
    position: 'absolute',
    top: 5,
    right:5,
    padding: 1,
    zIndex: 2
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
    elevation: 3,
    marginTop: 20
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold'
  },
  cardsContainer: {
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalBox: {
    width: '85%',
    height: 170,
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
});
