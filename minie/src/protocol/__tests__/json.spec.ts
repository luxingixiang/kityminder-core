import { describe, it, expect } from 'vitest';
import { TreeStore } from '@core/models/TreeStore';
import { exportToJSON, importFromJSON, type ProtocolTree } from '@core/protocol/json';

const createStore = () => {
    const store = new TreeStore({ id: 'root', text: '中心' });
    store.addNode('root', { id: 'A', text: 'A' });
    const b = store.addNode('root', { id: 'B', text: 'B' });
    store.addNode(b.data.id, { id: 'B-1', text: 'B-1' });
    return store;
};

describe('json protocol adapter', () => {
    it('exports store to protocol tree structure', () => {
        const store = createStore();
        const json = exportToJSON(store);

        expect(json.root.data.id).toBe('root');
        expect(json.root.children?.length).toBe(2);
        expect(json.root.children?.[1].children?.[0].data.id).toBe('B-1');
    });

    it('imports protocol tree into TreeStore preserving order', () => {
        const store = createStore();
        const exported = exportToJSON(store);
        const restored = importFromJSON(exported);

        const rootChildren = restored.root.children.map(n => n.data.id);
        expect(rootChildren).toEqual(['A', 'B']);
        expect(restored.getNode('B-1')).not.toBeNull();
        expect(restored.getNode('A')?.parent?.data.id).toBe('root');
    });

    it('rejects duplicate ids during import', () => {
        const duplicated: ProtocolTree = {
            root: {
                data: { id: 'root' },
                children: [
                    { data: { id: 'x' } },
                    { data: { id: 'x' } }
                ]
            }
        };
        expect(() => importFromJSON(duplicated)).toThrow(/重复的节点 id/);
    });

    it('preserves collapsed flag through export and import', () => {
        const store = createStore();
        store.toggleCollapse('B', true);

        const exported = exportToJSON(store);
        expect(exported.root.children?.[1].data.collapsed).toBe(true);

        const restored = importFromJSON(exported);
        expect(restored.getNode('B')?.data.collapsed).toBe(true);
    });
});
