import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export const LocationItem = ({ location, onPress }) => { //从 LocationList.js 里接收 单个 location 和 onPress
  return (
    <TouchableOpacity 
      style={styles.locationItem}
      onPress={onPress}
    >
      <Image 
        source={{ uri: location.photo }} 
        style={styles.locationImage} 
      />
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{location.name}</Text>
        <Text style={styles.timestamp}>
          {new Date(location.timestamp).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
}); 