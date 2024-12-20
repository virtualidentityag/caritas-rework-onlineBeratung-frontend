import { UserDataInterface } from '../interfaces/UserDataInterface';
import {
	GroupChatItemInterface,
	ListItemInterface,
	SESSION_DATA_KEY_ENQUIRIES,
	SESSION_DATA_KEY_MY_SESSIONS,
	SessionItemInterface,
	STATUS_ARCHIVED,
	STATUS_EMPTY,
	STATUS_ENQUIRY,
	TopicSessionInterface
} from '../interfaces/SessionsDataInterface';
import {
	CHAT_TYPE_GROUP_CHAT,
	CHAT_TYPE_SINGLE_CHAT,
	getChatItemForSession,
	getChatTypeForListItem,
	SESSION_LIST_TYPES
} from '../../components/session/sessionHelpers';

export type ExtendedSessionInterface = Omit<
	ListItemInterface,
	'session' | 'chat'
> & {
	item?: Partial<Omit<SessionItemInterface, 'topic'>> &
		Partial<Omit<GroupChatItemInterface, 'topic'>> & {
			topic: string | TopicSessionInterface;
		};
	rid: string;
	type: typeof CHAT_TYPE_GROUP_CHAT | typeof CHAT_TYPE_SINGLE_CHAT;
	isGroup?: boolean;
	isSession?: boolean;
	isEnquiry?: boolean;
	isEmptyEnquiry?: boolean;
	isNonEmptyEnquiry?: boolean;
	isArchive?: boolean;
};

export const buildExtendedSession = (
	session: ListItemInterface,
	sessionGroupId?: string
): ExtendedSessionInterface => {
	const { chat: groupChat, session: sessionChat, ...sessionProps } = session;
	let rid = sessionChat?.groupId ?? null;

	if (groupChat) {
		rid = groupChat.groupId;
	}
	return {
		...sessionProps,
		item: groupChat ?? sessionChat,
		type: groupChat ? CHAT_TYPE_GROUP_CHAT : CHAT_TYPE_SINGLE_CHAT,
		isGroup: !!groupChat,
		isSession: !!sessionChat,
		isEnquiry:
			sessionChat &&
			[STATUS_EMPTY, STATUS_ENQUIRY].includes(sessionChat.status),
		isEmptyEnquiry: sessionChat && sessionChat.status === STATUS_EMPTY,
		isNonEmptyEnquiry: sessionChat && sessionChat.status === STATUS_ENQUIRY,
		isArchive: sessionChat && sessionChat.status === STATUS_ARCHIVED,
		rid
	};
};

export const getExtendedSession = (
	sessionGroupId?: string,
	sessions?: ListItemInterface[]
): ExtendedSessionInterface | null => {
	if (!sessions || !sessionGroupId) {
		return null;
	}

	const session: ListItemInterface = sessions.find((sessionItem) => {
		const chatItem = getChatItemForSession(sessionItem);
		return (
			(chatItem.groupId && chatItem.groupId === sessionGroupId) ||
			chatItem?.id?.toString() === sessionGroupId
		);
	});

	// Extend the ActiveSessionType
	if (!session) {
		return null;
	}

	return buildExtendedSession(session, sessionGroupId);
};

export const getContact = (activeSession: ListItemInterface): any => {
	if (activeSession?.user) {
		return activeSession.user;
	}

	if (activeSession?.consultant) {
		return activeSession.consultant;
	}

	return null;
};

export const getSessionsDataKeyForSessionType = (sessionType) => {
	switch (sessionType) {
		case SESSION_LIST_TYPES.ENQUIRY:
			return SESSION_DATA_KEY_ENQUIRIES;
		case SESSION_LIST_TYPES.MY_SESSION:
			return SESSION_DATA_KEY_MY_SESSIONS;
		default:
			return SESSION_DATA_KEY_MY_SESSIONS;
	}
};

export const getUnreadMyMessages: Function = (sessionsData): number => {
	if (sessionsData.mySessions) {
		/* eslint-disable */
		const unreadCount = sessionsData.mySessions.filter((session) => {
			const chatType = getChatTypeForListItem(session);
			return !session[chatType].messagesRead;
		});
		/* eslint-enable */
		return unreadCount.length;
	} else {
		return 0;
	}
};

export const hasUserAuthority = (
	authority: string,
	userData: UserDataInterface
): boolean => userData?.grantedAuthorities?.includes(authority);

export const AUTHORITIES = {
	ASSIGN_CONSULTANT_TO_ENQUIRY: 'AUTHORIZATION_ASSIGN_CONSULTANT_TO_ENQUIRY',
	ASSIGN_CONSULTANT_TO_SESSION: 'AUTHORIZATION_ASSIGN_CONSULTANT_TO_SESSION',
	CONSULTANT_DEFAULT: 'AUTHORIZATION_CONSULTANT_DEFAULT',
	CREATE_NEW_CHAT: 'AUTHORIZATION_CREATE_NEW_CHAT',
	ASKER_DEFAULT: 'AUTHORIZATION_USER_DEFAULT',
	VIEW_AGENCY_CONSULTANTS: 'AUTHORIZATION_VIEW_AGENCY_CONSULTANTS'
};
