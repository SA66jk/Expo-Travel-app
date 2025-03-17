import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestCameraPermission } from './imageService';

const STORAGE_KEY = 'shareListData'; //储存键名 'shareListData'

// 获取存储的位置列表
export const getStoredLocations = async () => {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY); //从本地存储 (AsyncStorage) 获取位置列表数据，没有数据返还空数组
    return savedData ? JSON.parse(savedData) : []; //返还数据是JSON格式，解析后返回
  } catch (error) {
    console.error('Failed to load locations:', error);
    throw error;
  }
};

// 请求权限
export const requestPermissions = async () => {
  const [locationStatus] = await Promise.all([ //Promise.all() 同时运行多个异步任务
    Location.requestForegroundPermissionsAsync(), //请求GPS权限
    requestCameraPermission() //请求相机权限，从imageSerice.js中调用
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
      accuracy: Location.Accuracy.High //获取高精度GPS位置，10m
    }); //获取当前GPS位置

    const [addressInfo] = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }); //将坐标转化为地址信息

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
    const currentLocations = await getStoredLocations(); //获取存储的位置列表
    const newLocation = {
      id: Date.now().toString(), //使用时间截作为id
      ...locationData, //传入位置信息
      photo: photoUri, //传入照片
    };

    const updatedLocations = [newLocation, ...currentLocations]; // 把新位置放到列表前面
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations)); //存入本地存储
    return updatedLocations; // 返回更新后的数据
  } catch (error) {
    console.error('Failed to save location:', error);
    throw error;
  }
};

// 删除位置
export const deleteLocation = async (locationId) => {
  try {
    const locations = await getStoredLocations(); //获取储存的位置列表
    const updatedLocations = locations.filter(location => location.id !== locationId); //过滤掉要删除的位置
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations)); //更新本地储存
    return updatedLocations; //返还新数据
  } catch (error) {
    console.error('Failed to delete location:', error);
    throw error;
  }
};

// 更新位置主题
export const updateLocationTheme = async (locationId, newTheme) => {
  try {
    const locations = await getStoredLocations(); //获取储存的位置列表
    const updatedLocations = locations.map(location => //map()遍历数组
      location.id === locationId  //当位置id匹配时更新
        ? { ...location, name: newTheme }  //只更新name字段
        : location //如果id不匹配，返还原数据
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations)); //更新本地储存
    return updatedLocations; //返还新数据
  } catch (error) {
    console.error('Failed to update location theme:', error);
    throw error;
  }
};

// 更新位置照片
export const updateLocationPhoto = async (locationId, newPhotoUri) => {
  try {
    const locations = await getStoredLocations(); //获取储存的位置列表
    const updatedLocations = locations.map(location => 
      location.id === locationId  //位置id匹配时更新
        ? { ...location, photo: newPhotoUri } //只更新photo字段
        : location //如果id不匹配，返还原数据
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLocations)); //更新本地储存
    return updatedLocations; //返还新数据
  } catch (error) {
    console.error('Failed to update location photo:', error);
    throw error;
  }
}; 