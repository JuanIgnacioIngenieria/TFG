import React, { useEffect, useState } from 'react';
import { View,Text, FlatList,Image, StyleSheet,
  TouchableOpacity, ActivityIndicator, Modal, ImageBackground
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import ejerciciosData from '@/assets/data/ejercicios.json';
import { IMAGES } from '@/assets/images';



interface Rutina {
  routine_id: number;
  routine_name: string;
  created_at: string;
}

const RutinasGuardadas: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [rutinas, setRutinas] = useState<Rutina[]>([]);
  const [loading, setLoading] = useState(true);
  

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [routineExercises, setRoutineExercises] = useState<string[]>([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const fetchRutinas = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch(`http://192.168.1.32:3000/Rutina/${user.id}`);
        const data: { success: boolean; rutinas?: Rutina[] } = await res.json();
        if (data.success && Array.isArray(data.rutinas)) {
          setRutinas(data.rutinas);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchRutinas();
  }, [user]);

  const openDetailModal = async (routineId: number) => {
    setShowDetailModal(true);
    setLoadingExercises(true);
    try {
      const res = await fetch(`http://192.168.1.32:3000/Rutina/${routineId}/exercises`);
      const data: { success: boolean; exercises: (string | number)[] } = await res.json();
      if (data.success) {
        const mappedNames: string[] = data.exercises
          .map((id: string | number) => ejerciciosData.find(e => e.id === Number(id))?.nombre ?? '')
          .filter((nombre: string) => nombre !== '');
        setRoutineExercises(mappedNames);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingExercises(false);
    }
  };

  const confirmDelete = (routineId: number) => {
    setSelectedDeleteId(routineId);
    setShowDeleteModal(true);
  };

  const deleteRoutine = async () => {
    if (selectedDeleteId == null) return;
    setDeletingId(selectedDeleteId);
    try {
      const res = await fetch(
        `http://192.168.1.32:3000/Rutina/${selectedDeleteId}`,
        { method: 'DELETE' }
      );
      const data: { success: boolean; error?: string } = await res.json();
      if (data.success) {
        setRutinas(prev => prev.filter(r => r.routine_id !== selectedDeleteId));
      } else {
        console.warn('Error borrando rutina:', data.error);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
    }
  };


  return (
    <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>
      <View style={styles.container}>
        {/* Modal Consultar */}
        <Modal visible={showDetailModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <TouchableOpacity
                style={styles.modalCloseIcon}
                onPress={() => setShowDetailModal(false)}
              >
                <Image
                  source={IMAGES.X_ICON}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={[styles.header, { marginBottom: 10 }]}>Ejercicios de la Rutina</Text>

              {loadingExercises ? (
                <ActivityIndicator size="large" style={{ marginVertical: 20 }} />
              ) : routineExercises.length === 0 ? (
                <Text style={styles.emptyText}>No hay ejercicios.</Text>
              ) : (
                <View>
                  {routineExercises.map((nombre, idx) => (
                    <View key={idx} style={styles.exerciseItem}>
                     
                      <Text style={styles.exerciseName}>{nombre}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal Confirmación Borrado */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.header}>¿Seguro que deseas eliminar la rutina?</Text>
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <TouchableOpacity
                  style={[styles.Button, styles.buttonCancel]}
                  onPress={() => setShowDeleteModal(false)}
                  disabled={deletingId != null}
                >
                  <Text style={styles.ButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.Button, styles.buttonDelete]}
                  onPress={deleteRoutine}
                  disabled={deletingId != null}
                >
                  {deletingId === selectedDeleteId ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.ButtonText}>Adelante</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Botón Volver */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Mis Rutinas</Text>

        {loading ? (
          <ActivityIndicator size="large" color="black" style={{ marginTop: 40 }} />
        ) : rutinas.length === 0 ? (
          <Text style={styles.emptyText}>No tienes rutinas guardadas aún.</Text>
        ) : (
          <FlatList
            data={rutinas}
            keyExtractor={item => item.routine_id.toString()}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => (
              <View key={item.routine_id} style={styles.card}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item.routine_id)}
                >
                  <Image
                    source={IMAGES.X_ICON}
                    style={{ width: 24, height: 24 }}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                <View style={[styles.accentBar, { backgroundColor: 'black' }]} />
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Image
                      source={IMAGES.LIBRO_ICON}
                      style={styles.icon}
                    />
                    <Text style={styles.cardTitle}>{item.routine_name}</Text>
                  </View>
                  <Text style={styles.cardDate}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />{' '}
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.buttonsRow}>
                  <TouchableOpacity style={[styles.Button, styles.buttonOrange]}>
                    <Text style={styles.ButtonText}>Iniciar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.Button, styles.buttonPurple]}
                    onPress={() => openDetailModal(item.routine_id)}
                  >
                    <Text style={styles.ButtonText}>Consultar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    
    paddingHorizontal: 20, 
    paddingTop: 80 
  },
  backButton: { 
    position: 'absolute', 
    top: 50, 
    left: 20, 
    zIndex: 10 
  },
  header: { 
    fontFamily: 'Poppins-ExtraBold', 
    fontSize: 28, 
    color: '#333', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
  emptyText: { 
    fontFamily: 'Poppins-ExtraLight', 
    fontSize: 16, color: '#666', 
    textAlign: 'center', marginTop: 40 
  },
  card: { 
    position: 'relative', 
    flexDirection: 'row', 
    backgroundColor: '#fff',
    borderRadius: 20, 
    marginVertical: 10, 
    shadowColor: '#000', 
    shadowOffset: { 
      width: 0, 
      height: 2 
    }, 
    shadowOpacity: 0.1, 
    shadowRadius: 6, 
    elevation: 3, 
    overflow: 'hidden' 
  },
  deleteButton: { 
    position: 'absolute', 
    top: 6, 
    right: 6, 
    width: 18, 
    height: 18, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2 
  },
  accentBar: { 
    width: 6 
  },
  cardContent: { 
    flex: 1, 
    padding: 16 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  cardTitle: { 
    fontFamily: 'Poppins-ExtraBold', 
    fontSize: 18, 
    color: 'black', 
    flexShrink: 1, 
    marginLeft:10 
  },
  cardDate: { 
    fontFamily: 'Poppins-ExtraLight', 
    fontSize: 14, 
    color: '#666' 
  },
  buttonsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16 
  },
  Button: { 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    shadowColor: '#000', 
    shadowOffset: { 
      width: 0, 
      height: 2 
    }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  ButtonText: { 
    color: '#fff', 
    fontSize: 14, 
    fontFamily: 'Poppins-ExtraBold' 
  },
  buttonOrange: { 
    backgroundColor: 'rgb(255,136,0)', 
    marginRight: 10 
  },
  buttonPurple: { 
    backgroundColor: 'rgba(212, 0, 255, 0.9)' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalBox: { 
    width: '85%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20, 
    alignItems: 'center' 
  },
  modalCloseIcon: { 
    position: 'absolute', 
    top: 10, 
    right: 10, 
    padding: 5, 
    zIndex: 1 
  },
  exerciseItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 8 
  },
  exerciseImage: { 
    width: 40, 
    height: 40, 
    marginRight: 12, 
    borderRadius: 8 
  },
  exerciseName: { 
    fontFamily: 'Poppins-ExtraLight', 
    fontSize: 16, 
    color: '#333' 
  },
  buttonCancel: { 
    backgroundColor: '#ccc', 
    marginRight: 10 
  },
  buttonDelete: { 
    backgroundColor: 'red' 
  },
  icon: {
    width: 40,
    height: 50,
    resizeMode: 'contain',
  },
  imageBackground: {
    flex: 1,
  },
});

export default RutinasGuardadas;