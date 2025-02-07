import clsx from 'clsx';
import * as React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import {
	useState,
	useEffect,
	useRef,
	useCallback,
	MouseEvent,
	useContext
} from 'react';
import { Text } from '../text/Text';
import { LegalLinksContext } from '../../globalState/provider/LegalLinksProvider';
import './stage.styles';
import { Banner } from '../banner/Banner';
import { Headline } from '../headline/Headline';
import LegalLinks from '../legalLinks/LegalLinks';
import { ReactComponent as SkfLogo } from '../../resources/img/logos/01_skf.svg';
import { ReactComponent as CaritasLogo } from '../../resources/img/logos/02_caritas.svg';
import { ReactComponent as SkmLogo } from '../../resources/img/logos/03_skm.svg';
import { ReactComponent as InViaLogo } from '../../resources/img/logos/04_via.svg';
import { ReactComponent as KreuzbundLogo } from '../../resources/img/logos/05_kreuzbund.svg';
import { ReactComponent as RaphaelswerkLogo } from '../../resources/img/logos/06_raphael.svg';
import { ReactComponent as MalteserLogo } from '../../resources/img/logos/07_malteser.svg';
import { Spinner } from '../spinner/Spinner';

export interface StageProps {
	className?: string;
	hasAnimation?: boolean;
	isReady?: boolean;
}

export const Stage = ({
	className,
	hasAnimation,
	isReady = true
}: StageProps) => {
	const { t: translate } = useTranslation();

	const legalLinks = useContext(LegalLinksContext);

	const rootNodeRef = useRef(null);

	const [isOpen, setIsOpen] = useState(!hasAnimation);
	const [hasAnimationFinished, setHasAnimationFinished] = useState(false);

	useEffect(() => {
		if (hasAnimation && isReady) {
			setIsOpen(true);
		}

		const onTransitionEnd = () => {
			setHasAnimationFinished(true);
		};

		const rootNode = rootNodeRef.current;
		rootNode.addEventListener('transitionend', onTransitionEnd);
		return () => {
			rootNode.removeEventListener('transitionend', onTransitionEnd);
		};
	}, [hasAnimation, isReady]);

	const [ieBanner, setIeBanner] = useState(true);
	const closeIeBanner = useCallback((e: MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		setIeBanner(false);
	}, []);

	return (
		<div
			ref={rootNodeRef}
			className={clsx(className, 'stage', {
				'stage--no-animation': !hasAnimation,
				'stage--open': isOpen || !hasAnimation,
				'stage--ready': hasAnimationFinished
			})}
			data-cy="stage"
		>
			{ieBanner && (
				<Banner
					className="ieBanner"
					style={{ display: 'none' }}
					onClose={closeIeBanner}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="72"
						height="72"
						viewBox="0 0 72 72"
					>
						<path d="M37.7654935,7.31698782 L67.4353219,63.0603018 C67.9543029,64.035357 67.5845817,65.2465126 66.6095266,65.7654935 C66.3202373,65.9194701 65.9975433,66 65.6698284,66 L6.33017157,66 C5.22560207,66 4.33017157,65.1045695 4.33017157,64 C4.33017157,63.6722851 4.41070152,63.3495911 4.56467805,63.0603018 L34.2345065,7.31698782 C34.7534874,6.34193268 35.964643,5.9722115 36.9396982,6.49119247 C37.29099,6.67817038 37.5785156,6.96569598 37.7654935,7.31698782 Z M39,46 L39,26 L33,26 L33,46 L39,46 Z M39,56.4 L39,50.4 L33,50.4 L33,56.4 L39,56.4 Z" />
					</svg>
					<Trans i18nKey="banner.ie.text" />
				</Banner>
			)}

			<div className="stage__content">
				<div className="stage__headline">
					<Headline
						className="stage__title"
						semanticLevel="1"
						text={translate('app.stage.title')}
					/>
					<Headline
						className="stage__claim"
						semanticLevel="4"
						text={translate('app.claim')}
					/>
				</div>
				{hasAnimation ? <Spinner className="stage__spinner" /> : null}
				<div className="stage__logos">
					<SkfLogo />
					<CaritasLogo />
					<SkmLogo />
					<MalteserLogo />
					<KreuzbundLogo />
					<RaphaelswerkLogo />
					<InViaLogo />
				</div>
				<div className={`stage__legalLinks`}>
					<LegalLinks
						legalLinks={legalLinks}
						params={{ aid: null }}
						delimiter={
							<Text
								type="infoSmall"
								className="stage__legalLinksSeparator"
								text=" | "
							/>
						}
					>
						{(label, url) => (
							<button
								type="button"
								className="button-as-link"
								data-cy-link={url}
								onClick={() => window.open(url, '_blank')}
							>
								<Text
									className="stage__legalLinksItem"
									type="infoSmall"
									text={translate(label)}
								/>
							</button>
						)}
					</LegalLinks>
				</div>
			</div>
		</div>
	);
};
