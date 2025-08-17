import { Image } from 'expo-image';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function LoginScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Remove ALL email validation - let Supabase handle it
    console.log('Attempting signin with:', { email: `"${email}"`, password: '***' });

    setLoading(true);
    try {
      const { data, error } = await signIn(email.trim(), password);
      setLoading(false);

      if (error) {
        // Handle different types of authentication errors
        let errorMessage = 'An error occurred during sign in';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (error.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else {
          errorMessage = error.message || 'Failed to sign in';
        }
        
        Alert.alert('Sign In Failed', errorMessage);
      } else if (data?.user) {
        // Navigate to feed page after successful sign in
        router.replace('/feed');
      }
    } catch (err) {
      setLoading(false);
      console.error('Sign in error:', err);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !username || !fullName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Remove ALL email validation - let Supabase handle it
    console.log('Attempting signup with:', { 
      email: `"${email}"`, 
      emailLength: email.length,
      password: '***', 
      username, 
      fullName 
    });

    setLoading(true);
    try {
      const { data, error } = await signUp(email.trim(), password, username.trim(), fullName.trim());
      setLoading(false);

      console.log('Signup response:', { data, error });

      if (error) {
        // Handle different types of signup errors
        let errorMessage = 'An error occurred during sign up';
        
        console.log('Full signup error:', error);
        
        if (error.message.includes('already registered') || error.message.includes('User already registered')) {
          errorMessage = 'An account with this email already exists. Please try signing in instead.';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('signup is disabled')) {
          errorMessage = 'Account registration is currently disabled.';
        } else if (error.message.includes('Database error') || error.message.includes('relation') || error.message.includes('does not exist')) {
          errorMessage = 'Database setup incomplete. Please contact support.';
        } else {
          // Show the actual error message for debugging
          errorMessage = `Signup failed: ${error.message}`;
        }
        
        Alert.alert('Sign Up Failed', errorMessage);
      } else if (data?.user) {
        // Clear form fields
        setEmail('');
        setPassword('');
        setUsername('');
        setFullName('');
        
        // Show success message and switch to sign in
        Alert.alert(
          'Success', 
          'Account created successfully! Please sign in with your credentials.',
          [
            {
              text: 'OK',
              onPress: () => {
                setIsSignUp(false); // Switch to sign in form
              }
            }
          ]
        );
      }
    } catch (err) {
      setLoading(false);
      console.error('Sign up error:', err);
      Alert.alert('Error', 'Network error. Please check your connection and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          {isSignUp ? 'Create Account!' : 'Welcome!'}
        </Text>
      </View>
      
      <View style={styles.formContainer}>
        {isSignUp && (
          <>
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={24} color="#4DB6AC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="alternate-email" size={24} color="#4DB6AC" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </>
        )}
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={24} color="#4DB6AC" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          {email ? (
            <MaterialIcons name="check-circle" size={24} color="#4DB6AC" style={styles.checkIcon} />
          ) : null}
        </View>
        
        <View style={styles.inputContainer}>
          <MaterialIcons name="lock" size={24} color="#4DB6AC" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {password ? (
            <MaterialIcons name="info" size={24} color="#4DB6AC" style={styles.checkIcon} />
          ) : null}
        </View>
        
        {!isSignUp && (
          <TouchableOpacity style={styles.forgotPasswordContainer}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.signInButton, loading && styles.disabledButton]} 
          onPress={isSignUp ? handleSignUp : handleSignIn}
          disabled={loading}
        >
          <Text style={styles.signInButtonText}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => setIsSignUp(!isSignUp)}
        >
          <Text style={styles.signUpButtonText}>
            {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'left',
  },
  formContainer: {
    paddingHorizontal: 24,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
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
    borderBottomWidth: 2,
    borderBottomColor: '#e0e0e0',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  checkIcon: {
    marginLeft: 12,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-start',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#4DB6AC',
    fontSize: 16,
    fontWeight: '500',
  },
  signInButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    } : {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: '#4DB6AC',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  signUpButtonText: {
    color: '#4DB6AC',
    fontSize: 18,
    fontWeight: '600',
  },
});
