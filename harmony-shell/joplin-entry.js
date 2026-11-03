import { AppRegistry, View, Text } from 'react-native';
import React from 'react';

require('../packages/app-mobile/utils/initReact');
require('./polyfills/intl');
require('../packages/app-mobile/utils/polyfills');



const Root = require('../packages/app-mobile/root').default;

// react-redux 8.1.3 seeds subscription batching with react-native's
// unstable_batchedUpdates, which React Native 0.86 no longer exports, so batch
// ends up undefined and every store notification throws.
require('react-redux');
require('react-redux/lib/utils/batch').setBatch(fn => fn());

class SafeEntry extends React.Component {
	state = { error: null, errorInfo: '' };

	static getDerivedStateFromError(error) {
		return { error, errorInfo: `${error}` };
	}

	componentDidCatch(error, info) {
		console.log('Caught:', error, info?.componentStack);
	}

	render() {
		if (this.state.error) {
			return React.createElement(View,
				{ style: { flex: 1, padding: 20, backgroundColor: '#fff', justifyContent: 'center' } },
				React.createElement(Text, { style: { fontSize: 18, color: '#cc0000', fontWeight: 'bold' } },
					'Joplin Error'),
				React.createElement(Text, { style: { fontSize: 14, color: '#cc0000', marginTop: 10 } },
					this.state.errorInfo),
				React.createElement(Text, { style: { fontSize: 12, color: '#666', marginTop: 10 } },
					this.state.error?.stack || ''),
			);
		}
		return React.createElement(Root);
	}
}

AppRegistry.registerComponent('JoplinHarmony', () => SafeEntry);
