import {useCallback, useEffect, useRef, useState} from "react";
import {type MouseEvent, type TouchEvent} from "react";
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
	
	const { workspace, setWorkspace } = useWorkspace()

	const [isDragging, setIsDragging] = useState(false);
	const [previousTouchPosition, setPreviousTouchPosition] = useState<{pageX: number, pageY: number} | null>(null)

	const isTargetingWorkspace = (target: EventTarget) => {
		return !workspace.isLocked && (target === viewportRef.current || target === workspaceRef.current)
	}

	const handleMouseDown = (e: MouseEvent) => {
		if (!workspace.isLocked && isTargetingWorkspace(e.target)) {
			setIsDragging(true);
		}
	};

	const handleMouseUp = () => {
		if (!workspace.isLocked) {
			setIsDragging(false);
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (workspace.isLocked || !isDragging || !isTargetingWorkspace(e.target)) return;

		// Ignore all but primary button click
		if (e.buttons !== 1) {
			setIsDragging(false);
			return;
		}

		setWorkspace((prev) => ({
			...prev,
			offset: {
				x: prev.offset.x + e.movementX / workspace.zoom,
				y: prev.offset.y + e.movementY / workspace.zoom
			}
		}));
	};

	const handleTouchStart = (e: TouchEvent) => {
		if (workspace.isLocked || !isTargetingWorkspace(e.target)) return;

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
		if (workspace.isLocked || !isDragging || !isTargetingWorkspace(e.target)) return;
		if (!previousTouchPosition || e.targetTouches.length !== 1) return;

		const touch  = e.targetTouches.item(0)
		const movementX = touch.pageX - previousTouchPosition.pageX
		const movementY = touch.pageY - previousTouchPosition.pageY

		setPreviousTouchPosition({
			pageX: touch.pageX,
			pageY: touch.pageY
		})

		setWorkspace((prev) => ({
			...prev,
			offset: {
				x: prev.offset.x + movementX / workspace.zoom,
				y: prev.offset.y + movementY / workspace.zoom
			}
		}));
	};

	const handleWheel = useCallback((e: WheelEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (workspace.isLocked) return;

		if (e.ctrlKey) {
			const speedFactor =
				(e.deltaMode === 1 ? 0.05 : e.deltaMode ? 1 : 0.002) * 10;

			setWorkspace((prev) => {
				const pinchDelta = -e.deltaY * speedFactor;

				return {
					...prev,
					zoom: Math.min(
						WORKSPACE_ZOOM_MAX,
						Math.max(WORKSPACE_ZOOM_MIN, prev.zoom * Math.pow(2, pinchDelta))
					)
				};
			});
		}
	}, [setWorkspace, workspace.isLocked])

	// Handle zooming workspace based on mouse scroll or touchpad gestures (which mimic ctrl + scroll)
	useEffect(() => {
		const hookViewportRef = viewportRef.current

		if (!hookViewportRef) return
		hookViewportRef.addEventListener('wheel', handleWheel);

		return () => {
			hookViewportRef?.removeEventListener('wheel', handleWheel);
		}
	}, [handleWheel, setWorkspace]);

	const handleWorkspaceLockToggle = useCallback(() => {
		setWorkspace((prev) => ({
			...prev,
			isLocked: !workspace.isLocked
		}));

		if (!workspace.isLocked) {
			setWorkspace((prev) => ({
				isLocked: prev.isLocked,
				zoom: 1,
				offset: {x: 0, y: 0}
			}));
		}
	}, [setWorkspace, workspace.isLocked])

	const handleWorkspaceReset = useCallback(() => {
		if (workspace.isLocked) return;

		setIsDragging(false);
		setPreviousTouchPosition(null)
		setWorkspace((prev) => ({
			isLocked: prev.isLocked,
			offset: {
				x: 2 * WORKSPACE_GRID_SIZE,
				y: 2 * WORKSPACE_GRID_SIZE
			},
			zoom: 1
		}));
	}, [setWorkspace, workspace.isLocked])

	useEffect(() => {
		window.addEventListener('workspace-reset', handleWorkspaceReset)
		window.addEventListener('workspace-lock-toggle', handleWorkspaceLockToggle)

		return () => {
			window.removeEventListener('workspace-reset', handleWorkspaceReset)
			window.removeEventListener('workspace-lock-toggle', handleWorkspaceLockToggle)
		}
	}, [handleWorkspaceLockToggle, handleWorkspaceReset]);

	const handleDrop = (e) => {
		e.preventDefault();
		console.debug(e)
	}

	const handleDragOver = (e) => {
		e.preventDefault();
		console.debug(e)
	}

	return (
		<div
			className={`workspace-viewport${workspace.isLocked ? " --locked" : ""}`}
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
					id="dotted-grid"
					patternUnits="userSpaceOnUse"
					x={workspace.offset.x * workspace.zoom}
					y={workspace.offset.y * workspace.zoom}
					width={WORKSPACE_GRID_SIZE * workspace.zoom}
					height={WORKSPACE_GRID_SIZE * workspace.zoom}
				>
					<circle cx="1" cy="1" r="1"></circle>
				</pattern>
				<rect x="0" y="0" width="100%" height="100%" fill="url(#dotted-grid)"></rect>
			</svg>
			<div
				className="workspace"
				ref={workspaceRef}
				style={{
						transform: `translate(${workspace.offset.x * workspace.zoom}px, ${workspace.offset.y * workspace.zoom}px) scale(${workspace.zoom})`
				}}
				onDragOver={handleDragOver}
				onDrop={handleDrop}
			>
				<WorkspacePanel>node</WorkspacePanel>
				<WorkspacePanel>
					<PluginTest/>
				</WorkspacePanel>
				<WorkspacePanel>
					<input />
					<textarea />
					<button>test</button>
				</WorkspacePanel>
				<WorkspacePanel>node</WorkspacePanel>
				<WorkspacePanel>node</WorkspacePanel>
			</div>
		</div>
	);
}
