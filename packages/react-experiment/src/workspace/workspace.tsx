import {useEffect, useRef, useState} from "react";
import {type MouseEvent, type TouchEvent, type TouchList} from "react";
import "./workspace.css"
import {PluginTest} from "../plugins/plugins-test.tsx";

export const GRID_SIZE = 24;


/**
 * Credit to https://dev.to/iscorekin/infinite-workspace-without-canvas-107b for a very helpful article
 * on implementing this infinite workspace which this code is based on.
 *
 * @constructor
 */
export function Workspace() {
	const viewportRef = useRef<HTMLDivElement>(null);
	const [currentView, setCurrentView] = useState({
		offset: {
			x: 0.0,
			y: 0.0
		},
		zoom: 1
	});
	const [isDragging, setIsDragging] = useState(false);
	const [previousTouchPosition, setPreviousTouchPosition] = useState<{pageX: number, pageY: number} | null>(null)

	const handleMouseDown = () => {
		setIsDragging(true);
	};

	const handleMouseUp = () => {
		setIsDragging(false);
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;

		if (e.buttons !== 1) {
			setIsDragging(false);
			return;
		}

		setCurrentView((prev) => ({
			...prev,
			offset: {
				x: prev.offset.x + e.movementX / currentView.zoom,
				y: prev.offset.y + e.movementY / currentView.zoom
			}
		}));
	};

	const handleTouchStart = (e: TouchEvent) => {
		console.debug("touch start", e)

		// Only enable dragging if user is moving one finger, with two they may be zooming.
		if (e.targetTouches.length === 1) {
			setIsDragging(true);

			const touch  = e.targetTouches.item(0)
			setPreviousTouchPosition({
				pageX: touch.pageX,
				pageY: touch.pageY
			})
		}
		else {
			setIsDragging(false);
		}
	};

	const handleTouchEnd = (e: TouchEvent) => {
		console.debug("touch end", e)
		setPreviousTouchPosition(null)
		setIsDragging(false);
	};

	const handleTouchCancel = (e: TouchEvent) => {
		console.debug("touch cancel", e)
		setPreviousTouchPosition(null)
		setIsDragging(false);
	};

	const handleTouchMove = (e: TouchEvent) => {
		console.debug("touch move", e)
		if (!isDragging || !previousTouchPosition || e.targetTouches.length !== 1) return;

		const sensitivity =1
		const touch  = e.targetTouches.item(0)
		const movementX = (touch.pageX - previousTouchPosition.pageX) * sensitivity
		const movementY = (touch.pageY - previousTouchPosition.pageY) * sensitivity

		setPreviousTouchPosition({
			pageX: touch.pageX,
			pageY: touch.pageY
		})

		setCurrentView((prev) => ({
			...prev,
			offset: {
				x: prev.offset.x + movementX / currentView.zoom,
				y: prev.offset.y + movementY / currentView.zoom
			}
		}));
	};

	// Handle zooming workspace based on mouse scroll or touchpad gestures (which mimic ctrl + scroll)
	useEffect(() => {
		if (!viewportRef.current) return

		viewportRef.current.onwheel = (e: WheelEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (e.ctrlKey) {
				const speedFactor =
					(e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * 10;

				setCurrentView((prev) => {
					const pinchDelta = -e.deltaY * speedFactor;

					return {
						...prev,
						zoom: Math.min(
							1.3,
							Math.max(0.1, prev.zoom * Math.pow(2, pinchDelta))
						)
					};
				});
			}
		};
	}, [setCurrentView]);

	// Handle moving workspace based on touch events for mobile
	useEffect(() => {
		if (!viewportRef.current) return

		viewportRef.current.ontouchstart = () => {
			setIsDragging(true);
		}

		viewportRef.current.ontouchend = () => {
			setIsDragging(false);
		}
	}, [setCurrentView]);

	useEffect(() => {
		const handleWorkspaceReset = () => {
			setIsDragging(false);
			setPreviousTouchPosition(null)
			setCurrentView({
				offset: {
					x: 0,
					y: 0
				},
				zoom: 1
			})
		}

		window.addEventListener('workspace-reset', handleWorkspaceReset)

		return () => {
			window.removeEventListener('workspace-reset', handleWorkspaceReset)
		}
	}, []);

	return (
		<div
			className="workspace-viewport"
			ref={viewportRef}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchMove={handleTouchMove}
			onTouchCancel={handleTouchCancel}
		>
			<svg className="workspace-background">
				<pattern
					id="7e3f715f4ea90855"
					patternUnits="userSpaceOnUse"
					x={currentView.offset.x * currentView.zoom}
					y={currentView.offset.y * currentView.zoom}
					width="24" height="24"
				>
					<circle cx="1" cy="1" r="1"></circle>
				</pattern>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#7e3f715f4ea90855)"></rect>
			</svg>
			<div
				className="workspace"
				style={{
					transform: `translate(${currentView.offset.x * currentView.zoom}px, ${currentView.offset.y * currentView.zoom}px) scale(${currentView.zoom})`
				}}
			>
				<div
					style={{
						top: 0,
						left: 0
					}}
					className="workspace-panel"
				>
					node
				</div>
				<div
					style={{
						top: 4 * GRID_SIZE,
						left: 7 * GRID_SIZE
					}}
					className="workspace-panel"
				>
					<PluginTest/>
				</div>
				<div
					style={{
						top: 12 * GRID_SIZE,
						left: 2 * GRID_SIZE
					}}
					className="workspace-panel"
				>
					node
					<input />
					<textarea />
					<button>test</button>
				</div>
				<div
					style={{
						top: 5 * GRID_SIZE,
						left: -2 * GRID_SIZE
					}}
					className="workspace-panel"
				>
					node
				</div>
			</div>
		</div>
	);
}
