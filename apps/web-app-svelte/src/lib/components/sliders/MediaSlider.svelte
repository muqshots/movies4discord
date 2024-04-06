<script lang="ts">
	import { throttle } from 'throttle-debounce';
	import { writable } from 'svelte/store';
	import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'svelte-icons-pack/hi';
	import { Icon } from 'svelte-icons-pack';
	import type { MediaThumbnailProps } from '$lib/interfaces/media.ts';
	import MediaThumbnail from '$lib/components/misc/MediaThumbnail.svelte';
	import ShimmerThumbnail from '$lib/components/misc/ShimmerThumbnail.svelte';

	let slider: HTMLDivElement;
	let scrollDetails = writable({ left: false, right: true });

	export let text: string, media: MediaThumbnailProps[];

	const onScroll = ({
		currentTarget
	}: UIEvent & { currentTarget: EventTarget & HTMLDivElement }) => {
		const tg = currentTarget;
		if (
			(tg.scrollLeft !== 0) !== $scrollDetails.left ||
			(tg.scrollWidth - tg.clientWidth !== tg.scrollLeft) !== $scrollDetails.right
		) {
			$scrollDetails.right = tg.scrollWidth - tg.clientWidth !== tg.scrollLeft;
			$scrollDetails.left = tg.scrollLeft !== 0;
		}
	};
</script>

<div class="relative mr-2 flex flex-col gap-4">
	<span class="text-2xl font-light md:text-3xl">{text}</span>
	<hr />
	<div
		bind:this={slider}
		on:scroll={throttle(500, (e) => {
			onScroll(e);
		})}
		class="-m-2 flex snap-x scroll-p-2 flex-row gap-6 overflow-x-auto p-2 scrollbar-hide"
	>
		{#if media}
			{#each media as item}
				<MediaThumbnail props={item} />
			{/each}
		{:else}
			{#each [...Array(10)] as { }}
				<ShimmerThumbnail />
			{/each}
		{/if}
	</div>

	<div
		class={`${
			$scrollDetails.left ? 'flex' : 'hidden'
		} absolute top-4 h-full flex-col justify-center`}
	>
		<Icon
			src={HiOutlineChevronLeft}
			className="h-6 w-6 cursor-pointer"
			on:click={() => slider.scrollBy({ left: -600, behavior: 'smooth' })}
		/>
	</div>
	<div
		class={`${
			$scrollDetails.right ? 'flex' : 'hidden'
		} absolute top-4 right-0 h-full flex-col justify-center`}
	>
		<Icon
			src={HiOutlineChevronRight}
			className="h-6 w-6 cursor-pointer"
			on:click={() => slider.scrollBy({ left: 600, behavior: 'smooth' })}
		/>
	</div>
</div>
