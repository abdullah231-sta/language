// Test script to manually trigger voice activity indicators
// This can be used to test if the voice indicators work for all users

const testVoiceActivity = () => {
  console.log('Testing voice activity indicators...');
  
  // You can use this in the browser console when multiple users are connected
  // to manually add/remove users from the speaking list for testing
  
  // Example: Add a user to speaking list
  const addSpeakingUser = (userId) => {
    console.log(`Adding user ${userId} to speaking list`);
    // This would be called by the VoiceContext speaking detection callback
    // when real voice activity is detected
  };
  
  // Example: Remove a user from speaking list
  const removeSpeakingUser = (userId) => {
    console.log(`Removing user ${userId} from speaking list`);
  };
  
  console.log('Voice activity test functions available:');
  console.log('- addSpeakingUser(userId)');
  console.log('- removeSpeakingUser(userId)');
  
  return { addSpeakingUser, removeSpeakingUser };
};

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.testVoiceActivity = testVoiceActivity;
}

module.exports = { testVoiceActivity };