import { describe, it, expect } from 'vitest';
import { TreeStore } from '@core/models/TreeStore';

const createStore = () => new TreeStore({ id: 'root', text: 'Root' });

describe('TreeStore', () => {
    it('adds child node under parent and prevents duplicate ids', () => {
        const store = createStore();
        const child = store.addNode('root', { id: 'child', text: 'Child' });

        expect(child.parent?.data.id).toBe('root');
        expect(store.root.children).toHaveLength(1);

        expect(() => store.addNode('root', { id: 'child', text: 'Dup' })).toThrow();
    });

    it('removes non-root node and returns it', () => {
        const store = createStore();
        store.addNode('root', { id: 'childA' });
        store.addNode('root', { id: 'childB' });

        const removed = store.removeNode('childA');

        expect(removed.data.id).toBe('childA');
        expect(removed.parent).toBeNull();
        expect(store.root.children.map(n => n.data.id)).toEqual(['childB']);
    });

    it('moves node to another parent respecting index', () => {
        const store = createStore();
        store.addNode('root', { id: 'A' });
        const parentB = store.addNode('root', { id: 'B' });
        store.addNode('A', { id: 'A-1' });
        store.addNode('A', { id: 'A-2' });

        store.moveNode('A-2', 'B', 0);

        expect(parentB.children[0].data.id).toBe('A-2');
        const parentA = store.getNode('A');
        expect(parentA?.children.map(n => n.data.id)).toEqual(['A-1']);
    });

    it('blocks moving node into its descendant', () => {
        const store = createStore();
        store.addNode('root', { id: 'A' });
        store.addNode('A', { id: 'A-1' });

        expect(() => store.moveNode('A', 'A-1')).toThrow();
    });

    it('toggles collapse state with default and explicit values', () => {
        const store = createStore();
        store.addNode('root', { id: 'A' });

        expect(store.getNode('A')?.data.collapsed).toBeUndefined();
        store.toggleCollapse('A');
        expect(store.getNode('A')?.data.collapsed).toBe(true);

        store.toggleCollapse('A', false);
        expect(store.getNode('A')?.data.collapsed).toBe(false);
    });
});
