import { AppRegistry, View, Text } from 'react-native';
import React from 'react';

const HelloApp = () => React.createElement(
	View,
	{ style: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' } },
	React.createElement(Text, { style: { fontSize: 24, color: '#2196F3' } },
		'Joplin HarmonyOS - Hello World'),
	React.createElement(Text, { style: { fontSize: 14, color: '#666', marginTop: 10 } },
		'If you can see this, RNOH rendering works.'),
);

AppRegistry.registerComponent('JoplinHarmony', () => HelloApp);
