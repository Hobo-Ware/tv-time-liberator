import { describe, it, expect, mock } from 'bun:test';
import { ProgressReporter } from './ProgressReporter';

describe('ProgressReporter', () => {
    it('should report progress', () => {
        const onProgress = mock();
        const reporter = new ProgressReporter(
            10,
            onProgress,
        );

        reporter.increment(1);
        reporter.report('First step');

        expect(onProgress).toHaveBeenCalledWith({
            value: {
                current: 0.1,
                previous: 0,
            },
            total: 10,
            message: 'First step',
        });

        reporter.increment(4);
        reporter.report('Second step');
        expect(onProgress).toHaveBeenCalledWith({
            value: {
                current: 0.5,
                previous: 0.1,
            },
            total: 10,
            message: 'Second step',
        });

        reporter.increment(5);
        reporter.done('Third step');
        expect(onProgress).toHaveBeenCalledWith({
            value: {
                current: 1,
                previous: 0.5,
            },
            total: 10,
            message: 'Third step',
        });
    });

    it('should complete if done is called', () => {
        const onProgress = mock();
        const reporter = new ProgressReporter(
            10,
            onProgress,
        );

        reporter.increment(5);
        reporter.done('Done');

        expect(onProgress).toHaveBeenCalledWith({
            value: {
                current: 1,
                previous: 0,
            },
            total: 10,
            message: 'Done',
        });
    });
});