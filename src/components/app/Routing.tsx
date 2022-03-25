import * as React from 'react';
import { useContext, useEffect, useMemo } from 'react';
import { Route } from 'react-router-dom';
import {
	RouterConfigUser,
	RouterConfigConsultant,
	RouterConfigTeamConsultant,
	RouterConfigMainConsultant,
	RouterConfigPeerConsultant,
	RouterConfigAnonymousAsker
} from './RouterConfig';
import { AbsenceHandler } from './AbsenceHandler';
import {
	SessionsDataContext,
	UserDataContext,
	hasUserAuthority,
	AUTHORITIES,
	LegalLinkInterface
} from '../../globalState';
import { history } from './app';
import { SessionsListWrapper } from '../sessionsList/SessionsListWrapper';
import { NavigationBar } from './NavigationBar';
import { Header } from '../header/Header';
import { FinishedAnonymousConversationHandler } from './FinishedAnonymousConversationHandler';

interface routingProps {
	logout?: Function;
	legalLinks: Array<LegalLinkInterface>;
}

export const Routing = (props: routingProps) => {
	const { userData } = useContext(UserDataContext);
	const { sessionsData } = useContext(SessionsDataContext);
	const sessionGroupId = sessionsData?.mySessions?.[0]?.session?.groupId;
	const sessionId = sessionsData?.mySessions?.[0]?.session?.id;

	const routerConfig = useMemo(() => {
		if (hasUserAuthority(AUTHORITIES.VIEW_ALL_PEER_SESSIONS, userData)) {
			return RouterConfigMainConsultant();
		}
		if (hasUserAuthority(AUTHORITIES.USE_FEEDBACK, userData)) {
			return RouterConfigPeerConsultant();
		}
		if (
			hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData) &&
			userData.inTeamAgency
		) {
			return RouterConfigTeamConsultant();
		}
		if (hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData)) {
			return RouterConfigConsultant();
		}
		if (hasUserAuthority(AUTHORITIES.ANONYMOUS_DEFAULT, userData)) {
			return RouterConfigAnonymousAsker();
		}
		return RouterConfigUser();
	}, [userData]);

	useEffect(() => {
		history.push(
			'/sessions/' +
				(hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData)
					? 'consultant/sessionPreview'
					: 'user/view')
		);
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	// Redirect anonymous live chat users to their one and only session
	useEffect(() => {
		if (hasUserAuthority(AUTHORITIES.ANONYMOUS_DEFAULT, userData)) {
			if (sessionGroupId && sessionId) {
				history.push(
					`/sessions/user/view/${sessionGroupId}/${sessionId}`
				);
			}
		}
	}, [sessionGroupId, sessionId, userData]);

	return (
		<div className="app__wrapper">
			<NavigationBar
				routerConfig={routerConfig}
				handleLogout={() => props.logout()}
			/>

			<section className="contentWrapper">
				<Header />
				<div className="contentWrapper__list">
					{routerConfig.listRoutes.map(
						(route: any): JSX.Element => (
							<Route
								key={`list-${route.path}`}
								path={route.path}
								component={SessionsListWrapper}
							/>
						)
					)}
				</div>
				<div className="contentWrapper__detail">
					{routerConfig.detailRoutes.map(
						(route: any): JSX.Element => (
							<Route
								exact
								key={`detail-${route.path}`}
								path={route.path}
								render={(componentProps) => (
									<route.component
										{...componentProps}
										{...props}
										type={route.type || null}
									/>
								)}
							/>
						)
					)}

					{((hasUserProfileRoutes) => {
						if (hasUserProfileRoutes) {
							return (
								<div className="contentWrapper__userProfile">
									{routerConfig.userProfileRoutes.map(
										(route: any): JSX.Element => (
											<Route
												exact
												key={`userProfile-${route.path}`}
												path={route.path}
												render={(props) => (
													<route.component
														{...props}
														type={
															route.type || null
														}
													/>
												)}
											/>
										)
									)}
								</div>
							);
						}
					})(typeof routerConfig.userProfileRoutes !== 'undefined')}
				</div>

				<div className="contentWrapper__profile">
					{routerConfig.profileRoutes?.map(
						(route: any): JSX.Element => (
							<Route
								exact
								key={`profile-${route.path}`}
								path={route.path}
								render={() => (
									<route.component
										{...props}
										type={route.type || null}
									/>
								)}
							/>
						)
					)}
				</div>
			</section>
			{hasUserAuthority(AUTHORITIES.CONSULTANT_DEFAULT, userData) && (
				<AbsenceHandler />
			)}
			{hasUserAuthority(AUTHORITIES.ANONYMOUS_DEFAULT, userData) && (
				<FinishedAnonymousConversationHandler />
			)}
		</div>
	);
};
