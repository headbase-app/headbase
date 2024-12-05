import React from "react";
import {Router, Route, Switch} from "wouter";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { routes } from "./routes";

import { MainPage } from "./pages/main/main";
import { PageNotFound } from "./pages/page-not-found";
import { WelcomePage } from "./pages/welcome";

import "./app.scss"
import "./styles/variables.css"

export function App() {

	// useEffect(() => {
	// 	const ws = new WebSocket("ws://localhost:42102/v1/events");
	// 	console.debug(ws)
	//
	// 	ws.addEventListener('open', (event) => {
	// 		console.debug(`[WebSocket] received open`)
	// 		console.debug(event)
	//
	// 		console.debug('[WebSocket] sending subscribe event')
	// 		ws.send(JSON.stringify({
	// 			type: 'subscribe',
	// 			payload: {
	// 				vaults: ["example"]
	// 			}
	// 		}))
	// 	})
	//
	// 	ws.addEventListener('message', (event) => {
	// 		console.debug(`[WebSocket] received message`)
	// 		console.debug(event)
	// 	})
	//
	// 	ws.addEventListener('error', (event) => {
	// 		console.debug(`[WebSocket] received error`)
	// 		console.debug(event)
	// 	})
	//
	// 	ws.addEventListener('close', (event) => {
	// 		console.debug(`[WebSocket] received close`)
	// 		console.debug(event)
	// 	})
	//
	// 	return () => {
	// 		ws.close()
	// 	}
	// }, []);

	return (
		<Router>
			<HelmetProvider>
				<Helmet>
					<meta charSet="utf-8" />
					<title>Headbase</title>
				</Helmet>
					{/* Basic Pages */}
				<Switch>
					<Route path={routes.main} component={MainPage} />
					<Route path={routes.welcome} component={WelcomePage} />

					{/* 404 Route */}
					<Route component={PageNotFound} />
				</Switch>
			</HelmetProvider>
		</Router>
	);
}
