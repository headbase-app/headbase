import {createContext, useContext} from 'react';

const ServicesContext = createContext({});

export function useServices() {
	return useContext(ServicesContext);
}

export function ServicesProvider({children, ...services}) {
	return (
		<ServicesContext.Provider value={services}>
			{children}
		</ServicesContext.Provider>
	)
}
