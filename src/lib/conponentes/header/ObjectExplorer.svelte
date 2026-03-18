<script>
	let { value, name = '', open = false } = $props();

	let isOpen = $state(open);
	let isObject = $derived(value !== null && typeof value === 'object');
	let isArray = $derived(Array.isArray(value));
	let displayType = $derived(isArray ? `Array(${value.length})` : '');
	let isEmpty = $derived(isObject && Object.keys(value).length === 0);

	function toggle() {
		if (isObject && !isEmpty) {
			isOpen = !isOpen;
		}
	}
</script>

<div class="font-mono text-xs leading-5">
	{#if isObject}
		<div class="flex items-start">
			{#if !isEmpty}
				<button onclick={toggle} class="mt-1 mr-1">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						class="size-3 text-neutral-500 transition-transform {isOpen ? 'rotate-90' : 'rotate-0'}"
					>
						<path d="m9 18 6-6-6-6" />
					</svg>
				</button>
			{:else}
				<span class="mr-4"></span>
			{/if}

			<span class="mr-1 text-purple-400">{name}{name ? ':' : ''}</span>

			{#if !isOpen}
				<span onclick={toggle} class="cursor-pointer text-neutral-400 hover:text-neutral-300">
					{displayType}
					{#if isArray}
						[{#each value.slice(0, 3) as item, i}
							{#if i > 0},
							{/if}
							{typeof item === 'object' ? '{...}' : JSON.stringify(item)}
						{/each}{value.length > 3 ? ', ...' : ''}]
					{:else}
						{'{...}'}
					{/if}
				</span>
			{/if}
		</div>

		{#if isOpen}
			<div class="ml-4 border-l border-neutral-700/50 pl-2">
				{#each Object.entries(value) as [key, val]}
					<svelte:self name={key} value={val} />
				{/each}
			</div>
		{/if}
	{:else}
		<div class="flex items-start pl-4">
			{#if name}
				<span class="mr-1 text-purple-400">{name}:</span>
			{/if}
			{#if typeof value === 'string'}
				<span class="text-green-400">"{value}"</span>
			{:else if typeof value === 'number'}
				<span class="text-blue-400">{value}</span>
			{:else if typeof value === 'boolean'}
				<span class="text-yellow-400">{value}</span>
			{:else if value === null}
				<span class="text-neutral-500">null</span>
			{:else if value === undefined}
				<span class="text-neutral-500">undefined</span>
			{:else}
				<span class="text-neutral-300">{value}</span>
			{/if}
		</div>
	{/if}
</div>
