<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<script lang="ts">
	import type { MediaThumbnailProps } from '$lib/interfaces/media.ts';
	import { Icon } from 'svelte-icons-pack';
	import { BsTvFill } from 'svelte-icons-pack/bs';
	import { BiSolidMovie } from 'svelte-icons-pack/bi';
	import { RiSystemDeleteBin5Fill } from 'svelte-icons-pack/ri';
	import { HiSolidStar } from 'svelte-icons-pack/hi';

	const MediaTypeLogos = {
		movie: BiSolidMovie,
		tv: BsTvFill
	};

	export let props: MediaThumbnailProps;
</script>

<div class="snap-start">
	<a href={!props.onClick ? `/${props.media_type}/${props.id}` : ''} on:click={props.onClick}>
		<div class="flex cursor-pointer flex-col gap-2">
			<div
				class="relative aspect-video w-[244px] shrink-0 rounded-lg border-2 border-transparent shadow-md shadow-darktheme transition duration-200 hover:scale-105 hover:border-white hover:shadow-white md:w-[324px]"
			>
				<!-- {...getImageData(props.image.src || LandscapePlaceholder, props.image.b64)} -->
				<img
					src={props.image.src}
					width={160}
					height={90}
					sizes="(min-width: 768px) 320px, 240px"
					class="rounded-lg"
					alt={`${props.title} backdrop`}
				/>
				{#if props.onDelete}
					<div
						on:click={(e) => {
							e.stopPropagation();
							e.preventDefault();
							//   ky.delete('/api/history', {
							//     searchParams: {
							//       media_type: props.media_type,
							//       tmdbId: props.id,
							//       tvdbId: props.tvdbId ? props.tvdbId : 0,
							//       season: props.season ? props.season : 0,
							//       episode: props.episode ? props.episode : 0
							//     }
							//   }).then(() => props.onDelete());
						}}
						class="absolute top-0 right-0 bg-white text-black rounded-full p-2 m-2 transition-all duration-200 hover:scale-105 hover:bg-red-600 hover:text-white"
					>
						<Icon src={RiSystemDeleteBin5Fill} className="h-[1.125rem] w-[1.125rem]" />
					</div>
				{/if}
				{#if props.percentage}
					<div class="absolute bottom-0 h-1 w-full rounded-b-lg bg-gray-700">
						<div style={`width: ${props.percentage}%`} class="h-full rounded-bl-lg bg-red-600" />
					</div>
				{/if}
			</div>

			<div class="flex flex-col">
				<div class="flex w-60 flex-row justify-between md:w-80">
					<div class="w-10/12 truncate" title={props.title}>{props.title}</div>
					<Icon src={MediaTypeLogos[props.media_type]} className="h-5 w-5 text-gray-400" />
				</div>

				<div class="flex flex-row justify-between text-sm text-gray-400">
					<div>{props.release_date?.slice(0, 4) ?? 'Unknown year'}</div>
					<div class="flex flex-row gap-1">
						<div>{props.rating.toFixed(1)}</div>
						<Icon src={HiSolidStar} className="h-5 w-5" />
					</div>
				</div>
			</div>
		</div>
	</a>
</div>
