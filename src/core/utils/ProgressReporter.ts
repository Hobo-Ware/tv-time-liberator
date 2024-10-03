export type ProgressReport = {
    value: {
        current: number;
        previous: number;
    };
    total: number;
    message: string;
};

export type ProgressCallback = (report: ProgressReport) => void;

export class ProgressReporter {
    private _progress = 0;
    private _previous = 0;

    constructor(
        private _total: number,
        private _onProgress: ProgressCallback,
    ) { }

    increment(by: number) {
        this._progress += by;
    }

    report(message: string) {
        const current = this._progress / this._total;

        this._onProgress({
            value: {
                current,
                previous: this._previous,
            },
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