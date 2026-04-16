<script lang="ts">
  import { catchError, defer, from, map, merge, Observable, of, switchMap, timer } from "rxjs";
  import browser from "webextension-polyfill";
  import type { ProgressReport } from "../../../core/utils/ProgressReporter";
  import Button from "../components/Button.svelte";
  import ProgressBar from "../components/ProgressBar.svelte";
  import { currentProgress } from "../request/emissions/currentProgress";
  import { extract } from "../request/emissions/extract";
  import { listener } from "../request/listener/listener";
  import { Topic } from "../request/topic/Topic";
  import type { ExportFormat } from "../request/topic/TopicPayloadMap";
  import type { AuthStatus } from "../request/topic/verifyAuthorization";
  import { verifyAuthorization } from "../request/topic/verifyAuthorization";

  let exportFormat: ExportFormat = $state('zip');

  type ExtendedAuthStatus = AuthStatus | 'unreachable';

  const authStatus$ = timer(0, 1000).pipe(
    switchMap(() =>
      from(verifyAuthorization()).pipe(
        catchError(() => of('unreachable' as ExtendedAuthStatus)),
      )
    ),
  );

  const isAuthorized$ = authStatus$.pipe(map((s) => s === 'authorized'));
  const isWrongTab$   = authStatus$.pipe(map((s) => s === 'wrong-tab'));
  const isUnreachable$ = authStatus$.pipe(map((s) => s === 'unreachable'));

  const progressListener$ = from(
    new Observable<ProgressReport>((observer) =>
      listener(Topic.Progress, (report) => {
        observer.next(report);
      }),
    ),
  );

  const progress$ = merge(
    defer(() => from(currentProgress()).pipe(catchError(() => of(null)))),
    progressListener$,
  );

  const isDone$ = progress$.pipe(
    map((report) => !!report?.done),
  );

  const isLiberationInProgress$ = progress$.pipe(
    map((report) => !!report?.message && !isNaN(report?.total!) && !report?.done),
  );

  function openTvTime() {
    browser.tabs.create({ url: 'https://app.tvtime.com' });
  }
</script>

<div class="app">
  <header class="header">
    <img src="/icon/icon48.png" alt="" class="logo" />
    <h1 class="title">TV TIME <em>LIBERATOR</em></h1>
  </header>

  <div class="divider"></div>

  <p class="status">
    <span
      class="dot"
      class:idle={!$isAuthorized$ && !$isLiberationInProgress$ && !$isDone$}
      class:ready={!!$isAuthorized$ && !$isLiberationInProgress$ && !$isDone$}
      class:running={!!$isLiberationInProgress$}
      class:done={!!$isDone$}
    ></span>
    {#if $isDone$}
      Your data has been liberated! 🎉
    {:else if $isLiberationInProgress$}
      Liberation in progress...
    {:else if $isAuthorized$}
      Liberation is one click away 👇
    {:else if $isUnreachable$}
      Waiting for page...
    {:else if $isWrongTab$}
      Open TV Time first to get started
    {:else}
      Log into TV Time to liberate your data!
    {/if}
  </p>

  {#if $isWrongTab$ && !$isLiberationInProgress$ && !$isDone$}
    <Button onclick={openTvTime}>
      Open TV Time →
    </Button>
  {:else}
    <Button
      disabled={!$isAuthorized$ || $isLiberationInProgress$}
      onclick={() => extract(exportFormat)}
    >
      {#if $isDone$}
        Liberate again
      {:else if !$isLiberationInProgress$}
        Liberate
      {:else}
        {(($progress$?.value?.current ?? 0) * 100).toFixed(2)}%
      {/if}
    </Button>
  {/if}

  <div class="format-toggle" class:hidden={$isLiberationInProgress$ || $isDone$}>
    <label class:active={exportFormat === 'zip'}>
      <input type="radio" name="format" value="zip" bind:group={exportFormat} />
      ZIP
    </label>
    <label class:active={exportFormat === 'files'}>
      <input type="radio" name="format" value="files" bind:group={exportFormat} />
      Files
    </label>
  </div>

  <div class="progress-section" class:visible={$isLiberationInProgress$ || $isDone$}>
    <ProgressBar progress={($progress$?.value?.current ?? 0) * 100} success={$isDone$} />
    <div class="progress-footer">
      {#if $isDone$}
        <span class="eta done-label">✓ Done!</span>
      {:else}
        <span class="eta">ETA {$progress$?.estimated}s</span>
      {/if}
      <span class="msg">
        {$progress$?.message}
        {#if $progress$?.subMessage}
          <span class="sub-msg">{$progress$.subMessage}</span>
        {/if}
      </span>
    </div>
  </div>

  <a
    class="trakt-link"
    class:pending={!$isDone$}
    href="https://app.trakt.tv/settings/data?source=trakt-csv"
    target="_blank"
    rel="noreferrer"
  >
    {#if $isDone$}
      ▶ Import <code>activity_history.csv</code> into Trakt
    {:else}
      Trakt tip: use <code>activity_history.csv</code> after export finishes
    {/if}
  </a>
</div>

<style>
  .app {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 18px 24px 14px;
    gap: 12px;
  }

  /* ── Header ── */
  .header {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    flex-shrink: 0;
  }

  .logo {
    width: 34px;
    height: 34px;
    border-radius: 6px;
  }

  .title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    font-weight: 400;
    letter-spacing: 3px;
    margin: 0;
    color: #e8e8e8;
    line-height: 1;
  }

  .title em {
    font-style: normal;
    color: #ff013c;
    text-shadow: 0 0 14px rgba(255, 1, 60, 0.55);
  }

  /* ── Divider ── */
  .divider {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, #ff013c 30%, #00e6f6 70%, transparent);
    opacity: 0.35;
    flex-shrink: 0;
  }

  /* ── Status ── */
  .status {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 12px;
    color: #999;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    flex-shrink: 0;
  }

  .dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dot.idle    { background: #333; }
  .dot.ready   { background: #00e6f6; box-shadow: 0 0 6px #00e6f6; }
  .dot.running { background: #f5a623; box-shadow: 0 0 6px #f5a623; animation: pulse 1s ease-in-out infinite; }
  .dot.done    { background: #00c06f; box-shadow: 0 0 6px #00c06f; }
  /* idle covers wrong-tab (dark dot) */

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  /* ── Progress section ── */
  .progress-section {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.4s ease;
    flex-shrink: 0;
  }

  .progress-section.visible {
    opacity: 1;
  }

  .progress-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 11px;
    width: 100%;
  }

  .eta {
    color: #00e6f6;
    flex-shrink: 0;
  }

  .eta.done-label {
    color: #00c06f;
  }

  .msg {
    color: #555;
    overflow: hidden;
    max-width: 72%;
    text-align: right;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1px;
    white-space: nowrap;
  }

  .sub-msg {
    color: #3a3a3a;
    font-size: 10px;
  }

  .trakt-link {
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 11px;
    color: #9f42c6;
    text-decoration: none;
    transition: color 0.2s, opacity 0.3s;
    flex-shrink: 0;
    width: 100%;
    text-align: center;
  }

  .trakt-link.pending {
    color: #7a6b8f;
    opacity: 0.92;
  }

  .trakt-link code {
    font-family: inherit;
    font-weight: bold;
  }

  .trakt-link:hover {
    color: #c060f0;
    text-decoration: underline;
  }

  /* ── Format toggle ── */
  .format-toggle {
    display: flex;
    gap: 6px;
    font-family: 'Share Tech Mono', 'Courier New', monospace;
    font-size: 11px;
  }

  .format-toggle.hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .format-toggle input {
    display: none;
  }

  .format-toggle label {
    padding: 3px 10px;
    border: 1px solid #333;
    border-radius: 3px;
    color: #555;
    cursor: pointer;
    transition: color 0.2s, border-color 0.2s;
    user-select: none;
  }

  .format-toggle label.active {
    color: #00e6f6;
    border-color: #00e6f6;
    text-shadow: 0 0 8px rgba(0, 230, 246, 0.4);
  }
</style>
