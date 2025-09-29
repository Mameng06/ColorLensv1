import { StyleSheet, Dimensions } from 'react-native';
const { width } = Dimensions.get('window');

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
  // Responsive preview: fill available width inside the cameraArea padding, but don't exceed screen width minus padding
  cameraPreview: { width: '100%', maxWidth: width - 32, alignSelf: 'center', aspectRatio: 4 / 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  cameraFallback: { backgroundColor: '#F2F2F2', justifyContent: 'center', alignItems: 'center', width: '100%', maxWidth: width - 32, aspectRatio: 4 / 3, borderRadius: 8 },
  cameraFallbackText: { color: '#666', fontSize: 14 },
  permissionButton: { marginTop: 12, backgroundColor: '#2B7FFF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontWeight: '700' },
  // Crosshair base: lines will be sized at render time to match the preview size
  crosshairVertical: { position: 'absolute', width: 2, backgroundColor: '#fff', borderRadius: 0, elevation: 4 },
  crosshairHorizontal: { position: 'absolute', height: 2, backgroundColor: '#fff', borderRadius: 0, elevation: 4 },
  // Container for the preview area (keeps even margins and centers inner preview)
  cameraPreviewContainer: { width: '100%', maxWidth: width - 32, alignSelf: 'center', aspectRatio: 4 / 3, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000', position: 'relative' },
  // Inner preview fills the container (used for RNCamera or VisionCamera component)
  cameraInner: { width: '100%', height: '100%' },
  previewWrapper: { width: '100%', alignItems: 'center', position: 'relative' },
  debugText: { fontSize: 12, color: '#444' },
  debugBlock: { marginTop: 8 },
  absoluteOverlay: { position: 'absolute', left: 0, top: 0 },
  fillerBar: { position: 'absolute', backgroundColor: '#fff' },
  crosshairContainer: { position: 'absolute', width: 20, height: 20, justifyContent: 'center', alignItems: 'center', left: 0, top: 0 },
  crosshairDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'red', borderWidth: 0, elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  infoArea: { padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoLabel: { fontSize: 14, color: '#333', width: 100 },
  infoValue: { fontSize: 20, fontWeight: '700', color: '#000' },
  freezeButton: { marginTop: 12, backgroundColor: '#FF8C2B', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  freezeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
