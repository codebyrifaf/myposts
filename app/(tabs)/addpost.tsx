import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import Octicons from '@expo/vector-icons/Octicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { createPost } from '@/lib/database';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function AddPostScreen() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreatePost = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setLoading(true);
    
    try {
      const newPost = await createPost(user.id, content.trim());
      
      if (newPost) {
        Alert.alert('Success', 'Post created successfully!');
        setContent(''); // Clear the form
        // Navigate to feed to see the new post
        router.push('/feed');
      } else {
        Alert.alert('Error', 'Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return 'You';
    
    // Try to get the custom metadata first, then fall back to email
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user.email) {
      // Extract name from email (before @)
      return user.email.split('@')[0];
    }
    
    return 'You';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Post</Text>
      
      <View style={styles.postCard}>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>😊</Text>
          </View>
          <View>
            <Text style={styles.userName}>{getUserDisplayName()}</Text>
            <Text style={styles.userPrompt}>What's on your mind?</Text>
          </View>
        </View>
        
        <TextInput
          style={styles.textInput}
          placeholder="Share your thoughts..."
          multiline={true}
          numberOfLines={6}
          textAlignVertical="top"
          value={content}
          onChangeText={setContent}
          editable={!loading}
        />
        
        <View style={styles.actionSection}>
          <View style={styles.mediaButtons}>
            <TouchableOpacity style={styles.mediaButton} disabled={loading}>
              <MaterialIcons name="photo" size={20} color="#666" />
              <Text style={styles.mediaButtonText}>Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.mediaButton} disabled={loading}>
              <MaterialIcons name="camera-alt" size={20} color="#666" />
              <Text style={styles.mediaButtonText}>Camera</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[
              styles.postButton, 
              (!content.trim() || loading) && styles.disabledButton
            ]}
            onPress={handleCreatePost}
            disabled={!content.trim() || loading}
          >
            <Text style={styles.postButtonText}>
              {loading ? 'Posting...' : 'Post'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {!user && (
        <View style={styles.loginPrompt}>
          <MaterialIcons name="info" size={24} color="#ff9800" />
          <Text style={styles.loginPromptText}>
            Please log in to create posts
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B73FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    color: 'white',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userPrompt: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#6B73FF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
    marginBottom: 16,
    backgroundColor: '#fafafa',
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    color: '#666',
  },
  postButton: {
    backgroundColor: '#9CA3AF',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  postButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ffeaa7',
  },
  loginPromptText: {
    fontSize: 16,
    color: '#856404',
    marginLeft: 8,
    flex: 1,
  },
});
