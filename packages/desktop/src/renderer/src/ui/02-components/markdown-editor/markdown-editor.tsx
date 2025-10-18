import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { theme } from "./theme";
import { EditorView } from "@codemirror/view";
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link";
import {useCallback, useState} from "react";

export interface MarkdownEditorProps {
	initialValue: string;
	onChange: (value: string) => void;
}

export function MarkdownEditor({initialValue, onChange: _onChange}: MarkdownEditorProps) {
	const [value, setValue] = useState<string>(initialValue);

	const onChange = useCallback((value: string) => {
		setValue(value);
		_onChange(value);
	}, [_onChange]);

	return (
		<div className="ath-editor">
			<CodeMirror
				value={value}
				onChange={onChange}
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
