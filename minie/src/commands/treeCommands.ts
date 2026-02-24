import { TreeStore } from '../models/TreeStore';
import { TreeNode, type NodeData } from '../models/Node';
import type { Command } from './history';

function getNodeIndex(node: TreeNode): number {
    if (!node.parent) return -1;
    return node.parent.children.indexOf(node);
}

export function createAddNodeCommand(
    store: TreeStore,
    parentId: string,
    data: NodeData,
    index?: number
): Command {
    return {
        name: 'add-node',
        execute() {
            store.addNode(parentId, data, index);
        },
        undo() {
            store.removeNode(data.id);
        }
    };
}

export function createRemoveNodeCommand(store: TreeStore, nodeId: string): Command {
    let removedNode: TreeNode | null = null;
    let parentId = '';
    let index = -1;

    return {
        name: 'remove-node',
        execute() {
            const node = store.getNode(nodeId);
            // 确保节点存在且有父节点
            if (!node || !node.parent) {
                throw new Error(`Node "${nodeId}" not found or has no parent`);
            }
            parentId = node.parent.data.id;
            index = getNodeIndex(node);
            removedNode = store.removeNode(nodeId);
        },
        undo() {
            if (!removedNode) return;
            store.attachNode(parentId, removedNode, index);
        }
    };
}

export function createMoveNodeCommand(
    store: TreeStore,
    nodeId: string,
    targetParentId: string,
    index?: number
): Command {
    let previousParentId = '';
    let previousIndex = -1;

    return {
        name: 'move-node',
        execute() {
            const node = store.getNode(nodeId);
            if (!node || !node.parent) {
                throw new Error(`Node "${nodeId}" not found or has no parent`);
            }
            previousParentId = node.parent.data.id;
            previousIndex = getNodeIndex(node);
            store.moveNode(nodeId, targetParentId, index);
        },
        undo() {
            store.moveNode(nodeId, previousParentId, previousIndex);
        }
    };
}
