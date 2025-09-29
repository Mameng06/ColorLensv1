import { StyleSheet, Dimensions } from 'react-native';
const { height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3A86FF',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  videoContainer: {
    height: height * 0.4, // 40% of screen height
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  webView: {
    flex: 1,
  },
  webViewFallback: { justifyContent: 'center', alignItems: 'center' },
  infoContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});