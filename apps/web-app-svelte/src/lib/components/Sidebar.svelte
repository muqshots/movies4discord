<script lang="ts">
	import { Icon } from 'svelte-icons-pack';
	import { BsTvFill } from 'svelte-icons-pack/bs';
	import { FaBrandsDiscord, FaSolidMoneyBill1 } from 'svelte-icons-pack/fa';
	import { TrOutlineDeviceRemote, TrFillClock  } from 'svelte-icons-pack/tr';
	import { BiSolidMovie, BiSolidBookBookmark, BiSolidHome, BiWifi   } from 'svelte-icons-pack/bi';
	import { page } from '$app/stores';
    import {writable} from 'svelte/store'
    import {sidebarState} from "$lib/stores/misc"
	const SidebarItems = [
		{
			icon: BiSolidHome,
			text: 'Home',
			link: '/',
			isCurrent: (asPath: string) => asPath === '/'
		},
		{
			icon: BiSolidMovie,
			text: 'Movies',
			link: `/genres/movie/${/*movieGenres[0]!.id*/ ''}`,
			isCurrent: (asPath: string) => asPath.startsWith('/genres/movie')
		},
		{
			icon: BsTvFill,
			text: 'TV',
			link: `/genres/tv/${/*tvGenres[0]!.id*/ ''}`,
			isCurrent: (asPath: string) => asPath.startsWith('/genres/tv')
		},
		{
			icon: BiSolidBookBookmark,
			text: 'Watchlist',
			link: '/watchlist',
			isCurrent: (asPath: string) => asPath === '/watchlist'
		},
		{
			icon: TrFillClock,
			text: 'History',
			link: '/history',
			isCurrent: (asPath: string) => asPath === '/history'
		},
		{
			icon: TrOutlineDeviceRemote,
			text: 'Android TV',
			link: '/M4DTV.apk',
			isCurrent: (asPath: string) => asPath.startsWith('/download')
		},
		{
			icon: BiWifi,
			text: 'Connect',
			link: '/connect',
			isCurrent: (asPath: string) => asPath.startsWith('/connect')
		},
		{
			icon: FaSolidMoneyBill1,
			text: 'Donate',
			link: '/donate',
			isCurrent: (asPath: string) => asPath.startsWith('/donate')
		},
		{
			icon: FaBrandsDiscord,
			text: 'Discord',
			link: 'https://discord.movies4discord.xyz',
			isCurrent: (asPath: string) => false
		}
	];

</script>

<div>
	<!--  Dark mobile overlay when sidebar is $sidebarState -->
	<div
		class={`fixed z-40 h-screen w-screen bg-black/75 md:hidden ${!$sidebarState && 'hidden'}`}
		on:click={() => ($sidebarState = !$sidebarState)}
	></div>

	<div
		class={`${$sidebarState ? 'ml-0' : $sidebarState ? '-ml-52' : '-ml-20'} ${
			$sidebarState ? 'w-52' : 'w-20'
		} fixed z-50 h-screen border-r border-slate-800 bg-darktheme transition-all duration-200 md:ml-0`}
	>
		<div class="mx-6 flex flex-col gap-10">
			<div
				class="flex h-20 cursor-pointer flex-row items-center justify-between gap-4"
				on:click={() => ($sidebarState = !$sidebarState)}
			>
				{#if $sidebarState}
					<div class={`${!$sidebarState && 'hidden'}`}>Movies4Discord</div>
				{/if}
				<div class={`mt-1 transition duration-200 ${$sidebarState && 'rotate-90'}`}>
					<img src={'logo'} height={34} width={34} alt="logo" />
				</div>
			</div>
			<div class="flex flex-col gap-6">
				{#each SidebarItems as item}
					{@const isCurrentPage = item.isCurrent($page.url.pathname)}
					{@const IconTag = item.icon}
					<a href={item.link} aria-label={item.text}>
						<div
							class="group flex cursor-pointer flex-row items-center gap-4 hover:animate-[pulse_1.2s_ease-in-out_infinite]"
						>
							<div
								class={`${
									isCurrentPage ? 'bg-white text-black' : 'bg-graything'
								} rounded-full p-2 transition-all duration-200 group-hover:scale-105 group-hover:bg-white group-hover:text-black`}
							>
								<Icon src={IconTag} className={`h-[1.125rem] w-[1.125rem] group-hover:fill-black ${isCurrentPage? "fill-black" : "fill-white"}`} />
							</div>
							<span
								class={`${!$sidebarState && 'hidden'} ${
									isCurrentPage ? 'text-white' : 'text-[#808191]'
								} text-lg whitespace-nowrap transition duration-200 group-hover:text-white`}
							>
								{item.text}
							</span>
						</div>
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
