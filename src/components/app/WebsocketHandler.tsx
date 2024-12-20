import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Stomp } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { endpoints } from '../../resources/scripts/endpoints';
import { getValueFromCookie } from '../sessionCookie/accessSessionCookie';
import {
	NOTIFICATION_TYPE_CALL,
	VideoCallRequestProps
} from '../incomingVideoCall/IncomingVideoCall';
import {
	NotificationsContext,
	WebsocketConnectionDeactivatedContext
} from '../../globalState';
import {
	isBrowserNotificationTypeEnabled,
	sendNotification
} from '../../utils/notificationHelpers';
import { useTranslation } from 'react-i18next';
import { useAppConfig } from '../../hooks/useAppConfig';

interface WebsocketHandlerProps {
	disconnect: boolean;
}

export const WebsocketHandler = ({ disconnect }: WebsocketHandlerProps) => {
	const { t: translate } = useTranslation();
	const history = useHistory();
	const { releaseToggles } = useAppConfig();
	const [newStompDirectMessage, setNewStompDirectMessage] =
		useState<boolean>(false);
	const [newStompVideoCallRequest, setNewStompVideoCallRequest] =
		useState<VideoCallRequestProps>();
	const { addNotification } = useContext(NotificationsContext);
	const { setWebsocketConnectionDeactivated } = useContext(
		WebsocketConnectionDeactivatedContext
	);

	const stompClient = Stomp.over(function () {
		return new SockJS(endpoints.liveservice);
	});

	let reconnectAttemptCount = 0;
	const RECONNECT_ATTEMPT_LIMIT = 2;
	const RECONNECT_DELAY = 5000;

	// DEV-NOTE: comment next line to activate debug mode (stomp logging) for development
	stompClient.debug = () => {};

	useEffect(() => {
		stompClient.beforeConnect = () => {
			stompClient.connectHeaders = {
				accessToken: getValueFromCookie('keycloak')
			};
			reconnectAttemptCount++;

			if (reconnectAttemptCount >= RECONNECT_ATTEMPT_LIMIT) {
				stompClient.deactivate();
				setWebsocketConnectionDeactivated(true);
			}
		};

		stompClient.onConnect = () => {};

		stompConnect();

		stompClient.onWebSocketClose = (message) => {
			console.log('Closed', message);
		};

		stompClient.onWebSocketError = (error) => {
			console.log('Error', error);
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (disconnect) {
			stompClient?.disconnect();
		}
	}, [stompClient, disconnect]);

	useEffect(() => {
		if (newStompDirectMessage) {
			setNewStompDirectMessage(false);

			if (
				!releaseToggles.enableNewNotifications ||
				isBrowserNotificationTypeEnabled('newMessage')
			) {
				sendNotification(translate('notifications.message.new'), {
					onclick: () => {
						history.push(`/sessions/consultant/sessionView`);
					}
				});
			}
		}
	}, [newStompDirectMessage]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (newStompVideoCallRequest) {
			addNotification({
				id: newStompVideoCallRequest.rcGroupId,
				notificationType: NOTIFICATION_TYPE_CALL,
				videoCall: newStompVideoCallRequest
			});
		}
	}, [newStompVideoCallRequest]); // eslint-disable-line react-hooks/exhaustive-deps

	const stompConnect = () => {
		stompClient.reconnect_delay = RECONNECT_DELAY;
		stompClient.connect({}, (frame) => {
			reconnectAttemptCount = 0;
			stompClient.subscribe('/user/events', function (message) {
				const stompMessageBody = JSON.parse(message.body);
				const stompEventType: LiveService.Schemas.EventType =
					stompMessageBody['eventType'];
				if (stompEventType === 'directMessage') {
					setNewStompDirectMessage(true);
				} else if (stompEventType === 'videoCallRequest') {
					const stompEventContent: VideoCallRequestProps =
						stompMessageBody['eventContent'];
					setNewStompVideoCallRequest(stompEventContent);
				}
				message.ack({ 'message-id': message.headers.id });
			});
		});
	};

	return <></>;
};
