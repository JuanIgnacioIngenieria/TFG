import { View, Text, StyleSheet, ImageBackground} from 'react-native';
import { IMAGES } from '@/assets/images';


const Feed = () => {
  return (
    <View style={styles.container}>
      <ImageBackground source={IMAGES.BACKGROUND2} resizeMode="cover" style={styles.imageBackground}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Feed en construcción 🚧🚧</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

export default Feed

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 20,
    color: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  
  },
  imageBackground: {
    flex: 1,
    
  },
  textContainer: { 
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 90,
  }

});
