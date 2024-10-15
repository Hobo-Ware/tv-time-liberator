import create from 'simple-eta';

export type ProgressReport = {
    value: {
        current: number;
        previous: number;
    };
    estimated: number;
    total: number;
    message: string;
};

export type ProgressCallback = (report: ProgressReport) => void;

export class ProgressReporter {
    private _progress = 0;
    private _previous = 0;
    private _eta = create({ min: 0, max: 1, historyTimeConstant: 5 });

    constructor(
        private _total: number,
        private _onProgress: ProgressCallback,
    ) { }

    increment(by: number) {
        this._progress += by;
    }

    report(message: string) {
        const current = this._progress / this._total;
        this._eta.report(current);
        const eta = this._eta.estimate();

        this._onProgress({
            value: {
                current,
                previous: this._previous,
            },
            estimated: eta === Infinity ? 1 : parseInt(eta.toFixed(0), 10),
            total: this._total,
            message,
        });

        this._previous = current;
    }

    done(message: string) {
        this._progress = this._total;
        this.report(message);
    }
}