import {JButton} from "@ben-ryder/jigsaw-react";
import {ReactNode, useMemo, useState} from "react";

import "./performance.scss"
import {useHeadbase} from "../../../headbase/hooks/use-headbase.tsx";

export interface ReportItem {
	level: "section" | "task" | "message",
	text: string
}

export type ReportFunction = (reportItem: ReportItem) => void

export function PerformanceManager() {
	const { headbase } = useHeadbase()

	const [logs, setLogs] = useState<ReportItem[]>([])
	const [isRunning, setIsRunning] = useState<boolean>(false)

	function report(reportItem: ReportItem) {
		setLogs(logs => ([...logs, reportItem]))
	}

	const run = useMemo(() => {
		return async () => {
			throw new Error("no implemented yet")

			// setIsRunning(true)
			// setLogs([])
			// await runTest(headbase, report)
			// setIsRunning(false)
		}
	}, [headbase])

	const logDisplay: ReactNode[] = []
	for (const logItem of logs) {
		if (logItem.level === "section") {
			logDisplay.push(<h2>{logItem.text}</h2>)
		}
		else if (logItem.level === "task") {
			logDisplay.push(<h3>{logItem.text}</h3>)
		}
		else {
			logDisplay.push(<p>{logItem.text}</p>)
		}
	}

	return (
		<div className="performance">
			<div className="performance__header">
				<h1 className="performance__heading">Device Performance Benchmark</h1>
				<JButton className="performance__button" onClick={() => {run()}} disabled={isRunning} loading={isRunning}>Run Test</JButton>
			</div>
			<div className="performance__logs-container">
				<div className="performance__logs">
					{logDisplay}
				</div>
			</div>
		</div>
	)
}