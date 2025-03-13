import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput
} from 'react-native';

const windowWidth = Dimensions.get('window').width;

export const LocationPreviewModal = ({
  isVisible,
  isLoadingLocation,
  previewLocation,
  previewPhoto,
  onLoadLocation,
  onTakePhoto,
  onCancel,
  onConfirm,
  isLoading
}) => {
  const [theme, setTheme] = useState('');

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Location</Text>
          
          {/* 主题输入框（可选） */}
          <View style={styles.themeContainer}>
            <Text style={styles.infoLabel}>Theme (Optional):</Text>
            <TextInput
              style={styles.themeInput}
              value={theme}
              onChangeText={setTheme}
              placeholder="Enter location theme..."
              placeholderTextColor="#999"
            />
          </View>

          {/* 位置信息 */}
          {isLoadingLocation ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Getting location...</Text>
            </View>
          ) : previewLocation ? (
            <>
            
              <View style={styles.locationInfoContainer}>
                <Text style={styles.infoLabel}>Address:</Text>
                <Text style={styles.modalAddress}>
                  {previewLocation.address?.street} {previewLocation.address?.city}
                </Text>
              </View>

              <View style={styles.locationInfoContainer}>
                <Text style={styles.infoLabel}>Coordinates:</Text>
                <Text style={styles.modalCoords}>
                  Latitude: {previewLocation.coords.latitude.toFixed(6)}
                  {'\n'}
                  Longitude: {previewLocation.coords.longitude.toFixed(6)}
                </Text>
              </View>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onLoadLocation}
            >
              <Text style={styles.actionButtonText}>Get Current Location</Text>
            </TouchableOpacity>
          )}

          {/* 照片部分 */}
          {previewPhoto ? (
            <Image 
              source={{ uri: previewPhoto }} 
              style={styles.previewImage} 
            />
          ) : (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={onTakePhoto}
            >
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
          )}

          {/* 按钮 */}
          <View style={styles.previewButtons}>
            <TouchableOpacity 
              style={[styles.previewButton, styles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            {/* 确认发布按钮 */}
            <TouchableOpacity 
              style={[
                styles.previewButton, 
                styles.confirmButton,
                (!previewPhoto || !previewLocation) && styles.confirmButtonDisabled
              ]}
              onPress={() => onConfirm(theme)}
              disabled={!previewPhoto || !previewLocation || isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  locationInfoContainer: {
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  modalAddress: {
    fontSize: 16,
    color: '#333',
  },
  modalCoords: {
    fontSize: 14,
    color: '#666',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginVertical: 15,
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
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  themeContainer: {
    marginBottom: 15,
  },
  themeInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginTop: 5,
  },
}); 