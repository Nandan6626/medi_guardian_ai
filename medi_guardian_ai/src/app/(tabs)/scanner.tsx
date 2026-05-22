import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { ScanLine, Maximize, Zap, Camera as CameraIcon } from 'lucide-react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Colors } from '../../constants/Colors';

export default function ScannerScreen() {
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  function handleCapture() {
    setIsScanning(true);
    // Simulate API call or processing time
    setTimeout(() => {
      setIsScanning(false);
      // Here we could navigate to a result screen or add to activity feed
      Alert.alert('Success', 'Medication scanned successfully!');
    }, 1500);
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.cameraPlaceholder} facing={facing}>
        
        {/* Scanner Overlay */}
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {/* Animated Scan Line (Mocked via CSS) */}
            <View style={styles.scanLine} />
          </View>
        </View>

        {/* AI Confidence Badge */}
        <View style={styles.confidenceBadge}>
          <Zap size={16} color={Colors.warning} />
          <Text style={styles.confidenceText}>AI Analysing... 98%</Text>
        </View>

      </CameraView>

      {/* Controls */}
      <View style={styles.controls}>
        <Text style={styles.instructionTitle}>Position Pill or Label in frame</Text>
        <Text style={styles.instructionSub}>Our AI will auto-detect the medicine details.</Text>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.iconButton}>
            <Maximize size={24} color={Colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture} disabled={isScanning}>
            <View style={[styles.captureInner, isScanning && { backgroundColor: Colors.warning }]} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={toggleCameraFacing}>
            <CameraIcon size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  cameraPlaceholder: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: Colors.primary,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  confidenceBadge: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  confidenceText: {
    color: Colors.warning,
    marginLeft: 8,
    fontWeight: '700',
    fontSize: 14,
  },
  controls: {
    height: 250,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    alignItems: 'center',
    marginTop: -20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  instructionSub: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 30,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: 0.8,
  },
  permissionText: {
    color: Colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
