import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

type CountdownTask = {
    targetTime: number;
    persecondCallback: (remainingSeconds: number) => void;
    endTimerCallback: () => void;
    lastSecond: number;
};

@ccclass('ScheduleExtra')
export class ScheduleExtra extends Component {
    private static Instance: ScheduleExtra;
    protected onLoad() {
        if (ScheduleExtra.Instance == null) {
            ScheduleExtra.Instance = this;
            director.addPersistRootNode(this.node);
        } else if (ScheduleExtra.Instance != this) {
            this.node.destroy();
        }
    }

    private static tasks: CountdownTask[] = [];

    update() {
        const now = Date.now();
        for (let i = ScheduleExtra.tasks.length - 1; i >= 0; i--) {
            const task = ScheduleExtra.tasks[i];
            const remaining = Math.max(0, (task.targetTime - now) / 1000);

            const floored = Math.floor(remaining);
            if (floored !== task.lastSecond) {
                task.lastSecond = floored;
                task.persecondCallback?.(remaining); // 傳原始浮點秒數
            }

            if (remaining <= 0) {
                task.endTimerCallback?.();
                ScheduleExtra.tasks.splice(i, 1);
            }
        }
    }

    /**
     * 修改版ScheduleOnce
     * @param seconds 延遲幾秒
     * @param persecondCallback 每一秒做一次
     * @param endTimerCallback 最後做一次
     */
    static StartCountdown(seconds: number, persecondCallback: (remainingSeconds: number) => void, endTimerCallback: () => void) {
        const newTask: CountdownTask = {
            targetTime: Date.now() + seconds * 1000,
            persecondCallback,
            endTimerCallback,
            lastSecond: -1
        };
        this.tasks.push(newTask);
    }
}