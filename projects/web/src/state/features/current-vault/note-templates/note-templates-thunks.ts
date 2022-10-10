import {v4 as createUUID} from "uuid";
import {AppThunkDispatch} from "../../../store";
import {createNoteTemplate, updateNoteTemplate} from "./note-templates-actions";


export function createNewNoteTemplate(name: string, folderId: string | null) {
  return (dispatch: AppThunkDispatch) => {
    const templateId = createUUID();
    const timestamp = new Date().toISOString();

    const template = {
      id: templateId,
      name: name,
      body: "",
      folderId: folderId,
      targetFolderId: null,
      createdAt: timestamp,
      updatedAt: timestamp
    }
    dispatch(createNoteTemplate(template))
  }
}

export function renameNoteTemplate(templateId: string, newName: string) {
  return (dispatch: AppThunkDispatch) => {
    const timestamp = new Date().toISOString();

    dispatch(updateNoteTemplate({
      id: templateId,
      changes: {
        name: newName,
        updatedAt: timestamp
      }
    }));
  }
}

export function moveNoteTemplate(templateId: string, newFolder: string | null) {
  return (dispatch: AppThunkDispatch) => {
    const timestamp = new Date().toISOString();

    dispatch(updateNoteTemplate({
      id: templateId,
      changes: {
        folderId: newFolder,
        updatedAt: timestamp
      }
    }));
  }
}

export function updateNoteTemplateBody(templateId: string, newBody: string) {
  return (dispatch: AppThunkDispatch) => {
    const timestamp = new Date().toISOString();

    dispatch(updateNoteTemplate({
      id: templateId,
      changes: {
        body: newBody,
        updatedAt: timestamp
      }
    }));
  }
}

export function updateNoteTemplateTargetFolder(templateId: string, targetFolderId: string | null) {
  return (dispatch: AppThunkDispatch) => {
    const timestamp = new Date().toISOString();

    dispatch(updateNoteTemplate({
      id: templateId,
      changes: {
        targetFolderId: targetFolderId,
        updatedAt: timestamp
      }
    }));
  }
}
