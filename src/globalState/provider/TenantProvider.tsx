import * as React from 'react';
import { createContext, useState, useContext } from 'react';
import { TenantDataInterface } from '../interfaces/TenantDataInterface';

const initialTenantProps: TenantDataInterface = {
	id: null,
	name: '',
	subdomain: '',
	host: '',
	protocol: '',
	origin: '',
	theming: {
		logo: '',
		favicon: '',
		primaryColor: '',
		secondaryColor: ''
	},
	content: {
		impressum: '',
		claim: ''
	}
};

export const TenantContext = createContext<{
	tenant: TenantDataInterface;
	setTenant(tenant: TenantDataInterface): void;
}>(null);

export function TenantProvider(props) {
	const [tenant, setTenant] =
		useState<TenantDataInterface>(initialTenantProps);

	return (
		<TenantContext.Provider value={{ tenant, setTenant }}>
			{props.children}
		</TenantContext.Provider>
	);
}

export function useTenant() {
	return useContext(TenantContext).tenant;
}
