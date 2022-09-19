import { endpoints } from '../../../../src/resources/scripts/endpoints';

const videocallsApi = (cy) => {
	cy.intercept('GET', `${endpoints.videocallServiceBase}/*/jwt`, (req) => {
		req.reply({
			domain: `${Cypress.env('REACT_APP_UI_URL')
				.replace('http://', '')
				.replace('https://', '')}/jitsi`,
			jwt: 'any_token'
		});
	}).as('videocalls_jwt_get');
};

export default videocallsApi;
