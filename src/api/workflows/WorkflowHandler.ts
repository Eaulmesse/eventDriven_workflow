import { Workflow } from '../../types/workflow.types';
import type { MessageResponse } from '../types';
import { StorageManager } from '../../storage/StorageManager';

declare const crypto: Crypto;


export class WorkflowHandler {

  async handleList(): Promise<MessageResponse<Record<string, { id: string; name: string }>>> {
    try {
      const storageManager = StorageManager.getInstance();
      const workflows = await storageManager.getAll<Workflow>('workflows');
      return { success: true, data: workflows };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async handleGet(payload: { id?: string }): Promise<MessageResponse<{ id: string; name: string }>> {
    try {
      if (!payload?.id?.trim()) {
        return { success: false, error: 'id manquant' };
      }
      const workflow = { id: payload.id, name: `Workflow ${payload.id}` };
      return { success: true, data: workflow };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        
      };
    }
  }

  async handleCreate(payload: { name: string }): Promise<MessageResponse<{ id: string; name: string }>> {
    try {
      if (!payload?.name?.trim()) {
        return { success: false, error: 'Nom manquant' };
      }
      const newWorkflow: Workflow = {
        id: uuidv4(),
        name: payload.name,
        description: '',
        triggerType: 'manual',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const storageManager = StorageManager.getInstance();
      await storageManager.set('workflows', newWorkflow.id, newWorkflow);

      // return { success: true, data: newWorkflow };
      return { success: true, data: { id: newWorkflow.id, name: newWorkflow.name } };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }

  async handleUpdate(payload: { id: string; name: string }): Promise<MessageResponse<{ id: string; name: string }>> {
    try {
      if (!payload?.id?.trim()) {
        return { success: false, error: 'id manquant' };
      }
      if (!payload?.name?.trim()) {
        return { success: false, error: 'Nom manquant' };
      }

      const storageManager = StorageManager.getInstance();
      const workflow = await storageManager.get<Workflow>('workflows', payload.id);

      if (!workflow) {
        return { success: false, error: 'Workflow non trouvé' };
      }

      workflow.name = payload.name;
      workflow.updatedAt = new Date();
      await storageManager.update('workflows', payload.id, workflow);

      return { success: true, data: { id: workflow.id, name: workflow.name } };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleDelete(payload: { id: string }): Promise<MessageResponse<{ id: string }>> {
    try {
      if (!payload?.id?.trim()) {
        return { success: false, error: 'id manquant' };
      }

      const storageManager = StorageManager.getInstance();
      await storageManager.deleteWorkflow(payload.id);

      return { success: true, data: { id: payload.id } };

    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

  async handleExecute(payload: { id: string }): Promise<MessageResponse<{ id: string }>> {
    try {
      if (!payload?.id?.trim()) {
        return { success: false, error: 'id manquant' };
      }
      const storageManager = StorageManager.getInstance();
      const workflow = await storageManager.get<Workflow>('workflows', payload.id);
      if (!workflow) {
        return { success: false, error: 'Workflow non trouvé' };
      }
      return { success: true, data: { id: workflow.id } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' };
    }
  }

}

  

function uuidv4(): string {
  return crypto.randomUUID();
}

