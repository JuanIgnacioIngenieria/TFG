//Importaciones de React, Expo (navegacion y fuentes) y otras importaciones como imagen de fondo 

import { View, Text, StyleSheet, ImageBackground, ActivityIndicator, TouchableOpacity, } from 'react-native';
import { Link } from 'expo-router';


//Creacion de componente funcional App, es el principal y sera la entrada de la App
const App = () => {

  //Codigo para programar el Frontend de esta pantalla
  return (
    <View style={styles.container}>
      
      
        <Text style={styles.welcomeText}>Bienvenido a</Text>
        <Text style={styles.appTitle}>GlowUp!</Text>
        
        {/* Botón de Inicio de Sesión */}
        <Link href="../InicioSesion" asChild>
          <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Inicia Sesión</Text>
          </TouchableOpacity>
        </Link>

         {/* Botón de Registro */}
         <Link href="../Registro" asChild>
          <TouchableOpacity style={styles.button}>
           
              <Text style={styles.buttonText}>Registrate</Text>
          </TouchableOpacity>
        </Link>
      
    </View>
  );
};
// Permite usar el componente en otros archivos, sin el export, seria privado y no se podria usar
export default App; 


const styles = StyleSheet.create({
  container: {
    flex: 1, //flex 1 para ocupar toda la pantalla
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    color: 'white',
    fontSize: 68,
    fontFamily: 'Poppins-ExtraLight', 
    alignSelf: 'flex-start',
    marginLeft: 20, // Alinea a la izquierda
    
  },
  appTitle: {
    color: 'white',
    fontSize: 80,
    fontFamily: 'Poppins-ExtraBold',
    marginBottom: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    alignSelf: 'flex-start',
    marginLeft: 20,
  },
  button: {
    width: 240,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden', //importante para que el borderRadius funcione con la imagen
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 2 
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginTop: 15,
    backgroundColor:'white',
  
  },
 
  buttonText: {
    color: 'Black',
    fontSize: 20,
    fontFamily: 'Poppins-ExtraBold',
    textAlign: 'center',
  },
  
});
