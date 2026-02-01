import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const LiveStreamMobile = ({ streamUrl, style }) => {
  if (!streamUrl) {
    return <Text style={styles.loading}>Loading stream...</Text>;
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        source={{ uri: streamUrl }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}     // 🔥 VERY IMPORTANT
      />
    </View>
  );
};

export default LiveStreamMobile;

const styles = StyleSheet.create({
  container: {
    flex: 1,                 // 🔥 REMOVE FIXED HEIGHT
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%'           // 🔥 FULL FILL
  },
  loading: {
    textAlign: 'center',
    marginTop: 20
  }
});
