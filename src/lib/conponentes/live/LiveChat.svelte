<script>
	import { isChatOpen, chatHistory } from '$lib/stores/live';
	import { sendMessageToGroq } from '$lib/services/ai';
	import { html, css, js, compilar } from '$lib/conponentes/editor/app';
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let input = $state('');
	let chatContainer = $state();
	let isLoading = $state(false);

	function openInEditor() {
		const code = $page.url.searchParams.get('code');
		goto(`/?code=${code || ''}`);
	}

	async function sendMessage() {
		if (!input.trim()) return;

		// User message
		const userMsg = input;
		chatHistory.update((h) => [...h, { role: 'user', content: userMsg, timestamp: Date.now() }]);
		input = '';
		isLoading = true;

		await tick();
		scrollToBottom();

		try {
			// Prepared messages for API
			const apiMessages = $chatHistory
				.filter((m) => m.role !== 'system') // Filter out local system msgs if any
				.map((m) => ({ role: m.role, content: m.content }));

			let currentMessage = '';

			// Callback for streaming chunks
			const onChunk = (chunk, fullContent) => {
				isLoading = false; // Stop loading animation as soon as we get data

				// Try to extract the "message" field content from the growing JSON
				const match = fullContent.match(/"message":\s*"(.*?)(?:")?/s);
				if (match && match[1]) {
					const newMsg = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');

					chatHistory.update((h) => {
						const last = h[h.length - 1];
						if (last.role === 'assistant') {
							return [...h.slice(0, -1), { ...last, content: newMsg }];
						} else {
							return [...h, { role: 'assistant', content: newMsg, timestamp: Date.now() }];
						}
					});
					scrollToBottom();
				}
			};

			const responseContent = await sendMessageToGroq(apiMessages);

			try {
				const data = JSON.parse(responseContent);

				if (data.message) {
					chatHistory.update((h) => {
						const last = h[h.length - 1];
						if (last.role === 'assistant') {
							return [...h.slice(0, -1), { ...last, content: data.message }];
						} else {
							return [...h, { role: 'assistant', content: data.message, timestamp: Date.now() }];
						}
					});
				}

				// Handle code changes immediately
				if (data.changes && Array.isArray(data.changes) && data.changes.length > 0) {
					data.changes.forEach((change) => {
						let cleanCode = change.code.replace(/```[a-z]*\n/gi, '').replace(/```/g, '');

						console.log('Aplicando cambio inmediato:', change.file);
						const f = change.file.toLowerCase();

						if (f.includes('html')) html.set(cleanCode);
						else if (f.includes('css')) css.set(cleanCode);
						else if (f.includes('js') || f.includes('script')) js.set(cleanCode);
						else console.warn('Tipo de archivo desconocido:', change.file);
					});
					// Trigger compilation once after all changes
					compilar();
				}
			} catch (e) {
				console.error('Failed to parse AI response:', e);
				console.log('Raw response content:', responseContent);

				if (responseContent && responseContent.trim().length > 0) {
					chatHistory.update((h) => {
						const last = h[h.length - 1];
						if (last.role === 'assistant') {
							return h;
						} else {
							return [...h, { role: 'assistant', content: responseContent, timestamp: Date.now() }];
						}
					});
				} else {
					chatHistory.update((h) => [
						...h,
						{
							role: 'assistant',
							content: 'Error: Empty or invalid response from AI.',
							timestamp: Date.now()
						}
					]);
				}
			}
		} catch (error) {
			chatHistory.update((h) => [
				...h,
				{ role: 'assistant', content: `Error: ${error.message}`, timestamp: Date.now() }
			]);
		} finally {
			isLoading = false;
			await tick();
			scrollToBottom();
		}
	}

	function scrollToBottom() {
		if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
	}

	function formatDate(ts) {
		return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<!-- Static Layout (No fixed/fly) -->
<div
	class="flex h-full w-96 flex-col border-l border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
>
	<!-- Header -->
	<header class="flex flex-col gap-2 border-b border-zinc-100 p-4 dark:border-zinc-800">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<div
					class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg
					>
				</div>
				<h2 class="font-serif text-lg font-medium text-zinc-800 dark:text-zinc-100">Copilot</h2>
			</div>

			<div class="flex items-center gap-2">
				<!-- Open in Editor Button -->
				<button
					class="rounded-full p-2 text-zinc-500 hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
					onclick={openInEditor}
					title="Abrir en Editor"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"
						></path></svg
					>
				</button>

				<button
					class="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
					onclick={() => isChatOpen.set(false)}
					aria-label="Cerrar chat"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"
						></line></svg
					>
				</button>
			</div>
		</div>
	</header>

	<!-- Messages -->
	<div bind:this={chatContainer} class="flex-1 space-y-6 overflow-y-auto p-4">
		{#each $chatHistory as msg}
			<div class="flex flex-col gap-1 {msg.role === 'user' ? 'items-end' : 'items-start'}">
				<div
					class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
					{msg.role === 'user'
						? 'rounded-br-sm bg-blue-600 text-white'
						: 'rounded-bl-sm border border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'}"
				>
					{msg.content}
				</div>
				<span class="text-[10px] text-zinc-400">{formatDate(msg.timestamp)}</span>
			</div>
		{/each}

		{#if isLoading}
			<div class="flex items-start gap-2">
				<div class="flex space-x-1 rounded-2xl bg-zinc-50 px-4 py-3 dark:bg-zinc-900">
					<div class="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-0"></div>
					<div class="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-150"></div>
					<div class="h-2 w-2 animate-bounce rounded-full bg-zinc-400 delay-300"></div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Input -->
	<div class="border-t border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
		<div class="relative flex items-center">
			<input
				type="text"
				bind:value={input}
				onkeydown={(e) => e.key === 'Enter' && sendMessage()}
				placeholder="Describe los cambios..."
				class="w-full rounded-full border border-zinc-200 bg-zinc-50 py-3 pr-12 pl-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
			/>
			<button
				class="absolute right-2 rounded-full p-1.5 text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
				onclick={sendMessage}
				disabled={!input.trim()}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"
					></polygon></svg
				>
			</button>
		</div>
	</div>
</div>
