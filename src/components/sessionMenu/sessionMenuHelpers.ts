import { OverlayItem, OVERLAY_FUNCTIONS } from '../overlay/Overlay';
import { BUTTON_TYPES } from '../button/Button';
import { ReactComponent as CheckIllustration } from '../../resources/img/illustrations/check.svg';
import { ReactComponent as XIllustration } from '../../resources/img/illustrations/x.svg';
import { ReactComponent as ErrorBubbleIllustration } from '../../resources/img/illustrations/error-bubble.svg';

export const stopGroupChatSecurityOverlayItem: OverlayItem = {
	svg: XIllustration,
	illustrationBackground: 'error',
	headline: 'groupChat.stopChat.securityOverlay.headline',
	copy: '',
	buttonSet: [
		{
			label: 'groupChat.stopChat.securityOverlay.button1Label',
			function: OVERLAY_FUNCTIONS.STOP_GROUP_CHAT,
			type: BUTTON_TYPES.PRIMARY
		},
		{
			label: 'groupChat.stopChat.securityOverlay.button2Label',
			function: OVERLAY_FUNCTIONS.CLOSE,
			type: BUTTON_TYPES.SECONDARY
		}
	]
};

export const stopGroupChatSuccessOverlayItem: OverlayItem = {
	svg: CheckIllustration,
	headline: 'groupChat.stopChat.successOverlay.headline',
	buttonSet: [
		{
			label: 'groupChat.stopChat.successOverlay.button1Label',
			function: OVERLAY_FUNCTIONS.REDIRECT,
			type: BUTTON_TYPES.PRIMARY
		},
		{
			label: 'groupChat.stopChat.successOverlay.button2Label',
			function: OVERLAY_FUNCTIONS.LOGOUT,
			type: BUTTON_TYPES.SECONDARY
		}
	]
};

export const groupChatErrorOverlayItem: OverlayItem = {
	svg: XIllustration,
	illustrationBackground: 'error',
	headline: 'groupChat.createError.overlay.headline',
	buttonSet: [
		{
			label: 'groupChat.createError.overlay.buttonLabel',
			function: OVERLAY_FUNCTIONS.CLOSE,
			type: BUTTON_TYPES.PRIMARY
		}
	]
};

export const leaveGroupChatSecurityOverlayItem: OverlayItem = {
	svg: XIllustration,
	illustrationBackground: 'error',
	headline: 'groupChat.leaveChat.securityOverlay.headline',
	buttonSet: [
		{
			label: 'groupChat.leaveChat.securityOverlay.button1Label',
			function: OVERLAY_FUNCTIONS.LEAVE_GROUP_CHAT,
			type: BUTTON_TYPES.PRIMARY
		},
		{
			label: 'groupChat.leaveChat.securityOverlay.button2Label',
			function: OVERLAY_FUNCTIONS.CLOSE,
			type: BUTTON_TYPES.SECONDARY
		}
	]
};

export const leaveGroupChatSuccessOverlayItem: OverlayItem = {
	svg: CheckIllustration,
	headline: 'groupChat.leaveChat.successOverlay.headline',
	buttonSet: [
		{
			label: 'groupChat.leaveChat.successOverlay.button1Label',
			function: OVERLAY_FUNCTIONS.REDIRECT,
			type: BUTTON_TYPES.PRIMARY
		},
		{
			label: 'groupChat.leaveChat.successOverlay.button2Label',
			function: OVERLAY_FUNCTIONS.LOGOUT,
			type: BUTTON_TYPES.SECONDARY
		}
	]
};

export const archiveSessionSuccessOverlayItem: OverlayItem = {
	svg: CheckIllustration,
	illustrationBackground: 'info',
	copy: 'archive.overlay.session.success.copy',
	buttonSet: [
		{
			label: 'archive.overlay.session.success.button',
			function: OVERLAY_FUNCTIONS.ARCHIVE,
			type: BUTTON_TYPES.AUTO_CLOSE
		}
	]
};

export const videoCallErrorOverlayItem: OverlayItem = {
	svg: ErrorBubbleIllustration,
	headline: 'videoCall.overlay.unsupported.headline',
	copy: `videoCall.overlay.unsupported.copy`,
	showCloseButton: true,
	illustrationStyle: 'large',
	buttonSet: [
		{
			label: 'videoCall.overlay.unsupported.button.manual',
			function: 'GOTO_MANUAL',
			type: BUTTON_TYPES.PRIMARY
		}
	]
};
