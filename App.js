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
} from 'react-native'; //React Native 组件（View、Text、TouchableOpacity、Modal等）—— 用于 UI 渲染
import React, { useState, useEffect } from 'react'; //useState & useEffect —— React Hooks，用于管理应用状态和生命周期
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps'; // MapView & Marker —— react-native-maps 库，用于地图显示
import { LocationList } from './components/LocationList';
import { LocationPreviewModal } from './components/LocationPreviewModal';
import { LocationDetailModal } from './components/LocationDetailModal';
import * as locationService from './services/locationService';
import * as imageService from './services/imageService';
import AsyncStorage from '@react-native-async-storage/async-storage'; //AsyncStorage —— 用于本地存储位置数据

const windowWidth = Dimensions.get('window').width;

export default function App() {
  // 各种状态管理 react hook
  const [shareLocations, setShareLocations] = useState([]); //存储所有已记录的位置数据
  const [errorMsg, setErrorMsg] = useState(null); //用于显示错误信息
  const [selectedLocation, setSelectedLocation] = useState(null); //点击位置时，存储当前选中的位置数据
  const [isModalVisible, setIsModalVisible] = useState(false); //详情弹窗 —— 是否显示地点详情
  const [isEditMode, setIsEditMode] = useState(false); //是否处于编辑模式，默认为否
  const [editingName, setEditingName] = useState(''); //编辑模式下，储存用户输入的新主题
  const [isLoading, setIsLoading] = useState(false); //控制界面加载中的状态
  const [showMap, setShowMap] = useState(false); //是否显示地图
  const [previewLocation, setPreviewLocation] = useState(null); //记录用户当前位置预览数据
  const [previewPhoto, setPreviewPhoto] = useState(null); //记录用户当前拍摄的照片预览数据
  const [isPreviewVisible, setIsPreviewVisible] = useState(false); //控制位置预览弹窗的显示
  const [isLoadingLocation, setIsLoadingLocation] = useState(false); //获取 GPS 时的状态
  const [isEditThemeModalVisible, setIsEditThemeModalVisible] = useState(false); //编辑主题弹窗的显示状态

  // 初始化加载
  useEffect(() => {
    initializeApp();
  }, []);
  //只在应用启动时执行一次，请求用户的位置权限并加载已存储的位置数据
  //await 让 JavaScript 等待一个“异步操作”完成，然后再执行下一步

  // 初始化应用
  const initializeApp = async () => {
    try {
      await locationService.requestPermissions(); //请求位置权限，应用会弹出对话框 “是否允许访问位置？”
      const locations = await locationService.getStoredLocations(); //从本地存储加载之前保存的地点
      setShareLocations(locations); //把加载到的地点数据存入 shareLocations 变量
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
    setIsLoadingLocation(true); //让界面显示 “正在获取位置...”，防止用户误以为应用卡住了
    try {
      const location = await locationService.getCurrentLocation(); //调用 locationService.getCurrentLocation() 获取 GPS 位置
      setPreviewLocation(location); //把获取到的 位置 存入 previewLocation，用于 UI 显示
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setIsLoadingLocation(false); //位置加载完成，隐藏加载状态
    }
  };
  //try { ... } catch (error) { ... } 这种结构，它的作用是防止程序崩溃


  // 拍照
  const takePhoto = async () => {
    try {
      const photoUri = await imageService.takePhoto(); //调用 imageService.takePhoto() 拍照，返回照片路径（photoUri）
      if (photoUri) {
        setPreviewPhoto(photoUri); //将照片路径存入 previewPhoto，用于后续存储
      }
    } catch (error) {
      setErrorMsg('Failed to take photo');
    }
  };

  // 确认发布
  const confirmPost = async (theme) => {
    setIsLoading(true); //界面显示“正在保存...
    try {
      const locationData = {
        ...previewLocation, //把 GPS 位置数据复制到 locationData
        name: theme, // 使用主题作为位置名称
      };
      const updatedLocations = await locationService.saveLocation(locationData, previewPhoto); //调用 locationService 存储数据，previewPhoto 里是用户拍的照片
      setShareLocations(updatedLocations); //更新地点列表，刷新 UI
      setPreviewLocation(null);
      setPreviewPhoto(null); //清空预览数据
      setIsPreviewVisible(false); //关闭预览弹窗
    } catch (error) {
      setErrorMsg('Failed to save location');
    } finally {
      setIsLoading(false);
    }
  };

  // 打开位置详情
  const openLocationDetail = (location) => {
    setSelectedLocation(location); //存储被点击的地点信息，用于在详情弹窗中显示
    setIsModalVisible(true); //显示 LocationDetailModal 弹窗，用户可以查看详细信息、更新名称、修改照片、删除地点等
  };

  // 删除位置
  const handleDeleteLocation = async (id) => {
    try {
      const updatedLocations = await locationService.deleteLocation(id); //调用 locationService.deleteLocation(id); 删除存储的地点
      setShareLocations(updatedLocations); //更新地点列表，刷新 UI
      setIsModalVisible(false); //关闭弹窗
    } catch (error) {
      setErrorMsg('Failed to delete location');
    }
  };

  // 更新位置主题
  const handleUpdateLocationTheme = async (newTheme) => {
    if (!newTheme.trim()) return; //检查输入是否为空，为空不更新

    try {
      const updatedLocations = await locationService.updateLocationTheme(selectedLocation.id, newTheme); //调用 locationService.updateLocationTheme()，传入 selectedLocation.id 和 newTheme 
      setShareLocations(updatedLocations); //更新地点列表，刷新 UI
      setSelectedLocation({ ...selectedLocation, name: newTheme }); //更新弹窗里的主题
    } catch (error) {
      setErrorMsg('Failed to update theme');
    }
  };

  // 更新照片
  const handleUpdatePhoto = async (locationId) => {
    try {
      const photoUri = await imageService.takePhoto(); //调用 imageService.takePhoto() 拍照，返回照片路径 photoUri
      if (photoUri) { //拍照成功
        const updatedLocations = await locationService.updateLocationPhoto(locationId, photoUri); //更新存储中的地点数据，替换旧照片
        setShareLocations(updatedLocations); //更新地点列表，刷新 UI
        if (selectedLocation?.id === locationId) { 
          setSelectedLocation({ ...selectedLocation, photo: photoUri }); //弹窗照片立即更新，用户无需重新打开弹窗
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
