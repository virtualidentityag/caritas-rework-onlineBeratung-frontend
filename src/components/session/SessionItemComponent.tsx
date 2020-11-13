import * as React from 'react';
import { useState, useContext, useEffect, useMemo } from 'react';
import {
	typeIsSession,
	typeIsTeamSession,
	typeIsEnquiry,
	getViewPathForType,
	getChatItemForSession,
	getTypeOfLocation,
	isGroupChatForSessionItem,
	scrollToEnd,
	isMyMessage
} from './sessionHelpers';
import { MessageItem } from '../message/MessageItemComponent';
import { MessageSubmitInterfaceComponent } from '../messageSubmitInterface/messageSubmitInterfaceComponent';
import { translate } from '../../resources/scripts/i18n/translate';
import { MessageItemComponent } from '../message/MessageItemComponent';
import { SessionHeaderComponent } from '../sessionHeader/SessionHeaderComponent';
import { Button, BUTTON_TYPES, ButtonItem } from '../button/Button';
import { ajaxCallEnquiryAcceptance } from '../apiWrapper/';
import {
	Overlay,
	OVERLAY_FUNCTIONS,
	OverlayItem,
	OverlayWrapper
} from '../overlay/Overlay';
import { SessionAssign } from '../sessionAssign/SessionAssign';
import {
	SessionsDataContext,
	ActiveSessionGroupIdContext,
	getActiveSession,
	UserDataContext,
	getContact,
	AcceptedGroupIdContext,
	hasUserAuthority,
	AUTHORITIES
} from '../../globalState';
import { Link } from 'react-router-dom';
import './session.styles';
import './session.yellowTheme.styles';

export const SessionItemComponent = (props) => {
	let { sessionsData } = useContext(SessionsDataContext);
	const { activeSessionGroupId } = useContext(ActiveSessionGroupIdContext);
	let activeSession = getActiveSession(activeSessionGroupId, sessionsData);
	const { userData } = useContext(UserDataContext);
	const [monitoringButtonVisible, setMonitoringButtonVisible] = useState(
		false
	);
	const [overlayActive, setOverlayActive] = useState(false);
	const [currentGroupId, setCurrenGroupId] = useState(null);
	const { setAcceptedGroupId } = useContext(AcceptedGroupIdContext);
	const chatItem = getChatItemForSession(activeSession);
	const isGroupChat = isGroupChatForSessionItem(activeSession);
	const messages = useMemo(() => props.messages, [props && props.messages]); // eslint-disable-line react-hooks/exhaustive-deps
	const [isRequestInProgress, setIsRequestInProgress] = useState(false);

	useEffect(() => {
		scrollToEnd(0);
	}, []);

	if (!activeSession) return null;

	const getPlaceholder = () => {
		if (isGroupChat) {
			return translate('enquiry.write.input.placeholder.groupChat');
		} else if (hasUserAuthority(AUTHORITIES.USER_DEFAULT, userData)) {
			return translate('enquiry.write.input.placeholder');
		} else if (
			hasUserAuthority(AUTHORITIES.VIEW_ALL_PEER_SESSIONS, userData) &&
			activeSession.isFeedbackSession
		) {
			return translate('enquiry.write.input.placeholder.feedback.main');
		} else if (
			hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData) &&
			activeSession.isFeedbackSession
		) {
			return translate('enquiry.write.input.placeholder.feedback.peer');
		} else if (hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData)) {
			return translate('enquiry.write.input.placeholder.consultant');
		}
		return translate('enquiry.write.input.placeholder');
	};

	const handleButtonClick = (sessionId: any, sessionGroupId: string) => {
		if (isRequestInProgress) {
			return null;
		}
		setIsRequestInProgress(true);

		ajaxCallEnquiryAcceptance(sessionId)
			.then(() => {
				setOverlayActive(true);
				setCurrenGroupId(sessionGroupId);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const handleOverlayAction = (buttonFunction: string) => {
		setOverlayActive(false);
		setIsRequestInProgress(false);
		setCurrenGroupId('');
		setAcceptedGroupId(currentGroupId);
	};

	const isOnlyEnquiry = typeIsEnquiry(getTypeOfLocation());

	const buttonItem: ButtonItem = {
		label: translate('enquiry.acceptButton'),
		type: BUTTON_TYPES.PRIMARY,
		target: chatItem.groupId
	};

	const getMonitoringLink = () => {
		if (
			typeIsSession(getTypeOfLocation()) &&
			!hasUserAuthority(AUTHORITIES.USER_DEFAULT, userData)
		) {
			return {
				pathname: `/sessions/consultant/${getViewPathForType(
					getTypeOfLocation()
				)}/${chatItem.groupId}/${chatItem.id}/userProfile/monitoring`
			};
		}
		if (
			typeIsTeamSession(getTypeOfLocation()) &&
			!hasUserAuthority(AUTHORITIES.USER_DEFAULT, userData)
		) {
			return {
				pathname: `/sessions/consultant/${getViewPathForType(
					getTypeOfLocation()
				)}/${chatItem.groupId}/${chatItem.id}/userProfile/monitoring`
			};
		}
	};

	return (
		<div
			className={
				activeSession.isFeedbackSession
					? `session session--yellowTheme`
					: `session`
			}
		>
			<SessionHeaderComponent
				consultantAbsent={
					activeSession.consultant && activeSession.consultant.absent
						? activeSession.consultant
						: false
				}
			/>

			<div id="session-scroll-container" className="session__content">
				{messages
					? messages.map((message: MessageItem, index) => (
							<MessageItemComponent
								key={index}
								clientName={getContact(activeSession).username}
								askerRcId={chatItem.askerRcId}
								type={getTypeOfLocation()}
								isOnlyEnquiry={isOnlyEnquiry}
								isMyMessage={isMyMessage(message.userId)}
								{...message}
							/>
					  ))
					: null}
			</div>

			{chatItem.monitoring &&
			!activeSession.isFeedbackSession &&
			!typeIsEnquiry(getTypeOfLocation()) &&
			monitoringButtonVisible &&
			!hasUserAuthority(AUTHORITIES.USER_DEFAULT, userData) &&
			getMonitoringLink() ? (
				<Link to={getMonitoringLink()}>
					<div className="monitoringButton">
						<Button
							item={monitoringButtonItem}
							isLink={true}
							buttonHandle={() => null}
						/>
					</div>
				</Link>
			) : null}

			{typeIsEnquiry(getTypeOfLocation()) ? (
				<div className="session__acceptance messageItem">
					{hasUserAuthority(
						AUTHORITIES.VIEW_ALL_PEER_SESSIONS,
						userData
					) ? (
						<SessionAssign />
					) : (
						<Button
							item={buttonItem}
							buttonHandle={() =>
								handleButtonClick(chatItem.id, chatItem.groupId)
							}
						/>
					)}
				</div>
			) : null}

			{!typeIsEnquiry(getTypeOfLocation()) ||
			(typeIsEnquiry(getTypeOfLocation()) &&
				hasUserAuthority(
					AUTHORITIES.VIEW_ALL_PEER_SESSIONS,
					userData
				)) ? (
				<MessageSubmitInterfaceComponent
					handleSendButton={() => {}}
					isTyping={() => props.isTyping()}
					placeholder={getPlaceholder()}
					showMonitoringButton={() => {
						setMonitoringButtonVisible(true);
						scrollToEnd(0, true);
					}}
					type={getTypeOfLocation()}
					typingUsers={props.typingUsers}
				/>
			) : null}

			{overlayActive ? (
				<OverlayWrapper>
					<Overlay
						item={overlayItem}
						handleOverlay={handleOverlayAction}
					/>
				</OverlayWrapper>
			) : null}
		</div>
	);
};

const overlayItem: OverlayItem = {
	imgSrc: '/../resources/img/illustrations/check.svg',
	headline: translate('session.acceptance.overlayHeadline'),
	buttonSet: [
		{
			label: translate('session.acceptance.buttonLabel'),
			function: OVERLAY_FUNCTIONS.REDIRECT,
			type: BUTTON_TYPES.PRIMARY
		}
	]
};

const monitoringButtonItem: ButtonItem = {
	label: translate('session.monitoring.buttonLabel'),
	type: 'PRIMARY',
	function: ''
};
