<script lang="ts">
	interface Props {
		progress?: number;
		success?: boolean;
	}

	let { progress = 0, success = false }: Props = $props();
</script>

<style>
	.progress-bar {
		background-color: #161616;
		border: 1px solid #2a2a2a;
		border-radius: 2px;
		width: 100%;
		height: 8px;
		overflow: hidden;
	}

	.progress {
		background-color: #ff013c;
		height: 100%;
		transition: background-color 0.6s ease, width 0.3s ease, box-shadow 0.6s ease;
		box-shadow: 0 0 8px #ff013c;
		position: relative;
		overflow: hidden;
	}

	.progress::after {
		content: '';
		position: absolute;
		top: 0;
		left: -40%;
		bottom: 0;
		width: 35%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.35), transparent);
		animation: shimmer 2s infinite linear;
	}

	.progress.success {
		background-color: #00c06f;
		box-shadow: 0 0 10px #00c06f;
	}

	@keyframes shimmer {
		from { left: -40%; }
		to   { left: 110%; }
	}
</style>

<div class="progress-bar">
	<div class="progress" class:success style="width: {progress}%"></div>
</div>

