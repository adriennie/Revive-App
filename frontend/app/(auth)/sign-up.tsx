import React from 'react';
import { View, StyleSheet, ImageBackground, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, Card, TextInput } from 'react-native-paper';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { supabase } from '@/lib/supabase';

export default function SignUp() {
  const { isLoaded, signUp } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [photoUri, setPhotoUri] = React.useState('');
  const [photoUploading, setPhotoUploading] = React.useState(false);

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
      setPhotoUri(result.assets[0].uri);
    }
  };

  const uploadPhotoToSupabase = async (uri: string) => {
    if (!uri) return '';
    setPhotoUploading(true);
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileExt = blob.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `user_${Date.now()}.${fileExt}`;
      const newPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({ from: uri, to: newPath });
      const uploadUrl = `https://bzqqeativrabfbcqlzzl.supabase.co/storage/v1/object/user-photos/${fileName}`;
      const formData = new FormData();
      // @ts-ignore: React Native FormData file
      formData.append('file', { uri: newPath, name: fileName, type: blob.type });
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''}`,
          'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
        },
        body: formData,
      });
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload error:', errorText);
        Alert.alert('Photo Upload Error', errorText);
        throw new Error('Image upload failed');
      }
      const { data } = supabase.storage.from('user-photos').getPublicUrl(fileName);
      setPhotoUploading(false);
      return data.publicUrl;
    } catch (err) {
      setPhotoUploading(false);
      Alert.alert('Photo Upload Error', 'Could not upload photo.');
      return '';
    }
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill all required fields.');
      return;
    }
    try {
      const result = await signUp.create({ emailAddress: email, password });
      // Clerk userId
      const clerk_user_id = result?.createdUserId || '';
      let photo_url = '';
      if (photoUri) {
        photo_url = await uploadPhotoToSupabase(photoUri);
      }
      const { error } = await supabase.from('users').insert([
        {
          clerk_user_id,
          name,
          email,
          photo_url,
          phone_number: phone,
        },
      ]);
      if (error) {
        Alert.alert('Sign Up Error', 'Could not save user details.');
        return;
      }
      router.replace('/GetStarted');
    } catch (err) {
      console.error('Sign up error', err);
      Alert.alert('Sign Up Error', 'Could not sign up.');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' }}
      style={styles.bg}
      blurRadius={2}
    >
      <View style={styles.overlay} />
      <View style={styles.centered}>
        <Card style={styles.card} elevation={5}>
          <Card.Content>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Re:Vive</Text>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              autoCapitalize="words"
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry
            />
            <TouchableOpacity style={styles.photoBtn} onPress={handleImagePicker}>
              <Text style={{ color: '#fb923c', fontWeight: 'bold', textAlign: 'center' }}>
                {photoUri ? 'Change Photo' : 'Pick a Photo (optional)'}
              </Text>
            </TouchableOpacity>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : null}
            <Button
              mode="contained"
              style={styles.signupBtn}
              labelStyle={{ fontWeight: 'bold', fontSize: 16 }}
              onPress={handleSignUp}
              contentStyle={{ paddingVertical: 8 }}
              loading={photoUploading}
              disabled={photoUploading}
            >
              Sign Up
            </Button>
            <Button
              mode="text"
              style={styles.linkBtn}
              labelStyle={{ color: '#fb923c', fontWeight: 'bold' }}
              onPress={() => router.push('./login')}
            >
              Already have an account? Log In
            </Button>
          </Card.Content>
        </Card>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fb923c',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  signupBtn: {
    backgroundColor: '#fb923c',
    borderRadius: 30,
    marginBottom: 12,
    elevation: 2,
  },
  linkBtn: {
    marginTop: 8,
    alignSelf: 'center',
  },
  photoBtn: {
    marginBottom: 12,
    backgroundColor: 'rgba(251,146,60,0.1)',
    borderRadius: 20,
    padding: 8,
    alignItems: 'center',
  },
  photoPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fb923c',
  },
});