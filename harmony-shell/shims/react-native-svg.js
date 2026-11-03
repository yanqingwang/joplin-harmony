// HarmonyOS react-native-svg shim. Only the Joplin Cloud logo is drawn with
// SVG, so every primitive collapses into a plain view.
import * as React from 'react';
import { View } from 'react-native';

const placeholder = (name) => {
	const Component = (props) => React.createElement(View, { style: props.style }, props.children);
	Component.displayName = name;
	return Component;
};

export const Svg = placeholder('Svg');
export const G = placeholder('G');
export const Path = placeholder('Path');
export const Defs = placeholder('Defs');
export const LinearGradient = placeholder('LinearGradient');
export const RadialGradient = placeholder('RadialGradient');
export const Stop = placeholder('Stop');
export const ClipPath = placeholder('ClipPath');
export const Rect = placeholder('Rect');
export const Circle = placeholder('Circle');
export const Ellipse = placeholder('Ellipse');
export const Line = placeholder('Line');
export const Polygon = placeholder('Polygon');
export const Polyline = placeholder('Polyline');
export const Text = placeholder('SvgText');
export const TSpan = placeholder('TSpan');
export const Use = placeholder('Use');
export const Symbol = placeholder('Symbol');
export const Mask = placeholder('Mask');
export const Pattern = placeholder('Pattern');

export default Svg;
