import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { getSessionsListItemIcon, LIST_ICONS } from './sessionsListItemHelpers';
import {
	convertISO8601ToMSSinceEpoch,
	getPrettyDateFromMessageDate,
	MILLISECONDS_PER_SECOND
} from '../../utils/dateHelpers';
import { SESSION_LIST_TAB } from '../session/sessionHelpers';
import {
	AUTHORITIES,
	E2EEContext,
	hasUserAuthority,
	SessionTypeContext,
	useConsultingType,
	UserDataContext,
	useTenant,
	ActiveSessionContext,
	useTopic
} from '../../globalState';
import { TopicSessionInterface } from '../../globalState/interfaces';
import { getGroupChatDate } from '../session/sessionDateHelpers';
import { markdownToDraft } from 'markdown-draft-js';
import { convertFromRaw } from 'draft-js';
import './sessionsListItem.styles';
import { Tag } from '../tag/Tag';
import { SessionListItemVideoCall } from './SessionListItemVideoCall';
import { SessionListItemAttachment } from './SessionListItemAttachment';
import clsx from 'clsx';
import {
	decryptText,
	MissingKeyError,
	WrongKeyError
} from '../../utils/encryptionHelpers';
import { useE2EE } from '../../hooks/useE2EE';
import { useSearchParam } from '../../hooks/useSearchParams';
import { SessionListItemLastMessage } from './SessionListItemLastMessage';
import { ALIAS_MESSAGE_TYPES } from '../../api/apiSendAliasMessage';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '../../hooks/useAppConfig';

interface SessionListItemProps {
	defaultLanguage: string;
	itemRef?: any;
	handleKeyDownLisItemContent?: Function;
	index: number;
}

export const SessionListItemComponent = ({
	defaultLanguage,
	itemRef,
	handleKeyDownLisItemContent,
	index
}: SessionListItemProps) => {
	const { t: translate } = useTranslation(['common']);
	const tenantData = useTenant();
	const settings = useAppConfig();
	const { sessionId, rcGroupId: groupIdFromParam } = useParams<{
		rcGroupId: string;
		sessionId: string;
	}>();
	const sessionIdFromParam = sessionId ? parseInt(sessionId) : null;
	const history = useHistory();

	const sessionListTab = useSearchParam<SESSION_LIST_TAB>('sessionListTab');
	const getSessionListTab = () =>
		`${sessionListTab ? `?sessionListTab=${sessionListTab}` : ''}`;
	const { userData } = useContext(UserDataContext);
	const { path: listPath } = useContext(SessionTypeContext);
	const { isE2eeEnabled } = useContext(E2EEContext);
	const { activeSession } = useContext(ActiveSessionContext);

	// Is List Item active
	const isChatActive =
		activeSession.rid === groupIdFromParam ||
		activeSession.item.id === sessionIdFromParam;

	const language = activeSession.item.language || defaultLanguage;
	const consultingType = useConsultingType(activeSession.item.consultingType);
	const topic = useTopic(
		(activeSession.item.topic as TopicSessionInterface).id
	);

	const { key, keyID, encrypted, ready } = useE2EE(
		activeSession.item.groupId,
		activeSession.item.lastMessageType ===
			ALIAS_MESSAGE_TYPES.MASTER_KEY_LOST
	);
	const [plainTextLastMessage, setPlainTextLastMessage] = useState(null);

	const { autoSelectPostcode } =
		consultingType?.registration ||
		settings.registration.consultingTypeDefaults;

	useEffect(() => {
		if (!ready) {
			return;
		}

		if (isE2eeEnabled) {
			if (!activeSession.item.e2eLastMessage) return;
			decryptText(
				activeSession.item.e2eLastMessage.msg,
				keyID,
				key,
				encrypted,
				activeSession.item.e2eLastMessage.t === 'e2e'
			)
				.catch((e): string =>
					translate(
						e instanceof MissingKeyError ||
							e instanceof WrongKeyError
							? e.message
							: 'e2ee.message.encryption.error'
					)
				)
				.then((message) => {
					const rawMessageObject = markdownToDraft(message);
					const contentStateMessage =
						convertFromRaw(rawMessageObject);
					setPlainTextLastMessage(contentStateMessage.getPlainText());
				});
		} else {
			if (
				activeSession.item.e2eLastMessage &&
				activeSession.item.e2eLastMessage.t === 'e2e'
			) {
				setPlainTextLastMessage(
					translate('e2ee.message.encryption.text')
				);
			} else {
				const rawMessageObject = markdownToDraft(
					activeSession.item.lastMessage
				);
				const contentStateMessage = convertFromRaw(rawMessageObject);
				setPlainTextLastMessage(contentStateMessage.getPlainText());
			}
		}
	}, [
		isE2eeEnabled,
		key,
		keyID,
		encrypted,
		activeSession.item.groupId,
		activeSession.item.e2eLastMessage,
		activeSession.item.lastMessage,
		translate,
		ready
	]);

	const isAsker = hasUserAuthority(AUTHORITIES.ASKER_DEFAULT, userData);

	if (!activeSession) {
		return null;
	}

	const handleOnClick = () => {
		if (activeSession.item.groupId && activeSession.item.id !== undefined) {
			history.push(
				`${listPath}/${activeSession.item.groupId}/${
					activeSession.item.id
				}${getSessionListTab()}`
			);
		} else if (
			hasUserAuthority(AUTHORITIES.ASKER_DEFAULT, userData) &&
			activeSession.isEmptyEnquiry
		) {
			history.push(`/sessions/user/view/write/${activeSession.item.id}`);
		}
	};

	const handleKeyDownListItem = (e) => {
		handleKeyDownLisItemContent(e);
		if (e.key === 'Enter' || e.key === ' ') {
			handleOnClick();
		}
	};

	const iconVariant = () => {
		if (activeSession.isGroup) {
			return {
				variant: LIST_ICONS.IS_GROUP_CHAT,
				title: translate('message.groupChat')
			};
		} else if (activeSession.isEmptyEnquiry) {
			return {
				variant: LIST_ICONS.IS_NEW_ENQUIRY,
				title: translate('message.newEnquiry')
			};
		} else if (activeSession.item.messagesRead) {
			return {
				variant: LIST_ICONS.IS_READ,
				title: translate('message.read')
			};
		} else {
			return {
				variant: LIST_ICONS.IS_UNREAD,
				title: translate('message.unread')
			};
		}
	};

	const Icon = getSessionsListItemIcon(iconVariant().variant);
	const iconTitle = iconVariant().title;

	const prettyPrintDate = (
		messageDate: number, // seconds since epoch
		createDate: string // ISO8601 string
	) => {
		const newestDate = Math.max(
			messageDate * MILLISECONDS_PER_SECOND,
			convertISO8601ToMSSinceEpoch(createDate)
		);

		const prettyDate = getPrettyDateFromMessageDate(
			newestDate / MILLISECONDS_PER_SECOND
		);

		return prettyDate.str ? translate(prettyDate.str) : prettyDate.date;
	};

	// Hide sessions if consultingType has been switched to group chat.
	// ToDo: What is with vice versa?
	if (activeSession.isSession && consultingType?.groupChat.isGroupChat) {
		return null;
	}

	if (activeSession.isGroup) {
		const isMyChat = () =>
			activeSession.consultant &&
			userData.userId === activeSession.consultant.id;
		const defaultSubjectText = isMyChat()
			? translate('groupChat.listItem.subjectEmpty.self')
			: translate('groupChat.listItem.subjectEmpty.other');
		return (
			<div
				onClick={handleOnClick}
				className={clsx(
					'sessionsListItem',
					isChatActive && 'sessionsListItem--active'
				)}
				data-group-id={activeSession.rid ? activeSession.rid : ''}
				data-cy="session-list-item"
			>
				<div
					className={clsx(
						'sessionsListItem__content',
						isChatActive && 'sessionsListItem__content--active'
					)}
					onKeyDown={(e) => handleKeyDownListItem(e)}
					ref={itemRef}
					tabIndex={index === 0 ? 0 : -1}
					role="tab"
				>
					<div className="sessionsListItem__row">
						<div className="sessionsListItem__consultingType">
							{topic?.name || ''}
						</div>
						<div className="sessionsListItem__date">
							{getGroupChatDate(
								activeSession.item,
								translate('sessionList.time.label.postfix')
							)}
						</div>
					</div>
					<div className="sessionsListItem__row">
						<div className="sessionsListItem__icon">
							<Icon title={iconTitle} aria-label={iconTitle} />
						</div>
						<div
							className={clsx(
								'sessionsListItem__username',
								activeSession.item.messagesRead &&
									'sessionsListItem__username--readLabel'
							)}
						>
							{activeSession.item.topic}
						</div>
					</div>
					<div className="sessionsListItem__row">
						<SessionListItemLastMessage
							lastMessage={
								plainTextLastMessage
									? plainTextLastMessage
									: defaultSubjectText
							}
						/>
						{activeSession.item.attachment && (
							<SessionListItemAttachment
								attachment={activeSession.item.attachment}
							/>
						)}
						{activeSession.item.active && (
							<Tag
								text={translate(
									'groupChat.listItem.activeLabel'
								)}
								color="green"
							/>
						)}
					</div>
				</div>
			</div>
		);
	}

	const hasConsultantData = !!activeSession.consultant;
	let sessionTopic = '';

	if (isAsker) {
		if (hasConsultantData) {
			sessionTopic =
				activeSession.consultant.displayName ||
				activeSession.consultant.username;
		} else if (activeSession.isEmptyEnquiry) {
			sessionTopic = translate('sessionList.user.writeEnquiry');
		} else {
			sessionTopic = translate('sessionList.user.consultantUnknown');
		}
	} else {
		sessionTopic = activeSession.user.username;
	}

	return (
		<div
			onClick={handleOnClick}
			className={clsx(
				`sessionsListItem`,
				isChatActive && `sessionsListItem--active`
			)}
			data-group-id={activeSession.item.groupId}
			data-cy="session-list-item"
		>
			<div
				className="sessionsListItem__content"
				onKeyDown={(e) => handleKeyDownListItem(e)}
				ref={itemRef}
				tabIndex={index === 0 ? 0 : -1}
				role="tab"
			>
				<div className="sessionsListItem__row">
					<div className="sessionsListItem__consultingType">
						{!isAsker && !autoSelectPostcode
							? activeSession.item.postcode
							: null}
					</div>
					{topic?.name && (
						<div
							className="sessionsListItem__topic"
							style={{
								backgroundColor:
									tenantData?.theming?.primaryColor
							}}
						>
							{topic.name}
						</div>
					)}
					<div className="sessionsListItem__date">
						{prettyPrintDate(
							activeSession.item.messageDate,
							activeSession.item.createDate
						)}
					</div>
				</div>
				<div className="sessionsListItem__row">
					<div className="sessionsListItem__icon">
						<Icon title={iconTitle} aria-label={iconTitle} />
					</div>
					<div
						className={clsx(
							'sessionsListItem__username',
							activeSession.item.messagesRead &&
								'sessionsListItem__username--readLabel'
						)}
					>
						{sessionTopic}
					</div>
				</div>
				<div className="sessionsListItem__row">
					<SessionListItemLastMessage
						lastMessage={plainTextLastMessage}
						lastMessageType={activeSession.item.lastMessageType}
						language={language}
						showLanguage={
							language &&
							activeSession.isEnquiry &&
							!activeSession.isEmptyEnquiry
						}
						showSpan={activeSession.isEmptyEnquiry}
					/>
					{activeSession.item.attachment && (
						<SessionListItemAttachment
							attachment={activeSession.item.attachment}
						/>
					)}
					{activeSession.item.videoCallMessageDTO && (
						<SessionListItemVideoCall
							videoCallMessage={
								activeSession.item.videoCallMessageDTO
							}
							listItemUsername={
								activeSession.user?.username ||
								activeSession.consultant?.username
							}
							listItemAskerRcId={activeSession.item.askerRcId}
						/>
					)}
				</div>
			</div>
		</div>
	);
};
