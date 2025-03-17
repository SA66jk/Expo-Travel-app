import * as ImagePicker from 'expo-image-picker';

// 请求相机权限
export const requestCameraPermission = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync(); //调用 ImagePicker.requestCameraPermissionsAsync() 请求相机权限
  if (status !== 'granted') {
    throw new Error('Camera permission is required');
  }
  return true;
};

// 拍照
export const takePhoto = async () => {
  try {
    const result = await ImagePicker.launchCameraAsync({ //调用 ImagePicker.launchCameraAsync() 打开相机
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //只允许拍摄照片，不支持录制视频
      allowsEditing: true, //允许用户在拍照后 裁剪、旋转、调整
      aspect: [4, 3], //设置裁剪比例为 4:3 (宽高比)
      quality: 1, //图片质量最高（取值范围 0~1）
    });

    if (result.canceled) {
      return null;
    }

    return result.assets[0].uri;
  } catch (error) {
    console.error('Failed to take photo:', error);
    throw error;
  }
};

