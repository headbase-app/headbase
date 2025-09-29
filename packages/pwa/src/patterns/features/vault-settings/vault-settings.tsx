import {
	JInput,
	JButtonGroup, JButton,
	JForm, JFormContent, JFormRow, JTextArea,
} from "@ben-ryder/jigsaw-react";

export interface VaultSettingsProps {}

export function VaultSettings(props: VaultSettingsProps) {
	function onSave() {

	}

	return (
		<JForm className="vault-settings" onSubmit={onSave}>
			<JFormRow>
				<JButtonGroup>
					<JButton type="submit">Save</JButton>
				</JButtonGroup>
			</JFormRow>
			<JFormContent>
				<JFormRow>
					<JInput
						label="Templates Location"
						id="templates-location"
						type="text"
						tooltip={{content: "The location of files which should be considered templates."}}
						value={''}
						onChange={(e) => {}}
						placeholder="/templates"
					/>
				</JFormRow>
				<JFormRow>
					<JInput
						label="Default File Location"
						id="default-location"
						type="text"
						tooltip={{content: "The default location for new files."}}
						value={''}
						onChange={(e) => {}}
						placeholder="/default/folder"
					/>
				</JFormRow>
				<JFormRow>
					<JTextArea
						label="Sidebar Query"
						id="sidebar-query"
						rows={5}
						tooltip={{content: "The query used to show files in the sidebar."}}
						value={''}
						onChange={(e) => {}}
						placeholder="{isFavourite: {$equal: true}}"
					/>
				</JFormRow>
			</JFormContent>
		</JForm>
	);
}
