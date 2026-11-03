import { AppRegistry, View, Text } from 'react-native';
import React from 'react';

const TestApp = () => React.createElement(View,
	{ style: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' } },
	React.createElement(Text, { style: { fontSize: 24, color: '#2196F3' } },
		'Joplin Metro Config Test'),
	React.createElement(Text, { style: { fontSize: 14, color: '#666', marginTop: 10 } },
		'If visible, Joplin metro config works.'),
);

AppRegistry.registerComponent('JoplinHarmony', () => TestApp);
