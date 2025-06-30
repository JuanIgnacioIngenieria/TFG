
import React, { createContext, useState, useEffect, useContext } from 'react';
//Async storage nos permite leer y escribir datos en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';


//Asi es nuesttro objeto user (id handle y email)
interface User {
  id: string;
  handle: string;
  email?: string;
}

interface AuthContextProps {
  //Guardamos en memoria user y token 
  user: User | null;
  token: string | null;
  //estado de carga
  loading: boolean;
  //funciones para cambiar el estado
  login: (userData: User, authToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

//crear contexto con valor inicial undefined
const AuthContext = createContext<AuthContextProps | undefined>(undefined);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); //Aun esta cargando

  useEffect(() => { //se usa este hook para poder recuperar la sesion al iniciar la app
    const loadUser = async () => {
      //lee el token guardado
      const savedToken = await AsyncStorage.getItem('userToken');
      //Lee los datos del usuario guardados
      const savedUser = await AsyncStorage.getItem('userData');
      //Si hay datos,m a memoria
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
      //se acabo la carga
      setLoading(false);
    };
    loadUser();
  }, []);

  //Cuando el usuario inicia sesion se usa esta funcion
  const login = async (userData: User, authToken: string) => {
    //Se actualiza los datos y el token
    setUser(userData);
    setToken(authToken);
    //guardamos para la proxima vez
    await AsyncStorage.setItem('userToken', authToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = async () => {
    //reseteamos los datos
    setUser(null);
    setToken(null);
    //borramso estos datos tambien
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

//Esto nos permite utilizar el contexto en nuestras pantallas
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};

