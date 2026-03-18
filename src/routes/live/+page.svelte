<script>
	import { src } from '$lib/conponentes/editor/app';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	// onMount(() => {
	// 	const code = $page.url.searchParams.get('code');
	// 	if (!code) {
	// 		goto('/');
	// 		return;
	// 	}
	// });
</script>

<div class="flex h-dvh w-dvw overflow-hidden bg-white">
	<!-- Main Preview Area -->
	<div class="relative h-full flex-1">
		<iframe srcdoc={$src} title="Live Preview" class="h-full w-full border-none bg-white"></iframe>
	</div>
</div>
