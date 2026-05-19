/**
 * Whiteboard Sync Service
 * Orchestrates bidirectional synchronization between whiteboard frames and hierarchy nodes.
 */

import { useWhiteboardStore } from '@/stores/whiteboardStore';
import {
  ExcalidrawElement,
  SyncOperation,
  SyncOrigin,
  SyncOperationType,
} from '@/types/whiteboard';

type SyncEventCallback = (operation: SyncOperation) => void;
type FrameCreationHandler = (
  nodeId: string,
  title: string
) => Promise<string | null>;
type FrameUpdateHandler = (
  frameId: string,
  title: string
) => Promise<void>;
type FrameDeletionHandler = (frameId: string) => Promise<void>;

class WhiteboardSyncService {
  // Bidirectional maps (mirrors store for quick access)
  private nodeToFrame: Map<string, string> = new Map();
  private frameToNode: Map<string, string> = new Map();

  // Sync state
  private syncQueue: SyncOperation[] = [];
  private isSyncing: boolean = false;
  private processingOrigin: SyncOrigin | null = null;

  // Event subscribers
  private subscribers: Set<SyncEventCallback> = new Set();

  // Frame handlers (set by useWhiteboardSync when whiteboard is active)
  private frameCreationHandler: FrameCreationHandler | null = null;
  private frameUpdateHandler: FrameUpdateHandler | null = null;
  private frameDeletionHandler: FrameDeletionHandler | null = null;
  private isWhiteboardActive: boolean = false;

  // Track operations to prevent infinite loops
  private recentOperations: Map<string, number> = new Map();
  private readonly OPERATION_DEBOUNCE_MS = 500;

  constructor() {
    // Initialize maps from store on first access
    this.initializeMapsFromStore();
  }

  /**
   * Initialize bidirectional maps from persisted store state
   */
  private initializeMapsFromStore(): void {
    const store = useWhiteboardStore.getState();
    this.nodeToFrame = new Map(store.nodeFrameMap);
    this.frameToNode = new Map(store.frameNodeMap);
  }

  /**
   * Refresh maps from store (call after store updates)
   */
  public refreshMapsFromStore(): void {
    this.initializeMapsFromStore();
  }

  /**
   * Subscribe to sync events
   */
  public subscribe(callback: SyncEventCallback): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of a sync operation
   */
  private notifySubscribers(operation: SyncOperation): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(operation);
      } catch (error) {
        console.error('[WhiteboardSync] Subscriber error:', error);
      }
    });
  }

  /**
   * Check if an operation should be skipped to prevent loops
   */
  private shouldSkipOperation(
    type: SyncOperationType,
    entityId: string
  ): boolean {
    const key = `${type}:${entityId}`;
    const lastTime = this.recentOperations.get(key);
    const now = Date.now();

    if (lastTime && now - lastTime < this.OPERATION_DEBOUNCE_MS) {
      return true;
    }

    this.recentOperations.set(key, now);
    // Clean up old entries
    if (this.recentOperations.size > 100) {
      const cutoff = now - this.OPERATION_DEBOUNCE_MS * 2;
      for (const [k, time] of this.recentOperations) {
        if (time < cutoff) {
          this.recentOperations.delete(k);
        }
      }
    }

    return false;
  }

  /**
   * Queue a sync operation
   */
  private queueOperation(operation: SyncOperation): void {
    // Don't queue if this operation type was just processed
    const entityId = operation.frameId || operation.nodeId || '';
    if (this.shouldSkipOperation(operation.type, entityId)) {
      return;
    }

    this.syncQueue.push(operation);
    this.processQueue();
  }

  /**
   * Process queued operations
   */
  private async processQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    useWhiteboardStore.getState().setSyncStatus('syncing');

    try {
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        if (operation) {
          this.processingOrigin = operation.origin;
          await this.processOperation(operation);
          this.notifySubscribers(operation);
          this.processingOrigin = null;
        }
      }
      useWhiteboardStore.getState().setSyncStatus('idle');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Sync failed';
      useWhiteboardStore.getState().setSyncError(errorMessage);
      console.error('[WhiteboardSync] Queue processing error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Process a single sync operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    console.log('[WhiteboardSync] Processing operation:', operation);

    switch (operation.type) {
      case 'node_created':
        await this.handleNodeCreated(operation);
        break;
      case 'node_updated':
        await this.handleNodeUpdated(operation);
        break;
      case 'node_deleted':
        await this.handleNodeDeleted(operation);
        break;
      // Frame operations are handled by useSaveWhiteboard
      default:
        break;
    }
  }

  /**
   * Handle node created - create a frame on the whiteboard
   */
  private async handleNodeCreated(operation: SyncOperation): Promise<void> {
    if (!this.isWhiteboardActive || !this.frameCreationHandler) {
      console.log(
        '[WhiteboardSync] Whiteboard not active, skipping frame creation'
      );
      return;
    }

    const payload = operation.payload as { id: string; title: string } | undefined;
    if (!payload?.id || !payload?.title) return;

    // Don't create frame if node already has one
    if (this.nodeToFrame.has(payload.id)) {
      console.log(
        '[WhiteboardSync] Node already has frame, skipping:',
        payload.id
      );
      return;
    }

    try {
      const frameId = await this.frameCreationHandler(payload.id, payload.title);
      if (frameId) {
        this.linkFrameToNode(frameId, payload.id);
        console.log(
          '[WhiteboardSync] Created frame for node:',
          payload.id,
          '->',
          frameId
        );
      }
    } catch (error) {
      console.error('[WhiteboardSync] Failed to create frame:', error);
    }
  }

  /**
   * Handle node updated - update the linked frame's text
   */
  private async handleNodeUpdated(operation: SyncOperation): Promise<void> {
    if (!this.isWhiteboardActive || !this.frameUpdateHandler) {
      return;
    }

    const payload = operation.payload as { id: string; title: string } | undefined;
    if (!payload?.id || !payload?.title) return;

    const frameId = this.nodeToFrame.get(payload.id);
    if (!frameId) return;

    try {
      await this.frameUpdateHandler(frameId, payload.title);
      console.log(
        '[WhiteboardSync] Updated frame text for node:',
        payload.id
      );
    } catch (error) {
      console.error('[WhiteboardSync] Failed to update frame:', error);
    }
  }

  /**
   * Handle node deleted - delete the linked frame
   */
  private async handleNodeDeleted(operation: SyncOperation): Promise<void> {
    if (!this.isWhiteboardActive || !this.frameDeletionHandler) {
      return;
    }

    if (!operation.nodeId) return;

    const frameId = this.nodeToFrame.get(operation.nodeId);
    if (!frameId) return;

    try {
      await this.frameDeletionHandler(frameId);
      this.unlinkNode(operation.nodeId);
      console.log(
        '[WhiteboardSync] Deleted frame for node:',
        operation.nodeId
      );
    } catch (error) {
      console.error('[WhiteboardSync] Failed to delete frame:', error);
    }
  }

  /**
   * Register frame handlers when whiteboard becomes active
   */
  public registerFrameHandlers(
    onCreateFrame: FrameCreationHandler,
    onUpdateFrame: FrameUpdateHandler,
    onDeleteFrame: FrameDeletionHandler
  ): () => void {
    this.frameCreationHandler = onCreateFrame;
    this.frameUpdateHandler = onUpdateFrame;
    this.frameDeletionHandler = onDeleteFrame;
    this.isWhiteboardActive = true;

    return () => {
      this.frameCreationHandler = null;
      this.frameUpdateHandler = null;
      this.frameDeletionHandler = null;
      this.isWhiteboardActive = false;
    };
  }

  /**
   * Check if whiteboard is active
   */
  public getIsWhiteboardActive(): boolean {
    return this.isWhiteboardActive;
  }

  // ===========================================================================
  // Frame Event Handlers (Whiteboard → Hierarchy)
  // ===========================================================================

  /**
   * Handle frame creation on whiteboard
   */
  public async onFrameCreated(
    frame: ExcalidrawElement,
    nodeId?: string
  ): Promise<void> {
    // Skip if processing originated from hierarchy
    if (this.processingOrigin === 'hierarchy') {
      return;
    }

    const operation: SyncOperation = {
      id: `frame-created-${frame.id}-${Date.now()}`,
      type: 'frame_created',
      origin: 'whiteboard',
      frameId: frame.id,
      nodeId,
      payload: frame,
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  /**
   * Handle frame update on whiteboard
   */
  public async onFrameUpdated(
    frame: ExcalidrawElement,
    changes?: Partial<{ title: string }>
  ): Promise<void> {
    if (this.processingOrigin === 'hierarchy') {
      return;
    }

    const nodeId = this.getLinkedNodeId(frame.id);
    if (!nodeId) return;

    const operation: SyncOperation = {
      id: `frame-updated-${frame.id}-${Date.now()}`,
      type: 'frame_updated',
      origin: 'whiteboard',
      frameId: frame.id,
      nodeId,
      payload: { frame, changes },
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  /**
   * Handle frame deletion on whiteboard
   */
  public async onFrameDeleted(frameId: string): Promise<void> {
    if (this.processingOrigin === 'hierarchy') {
      return;
    }

    const nodeId = this.getLinkedNodeId(frameId);

    const operation: SyncOperation = {
      id: `frame-deleted-${frameId}-${Date.now()}`,
      type: 'frame_deleted',
      origin: 'whiteboard',
      frameId,
      nodeId: nodeId ?? undefined,
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // ===========================================================================
  // Node Event Handlers (Hierarchy → Whiteboard)
  // ===========================================================================

  /**
   * Handle node creation in hierarchy
   */
  public async onNodeCreated(node: {
    id: string;
    title: string;
  }): Promise<void> {
    if (this.processingOrigin === 'whiteboard') {
      return;
    }

    const operation: SyncOperation = {
      id: `node-created-${node.id}-${Date.now()}`,
      type: 'node_created',
      origin: 'hierarchy',
      nodeId: node.id,
      payload: node,
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  /**
   * Handle node update in hierarchy
   */
  public async onNodeUpdated(node: {
    id: string;
    title: string;
  }): Promise<void> {
    if (this.processingOrigin === 'whiteboard') {
      return;
    }

    const frameId = this.getLinkedFrameId(node.id);
    if (!frameId) return;

    const operation: SyncOperation = {
      id: `node-updated-${node.id}-${Date.now()}`,
      type: 'node_updated',
      origin: 'hierarchy',
      nodeId: node.id,
      frameId,
      payload: node,
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  /**
   * Handle node deletion in hierarchy
   */
  public async onNodeDeleted(nodeId: string): Promise<void> {
    if (this.processingOrigin === 'whiteboard') {
      return;
    }

    const frameId = this.getLinkedFrameId(nodeId);

    const operation: SyncOperation = {
      id: `node-deleted-${nodeId}-${Date.now()}`,
      type: 'node_deleted',
      origin: 'hierarchy',
      nodeId,
      frameId: frameId ?? undefined,
      timestamp: Date.now(),
    };

    this.queueOperation(operation);
  }

  // ===========================================================================
  // Map Management
  // ===========================================================================

  /**
   * Link a frame to a node
   */
  public linkFrameToNode(frameId: string, nodeId: string): void {
    this.nodeToFrame.set(nodeId, frameId);
    this.frameToNode.set(frameId, nodeId);
    useWhiteboardStore.getState().updateNodeFrameMap(nodeId, frameId);
  }

  /**
   * Unlink a frame from its node
   */
  public unlinkFrame(frameId: string): void {
    const nodeId = this.frameToNode.get(frameId);
    if (nodeId) {
      this.nodeToFrame.delete(nodeId);
      this.frameToNode.delete(frameId);
      useWhiteboardStore.getState().removeNodeFrameMapping(nodeId);
    }
  }

  /**
   * Unlink a node from its frame
   */
  public unlinkNode(nodeId: string): void {
    const frameId = this.nodeToFrame.get(nodeId);
    if (frameId) {
      this.frameToNode.delete(frameId);
      this.nodeToFrame.delete(nodeId);
      useWhiteboardStore.getState().removeNodeFrameMapping(nodeId);
    }
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Get the node ID linked to a frame
   */
  public getLinkedNodeId(frameId: string): string | null {
    return this.frameToNode.get(frameId) ?? null;
  }

  /**
   * Get the frame ID linked to a node
   */
  public getLinkedFrameId(nodeId: string): string | null {
    return this.nodeToFrame.get(nodeId) ?? null;
  }

  /**
   * Check if a frame is linked to a node
   */
  public isFrameLinked(frameId: string): boolean {
    return this.frameToNode.has(frameId);
  }

  /**
   * Check if a node is linked to a frame
   */
  public isNodeLinked(nodeId: string): boolean {
    return this.nodeToFrame.has(nodeId);
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): { isSyncing: boolean; queueLength: number } {
    return {
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
    };
  }

  /**
   * Clear all mappings (use with caution)
   */
  public clearMappings(): void {
    this.nodeToFrame.clear();
    this.frameToNode.clear();
    useWhiteboardStore
      .getState()
      .setNodeFrameMaps(new Map(), new Map());
  }
}

// Export singleton instance
export const whiteboardSyncService = new WhiteboardSyncService();
export default whiteboardSyncService;
