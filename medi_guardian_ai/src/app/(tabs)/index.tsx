import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Header } from '../../components/ui/Header';
import { HorizontalSelector } from '../../components/ui/HorizontalSelector';
import { HeroFeatureCard } from '../../components/ui/HeroFeatureCard';
import { SecondaryFeedItem } from '../../components/ui/SecondaryFeedItem';
import { Pill, Activity, Apple } from 'lucide-react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header 
          greeting="GOOD MORNING"
          name="Harshith"
          notificationCount={3}
        />
        
        <HorizontalSelector />
        
        <HeroFeatureCard />
        
        <View style={styles.feedSection}>
          <SecondaryFeedItem 
            title="Morning Vitamins" 
            subtitle="Take with food - 9:00 AM" 
            icon={Pill} 
            iconColor="#ca0013" 
          />
          <SecondaryFeedItem 
            title="Hydration Check" 
            subtitle="2 glasses of water" 
            icon={Activity} 
            iconColor="#4299E1" 
          />
          <SecondaryFeedItem 
            title="Healthy Snack" 
            subtitle="Apple or Banana" 
            icon={Apple} 
            iconColor="#38A169" 
          />
          {/* Add bottom padding to account for the floating tab bar */}
          <View style={styles.bottomSpacer} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  feedSection: {
    marginTop: 8,
  },
  bottomSpacer: {
    height: 100, // Space for the floating navigation bar
  },
});
