import * as React from 'react';
import { Headline } from '../headline/Headline';
import { Text } from '../text/Text';
import { useContext } from 'react';
import { TenantContext } from '../../globalState';
import './header.styles';
import { useTranslation } from 'react-i18next';
import { LanguageSwitch } from '../languageSwitch/LanguageSwitch';

export const Header = ({ showLanguageSwitch = false }) => {
	const { t: translate } = useTranslation();
	const { tenant } = useContext(TenantContext);

	return (
		<header className="header">
			<Headline
				semanticLevel="2"
				text={tenant?.name || translate('app.title')}
			/>
			<div className="header__right">
				<Text
					type="standard"
					text={tenant?.content?.claim || translate('app.claim')}
				/>
				{showLanguageSwitch && <LanguageSwitch />}
			</div>
		</header>
	);
};
