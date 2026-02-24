import { describe, it, expect } from 'vitest';
import { HistoryStack, type Command } from '@core/commands/history';

describe('HistoryStack', () => {
    it('executes, undoes, and redoes commands', () => {
        let value = 0;
        const history = new HistoryStack();
        const inc: Command = {
            name: 'inc',
            execute: () => { value += 1; },
            undo: () => { value -= 1; }
        };

        history.execute(inc);
        expect(value).toBe(1);
        expect(history.canUndo()).toBe(true);

        history.undo();
        expect(value).toBe(0);
        expect(history.canRedo()).toBe(true);

        history.redo();
        expect(value).toBe(1);
    });

    it('clears redo stack when new command executed after undo', () => {
        let value = 0;
        const history = new HistoryStack();
        const inc = (step: number): Command => ({
            name: `inc-${step}`,
            execute: () => { value += step; },
            undo: () => { value -= step; }
        });

        history.execute(inc(1));
        history.execute(inc(2));
        history.undo();
        expect(value).toBe(1);

        history.execute(inc(3));
        history.redo();
        expect(value).toBe(4);
    });
});
