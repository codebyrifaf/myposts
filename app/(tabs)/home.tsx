import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, RefreshControl, Alert, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getUserProfile, getUserPosts, updateUserDisplayName, getPostLikes, getPostComments } from '@/lib/database';
import { Post, User } from '@/lib/supabase';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  
  const { user, signOut } = useAuth();

  const fetchUserData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      // Fetch user profile
      const profile = await getUserProfile(user.id);
      setUserProfile(profile);

      // Fetch user posts
      const posts = await getUserPosts(user.id);
      setUserPosts(posts);
      
      // Fetch like and comment counts for each post
      const likeCounts: { [key: string]: number } = {};
      const commentCounts: { [key: string]: number } = {};
      
      for (const post of posts) {
        const postLikes = await getPostLikes(post.id);
        const postComments = await getPostComments(post.id);
        likeCounts[post.id] = postLikes.length;
        commentCounts[post.id] = postComments.length;
      }
      
      setLikeCounts(likeCounts);
      setCommentCounts(commentCounts);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/login');
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const getUsername = () => {
    if (userProfile?.name) return `@${userProfile.name.toLowerCase().replace(/\s+/g, '')}`;
    if (user?.user_metadata?.username) return `@${user.user_metadata.username}`;
    if (user?.email) return `@${user.email.split('@')[0]}`;
    return '@user';
  };

  const getBio = () => {
    return 'Welcome to MyPosts!';
  };

  const handleEditProfile = () => {
    Alert.prompt(
      'Edit Display Name',
      'Enter your new display name:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async (newName) => {
            if (newName && newName.trim() && user) {
              const success = await updateUserDisplayName(user.id, newName.trim());
              if (success) {
                Alert.alert('Success', 'Display name updated successfully!');
                // Refresh the profile data
                fetchUserData();
              } else {
                Alert.alert('Error', 'Failed to update display name. Please try again.');
              }
            }
          },
        },
      ],
      'plain-text',
      userProfile?.name || ''
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <MaterialIcons name="person-off" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>Please log in</Text>
          <Text style={styles.emptyStateSubtext}>
            You need to be logged in to view your profile
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <MaterialIcons name="logout" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImage}>
              <Text style={styles.profileImageText}>
                {getDisplayName().charAt(0).toUpperCase()}
              </Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <MaterialIcons name="edit" size={16} color="#4DB6AC" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>{getDisplayName()}</Text>
          <Text style={styles.userHandle}>{getUsername()}</Text>
          <Text style={styles.userBio}>{getBio()}</Text>
          
          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <MaterialIcons name="share" size={20} color="#4DB6AC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsSectionHeader}>
            <Text style={styles.postsSectionTitle}>My Posts</Text>
            <TouchableOpacity>
              <MaterialIcons name="grid-view" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {userPosts.length === 0 ? (
            <View style={styles.emptyPosts}>
              <MaterialIcons name="post-add" size={48} color="#ccc" />
              <Text style={styles.emptyPostsText}>No posts yet</Text>
              <Text style={styles.emptyPostsSubtext}>
                Share your first post!
              </Text>
            </View>
          ) : (
            userPosts.map((post) => (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.smallAvatar}>
                    <Text style={styles.smallAvatarText}>
                      {getDisplayName().charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{getDisplayName()}</Text>
                    <Text style={styles.postDate}>{formatDate(post.created_at)}</Text>
                  </View>
                </View>
                <Text style={styles.postText}>{post.content}</Text>
                <View style={styles.postActions}>
                  <View style={styles.actionButton}>
                    <MaterialIcons name="favorite" size={20} color="#e91e63" />
                    <Text style={styles.actionText}>{likeCounts[post.id] || 0}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionButton}>
                    <MaterialIcons name="chat-bubble-outline" size={20} color="#666" />
                    <Text style={styles.actionText}>{commentCounts[post.id] || 0}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton}>
                    <MaterialIcons name="share" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4DB6AC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  profileImageText: {
    fontSize: 40,
    color: 'white',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4DB6AC',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userHandle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  userBio: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editProfileButton: {
    backgroundColor: '#4DB6AC',
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 8,
  },
  editProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  postsSection: {
    padding: 16,
  },
  postsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  postsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  postCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    }),
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  smallAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4DB6AC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  smallAvatarText: {
    fontSize: 18,
    color: 'white',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  emptyPosts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyPostsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 12,
  },
  emptyPostsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
});
