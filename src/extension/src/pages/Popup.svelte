<script lang="ts">
  import { defer, from, map, merge, Observable, switchMap, timer } from "rxjs";
  import type { ProgressReport } from "../../../core/utils/ProgressReporter";
  import Button from "../components/Button.svelte";
  import ProgressBar from "../components/ProgressBar.svelte";
  import { currentProgress } from "../request/emissions/currentProgress";
  import { extract } from "../request/emissions/extract";
  import { listener } from "../request/listener/listener";
  import { Topic } from "../request/topic/Topic";
  import { verifyAuthorization } from "../request/topic/verifyAuthorization";

  const isAuthorized$ = timer(0, 1000).pipe(
    switchMap(() => verifyAuthorization()),
  );

  const progressListener$ = from(
    new Observable<ProgressReport>((observer) =>
      listener(Topic.Progress, (report) => {
        observer.next(report);
      }),
    ),
  );

  const progress$ = merge(
    defer(() => from(currentProgress())),
    progressListener$,
  );

  const isDone$ = progress$.pipe(
    map((report) => !!report?.done),
  );

  const isLiberationInProgress$ = progress$.pipe(
    map((report) => !!report.message && !isNaN(report.total) && !report.done),
  );
</script>

<div>
  <h1>TV Time Liberator</h1>

  {#if $isDone$}
    <label for="button">Liberation complete! Your data is free. 🎉</label>
  {:else if $isLiberationInProgress$}
    <label for="button">Liberation is in progress... </label>
  {:else if $isAuthorized$}
    <label for="button">Liberation is one click away 👇</label>
  {:else}
    <label for="button">Log into TV Time to liberate your data!</label>
  {/if}

  <Button
    disabled={!$isAuthorized$ || $isLiberationInProgress$}
    on:click={extract}
  >
    {#if $isDone$}
      Liberate again
    {:else if !$isLiberationInProgress$}
      Liberate
    {:else}
      {($progress$?.value?.current * 100).toFixed(2)}%...
    {/if}
  </Button>

  <div
    class="progress-container"
    style:opacity={!$isLiberationInProgress$ && !$isDone$ ? 0 : 1}
  >
    {#if $isDone$}
      <a
        class="trakt-tip"
        href="https://app.trakt.tv/settings/data?mode=media"
        target="_blank"
        rel="noreferrer"
      >
        💡 Try importing <code>activity_history.csv</code> into Trakt →
      </a>
    {:else}
      <span class="progress-report-message">
        Estimated time: {$progress$?.estimated}s
      </span>
    {/if}
    <span class="progress-report-message">{$progress$?.message}</span>
    <ProgressBar progress={$progress$?.value?.current * 100} success={$isDone$} />
  </div>
</div>

<style>
  .progress-report-message {
    font-family: "Courier New", Courier, monospace;

    max-width: 90%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .trakt-tip {
    font-family: "Courier New", Courier, monospace;
    color: #9f42c6;
    text-decoration: none;
    max-width: 90%;
    text-align: center;
  }

  .trakt-tip:hover {
    text-decoration: underline;
  }

  .trakt-tip code {
    font-family: inherit;
    font-weight: bold;
  }

  .progress-container {
    height: 5em;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
</style>
