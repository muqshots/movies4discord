<script lang="ts">
	import Recommendations from '$lib/components/sliders/Recommendations.svelte';
	import CastSlider from '$lib/components/sliders/CastSlider.svelte';
	import type { PageData } from './$types';
	import Button from '$lib/components/selectables/Button.svelte';
	import { BiSolidStar } from 'svelte-icons-pack/bi';
	import {
		BsPlayFill,
		BsBookmarkCheckFill,
		BsBookmarkDashFill,
		BsBookmarkPlusFill
	} from 'svelte-icons-pack/bs';
	import { Icon } from 'svelte-icons-pack';
	import { signIn } from '@auth/sveltekit/client';
	export let data: PageData;
</script>

<div class="bg-theme pb-10">
	<div class="relative -mt-20 h-[22rem]">
		<img
			src={data.backdrop?.url || '/LandscapePlaceholder.png'}
			class="opacity-[0.7] object-cover object-top w-full h-full"
			alt={`${data.title} backdrop`}
		/>
		{#if data.logoUrl}
			<div
				class="absolute inset-[50%] h-full max-h-[70%] w-full max-w-[75%] translate-x-[-50%] translate-y-[-60%] md:max-w-2xl md:translate-y-[-50%]"
			>
				<img src={data.logoUrl} alt={`${data.title} logo`} class="object-contain w-full h-full" />
			</div>
		{/if}
		<div class="absolute bottom-0 h-8 w-full rounded-t-full bg-theme" />
	</div>

	<div class="mx-3 flex flex-col gap-8 scrollbar-hide md:ml-6">
		<div class="grid gap-8 md:grid-cols-[min-content,auto]">
			<div class="mx-auto -mt-32 aspect-[1/1.5] w-56 rounded-3xl">
				<div class="group relative">
					<img
						src={data.poster?.url || '/PortraitPlaceholder.png'}
						sizes="(min-width: 768px) 288px, 208px"
						alt={`${data.title} poster`}
						class="rounded-3xl"
					/>
					<div
						class="absolute inset-0 flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-3xl bg-black/60 opacity-0 transition duration-200 group-hover:opacity-100"
					>
						<div class="flex flex-col items-center justify-center">
							<!-- <Icon class="h-10 w-10" /> -->
							<div class="text-xl">Trailer</div>
						</div>
					</div>
				</div>
			</div>
			<div class="mb-2 flex flex-col items-center justify-end gap-3 md:items-start">
				<div class="mb-2 text-center text-2xl font-semibold md:text-left md:text-4xl">
					{data.title}
				</div>
				<div class="flex flex-row flex-wrap gap-1">
					{#if data.genres}
						{#each data.genres as genre}
							<Button name={genre.name} url={`/genres/movie/${genre.id}`} selected={false} />
						{/each}
					{/if}
				</div>
				<div class="flex flex-row gap-2 text-sm text-gray-500">
					<div class="flex flex-row gap-1">
						<div>{data.rating?.toFixed(1)}</div>
						<Icon src={BiSolidStar} className="h-4 w-4 fill-gray-500 mt-[0.095rem]" />
					</div>
					<div>|</div>
					<div>
						{data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : '00h00m'}
					</div>
					<div>|</div>
					<div>{data.releaseDate?.slice(0, 4) ?? 'Unknown year'}</div>
				</div>
				<div class="flex flex-row gap-1.5">
					<button
						disabled={data.isAvailable && data.session ? false : true}
						class={`${
							data.isAvailable === true || data.session === null
								? 'hover:bg-white hover:text-black'
								: 'cursor-not-allowed'
						} flex flex-row items-center gap-1 rounded-md bg-graything py-2 px-4 transition duration-200 group`}
						on:click={data.session === null ? () => signIn('discord') : () => {}}
					>
						<Icon className="h-5 w-5 fill-white group-hover:fill-black" src={BsPlayFill} />
						<div class="text-sm">
							{!data.session
								? 'Login'
								: data.isAvailable === true
									? 'Stream'
									: data.isAvailable === false
										? 'Not Available'
										: 'Loading'}
						</div>
					</button>
					<button
						class="flex flex-row items-center gap-1 rounded-md bg-blue-500 py-2 px-4 transition active:bg-blue-600"
						on:click={async () => {
							if (data.session) {
								//   mutate({ isInWatchlist: !inWatchlist }, false);
								//   await ky(
								//     `/api/watchlist?tmdbId=${id}&isShow=${
								//       media_type === "tv"
								//     }`,
								//     {
								//       method: inWatchlist ? "DELETE" : "POST",
								//     }
								//   );
								//   mutate();
							} else {
								signIn('discord');
							}
						}}
					>
						<Icon className="h-[1.125rem] w-[1.125rem]" src={BsBookmarkPlusFill} />
						<div class="text-sm">
							<!-- {inWatchlist ? "Saved" : "Save "} -->
							Save
						</div>
					</button>
					<!-- {extraButton && ExtraButtonIcon && (
          <button
            class={`${
              !extraButton.disabled
                ? "hover:bg-white hover:text-black"
                : "cursor-not-allowed"
            } flex flex-row items-center gap-1 rounded-md bg-graything py-2 px-4 transition duration-200`}
            onClick={extraButton.onClick}
          >
            <ExtraButtonIcon class="h-[1.125rem] w-[1.125rem]" />
            <div class="text-sm">{extraButton.text}</div>
          </button>
        )} -->
				</div>
			</div>
		</div>
		<div class="flex flex-col gap-4">
			<div class="text-4xl font-light">Overview</div>
			<div class="text-gray-500">{data.overview}</div>
			<hr />
			<div class="text-4xl font-light">Cast</div>
			{#if data.cast}
				<CastSlider cast={data.cast} />
			{/if}
			<hr />
			<div class="text-4xl font-light">Recommendations</div>
			{#if data.recommendations}
				<Recommendations media={data.recommendations} />
			{/if}
		</div>
	</div>
</div>
