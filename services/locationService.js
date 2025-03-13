import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestCameraPermission } from './imageService';

const STORAGE_KEY = 'shareListData';

// 获取存储的位置列表
export const getStoredLocations = async () => {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : [];
  } catch (error) {
    console.error('Failed to load locations:', error);
    throw error;
  }
};

// 请求权限
export const requestPermissions = async () => {
  const [locationStatus] = await Promise.all([
    Location.requestForegroundPermissionsAsync(),
    requestCameraPermission()
  ]);

  if (locationStatus.status !== 'granted') {
    throw new Error('Location permission is required');
  }

  return true;
};

// 获取当前位置
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });

    const [addressInfo] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    return {
      coords: location.coords,
      address: addressInfo,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    throw error;
  }
};

// 保存新位置
export const saveLocation = async (locationData, photoUri) => {
  try {
    const currentLocations = await getStoredLocations();
    const newLocation = {
      id: Date.now().toString(),
      ...locationData,
      photo: photoUri,
    };

    const updatedLocations = [newLocation, ...currentLocations];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    return updatedLocations;
  } catch (error) {
    console.error('Failed to save location:', error);
    throw error;
  }
};

// 删除位置
export const deleteLocation = async (locationId) => {
  try {
    const locations = await getStoredLocations();
    const updatedLocations = locations.filter(location => location.id !== locationId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    return updatedLocations;
  } catch (error) {
    console.error('Failed to delete location:', error);
    throw error;
  }
};

// 更新位置主题
export const updateLocationTheme = async (locationId, newTheme) => {
  try {
    const locations = await getStoredLocations();
    const updatedLocations = locations.map(location => 
      location.id === locationId 
        ? { ...location, name: newTheme }  // 使用 name 字段存储主题
        : location
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    return updatedLocations;
  } catch (error) {
    console.error('Failed to update location theme:', error);
    throw error;
  }
};

// 更新位置照片
export const updateLocationPhoto = async (locationId, newPhotoUri) => {
  try {
    const locations = await getStoredLocations();
    const updatedLocations = locations.map(location => 
      location.id === locationId 
        ? { ...location, photo: newPhotoUri }
        : location
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations));
    return updatedLocations;
  } catch (error) {
    console.error('Failed to update location photo:', error);
    throw error;
  }
}; 