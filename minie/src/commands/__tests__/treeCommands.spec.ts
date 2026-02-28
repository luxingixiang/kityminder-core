import { describe, it, expect } from 'vitest';
import { TreeStore } from '@core/models/TreeStore';
import { HistoryStack } from '@core/commands/history';
import {
    createAddNodeCommand,
    createRemoveNodeCommand,
    createMoveNodeCommand,
    createUpdateNodeTextCommand,
    createToggleCollapseCommand
} from '@core/commands/treeCommands';

describe('tree commands', () => {
    it('supports add undo redo', () => {
        const store = new TreeStore({ id: 'root' });
        const history = new HistoryStack();

        history.execute(createAddNodeCommand(store, 'root', { id: 'A' }));
        expect(store.getNode('A')).not.toBeNull();

        history.undo();
        expect(store.getNode('A')).toBeNull();

        history.redo();
        expect(store.getNode('A')).not.toBeNull();
    });

    it('supports remove undo redo', () => {
        const store = new TreeStore({ id: 'root' });
        store.addNode('root', { id: 'A' });
        store.addNode('A', { id: 'A-1' });
        const history = new HistoryStack();

        history.execute(createRemoveNodeCommand(store, 'A'));
        expect(store.getNode('A')).toBeNull();

        history.undo();
        expect(store.getNode('A-1')).not.toBeNull();

        history.redo();
        expect(store.getNode('A')).toBeNull();
    });

    it('supports move undo redo', () => {
        const store = new TreeStore({ id: 'root' });
        store.addNode('root', { id: 'A' });
        store.addNode('root', { id: 'B' });
        store.addNode('A', { id: 'A-1' });
        const history = new HistoryStack();

        history.execute(createMoveNodeCommand(store, 'A-1', 'B', 0));
        expect(store.getNode('A-1')?.parent?.data.id).toBe('B');

        history.undo();
        expect(store.getNode('A-1')?.parent?.data.id).toBe('A');

        history.redo();
        expect(store.getNode('A-1')?.parent?.data.id).toBe('B');
    });

    it('supports update text undo redo', () => {
        const store = new TreeStore({ id: 'root', text: 'Root' });
        store.addNode('root', { id: 'A', text: 'Old' });
        const history = new HistoryStack();

        history.execute(createUpdateNodeTextCommand(store, 'A', 'New'));
        expect(store.getNode('A')?.data.text).toBe('New');

        history.undo();
        expect(store.getNode('A')?.data.text).toBe('Old');

        history.redo();
        expect(store.getNode('A')?.data.text).toBe('New');
    });

    it('supports toggle collapse undo redo', () => {
        const store = new TreeStore({ id: 'root' });
        store.addNode('root', { id: 'A' });
        const history = new HistoryStack();

        history.execute(createToggleCollapseCommand(store, 'A', true));
        expect(store.getNode('A')?.data.collapsed).toBe(true);

        history.undo();
        expect(store.getNode('A')?.data.collapsed).toBe(false);

        history.redo();
        expect(store.getNode('A')?.data.collapsed).toBe(true);
    });
});
