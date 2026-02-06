import type { MessageResponse, MessageRequest } from '../types';
import { StorageManager } from '../../storage/StorageManager';
import { Action, ActionType } from '../../types/action.types';

declare const crypto: Crypto;

export class ActionHandler {

  async handleList(): Promise<MessageResponse<Record<string, Action>>> {
    try {
      const storageManager = StorageManager.getInstance();
      const actions = await storageManager.getAll<Action>('actions');
      return { success: true, data: actions };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleGet(payload: { id: string }): Promise<MessageResponse<Action>> {
    try {
      const storageManager = StorageManager.getInstance();
      const action = await storageManager.get<Action>('actions', payload.id);
      return { success: true, data: action };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleCreate(payload: { workflowId: string; actionType: ActionType; order: number; actionConfig: Record<string, any> }): Promise<MessageResponse<Action>> {
    try {
        if (!payload?.workflowId?.trim()) {
            return { success: false, error: 'workflowId manquant' };
        }
        const action: Action = {
            id: uuidv4(),
            workflowId: payload.workflowId,
            actionType: payload.actionType,
            order: payload.order,
            actionConfig: payload.actionConfig,
            createdAt: new Date(),
        }
        const storageManager = StorageManager.getInstance();
        await storageManager.set('actions', action.id, action);
        return { success: true, data: action };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleUpdate(payload: { id: string; workflowId: string; actionType: ActionType; order: number; actionConfig: Record<string, any> }): Promise<MessageResponse<Action>> {
    try {
      const storageManager = StorageManager.getInstance();
      const action = await storageManager.get<Action>('actions', payload.id);
      return { success: true, data: action };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleDelete(payload: { id: string }): Promise<MessageResponse<{ id: string }>> {
    try {
      const storageManager = StorageManager.getInstance();
      await storageManager.remove('actions', payload.id);
      return { success: true, data: { id: payload.id } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleReorder(payload: { id: string; order: number }): Promise<MessageResponse<{ id: string; order: number }>> {
    try {
      const storageManager = StorageManager.getInstance();
      const action = await storageManager.get<Action>('actions', payload.id);

      if (!action) {
        return { success: false, error: 'Action non trouvée' };
      }

      action.order = payload.order;
      await storageManager.update('actions', payload.id, action);
      return { success: true, data: { id: payload.id, order: payload.order } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }
}

function uuidv4(): string {
    return crypto.randomUUID();
}

