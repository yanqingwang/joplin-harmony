// HarmonyOS vector-icons shim. Icon fonts need a native glyph loader that does
// not exist on RNOH, so icons render as a dot of the requested size and colour.
// The layout stays intact and the UI remains usable.
import * as React from 'react';
import { Text, View } from 'react-native';

const createIconComponent = (displayName) => {
	const Icon = (props) => {
		const size = props.size ?? 16;
		const color = props.color ?? '#000000';
		return React.createElement(
			View,
			{ style: props.style, accessibilityLabel: props.accessibilityLabel },
			React.createElement(Text, { style: { fontSize: size, lineHeight: size, color } }, '•'),
		);
	};
	Icon.displayName = displayName;
	return Icon;
};

export const FontAwesome5 = createIconComponent('FontAwesome5');
export const MaterialDesignIcons = createIconComponent('MaterialDesignIcons');
export const Ionicons = createIconComponent('Ionicons');
export const MaterialIcons = createIconComponent('MaterialIcons');

export const createIconSet = () => createIconComponent('IconSet');
export const createIconSetFromFontello = () => createIconComponent('IconSet');
export const getImageSource = async () => null;
export const getImageSourceSync = () => null;

export default FontAwesome5;
