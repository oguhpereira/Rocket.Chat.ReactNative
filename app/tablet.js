import React from 'react';
import {
	createStackNavigator, createAppContainer, createSwitchNavigator, createDrawerNavigator, NavigationActions
} from 'react-navigation';
import { Provider } from 'react-redux';
import { useScreens } from 'react-native-screens'; // eslint-disable-line import/no-unresolved
import {
	View, Linking
} from 'react-native';
import PropTypes from 'prop-types';

import { appInit } from './actions';
import { deepLinkingOpen } from './actions/deepLinking';
import Navigation from './lib/Navigation';
import Sidebar from './views/SidebarView';
import parseQuery from './lib/methods/helpers/parseQuery';
import { initializePushNotifications, onNotification } from './notifications/push';
import store from './lib/createStore';
import NotificationBadge from './notifications/inApp';
import { defaultHeader, onNavigationStateChange } from './utils/navigation';
import { loggerConfig, analytics } from './utils/log';
import Toast from './containers/Toast';
import RocketChat from './lib/rocketchat';
import { COLOR_BORDER } from './constants/colors';

useScreens();

const parseDeepLinking = (url) => {
	if (url) {
		url = url.replace(/rocketchat:\/\/|https:\/\/go.rocket.chat\//, '');
		const regex = /^(room|auth)\?/;
		if (url.match(regex)) {
			url = url.replace(regex, '').trim();
			if (url) {
				return parseQuery(url);
			}
		}
	}
	return null;
};

// Outside
const OutsideStack = createStackNavigator({
	OnboardingView: {
		getScreen: () => require('./views/OnboardingView').default,
		header: null
	},
	NewServerView: {
		getScreen: () => require('./views/NewServerView').default
	},
	LoginSignupView: {
		getScreen: () => require('./views/LoginSignupView').default
	},
	LoginView: {
		getScreen: () => require('./views/LoginView').default
	},
	ForgotPasswordView: {
		getScreen: () => require('./views/ForgotPasswordView').default
	},
	RegisterView: {
		getScreen: () => require('./views/RegisterView').default
	},
	LegalView: {
		getScreen: () => require('./views/LegalView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AuthenticationWebViewStack = createStackNavigator({
	AuthenticationWebView: {
		getScreen: () => require('./views/AuthenticationWebView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const OutsideStackModal = createStackNavigator({
	OutsideStack,
	AuthenticationWebViewStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

// Side list
const ListStack = createStackNavigator({
	RoomsListView: {
		getScreen: () => require('./views/RoomsListView').default
	},
	DirectoryView: {
		getScreen: () => require('./views/DirectoryView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	}
}, {
	defaultNavigationOptions: defaultHeader,
	transitionConfig: () => ({
		transitionSpec: {
			duration: 0
		}
	})
});

// Inside
const ChatsStack = createStackNavigator({
	Home: {
		getScreen: () => require('./views/RoomView').default
	},
	RoomView: {
		getScreen: () => require('./views/RoomView').default
	},
	RoomActionsView: {
		getScreen: () => require('./views/RoomActionsView').default
	},
	RoomInfoView: {
		getScreen: () => require('./views/RoomInfoView').default
	},
	RoomInfoEditView: {
		getScreen: () => require('./views/RoomInfoEditView').default
	},
	RoomMembersView: {
		getScreen: () => require('./views/RoomMembersView').default
	},
	SearchMessagesView: {
		getScreen: () => require('./views/SearchMessagesView').default
	},
	SelectedUsersView: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	ThreadMessagesView: {
		getScreen: () => require('./views/ThreadMessagesView').default
	},
	MessagesView: {
		getScreen: () => require('./views/MessagesView').default
	},
	AutoTranslateView: {
		getScreen: () => require('./views/AutoTranslateView').default
	},
	ReadReceiptsView: {
		getScreen: () => require('./views/ReadReceiptView').default
	},
	TableView: {
		getScreen: () => require('./views/TableView').default
	},
	NotificationPrefView: {
		getScreen: () => require('./views/NotificationPreferencesView').default
	}
}, {
	defaultNavigationOptions: defaultHeader,
	transitionConfig: () => ({
		transitionSpec: {
			duration: 0
		}
	})
});

ChatsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ProfileStack = createStackNavigator({
	ProfileView: {
		getScreen: () => require('./views/ProfileView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

ProfileStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const SettingsStack = createStackNavigator({
	SettingsView: {
		getScreen: () => require('./views/SettingsView').default
	},
	LanguageView: {
		getScreen: () => require('./views/LanguageView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const AdminPanelStack = createStackNavigator({
	AdminPanelView: {
		getScreen: () => require('./views/AdminPanelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

SettingsStack.navigationOptions = ({ navigation }) => {
	let drawerLockMode = 'unlocked';
	if (navigation.state.index > 0) {
		drawerLockMode = 'locked-closed';
	}
	return {
		drawerLockMode
	};
};

const ChatsDrawer = createDrawerNavigator({
	ListStack,
	ProfileStack,
	SettingsStack,
	AdminPanelStack
}, {
	contentComponent: Sidebar
});

const NewMessageStack = createStackNavigator({
	NewMessageView: {
		getScreen: () => require('./views/NewMessageView').default
	},
	SelectedUsersViewCreateChannel: {
		getScreen: () => require('./views/SelectedUsersView').default
	},
	CreateChannelView: {
		getScreen: () => require('./views/CreateChannelView').default
	}
}, {
	defaultNavigationOptions: defaultHeader
});

const InsideStackModal = createStackNavigator({
	Main: ChatsStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

const ListStackModal = createStackNavigator({
	Main: ChatsDrawer,
	NewMessageStack
},
{
	mode: 'modal',
	headerMode: 'none'
});

const SetUsernameStack = createStackNavigator({
	SetUsernameView: {
		getScreen: () => require('./views/SetUsernameView').default
	}
});

class CustomInsideStack extends React.Component {
	static router = InsideStackModal.router;

	static propTypes = {
		navigation: PropTypes.object
	}

	render() {
		const { navigation } = this.props;
		return (
			<React.Fragment>
				<InsideStackModal navigation={navigation} />
				<NotificationBadge navigation={navigation} />
				<Toast />
			</React.Fragment>
		);
	}
}

const App = createAppContainer(createSwitchNavigator(
	{
		OutsideStack: OutsideStackModal,
		InsideStack: CustomInsideStack,
		AuthLoading: {
			getScreen: () => require('./views/AuthLoadingView').default
		},
		SetUsernameStack
	},
	{
		initialRouteName: 'AuthLoading'
	}
));

const ListContainer = createAppContainer(ListStackModal);

export class MasterDetailView extends React.Component {
	componentDidMount() {
		const defaultDetailsGetStateForAction = ListContainer.router.getStateForAction;
		const defaultMasterGetStateForAction = App.router.getStateForAction;

		ListContainer.router.getStateForAction = (action, state) => {
			if (action.type === NavigationActions.NAVIGATE) {
				const { routeName, params } = action;
				Navigation.navigate(routeName, params);
				if (routeName === 'RoomView') {
					this.listRef.dispatch(NavigationActions.navigate({ routeName: 'RoomsListView' }));
				}
			}

			return defaultDetailsGetStateForAction(action, state);
		};

		App.router.getStateForAction = (action, state) => defaultMasterGetStateForAction(action, state);
	}

	render() {
		return (
			<View style={{ flex: 1, flexDirection: 'row' }}>
				<View style={{ flex: 4 }}>
					<ListContainer
						ref={(listRef) => {
							this.listRef = listRef;
						}}
					/>
				</View>
				<View style={{ height: '100%', width: 1, backgroundColor: COLOR_BORDER }} />
				<View style={{ flex: 8 }}>
					<App
						ref={(navigatorRef) => {
							Navigation.setTopLevelNavigator(navigatorRef);
						}}
						onNavigationStateChange={onNavigationStateChange}
					/>
				</View>
			</View>
		);
	}
}

export default class Root extends React.Component {
	constructor(props) {
		super(props);
		this.init();
		this.initCrashReport();
	}

	componentDidMount() {
		this.listenerTimeout = setTimeout(() => {
			Linking.addEventListener('url', ({ url }) => {
				const parsedDeepLinkingURL = parseDeepLinking(url);
				if (parsedDeepLinkingURL) {
					store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
				}
			});
		}, 5000);
	}

	componentWillUnmount() {
		clearTimeout(this.listenerTimeout);
	}

	init = async() => {
		const [notification, deepLinking] = await Promise.all([initializePushNotifications(), Linking.getInitialURL()]);
		const parsedDeepLinkingURL = parseDeepLinking(deepLinking);
		if (notification) {
			onNotification(notification);
		} else if (parsedDeepLinkingURL) {
			store.dispatch(deepLinkingOpen(parsedDeepLinkingURL));
		} else {
			store.dispatch(appInit());
		}
	}

	initCrashReport = () => {
		RocketChat.getAllowCrashReport()
			.then((allowCrashReport) => {
				if (!allowCrashReport) {
					loggerConfig.autoNotify = false;
					loggerConfig.registerBeforeSendCallback(() => false);
					analytics().setAnalyticsCollectionEnabled(false);
				}
			});
	}

	render() {
		return (
			<Provider store={store}>
				<MasterDetailView />
			</Provider>
		);
	}
}