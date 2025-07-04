import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons, Entypo } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import Sidebar from '@/components/Sidebar';

const categories = [
  { title: 'Free food', route: '/FreeFood' },
  { title: 'Free non-food', route: '/FreeNonFood' },
  // { title: 'For sale', route: '/ForSale' },
  // { title: 'Wanted', route: '/Wanted' },
];

export default function GetStarted() {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const location = 'XYZ';
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  if (!isLoaded) return null;

  const userName = isSignedIn ? user?.firstName ?? 'Guest' : 'Guest';

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* ───── HEADER ───── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.greeting}>Good afternoon, {userName}</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity>
              <Ionicons name="notifications-outline" size={22} color="#000" style={styles.iconGap} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSidebarVisible(true)}>
              <Entypo name="menu" size={22} color="#000" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#000" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
        <Text style={styles.subtext}>Listings within 5km</Text>
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
          <Link href="/Explore" asChild>
            <TouchableOpacity>
              <Ionicons name="search" size={22} color="#000" />
            </TouchableOpacity>
          </Link>
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
      <Sidebar isVisible={isSidebarVisible} onClose={() => setSidebarVisible(false)} />
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