import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';
import type { CasoEvidenceInput } from '@/features/casos/api';

export type TechnicianPhoto = CasoEvidenceInput;

async function pickFrom(source: 'camera' | 'library'): Promise<TechnicianPhoto | undefined> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    Alert.alert(
      'Permiso requerido',
      source === 'camera'
        ? 'Necesitamos acceso a la cámara para tomar evidencia. Actívalo en Ajustes.'
        : 'Necesitamos acceso a la galería para adjuntar evidencia. Actívalo en Ajustes.',
    );
    return undefined;
  }

  const pickerOptions: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: Platform.OS === 'ios',
    aspect: [4, 3],
  };

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(pickerOptions)
      : await ImagePicker.launchImageLibraryAsync(pickerOptions);

  if (result.canceled || !result.assets[0]) return undefined;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    mimeType: asset.mimeType ?? undefined,
    fileName: asset.fileName ?? undefined,
  };
}

export function promptTechnicianEvidence(onPicked: (photo: TechnicianPhoto) => void): void {
  Alert.alert('Adjuntar evidencia', 'Una foto ayuda a dejar constancia del trabajo en campo.', [
    { text: 'Cámara', onPress: () => void pickFrom('camera').then((photo) => photo && onPicked(photo)) },
    { text: 'Galería', onPress: () => void pickFrom('library').then((photo) => photo && onPicked(photo)) },
    { text: 'Cancelar', style: 'cancel' },
  ]);
}
