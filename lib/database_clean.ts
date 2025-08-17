import { supabase, Post, User, Like, Comment } from './supabase';

export const createUserProfile = async (userId: string, email: string, name: string): Promise<boolean> => {
  // Check if user profile already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (existingUser) {
    console.log('User profile already exists');
    return true;
  }

  // Create user profile
  const { error } = await supabase
    .from('users')
    .insert([
      {
        id: userId,
        email: email,
        name: name,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error creating user profile:', error);
    return false;
  }

  console.log('User profile created successfully');
  return true;
};

// User Services
export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<boolean> => {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }

  return true;
};

// Post Services
export const getAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      user:users(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user posts:', error);
    return [];
  }

  return data || [];
};

export const createPost = async (userId: string, content: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .insert([
      {
        user_id: userId,
        content,
        created_at: new Date().toISOString(),
      },
    ])
    .select(`
      *,
      user:users(*)
    `)
    .single();

  if (error) {
    console.error('Error creating post:', error);
    return null;
  }

  return data;
};

export const deletePost = async (postId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting post:', error);
    return false;
  }

  return true;
};

// Like Services
export const likePost = async (userId: string, postId: string): Promise<boolean> => {
  // Check if already liked
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  if (existingLike) {
    // Unlike
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', postId);

    return !error;
  } else {
    // Like
    const { error } = await supabase
      .from('likes')
      .insert([{ user_id: userId, post_id: postId }]);

    return !error;
  }
};

export const getPostLikes = async (postId: string): Promise<Like[]> => {
  const { data, error } = await supabase
    .from('likes')
    .select('*')
    .eq('post_id', postId);

  if (error) {
    console.error('Error fetching post likes:', error);
    return [];
  }

  return data || [];
};

export const isPostLikedByUser = async (userId: string, postId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  return !!data && !error;
};

// Comment Services
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(*)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching post comments:', error);
    return [];
  }

  return data || [];
};

export const createComment = async (userId: string, postId: string, content: string): Promise<Comment | null> => {
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        user_id: userId,
        post_id: postId,
        content,
      },
    ])
    .select(`
      *,
      user:users(*)
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    return null;
  }

  return data;
};
