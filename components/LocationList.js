import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { LocationItem } from './LocationItem';

export const LocationList = ({ locations, onLocationPress }) => { //接受locations和onLocationPress函数作为props
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

//列表为空显示列表为空样式
//列表不为空遍历 locations，为 每个地点创建一个 LocationItem 组件
//onPress={() => onLocationPress(location)} 绑定点击事件
//onLocationPress 函数会在点击时调用，传入当前地点作为参数

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