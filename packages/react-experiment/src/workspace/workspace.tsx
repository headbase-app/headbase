import {useCallback, useEffect, useRef, useState} from "react";
import {type MouseEvent, type TouchEvent, type DragEvent} from "react";
import "./workspace.css"
import {PluginTest} from "../plugins/plugins-test.tsx";
import {useWorkspace} from "./use-workspace/use-workspace.ts";
import {WORKSPACE_GRID_SIZE, WORKSPACE_ZOOM_MAX, WORKSPACE_ZOOM_MIN} from "./use-workspace/workspace-context.tsx";
import {WorkspacePanel} from "./workspace-panel.tsx";


/**
 * Credit to https://dev.to/iscorekin/infinite-workspace-without-canvas-107b for a very helpful article
 * on implementing this infinite workspace which this code is based on.
 *
 * @constructor
 */
export function Workspace() {
	const viewportRef = useRef<HTMLDivElement>(null);
	const workspaceRef = useRef<HTMLDivElement>(null);

	const {
		isLocked, setIsLocked,
		zoom, setZoom,
		position, setPosition,
		panels, addPanel, removePanel, movePanel
	} = useWorkspace()

	const [isDragging, setIsDragging] = useState(false);
	const [previousTouchPosition, setPreviousTouchPosition] = useState<{pageX: number, pageY: number} | null>(null)

	const isTargetingWorkspace = (target: EventTarget) => {
		return !isLocked && (target === viewportRef.current || target === workspaceRef.current)
	}

	const handleMouseDown = (e: MouseEvent) => {
		if (!isLocked && isTargetingWorkspace(e.target)) {
			setIsDragging(true);
		}
	};

	const handleMouseUp = () => {
		if (!isLocked) {
			setIsDragging(false);
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isLocked || !isDragging || !isTargetingWorkspace(e.target)) return;

		// Ignore all but primary button click
		if (e.buttons !== 1) {
			setIsDragging(false);
			return;
		}

		setPosition((prev) => ({
			x: prev.x + e.movementX / zoom,
			y: prev.y + e.movementY / zoom
		}))
	};

	const handleTouchStart = (e: TouchEvent) => {
		if (isLocked || !isTargetingWorkspace(e.target)) return;

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

	const handleTouchEnd = () => {
		setPreviousTouchPosition(null)
		setIsDragging(false);
	};

	const handleTouchCancel = () => {
		setPreviousTouchPosition(null)
		setIsDragging(false);
	};

	const handleTouchMove = (e: TouchEvent) => {
		if (isLocked || !isDragging || !isTargetingWorkspace(e.target)) return;
		if (!previousTouchPosition || e.targetTouches.length !== 1) return;

		const touch  = e.targetTouches.item(0)
		const movementX = touch.pageX - previousTouchPosition.pageX
		const movementY = touch.pageY - previousTouchPosition.pageY

		setPreviousTouchPosition({
			pageX: touch.pageX,
			pageY: touch.pageY
		})

		setPosition((prev) => ({
			x: prev.x + movementX / zoom,
			y: prev.y + movementY / zoom
		}))
	};

	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (isLocked) return;

		if (e.ctrlKey) {
			const speedFactor =
				(e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * 10;
			const pinchDelta = -e.deltaY * speedFactor;

			setZoom((prev) => (
				Math.min(
					WORKSPACE_ZOOM_MAX,
					Math.max(WORKSPACE_ZOOM_MIN, prev * Math.pow(2, pinchDelta))
				)
			))
		}
	}, [setZoom, isLocked])

	// Handle zooming workspace based on mouse scroll or touchpad gestures (which mimic ctrl + scroll)
	useEffect(() => {
		const hookViewportRef = viewportRef.current

		if (!hookViewportRef) return
		hookViewportRef.addEventListener('wheel', handleWheel);

		return () => {
			hookViewportRef?.removeEventListener('wheel', handleWheel);
		}
	}, [handleWheel]);

	const handleWorkspaceLockToggle = useCallback(() => {
		setIsLocked(!isLocked)

		if (isLocked) {
			setZoom(1)
			setPosition({x: 0, y: 0})
		}
	}, [isLocked, setIsLocked, setPosition, setZoom])

	const handleWorkspaceReset = useCallback(() => {
		if (isLocked) return;

		setIsDragging(false);
		setPreviousTouchPosition(null)
		setZoom(1)
		setPosition({
			x: 2 * WORKSPACE_GRID_SIZE,
			y: 2 * WORKSPACE_GRID_SIZE
		})
	}, [isLocked, setPosition, setZoom])

	useEffect(() => {
		window.addEventListener('workspace-reset', handleWorkspaceReset)
		window.addEventListener('workspace-lock-toggle', handleWorkspaceLockToggle)

		return () => {
			window.removeEventListener('workspace-reset', handleWorkspaceReset)
			window.removeEventListener('workspace-lock-toggle', handleWorkspaceLockToggle)
		}
	}, [handleWorkspaceLockToggle, handleWorkspaceReset]);

	useEffect(() => {
		console.debug('add')
		addPanel({
			id: 'test-1',
			coordinates: {x: 0, y: 0},
			children: (
				<p>test 1</p>
			)
		})
		addPanel({
			id: 'test-2',
			coordinates: {x: 0, y: 0},
			children: (
				<p>test 2</p>
			)
		})
		addPanel({
			id: 'test-3',
			coordinates: {x: 0, y: 0},
			children: (
				<p>test 3</p>
			)
		})
		addPanel({
			id: 'test-4',
			coordinates: {x: 0, y: 0},
			children: (
				<p>test 4</p>
			)
		})
		addPanel({
			id: 'plugins',
			coordinates: {x: 0, y: 0},
			children: (
				<PluginTest/>
			)
		})
		addPanel({
			id: 'form',
			coordinates: {x: 0, y: 0},
			children: (
				<>
					<input />
					<textarea />
					<button>test</button>
				</>
			)
		})

		return () => {
			removePanel('test-1')
			removePanel('test-2')
			removePanel('test-3')
			removePanel('test-4')
			removePanel('plugins')
			removePanel('form')
		}
	}, [addPanel, removePanel]);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		console.debug('drop')
		console.debug(e)

		const data = JSON.parse(e.dataTransfer.getData("application/json"))
		console.debug('data', data);
		movePanel(data.id, {x: e.clientX - position.x, y: e.clientY - position.y})
	}

	return (
		<div
			className={`workspace-viewport${isLocked ? " --locked" : ""}`}
			ref={viewportRef}
			onMouseDown={handleMouseDown}
			onMouseUp={handleMouseUp}
			onMouseMove={handleMouseMove}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
			onTouchMove={handleTouchMove}
			onTouchCancel={handleTouchCancel}
			onDragOver={handleDragOver}
			onDrop={handleDrop}
		>
			<svg className="workspace-background">
				<pattern
					id="dotted-grid"
					patternUnits="userSpaceOnUse"
					x={position.x * zoom}
					y={position.y * zoom}
					width={WORKSPACE_GRID_SIZE * zoom}
					height={WORKSPACE_GRID_SIZE * zoom}
				>
					<circle cx="1" cy="1" r="1"></circle>
				</pattern>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#dotted-grid)"></rect>
			</svg>
			<div
				className="workspace"
				ref={workspaceRef}
				style={{
					transform: `translate(${position.x * zoom}px, ${position.y * zoom}px) scale(${zoom})`
				}}
			>
				{panels.map((panel) => (
					<WorkspacePanel key={panel.id} {...panel} />
				))}
			</div>
		</div>
	);
}
