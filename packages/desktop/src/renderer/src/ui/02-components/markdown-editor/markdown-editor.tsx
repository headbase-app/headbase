import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { theme } from "./theme";
import { EditorView } from "@codemirror/view";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";

export interface MarkdownEditorProps {
	id: string; // todo: add ID to CodeMirror
	value: string;
	onChange: (value: string) => void;
}

export function MarkdownEditor(props: MarkdownEditorProps) {
	return (
		<div className="ath-editor">
			<CodeMirror
				value={props.value}
				onChange={(value) => {
					// onChange is triggered even for external value changes, so this checks if there really was an update
					if (value !== props.value) {
						props.onChange(value);
					}
				}}
				extensions={[
					markdown({ base: markdownLanguage, codeLanguages: languages }),
					EditorView.lineWrapping,
					hyperLink,
				]}
				theme={theme}
				basicSetup={{
					lineNumbers: false,
					foldGutter: false,
					highlightActiveLine: false,
					highlightSelectionMatches: false,
				}}
				placeholder="start typing markdown here..."
			/>
		</div>
	);
}
