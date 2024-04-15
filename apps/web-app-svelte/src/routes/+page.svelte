<script lang="ts">
	import {sidebarState} from "$lib/stores/misc"
	import type { PageData } from './$types';
	import Recommendations from "$lib/components/sliders/Recommendations.svelte"

	export let data: PageData;
</script>

<svelte:head>
	<title>Movies4Discord</title>
	<meta name="description" content="🚀Watch all your media in one place!🚀" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content="Movies4Discord" />
	<meta
		property="og:description"
		content="🚀Watch all your media in one place!🚀"
	/>
	<meta property="og:url" content="https://movies4discord.xyz/" />
	<meta
		property="og:image"
		content="https://movies4discord.xyz/logo.png"
	/>
</svelte:head>

<div class="mx-3 flex flex-col gap-8">
	{#each data.sliders as slider}
	<div class="relative mr-2 flex flex-col gap-4">
		<span class="text-2xl font-light md:text-3xl">{slider.text}</span>
		<hr />
		<Recommendations media={slider.media} />
	  </div>
	{/each}
	<!-- {data.sliders.map((slider, i) => (
	  
	))} -->

	<!-- <ContinueWatching /> -->
  </div>
