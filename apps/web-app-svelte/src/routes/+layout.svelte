<script>
	import '../app.css';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import Header from '$lib/components/Header.svelte';
	import { sidebarState } from '$lib/stores/misc';
</script>

<div>
	<main class="bg-theme text-white scrollbar-hide">
		<Sidebar />
		<div class={`${$sidebarState ? 'md:ml-52' : 'md:ml-20'} ml-0 transition-all  duration-200`}>
			<Header />
			<div class="mb-8">
				<slot />
			</div>
		</div>
	</main>
</div>
