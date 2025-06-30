
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ImageBackground, Modal} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { IMAGES } from '@/assets/images';


 
  
const Perfil = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmLogout = () => {
    logout();
    router.push('/');
  }
  return (
    <View style={styles.container}>
      <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.container}>
        {/* Modal Confirmación logout */}
        <Modal visible={showDeleteModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
                <Text style={styles.header}>¿Seguro que deseas salir?</Text>
                <TouchableOpacity
                  style={styles.modalCloseIcon}
                  onPress={() => setShowDeleteModal(false)}
                >
                <Image source={IMAGES.X_ICON} style={{ width: 24, height: 24 }} resizeMode="contain" />
                </TouchableOpacity>    
                <TouchableOpacity
                  style={styles.Button}
                   onPress={confirmLogout}
                >
                <Text style={styles.textButton}>¡Sí, adios!</Text>
                </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Contenedor superior Perfil */}
      <View style={styles.profileBubble}>
        <View style={styles.headerRow}>
          <View style={styles.nameAndEdit}>
            {/* Nombre usuario */}
            <Text style={styles.username}>{user?.handle ?? 'Usuario'}</Text> 
            <TouchableOpacity>
              {/* Lapiz perfil */}
              <Image
                source={IMAGES.LAPIZ_ICON} 
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
          {/* Foto de perfil*/}
          <Image
            source={IMAGES.LOGO}
            style={styles.profileImage}
          />
        </View>
        {/* estado*/}
        <Text style={styles.statusText}>
          “GlowUp is in progress.”
        </Text>

        {/*Seguidores, seguidos, posts */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Seguidos</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
        </View>
      </View>

      {/* Contenedor inferior */}
      <View style={styles.contentContainer}>
        {/* Estadisticas/info aun por concretar*/}
        <View style={styles.profileContent}>
          <Text style={styles.infoText}>¡Aquí irá la info del perfil o tus estadísticas!</Text>
        </View>

        {/* Boton log out */}
        <TouchableOpacity
          style={styles.Button}
          onPress={() => {
            setShowDeleteModal(true)
          }  
        }
        >
          <Text style={styles.textButton}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      </ImageBackground>
    </View>
  );
};

export default Perfil;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  banner: {
    height: 700,
    backgroundColor: 'rgb(250, 165, 86)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  profileBubble: {
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    width: 400,
    paddingVertical: 30,
    paddingHorizontal: 20,
    zIndex: 1,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 15,
    marginRight: 15,
    
    
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
    position: 'absolute',
   left: -30,
    top: -40,
    zIndex: 2,
  },
  nameAndEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    maxWidth: 250,
    marginLeft: 90,
  },
  username: {
    fontSize: 22,
    fontFamily: 'Poppins-ExtraBold',
    color: '#333',
    
  },
  editIcon: {
     width: 30,
    height: 25,
    resizeMode: 'contain',
  },
  statusText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'left',
    color: '#444',
    marginTop: 40,
    fontFamily: 'Poppins-ExtraBold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-ExtraBold',
  },
  statLabel: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'Poppins-ExtraBold',
  },
  contentContainer: {
    marginTop: 230,
    position: 'absolute',
    top: 80,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 40,
    width: 400,
    paddingVertical: 30,
    paddingHorizontal: 20,
    zIndex: 1,
    shadowRadius: 5,
    elevation: 5,
    marginLeft: 15,
    marginRight: 15,
    height:530
    

  },
  profileContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    fontFamily: 'Poppins-ExtraBold',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },


  Button: {
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    width: '60%',
    alignSelf: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textButton: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-ExtraBold',
    alignSelf: 'center'
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
  
  header: { 
    fontFamily: 'Poppins-ExtraBold', 
    fontSize: 28, 
    color: '#333', 
    marginBottom: 20, 
    textAlign: 'center' 
  },

});
