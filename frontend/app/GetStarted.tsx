import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { AuthService } from '@/lib/authService';
import { api } from '@/lib/api';

const categories = [
  { title: 'Free food', route: '/FreeFood' },
  { title: 'Free non-food', route: '/FreeNonFood' },
  // { title: 'For sale', route: '/ForSale' },
  // { title: 'Wanted', route: '/Wanted' },
];

export default function GetStarted() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams();
  const location = 'XYZ';
  const [userName, setUserName] = useState('Guest');
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const userDataRef = useRef<{ name: string; email: string } | null>(null);

  useEffect(() => {
    console.log('GetStarted useEffect triggered. user:', user, 'params:', params);
    console.log('Params details:', {
      userName: params.userName,
      userEmail: params.userEmail,
      userId: params.userId,
      hasParams: !!params.userName
    });
    
    const fetchUserData = async () => {
      // First check if user data was passed via router params
      if (params.userName && params.userName !== 'User' && !userDataRef.current) {
        console.log('✅ User data received via params:', params.userName);
        const userData = {
          name: params.userName as string,
          email: params.userEmail as string || ''
        };
        userDataRef.current = userData;
        setUserName(userData.name);
        setUserEmail(userData.email);
        setLoading(false);
        console.log('✅ Set user data from params and stopped loading');
        return;
      }
      
      // If we have stored user data, use it
      if (userDataRef.current && userDataRef.current.name !== 'User') {
        console.log('✅ Using stored user data:', userDataRef.current);
        setUserName(userDataRef.current.name);
        setUserEmail(userDataRef.current.email);
        setLoading(false);
        return;
      }
      
      // Try to fetch user data from database using Clerk user ID
      if (user?.id) {
        try {
          console.log('🔍 Fetching user data from database for Clerk ID:', user.id);
          const result = await api.getUserByClerkId(user.id);
          console.log('📋 Database result:', result);
          if (result.success && result.user && result.user.name) {
            console.log('✅ Found user in database:', result.user);
            const userData = { name: result.user.name, email: result.user.email };
            userDataRef.current = userData;
            setUserName(result.user.name);
            setUserEmail(result.user.email);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Failed to fetch user from database:', error);
        }
      }
      
      // Fallback to Clerk user data
      if (user) {
        const name = user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User';
        const email = user.primaryEmailAddress?.emailAddress || '';
        console.log('🔍 Clerk user data:', { name, email });
        const userData = { name, email };
        userDataRef.current = userData;
        setUserName(name);
        setUserEmail(email);
        setLoading(false);
        console.log('User loaded from Clerk. Name set to:', name);
      } else {
        // If no user data available, don't keep loading forever
        console.log('No user data available, setting default values');
        const userData = { name: 'User', email: '' };
        userDataRef.current = userData;
        setUserName('User');
        setUserEmail('');
        setLoading(false);
        console.log('✅ Set default values and stopped loading');
      }
    };
    
    fetchUserData();
  }, [user, params]);

  if (loading) {
    console.log('Rendering ActivityIndicator. Loading:', loading, 'user:', user);
    return <ActivityIndicator size="large" color="#fb923c" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ───── HEADER ───── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Good afternoon, {userName}</Text>
          <View style={styles.headerIcons}>
            <Ionicons name="notifications-outline" size={22} color="#000" style={styles.iconGap} />
            <Entypo name="menu" size={22} color="#000" />
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#000" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <Text style={styles.subtext}>Listings within 5km</Text>
        {userEmail ? (
          <Text style={styles.userEmail}>{userEmail}</Text>
        ) : null}
      </View>

      {/* ───── BODY ───── */}
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Explore Categories</Text>
        <View style={styles.grid}>
          {categories.map(({ title, route }) => (
            <TouchableOpacity
              key={title}
              style={styles.card}
              onPress={() => router.push(route as any)}
            >
              <Text style={styles.cardText}>{title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ───── FOOTER / TAB BAR ───── */}
      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <Ionicons name="home-outline" size={22} color="#FF9800" />
          <Text style={styles.tabTextActive}>Home</Text>
        </View>

        <View style={styles.tabItem}>
        <TouchableOpacity onPress={() => router.push('/Explore')}>
          <Ionicons name="search" size={22} color="#000" />
          </TouchableOpacity>

          <Text style={styles.tabText}>Explore</Text>
        </View>

        <View style={styles.addButtonWrapper}>
          <TouchableOpacity style={styles.addButton} onPress={() => router.push('/Add')}>
            <Ionicons name="add" size={24} color="#fff"/>
          </TouchableOpacity>
          <Text style={styles.tabText}>Add</Text>
        </View>

        <View style={styles.tabItem}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/CreditEconomy')}>
            <Ionicons name="card-outline" size={22} color="#000" />
            <Text style={styles.tabText}>Community</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabItem}>
          <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/Inbox')}>
          <MaterialIcons name="email" size={22} color="#000" />
          <Text style={styles.tabText}>Messages</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const HEADER_BG = '#FFF4E5';
const ORANGE_LIGHT = '#FFE0B2';
const PRIMARY_ACC = '#FF9800';

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconGap: {
    marginRight: 14,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    marginLeft: 4,
    fontSize: 15,
    fontWeight: '500',
  },
  subtext: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  userEmail: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  card: {
    width: '48%',
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: ORANGE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: HEADER_BG,
    height: 62,
    borderTopWidth: 1,
    borderColor: '#DDD',
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
  },
  tabItem: {
    alignItems: 'center',
    flex: 1,
  },
  tabText: {
    fontSize: 11,
    color: '#333',
    marginTop: 2,
  },
  tabTextActive: {
    fontSize: 11,
    color: PRIMARY_ACC,
    fontWeight: 'bold',
    marginTop: 2,
  },
  addButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    flex: 1,
  },
  addButton: {
    backgroundColor: PRIMARY_ACC,
    padding: 14,
    borderRadius: 30,
    marginBottom: 4,
  },
});