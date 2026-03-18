<script>
	let { titulo, onclick, children, ...rest } = $props();
</script>

<button
	class="group relative h-10 w-full rounded-md hover:bg-zinc-700/40 max-sm:w-10 xl:z-50"
	{onclick}
	{...rest}
>
	{@render children?.()}

	<span
		class="absolute top-1 z-10 ml-6 -translate-x-20 scale-0 rounded-md border border-zinc-700 bg-zinc-800 p-4 py-1 font-mono text-sm text-nowrap transition-all group-hover:translate-x-0 group-hover:scale-100 group-hover:delay-300 max-sm:hidden"
		>{titulo}</span
	>
</button>
