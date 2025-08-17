import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { getAllPosts, likePost, isPostLikedByUser, getPostComments, createComment, getPostLikes } from '@/lib/database';
import { Post, Comment } from '@/lib/supabase';

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentCounts, setCommentCounts] = useState<{ [key: string]: number }>({});
  
  const { user } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    const fetchedPosts = await getAllPosts();
    setPosts(fetchedPosts);
    
    // Check which posts are liked by current user and get comment counts
    if (user) {
      const likedStatus: { [key: string]: boolean } = {};
      const commentCounts: { [key: string]: number } = {};
      const likeCounts: { [key: string]: number } = {};
      
      for (const post of fetchedPosts) {
        const isLiked = await isPostLikedByUser(user.id, post.id);
        likedStatus[post.id] = isLiked;
        
        const postComments = await getPostComments(post.id);
        commentCounts[post.id] = postComments.length;
        
        const postLikes = await getPostLikes(post.id);
        likeCounts[post.id] = postLikes.length;
      }
      setLikedPosts(likedStatus);
      setCommentCounts(commentCounts);
      setLikeCounts(likeCounts);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;

    const success = await likePost(user.id, postId);
    if (success) {
      // Update local state optimistically
      setLikedPosts(prev => ({
        ...prev,
        [postId]: !prev[postId]
      }));
      
      // Update like counts
      setLikeCounts(prev => ({
        ...prev,
        [postId]: likedPosts[postId] 
          ? (prev[postId] || 0) - 1 
          : (prev[postId] || 0) + 1
      }));
    }
  };

  const handleComment = async (postId: string) => {
    setSelectedPostId(postId);
    const postComments = await getPostComments(postId);
    setComments(postComments);
    setShowCommentsModal(true);
  };

  const handleAddComment = async () => {
    if (!user || !newComment.trim()) return;

    const success = await createComment(user.id, selectedPostId, newComment.trim());
    if (success) {
      // Refresh comments
      const postComments = await getPostComments(selectedPostId);
      setComments(postComments);
      setNewComment('');
      
      // Update comment count
      setCommentCounts(prev => ({
        ...prev,
        [selectedPostId]: postComments.length
      }));
    } else {
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Feed</Text>
        <TouchableOpacity onPress={onRefresh}>
          <MaterialIcons name="refresh" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {posts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="post-add" size={64} color="#ccc" />
          <Text style={styles.emptyStateText}>No posts yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Be the first to share something!
          </Text>
        </View>
      ) : (
        posts.map((post) => (
          <View key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {post.user?.name?.charAt(0) || post.user?.email?.charAt(0) || '?'}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {post.user?.name || post.user?.email?.split('@')[0] || 'Unknown User'}
                </Text>
                <Text style={styles.postDate}>
                  {formatDate(post.created_at)}
                </Text>
              </View>
              {user?.id === post.user_id && (
                <TouchableOpacity>
                  <Text style={styles.closeButton}>⋮</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={styles.postText}>{post.content}</Text>
            
            {/* Remove image section since we don't have image_url in our simplified schema */}
            
            <View style={styles.postActions}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleLike(post.id)}
              >
                <MaterialIcons 
                  name={likedPosts[post.id] ? "favorite" : "favorite-border"} 
                  size={20} 
                  color={likedPosts[post.id] ? "#e91e63" : "#666"} 
                />
                <Text style={styles.actionText}>{likeCounts[post.id] || 0}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleComment(post.id)}
              >
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
      </ScrollView>

      {/* Comments Modal */}
      <Modal
      visible={showCommentsModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Comments</Text>
          <TouchableOpacity onPress={() => setShowCommentsModal(false)}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.commentsContainer}>
          {comments.length === 0 ? (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>No comments yet</Text>
              <Text style={styles.noCommentsSubtext}>Be the first to comment!</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarText}>
                    {comment.user?.name?.charAt(0) || comment.user?.email?.charAt(0) || '?'}
                  </Text>
                </View>
                <View style={styles.commentContent}>
                  <Text style={styles.commentUserName}>
                    {comment.user?.name || comment.user?.email?.split('@')[0] || 'Unknown User'}
                  </Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentDate}>
                    {formatDate(comment.created_at)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </ScrollView>
        
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.commentButton, { opacity: newComment.trim() ? 1 : 0.5 }]}
            onPress={handleAddComment}
            disabled={!newComment.trim()}
          >
            <MaterialIcons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
        </View>
      </Modal>
    </>
  );
}const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
  postCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    }),
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4DB6AC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  postDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    fontSize: 20,
    color: '#999',
  },
  postText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
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
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  commentsContainer: {
    flex: 1,
    padding: 16,
  },
  noCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4DB6AC',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  commentContent: {
    flex: 1,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 14,
  },
  commentButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4DB6AC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
