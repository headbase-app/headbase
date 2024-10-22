import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Helmet, HelmetProvider } from "react-helmet-async";

import { routes } from "./routes";

import { MainPage } from "./pages/main/main";
import { PageNotFound } from "./pages/page-not-found";
import { WelcomePage } from "./pages/welcome";

import "./app.scss"

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
		<BrowserRouter>
			<HelmetProvider>
				<Helmet>
					<meta charSet="utf-8" />
					<title>Headbase</title>
				</Helmet>
				<Routes>
					{/* Basic Pages */}
					<Route path={routes.main} element={<MainPage />} />
					<Route path={routes.welcome} element={<WelcomePage />} />

					{/* 404 Route */}
					<Route path="*" element={<PageNotFound />} />
				</Routes>
			</HelmetProvider>
		</BrowserRouter>
	);
}
