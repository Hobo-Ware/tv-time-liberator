<script>
	export let progress = 0;
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
	}
</style>

<div class="progress-bar">
	<div class="progress" style="width: {progress}%"></div>
</div>

