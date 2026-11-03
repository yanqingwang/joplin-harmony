// react-native-safe-area-context's provider is a native Fabric view, so on
// RNOH it never reports insets and its children stay unmounted (blank app).
// Joplin only needs the hooks/context, so answer from the window dimensions.
const React = require('react');
const { Dimensions, StatusBar, View } = require('react-native');

const getFrame = () => {
	const { width, height } = Dimensions.get('window');
	return { x: 0, y: 0, width, height };
};

const getInsets = () => ({ top: StatusBar.currentHeight || 0, right: 0, bottom: 0, left: 0 });

const SafeAreaInsetsContext = React.createContext(getInsets());
const SafeAreaFrameContext = React.createContext(getFrame());

const SafeAreaProvider = ({ children }) => {
	const frame = getFrame();
	const insets = getInsets();
	return React.createElement(SafeAreaFrameContext.Provider, { value: frame },
		React.createElement(SafeAreaInsetsContext.Provider, { value: insets }, children));
};

const useSafeAreaInsets = () => React.useContext(SafeAreaInsetsContext) || getInsets();
const useSafeAreaFrame = () => React.useContext(SafeAreaFrameContext) || getFrame();

const SafeAreaView = ({ style, children, ...rest }) => {
	const insets = useSafeAreaInsets();
	const padding = {
		paddingTop: insets.top,
		paddingRight: insets.right,
		paddingBottom: insets.bottom,
		paddingLeft: insets.left,
	};
	return React.createElement(View, { ...rest, style: [style, padding] }, children);
};

const initialWindowMetrics = { frame: getFrame(), insets: getInsets() };

module.exports = {
	SafeAreaProvider,
	SafeAreaView,
	SafeAreaInsetsContext,
	SafeAreaFrameContext,
	useSafeAreaInsets,
	useSafeAreaFrame,
	initialWindowMetrics,
};
