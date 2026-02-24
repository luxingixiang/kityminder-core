export interface Command {
    name: string;
    execute(): void;
    undo(): void;
}

export class HistoryStack {
    private stack: Command[] = [];
    private pointer = -1;

    execute(command: Command) {
        // 清理“未来”分支
        // 如果在历史中间执行新命令，丢弃之后的所有命令
        if (this.pointer < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.pointer + 1);
        }
        command.execute();
        // 把新命令推入栈中
        this.stack.push(command);
        // 更新指针指向最新命令
        this.pointer = this.stack.length - 1;
    }

    // 撤销当前指针指向的命令，然后指针前移。
    undo() {
        if (!this.canUndo()) return;
        const command = this.stack[this.pointer];
        command.undo();
        this.pointer -= 1;
    }

    // 重做当前指针的下一个命令，然后指针后移。
    redo() {
        if (!this.canRedo()) return;
        const command = this.stack[this.pointer + 1];
        command.execute();
        this.pointer += 1;
    }

    // 完全重置状态。
    clear() {
        this.stack = [];
        this.pointer = -1;
    }

    canUndo() {
        return this.pointer >= 0;
    }

    canRedo() {
        return this.pointer < this.stack.length - 1;
    }
}
