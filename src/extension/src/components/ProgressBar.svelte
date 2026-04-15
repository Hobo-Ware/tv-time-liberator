<script lang="ts">
	interface Props {
		progress?: number;
		success?: boolean;
	}

	let { progress = 0, success = false }: Props = $props();
</script>

<style>
	.progress-bar {
		background-color: #cacaca;
		border-radius: 4px;
		width: 90%;
		height: .6em;
		overflow: hidden;
	}

	.progress {
		background-color: #ff013c;
		height: 100%;
		transition: background-color 0.6s ease, width 0.3s ease;
	}

	.progress.success {
		background-color: #00c06f;
	}
</style>

<div class="progress-bar">
	<div class="progress" class:success style="width: {progress}%"></div>
</div>

