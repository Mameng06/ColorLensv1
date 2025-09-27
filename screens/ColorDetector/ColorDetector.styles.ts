import { StyleSheet, Dimensions } from 'react-native';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  backButton: { padding: 8 },
  backText: { fontSize: 24 },
  settingsButton: { padding: 8 },
  settingsText: { fontSize: 20 },
  // Camera area holds the preview and crosshair. position: 'relative' so absolute children are positioned correctly.
  // Camera area holds the preview and crosshair. position: 'relative' so absolute children are positioned correctly.
  // Add horizontal padding so the preview sits visually centered with even white space.
  cameraArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', position: 'relative', paddingTop: 8, paddingHorizontal: 16 },
  // Use a precise pixel width (screen width minus horizontal padding) so the preview centers exactly.
  cameraPreview: { width: width - 32, alignSelf: 'center', aspectRatio: 4 / 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  cameraFallback: { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', width: width - 32, aspectRatio: 4 / 3, borderRadius: 8 },
  cameraFallbackText: { color: '#666', fontSize: 14 },
  permissionButton: { marginTop: 12, backgroundColor: '#2B7FFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontWeight: '700' },
  // Crosshair: two white lines (vertical & horizontal) and a red central dot with white border
  crosshairVertical: { position: 'absolute', width: 2, height: 20000, backgroundColor: '#fff', left: '50%', top: 0, transform: [{ translateX: -1 }] },
  crosshairHorizontal: { position: 'absolute', height: 2, width: 20000, backgroundColor: '#fff', top: '50%', left: 0, transform: [{ translateY: -1 }] },
  crosshairContainer: { position: 'absolute', width: 20, height: 20, justifyContent: 'center', alignItems: 'center', left: 0, top: 0 },
  crosshairDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', borderWidth: 2, borderColor: '#fff' },
  infoArea: { padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#333', width: 100 },
  infoValue: { fontSize: 20, fontWeight: '700', color: '#000' },
  freezeButton: { marginTop: 12, backgroundColor: '#FF8C2B', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  freezeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
