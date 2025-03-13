import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LocationItem } from './LocationItem';

export const LocationList = ({ locations, onLocationPress }) => {
  return (
    <ScrollView style={styles.locationsList}>
      {locations.length === 0 ? (
        <View style={styles.emptyContainer}>
        </View>
      ) : (
        locations.map(location => (
          <LocationItem
            key={location.id}
            location={location}
            onPress={() => onLocationPress(location)}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  locationsList: {
    flex: 1,
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
}); 