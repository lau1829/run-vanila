<script>
	import { logs, Ajustes } from '$lib/conponentes/editor/app';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';

	let { onOpenConsole } = $props();
	let lastLogCount = 0;

	// Función para mostrar notificación según el tipo de log
	function showNotification(log) {
		if ($Ajustes.consoleNotifications !== 'on') return;

		const message = Array.isArray(log.args) 
			? log.args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ')
			: String(log.args);

		const truncatedMessage = message.length > 100 
			? message.substring(0, 100) + '...' 
			: message;

		const toastOptions = {
			duration: 4000,
			onClick: () => {
				if (onOpenConsole) onOpenConsole();
			},
			style: 'cursor: pointer;'
		};

		if (log.type === 'error') {
			toast.error(truncatedMessage, {
				...toastOptions,
				description: 'Click para abrir consola'
			});
		} else if (log.type === 'warn') {
			toast.warning(truncatedMessage, {
				...toastOptions,
				description: 'Click para abrir consola'
			});
		} else {
			toast.info(truncatedMessage, {
				...toastOptions,
				description: 'Click para abrir consola'
			});
		}
	}

	// Observar cambios en los logs
	$effect(() => {
		const currentLogs = $logs;
		
		if (currentLogs.length > lastLogCount) {
			// Mostrar notificación solo para el último log agregado
			const newLog = currentLogs[currentLogs.length - 1];
			showNotification(newLog);
		}
		
		lastLogCount = currentLogs.length;
	});
</script>
