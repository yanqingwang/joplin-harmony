import * as React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

function App(): React.JSX.Element {
	const [runtime, setRuntime] = React.useState('booting');

	React.useEffect(() => {
		setRuntime('React Native running on HarmonyOS');
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
			<Text style={styles.logo}>Joplin</Text>
			<Text style={styles.subtitle}>HarmonyOS port · RNOH 0.86.1</Text>
			<View style={styles.chip}>
				<Text style={styles.chipText}>{runtime}</Text>
			</View>
			<Text style={styles.hint}>P0 shell — proves the RNOH toolchain end to end.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#ffffff',
		paddingHorizontal: 24,
	},
	logo: {
		fontSize: 48,
		fontWeight: '700',
		color: '#0b3d91',
	},
	subtitle: {
		marginTop: 8,
		fontSize: 16,
		color: '#555555',
	},
	chip: {
		marginTop: 24,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: '#e8f0fe',
	},
	chipText: {
		fontSize: 14,
		color: '#0b3d91',
	},
	hint: {
		marginTop: 16,
		fontSize: 12,
		color: '#888888',
		textAlign: 'center',
	},
});

export default App;
