import React, { useState } from 'react';
import {
  View, 
  Text,
  Modal,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
  TextInput
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

// 获取屏幕宽度，用于计算模态框宽度
const windowWidth = Dimensions.get('window').width;

/**
 * 位置详情模态框组件
 * @param {boolean} isVisible - 控制模态框显示/隐藏
 * @param {object} location - 位置信息对象
 * @param {boolean} showMap - 控制地图显示/隐藏
 * @param {function} onToggleMap - 切换地图显示状态的回调
 * @param {function} onDelete - 删除位置的回调
 * @param {function} onClose - 关闭模态框的回调
 * @param {function} onUpdatePhoto - 更新照片的回调
 * @param {function} onUpdateTheme - 更新主题的回调
 */
export const LocationDetailModal = ({
  isVisible, //弹窗是否可见
  location, //传入地点数据
  showMap, //控制地图显示和隐藏
  onToggleMap, //切换地图显示状态的回调函数
  onDelete, //删除地点的回调函数
  onClose, //关闭弹窗的回调函数
  onUpdatePhoto, //更新照片的回调函数
  onUpdateTheme //更新主题的回调函数
}) => {
  // 编辑主题模态框的状态管理
  const [isEditThemeModalVisible, setIsEditThemeModalVisible] = useState(false); //编辑主题弹窗是否显示
  const [editingTheme, setEditingTheme] = useState(''); //编辑的主题

  // 如果没有位置信息，不渲染任何内容
  if (!location) return null;

  // 处理编辑主题按钮点击
  const handleEditTheme = () => {
    setEditingTheme(location.name);
    setIsEditThemeModalVisible(true); //显示编辑弹窗
  };

  // 处理保存主题
  const handleSaveTheme = () => {
    if (editingTheme.trim() && onUpdateTheme) { //确保输入框有内容
      onUpdateTheme(editingTheme); //调用onUpdateTheme进行主题更新
      setIsEditThemeModalVisible(false); //关闭弹窗
      setEditingTheme(''); //清空输入框
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* 照片区域 */}
          <TouchableOpacity
            onPress={() => onUpdatePhoto(location.id)}
            style={styles.modalImageContainer}
          >
            <Image 
              source={{ uri: location.photo }} 
              style={styles.modalImage} 
            />
            <View style={styles.updatePhotoOverlay}>
              <Text style={styles.updatePhotoText}>Update Photo</Text>
            </View>
          </TouchableOpacity>

          {/* 标题和操作按钮区域 */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{location.name}</Text>
            <View style={styles.headerButtons}>
              {/* 编辑主题按钮 */}
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={handleEditTheme}
              >
                <Text style={styles.actionButtonText}>Edit Theme</Text>
              </TouchableOpacity>
              {/* 删除按钮 */}
              <TouchableOpacity 
                style={[styles.iconButton, styles.deleteIconButton]}
                onPress={() => {
                  Alert.alert(
                    'Confirm Delete',
                    'Are you sure you want to delete this location?',
                    [
                      {
                        text: 'Cancel',
                        style: 'cancel'
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => onDelete(location.id)
                      }
                    ]
                  );
                }}
              >
                <Text style={[styles.actionButtonText, { color: '#FF3B30' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 地址信息 */}
          <Text style={styles.modalAddress}>
            Location: {location.address?.street} {location.address?.city}
          </Text>

          {/* 坐标和地图区域 */}
          <View style={styles.coordsContainer}>
            <View style={styles.coordsContent}>
              {/* 坐标信息 */}
              <Text style={styles.modalCoords}>
                Latitude: {location.coords.latitude.toFixed(6)}
                {'\n'}
                Longitude: {location.coords.longitude.toFixed(6)}
              </Text>
              {/* 切换地图显示按钮 */}
              <TouchableOpacity
                style={styles.mapToggleButton}
                onPress={onToggleMap}
              >
                <Text style={styles.actionButtonText}>
                  {showMap ? 'Hide Location' : 'Show Location'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* 地图组件 */}
            {showMap && (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                  }}
                  title={location.name}
                />
              </MapView>
            )}
          </View>

          {/* 关闭按钮 */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>

          {/* 编辑主题的模态框 */}
          <Modal
            visible={isEditThemeModalVisible}
            transparent={true}
            animationType="fade"
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { padding: 20 }]}>
                <Text style={styles.modalTitle}>Edit Theme</Text>
                {/* 主题输入框 */}
                <TextInput
                  style={styles.editThemeInput}
                  value={editingTheme}
                  onChangeText={setEditingTheme}
                  placeholder="Enter new theme..."
                  placeholderTextColor="#999"
                />
                {/* 编辑主题的按钮组 */}
                <View style={styles.editButtons}>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.cancelButton]}
                    onPress={() => {
                      setIsEditThemeModalVisible(false);
                      setEditingTheme('');
                    }}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editButton, styles.saveButton]}
                    onPress={handleSaveTheme}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

// 样式定义
const styles = StyleSheet.create({
  // 模态框容器样式
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 半透明背景
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 模态框内容区域样式
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: windowWidth - 40,
    maxHeight: '80%',
  },
  // 图片容器样式
  modalImageContainer: {
    position: 'relative',
    width: '100%',
    height: 250,
    marginBottom: 15,
  },
  // 图片样式
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  // 更新照片覆盖层样式
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
  // 更新照片文本样式
  updatePhotoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  // 模态框头部样式
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  // 模态框标题样式
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // 头部按钮容器样式
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // 图标按钮样式
  iconButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
    backgroundColor: '#f5f5f5',
  },
  // 删除按钮特殊样式
  deleteIconButton: {
    backgroundColor: '#ffebee',
  },
  // 操作按钮文本样式
  actionButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  // 地址文本样式
  modalAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  // 坐标容器样式
  coordsContainer: {
    marginBottom: 10,
  },
  // 坐标内容样式
  coordsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // 坐标文本样式
  modalCoords: {
    fontSize: 14,
    color: '#888',
    flex: 1,
  },
  // 地图切换按钮样式
  mapToggleButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  // 地图样式
  map: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    marginTop: 10,
  },
  // 关闭按钮样式
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  // 主题输入框样式
  editThemeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  // 编辑按钮容器样式
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  // 编辑按钮基础样式
  editButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 10,
  },
  // 保存按钮样式
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  // 取消按钮样式
  cancelButton: {
    backgroundColor: '#666',
  },
  // 按钮文本样式
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 