<script lang="ts">
  import Button from "../components/Button.svelte";
  import { extract } from "../request/topic/extract";
  import { verifyAuthorization } from "../request/topic/verifyAuthorization";

  let isAuthorized = false;

  async function checkAuthorization() {
    isAuthorized = await verifyAuthorization();
  }

  checkAuthorization();
  setInterval(checkAuthorization, 1000);
</script>

<div>
  <h1>TV Time Liberator</h1>

  <Button isDisabled={!isAuthorized} on:click={extract}>Liberate</Button>

  {#if isAuthorized}
    <label for="button">Liberation is one click away 👆</label>
  {:else}
    <label for="button">Log into TV Time to liberate your data!</label>
  {/if}
</div>

<style>
</style>
