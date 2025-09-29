import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface YoutubeLogoProps {
  size?: number;
}

const YoutubeLogo: React.FC<YoutubeLogoProps> = ({ size = 18 }) => {
  // Try to lazy-load react-native-svg. If it's not installed, fall back to a text glyph.
  try {
     
    const SvgMod: any = require('react-native-svg');
    const Svg = SvgMod.Svg || SvgMod.default?.Svg || SvgMod;
    const Rect = SvgMod.Rect || SvgMod.default?.Rect || SvgMod.Rect;
    const Path = SvgMod.Path || SvgMod.default?.Path || SvgMod.Path;
    if (!Svg || !Rect || !Path) throw new Error('svg shapes missing');

    // Render a simple rounded-rectangle YouTube badge with white play triangle
    const width = size * 3; // badge width
    const height = Math.round(size * 1.8);
    const rx = Math.max(4, Math.round(size * 0.3));

    return (
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
        <Rect x={0} y={0} width={width} height={height} rx={rx} fill="#FF0000" />
        {/* triangle centered */}
        <Path d={`M ${width * 0.38} ${height * 0.25} L ${width * 0.68} ${height * 0.5} L ${width * 0.38} ${height * 0.75} Z`} fill="#FFFFFF" />
      </Svg>
    );
  } catch (e) {
    // Fallback: simple red play glyph
    return <Text style={[styles.fallback, { fontSize: size, lineHeight: size }]}>{'▶'}</Text>;
  }
};

export default YoutubeLogo;

const styles = StyleSheet.create({
  fallback: { color: '#FF0000' },
});
