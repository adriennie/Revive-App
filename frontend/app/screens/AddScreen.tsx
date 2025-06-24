import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';

interface ItemData {
  name: string;
  price: number;
  description: string;
  category: string;
  condition: string;
  location: string;
  type: string;
  image_url: string;
  age_minutes: number | null;
  clerk_user_id?: string;
  user_id?: string;
}

export default function AddItemScreen() {
  const { user } = useUser();
  const [isFood, setIsFood] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImagePicker = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please grant media library permission.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera access is required to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUrl(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name || !description || !category || !condition || !location || !price) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);
    let publicImageUrl = '';

    try {
      if (imageUrl) {
        console.log('Starting image upload process...');
        const fileExt = imageUrl.split('.').pop()?.toLowerCase() === 'png' ? 'png' : 'jpg';
        const fileName = `item_${Date.now()}.${fileExt}`;

        console.log('Reading image file...');
        // Get the image file data as a binary array
        const fileInfo = await FileSystem.getInfoAsync(imageUrl);
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }

        console.log('Uploading to Supabase storage...');
        // Create form data for the file
        const formData = new FormData();
        formData.append('file', {
          uri: imageUrl,
          type: `image/${fileExt}`,
          name: fileName
        } as any);

        // Upload using Supabase storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(fileName, formData, {
            contentType: `image/${fileExt}`,
            upsert: true
          });

        if (uploadError) {
          console.error('Upload error details:', uploadError);
          throw new Error(`Upload failed: ${uploadError.message}`);
        }

        console.log('Upload successful, getting public URL...');
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from('item-images')
          .getPublicUrl(fileName);

        publicImageUrl = urlData.publicUrl;
        console.log('Public URL obtained:', publicImageUrl);
      }

      const itemData: ItemData = {
        name,
        price: parseFloat(price),
        description,
        category,
        condition,
        location,
        type: isFood ? 'food' : 'sale',
        image_url: publicImageUrl,
        age_minutes: isFood ? parseInt(age, 10) || null : null,
        clerk_user_id: user?.id,
      };

      // Get user's Supabase ID if available
      if (user?.id) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('clerk_user_id', user.id)
          .single();

        if (!userError && userData) {
          itemData.user_id = userData.id;
        }
      }

      const { error } = await supabase.from('itemdata').insert([itemData]);

      if (error) {
        Alert.alert('Error', 'Failed to save item.');
        console.log(error);
        setLoading(false);
        return;
      }

      Alert.alert('Success!', 'Item has been added successfully.');
      router.replace('/GetStarted');
    } catch (err) {
      Alert.alert('Upload Error', err instanceof Error ? err.message : 'Something went wrong.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Text style={styles.header}>Add {isFood ? 'Food' : 'Sale Item'}</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.label}>Is this a food item?</Text>
            <Switch
              value={isFood}
              onValueChange={setIsFood}
              trackColor={{ false: '#767577', true: '#FF9800' }}
              thumbColor="#fff"
            />
          </View>

          <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} placeholderTextColor="#999" />
          <TextInput style={[styles.input, styles.multiline]} placeholder="Description" multiline value={description} onChangeText={setDescription} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Condition" value={condition} onChangeText={setCondition} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} placeholderTextColor="#999" />
          <TextInput style={styles.input} placeholder="Price (₹)" keyboardType="numeric" value={price} onChangeText={setPrice} placeholderTextColor="#999" />

          {isFood && (
            <TextInput style={styles.input} placeholder="Age in Minutes (e.g. 120)" keyboardType="numeric" value={age} onChangeText={setAge} placeholderTextColor="#999" />
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
              <Text style={styles.imageButtonText}>Pick Image</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>
          </View>

          {imageUrl && (
            <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E1',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
    color: '#000',
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  imageButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    flex: 0.48,
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },
  button: {
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
