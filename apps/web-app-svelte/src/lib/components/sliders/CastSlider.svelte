<script lang="ts">
	interface CastSliderProps {
		name: string;
		id: number;
		image: string | null;
		character: string;
	}

	export let cast: CastSliderProps[];
</script>

<div class="scrollbar-hide flex snap-x snap-mandatory flex-row gap-6 overflow-x-auto">
	{#if cast.length > 0}
		{#each cast as p}
			<a href={`/comrade/${p.id}`}>
				<div class="snap-start">
					<div class="flex flex-col gap-2">
						<div class="rounded-lg w-[160px]">
							<img
								src={p.image || '/PortraitPlaceholder.png'}
								width={160}
								height={240}
								class="rounded-lg"
								alt={`${p.name} pic`}
							/>
						</div>
						<div class="flex max-w-[160px] flex-col">
							<div class="truncate whitespace-nowrap" title={p.name}>{p.name}</div>
							<div class="text-sm text-gray-500" title={p.character}>{p.character}</div>
						</div>
					</div>
				</div>
			</a>
		{/each}
	{/if}
</div>
