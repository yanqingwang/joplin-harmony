import { AppRegistry, View, Text } from 'react-native';
import React from 'react';

let statusMsg = 'Starting...';
let errorMsg = '';
let errorStack = '';

try {
	statusMsg = 'Importing polyfills/intl...';
	require('./polyfills/intl');
	statusMsg = 'Importing initReact...';
	require('../packages/app-mobile/utils/initReact');
	statusMsg = 'Importing polyfills...';
	require('../packages/app-mobile/utils/polyfills');
	statusMsg = 'Importing react-redux...';
	require('react-redux');
	statusMsg = 'Importing react-redux/batch...';
	require('react-redux/lib/utils/batch').setBatch(fn => fn());
	statusMsg = 'Importing root...';
	const rootModule = require('../packages/app-mobile/root');
	statusMsg = 'All imports OK';
} catch (error) {
	errorMsg = `${error}`;
	errorStack = error && error.stack ? error.stack : '';
}

const TestApp = () => {
	if (errorMsg) {
		return React.createElement(View,
			{ style: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' } },
			React.createElement(Text, { style: { fontSize: 18, color: '#cc0000', fontWeight: 'bold' } },
				`Import Error at: ${statusMsg}`),
			React.createElement(Text, { style: { fontSize: 14, color: '#cc0000', marginTop: 10 } },
				errorMsg),
			React.createElement(Text, { style: { fontSize: 12, color: '#666', marginTop: 10 } },
				errorStack),
		);
	}
	return React.createElement(View,
		{ style: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' } },
		React.createElement(Text, { style: { fontSize: 24, color: '#2196F3' } },
			`Status: ${statusMsg}`),
	);
};

AppRegistry.registerComponent('JoplinHarmony', () => TestApp);