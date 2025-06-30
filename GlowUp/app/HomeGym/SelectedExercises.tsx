import { create } from 'zustand';// para tener un store global

//interfaz d ela funcion declarada previamente en crear rutina
interface SelectedExercisesStore {
  selectedExerciseIds: string[];//array de ids de los ejercicios seleccionados
  toggleExercise: (id: string) => void; //añade si pinchas en el objeto y elimina sino
  clearExercises: () => void;//vacia por completo la lista
}

export const useSelectedExercisesStore = create<SelectedExercisesStore>((set) => ({
  selectedExerciseIds: [],
  toggleExercise: (id) =>  //recibe el id y dentro añadira si no existe y eliminara si si
    set((state) => ({
      selectedExerciseIds: state.selectedExerciseIds.includes(id)
        ? state.selectedExerciseIds.filter(exId => exId !== id)
        : [...state.selectedExerciseIds, id],
    })),
  clearExercises: () => set({ selectedExerciseIds: [] }),
}));