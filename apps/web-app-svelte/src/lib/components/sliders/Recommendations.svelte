<script lang="ts">
	import { throttle } from 'throttle-debounce';
	import { writable } from 'svelte/store';
	import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'svelte-icons-pack/hi';
	import { BiSolidStar } from "svelte-icons-pack/bi";
	import { Icon } from 'svelte-icons-pack';
	import type { MediaThumbnailProps } from '$lib/interfaces/media.ts';

	let slider: HTMLDivElement;
	let scrollDetails = writable({ left: false, right: true });

	export let media: MediaThumbnailProps[];

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
	<div
		class="scrollbar-hide flex snap-x snap-mandatory flex-row gap-6 overflow-x-auto pt-2"
		bind:this={slider}
		on:scroll={throttle(500, (e) => {
			onScroll(e);
		})}
	>
		{#if media.length > 0}
			{#each media as item}
				<a href={`/${item.media_type}/${item.id}`}>
					<div class="snap-start">
						<div class="flex flex-col gap-2">
							<div
								class="shrink-0 rounded-lg border-2 border-transparent shadow-md shadow-darktheme transition duration-200 hover:scale-105 hover:border-white hover:shadow-white w-[160px]"
							>
								<img
									src={item.image.src}
									width={160}
									height={90}
									sizes="(min-width: 768px) 320px, 240px"
									class="rounded-lg"
									alt={`${item.title} backdrop`}
								/>
							</div>
							<div class="flex max-w-[160px] flex-col">
								<div class="truncate whitespace-nowrap" title={item.title}>{item.title}</div>
								<div class="flex flex-row justify-between text-sm text-gray-400">
									<div>{item.release_date?.slice(0, 4) ?? 'Unknown year'}</div>
									<div class="flex flex-row gap-1">
										{item.rating?.toFixed(1) ?? 'N/A'}
										<Icon src={BiSolidStar} className="h-4 w-4 fill-gray-400 mt-[0.095rem]" />
									</div>
								</div>
							</div>
						</div>
					</div>
				</a>
			{/each}
		{:else}
			No recommendations for this movie
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
