import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';
import { LocationList } from './components/LocationList';
import { LocationPreviewModal } from './components/LocationPreviewModal';
import { LocationDetailModal } from './components/LocationDetailModal';
import * as locationService from './services/locationService';
import * as imageService from './services/imageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

export default function App() {
  // 各种状态管理 react hook
  const [shareLocations, setShareLocations] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [previewLocation, setPreviewLocation] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isEditThemeModalVisible, setIsEditThemeModalVisible] = useState(false);

  // 初始化加载
  useEffect(() => {
    initializeApp();
  }, []);

  // 初始化应用
  const initializeApp = async () => {
    try {
      await locationService.requestPermissions();
      const locations = await locationService.getStoredLocations();
      setShareLocations(locations);
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // 显示位置预览对话框
  const captureLocation = () => {
    setIsPreviewVisible(true);
  };

  // 加载位置数据
  const loadLocationData = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await locationService.getCurrentLocation();
      setPreviewLocation(location);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // 拍照
  const takePhoto = async () => {
    try {
      const photoUri = await imageService.takePhoto();
      if (photoUri) {
        setPreviewPhoto(photoUri);
      }
    } catch (error) {
      setErrorMsg('Failed to take photo');
    }
  };

  // 确认发布
  const confirmPost = async (theme) => {
    setIsLoading(true);
    try {
      const locationData = {
        ...previewLocation,
        name: theme, // 使用主题作为位置名称
      };
      const updatedLocations = await locationService.saveLocation(locationData, previewPhoto);
      setShareLocations(updatedLocations);
      setPreviewLocation(null);
      setPreviewPhoto(null);
      setIsPreviewVisible(false);
    } catch (error) {
      setErrorMsg('Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  // 打开位置详情
  const openLocationDetail = (location) => {
    setSelectedLocation(location);
    setIsModalVisible(true);
  };

  // 删除位置
  const handleDeleteLocation = async (id) => {
    try {
      const updatedLocations = await locationService.deleteLocation(id);
      setShareLocations(updatedLocations);
      setIsModalVisible(false);
    } catch (error) {
      setErrorMsg('Failed to delete location');
    }
  };

  // 更新位置主题
  const handleUpdateLocationTheme = async (newTheme) => {
    if (!newTheme.trim()) return;

    try {
      const updatedLocations = await locationService.updateLocationTheme(selectedLocation.id, newTheme);
      setShareLocations(updatedLocations);
      setSelectedLocation({ ...selectedLocation, name: newTheme });
    } catch (error) {
      setErrorMsg('Failed to update theme');
    }
  };

  // 更新照片
  const handleUpdatePhoto = async (locationId) => {
    try {
      const photoUri = await imageService.takePhoto();
      if (photoUri) {
        const updatedLocations = await locationService.updateLocationPhoto(locationId, photoUri);
        setShareLocations(updatedLocations);
        if (selectedLocation?.id === locationId) {
          setSelectedLocation({ ...selectedLocation, photo: photoUri });
        }
      }
    } catch (error) {
      setErrorMsg('Failed to update photo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Footprints</Text>

      <LocationList 
        locations={shareLocations}
        onLocationPress={openLocationDetail}
      />
      {/* 位置预览 */}
      <LocationPreviewModal 
        isVisible={isPreviewVisible}
        isLoadingLocation={isLoadingLocation}
        previewLocation={previewLocation}
        previewPhoto={previewPhoto}
        onLoadLocation={loadLocationData}
        onTakePhoto={takePhoto}
        onCancel={() => {
          setPreviewLocation(null);
          setPreviewPhoto(null);
          setIsPreviewVisible(false);
        }}
        onConfirm={confirmPost}
        isLoading={isLoading}
      />
      {/* 位置详情 */}
      <LocationDetailModal 
        isVisible={isModalVisible}
        location={selectedLocation}
        showMap={showMap}
        onToggleMap={() => setShowMap(!showMap)}
        onDelete={handleDeleteLocation}
        onClose={() => {
          setIsModalVisible(false);
        }}
        onUpdatePhoto={handleUpdatePhoto}
        onUpdateTheme={handleUpdateLocationTheme}
      />

      {/* 拍照按钮 */}
      <TouchableOpacity
        style={[
          styles.captureButton,
          isLoading && styles.captureButtonDisabled
        ]}
        onPress={captureLocation}
        disabled={isLoading}
      >
        <View style={styles.captureButtonContent}>
          <Text style={styles.captureButtonText}>
            {isLoading ? 'Processing...' : 'Record Location'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* 错误信息 */}
      {errorMsg && (
        <Text style={styles.errorText}>{errorMsg}</Text>
      )}
      {/* 状态栏 */}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  locationsList: {
    flex: 1,
  },
  locationItem: {
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  locationInfo: {
    padding: 15,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  timestamp: {
    color: '#666',
    fontSize: 14,
  },
  captureButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  captureButtonDisabled: {
    backgroundColor: '#999',
  },
  captureButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonIcon: {
    marginRight: 8,
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: windowWidth - 40,
    maxHeight: '80%',
  },
  modalImageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    marginBottom: 15,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  updatePhotoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  updatePhotoText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  coordsContainer: {
    marginBottom: 10,
  },
  coordsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalCoords: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  mapToggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editNameContainer: {
    marginBottom: 15,
  },
  editNameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    backgroundColor: '#f5f5f5',
  },
  deleteIconButton: {
    backgroundColor: '#ffebee',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  closeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  modalTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 15,
  },
  previewButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  previewButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF3B30',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginVertical: 10,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 10,
  },
});
