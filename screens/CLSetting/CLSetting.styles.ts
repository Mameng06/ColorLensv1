import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  backButton: { padding: 8 },
  backText: { fontSize: 24 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  note: { fontSize: 14, color: '#666', textAlign: 'center' },
  saveButton: { backgroundColor: '#3A86FF', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  saveText: { color: '#fff', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 8 },
  label: { fontSize: 16, fontWeight: '600' },
  choice: { padding: 10, borderRadius: 6, backgroundColor: '#EEE', marginRight: 8 },
  choiceSelected: { backgroundColor: '#D7C9FF' },
  fabContainer: { position: 'absolute', right: 16, bottom: 24 },
  fabSubmenu: { backgroundColor: 'transparent', alignItems: 'flex-end' },
  fabSubmenuItem: { backgroundColor: '#F4E6FF', padding: 10, borderRadius: 8, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  fabSubmenuIcon: { marginRight: 8 },
  fabSubmenuText: { fontWeight: '600' },
});
