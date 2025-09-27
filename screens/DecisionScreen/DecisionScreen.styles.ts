import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 60,
    textAlign: 'left',
    alignSelf: 'flex-start',
    width: '100%',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  mainButton: {
    backgroundColor: '#FF6B35', // Orange background
    borderWidth: 2,
    borderColor: '#3A86FF', // Blue border
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  mainButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  
  // FAB Styles
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'flex-end',
  },
  fabSubmenu: {
    marginBottom: 20,
    alignItems: 'flex-end',
    gap: 12,
  },
  fabSubmenuItem: {
    backgroundColor: '#8338EC', // Purple background
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 140,
    justifyContent: 'flex-end',
  },
  fabSubmenuIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
    fontWeight: 'bold',
  },
  fabSubmenuText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  fabMain: {
    width: 56,
    height: 56,
    backgroundColor: '#8338EC', // Purple background
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  fabMainIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});