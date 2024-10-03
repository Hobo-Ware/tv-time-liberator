<script lang="ts">
  import ProgressBar from "../components/ProgressBar.svelte";
  import Button from "../components/Button.svelte";
  import { Observable, switchMap, merge, defer, from, map, timer } from "rxjs";
  import { extract } from "../request/emissions/extract";
  import { verifyAuthorization } from "../request/topic/verifyAuthorization";
  import { Topic } from "../request/topic/Topic";
  import { listener } from "../request/listener/listener";
  import type { ProgressReport } from "../../../core/utils/ProgressReporter";
  import { currentProgress } from "../request/emissions/currentProgress";

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

  const isLiberationInProgress$ = progress$.pipe(
    map((report) => !!report.message && !isNaN(report.total)),
  );
</script>

<div>
  <h1>TV Time Liberator</h1>

  {#if $isLiberationInProgress$}
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
    {#if !$isLiberationInProgress$}
      Liberate
    {:else}
      {($progress$?.value?.current * 100).toFixed(2)}%...
    {/if}
  </Button>

  <div
    class="progress-container"
    style:opacity={!$isLiberationInProgress$ ? 0 : 1}
  >
    <span class="progress-report-message">{$progress$?.message}</span>
    <ProgressBar progress={$progress$?.value?.current * 100} />
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

  .progress-container {
    height: 2em;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
  }
</style>
