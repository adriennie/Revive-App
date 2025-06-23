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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function AddItemScreen() {
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

  // Helper to get a blob from a local file URI robustly
  const getBlobFromUri = async (uri: string) => {
    const response = await fetch(uri);
    if (!response.ok) throw new Error('Failed to fetch file');
    return await response.blob();
  };

  const handleSubmit = async () => {
    if (!name || !description || !category || !condition || !location || !price) {
      Alert.alert('Error', 'Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      let publicImageUrl = '';
      if (imageUrl) {
        // 1. Upload image to Supabase Storage
        const fileExt = imageUrl.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        let blob;
        try {
          blob = await getBlobFromUri(imageUrl);
        } catch (e) {
          setLoading(false);
          Alert.alert('Image error', 'Could not read image file.');
          return;
        }

        const { error: uploadError } = await supabase.storage
          .from('item-images')
          .upload(filePath, blob, {
            cacheControl: '3600',
            upsert: false,
            contentType: blob.type || 'image/jpeg',
          });

        if (uploadError) {
          Alert.alert('Image upload failed', uploadError.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage.from('item-images').getPublicUrl(filePath);
        publicImageUrl = data.publicUrl;
      }

      const itemData = {
        name,
        price: parseFloat(price),
        description,
        category,
        condition,
        location,
        type: isFood ? 'food' : 'sale',
        image_url: publicImageUrl,
        age_minutes: isFood ? parseInt(age, 10) || null : null,
      };

      const { error } = await supabase.from('itemdata').insert([itemData]);

      if (error) {
        console.error('Supabase error:', error);
        Alert.alert('Error', 'Failed to save item. Please check the console for details.');
        setLoading(false);
        return;
      }

      Alert.alert('Success!', 'Item has been added successfully.');
      setName('');
      setDescription('');
      setCategory('');
      setCondition('');
      setLocation('');
      setImageUrl('');
      setPrice('');
      setAge('');
      setLoading(false);
      router.replace('/GetStarted');
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
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
        

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Description"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Condition" value={condition} onChangeText={setCondition} />
        <TextInput style={styles.input} placeholder="Location" value={location} onChangeText={setLocation} />
        <TextInput
          style={styles.input}
          placeholder="Price (₹)"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        {isFood && (
          <TextInput
            style={styles.input}
            placeholder="Age in Minutes (e.g. 120)"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
        )}

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <TouchableOpacity style={styles.imageButton} onPress={handleImagePicker}>
            <Text style={styles.imageButtonText}>Pick Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Text style={styles.imageButtonText}>📷 Take Photo</Text>
          </TouchableOpacity>
        </View>

        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.imagePreview} />
        ) : null}

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  imageButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    flex: 0.48, // To give space between buttons
  },
  imageButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  imagePickerText: {
    textAlign: 'center',
    color: '#999',
    marginBottom: 10,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
    resizeMode: 'cover',
  },

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
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
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