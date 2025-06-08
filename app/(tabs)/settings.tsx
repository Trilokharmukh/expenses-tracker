import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useExpenses } from '../../context/ExpenseContext';
import { useAuth } from '../../context/AuthContext';
import {
  Moon,
  Sun,
  Mail,
  Github,
  Twitter,
  ChevronRight,
  CloudDownload,
  CloudUpload,
  Trash2,
} from 'lucide-react-native';
import {
  createBackup,
  getBackups,
  restoreFromBackup,
  deleteBackup,
} from '../../utils/backup';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { expenses, categories } = useExpenses();
  const { logout } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backups, setBackups] = useState<string[]>([]);
  const [showBackupsModal, setShowBackupsModal] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const availableBackups = await getBackups();
      setBackups(availableBackups);
    } catch (error) {
      console.error('Failed to load backups:', error);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
  };

  const handleBackup = async () => {
    try {
      setIsBackingUp(true);
      await createBackup();
      await loadBackups();
      Alert.alert('Success', 'Backup created successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (backupPath: string) => {
    try {
      setIsRestoring(true);

      // Confirm restore
      Alert.alert(
        'Confirm Restore',
        'This will replace all your current data. Are you sure?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await restoreFromBackup(backupPath);
                Alert.alert('Success', 'Data restored successfully');
                setShowBackupsModal(false);
              } catch (error) {
                Alert.alert(
                  'Error',
                  'Failed to restore data. Please try again.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to restore data. Please try again.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteBackup = async (backupPath: string) => {
    try {
      Alert.alert(
        'Delete Backup',
        'Are you sure you want to delete this backup?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteBackup(backupPath);
              await loadBackups();
              Alert.alert('Success', 'Backup deleted successfully');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to delete backup. Please try again.');
    }
  };

  const formatBackupDate = (backupPath: string) => {
    const fileName = backupPath.split('/').pop() || '';
    const dateStr = fileName
      .replace('expense-tracker-backup-', '')
      .replace('.json', '');
    return new Date(dateStr).toLocaleDateString();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <View style={styles.setting}>
              <View style={styles.settingInfo}>
                <View style={styles.iconContainer}>
                  {darkMode ? (
                    <Moon size={20} color="#06B6D4" />
                  ) : (
                    <Sun size={20} color="#06B6D4" />
                  )}
                </View>
                <Text style={styles.settingText}>Dark Mode</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#e2e8f0', true: '#0891b2' }}
                thumbColor={darkMode ? '#06B6D4' : '#f5f5f5'}
              />
            </View>

            <View style={styles.setting}>
              <View style={styles.settingInfo}>
                <View style={styles.iconContainer}>
                  <Mail size={20} color="#06B6D4" />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#e2e8f0', true: '#0891b2' }}
                thumbColor={notificationsEnabled ? '#06B6D4' : '#f5f5f5'}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Management</Text>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleBackup}
              disabled={isBackingUp}
            >
              <View style={styles.actionInfo}>
                <View
                  style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}
                >
                  <CloudDownload size={20} color="#0284c7" />
                </View>
                <Text style={styles.actionText}>
                  {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                </Text>
              </View>
              {isBackingUp ? (
                <ActivityIndicator size="small" color="#0284c7" />
              ) : (
                <ChevronRight size={20} color="#999" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => setShowBackupsModal(true)}
            >
              <View style={styles.actionInfo}>
                <View
                  style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}
                >
                  <CloudUpload size={20} color="#0284c7" />
                </View>
                <Text style={styles.actionText}>Restore from Backup</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionInfo}>
                <View
                  style={[styles.iconContainer, { backgroundColor: '#f3f4f6' }]}
                >
                  <Github size={20} color="#333" />
                </View>
                <Text style={styles.actionText}>Version 1.0.0</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem}>
              <View style={styles.actionInfo}>
                <View
                  style={[styles.iconContainer, { backgroundColor: '#e0f2fe' }]}
                >
                  <Twitter size={20} color="#1d9bf0" />
                </View>
                <Text style={styles.actionText}>Follow on Twitter</Text>
              </View>
              <ChevronRight size={20} color="#999" />
            </TouchableOpacity>
          </View>

          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>
              ExpenseTracker © {new Date().getFullYear()}
            </Text>
            <Text style={styles.appVersion}>Version 1.0.0</Text>
          </View>
        </ScrollView>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Backups Modal */}
        <Modal
          visible={showBackupsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowBackupsModal(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Available Backups</Text>
                <TouchableOpacity onPress={() => setShowBackupsModal(false)}>
                  <Text style={styles.closeButton}>Close</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.backupsList}>
                {backups.length === 0 ? (
                  <Text style={styles.noBackupsText}>No backups available</Text>
                ) : (
                  backups.map((backupPath) => (
                    <View key={backupPath} style={styles.backupItem}>
                      <View style={styles.backupInfo}>
                        <Text style={styles.backupDate}>
                          {formatBackupDate(backupPath)}
                        </Text>
                      </View>
                      <View style={styles.backupActions}>
                        <TouchableOpacity
                          style={[styles.backupButton, styles.restoreButton]}
                          onPress={() => handleRestore(backupPath)}
                          disabled={isRestoring}
                        >
                          <Text style={styles.backupButtonText}>Restore</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.backupButton, styles.deleteButton]}
                          onPress={() => handleDeleteBackup(backupPath)}
                        >
                          <Trash2 size={16} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  actionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 12,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    fontSize: 16,
    color: '#06B6D4',
    fontWeight: '600',
  },
  backupsList: {
    padding: 16,
  },
  noBackupsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 24,
  },
  backupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backupInfo: {
    flex: 1,
  },
  backupDate: {
    fontSize: 16,
    color: '#333',
  },
  backupActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
  },
  restoreButton: {
    backgroundColor: '#06B6D4',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  backupButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#ff3b30',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
