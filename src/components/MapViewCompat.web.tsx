import React from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = undefined;

export function Marker() {
  return null;
}

export function Polyline() {
  return null;
}

const MapView = React.forwardRef<any, any>(({ style }, ref) => (
  <View
    ref={ref}
    style={[
      {
        flex: 1,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
      },
      style,
    ]}
  >
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(59, 130, 246, 0.16)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: '#3b82f6',
          borderWidth: 4,
          borderColor: '#fff',
        }}
      />
    </View>
  </View>
));

MapView.displayName = 'MapViewCompat';

export default MapView;
