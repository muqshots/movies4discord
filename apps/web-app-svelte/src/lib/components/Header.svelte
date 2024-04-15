<script lang="ts">
	import { page } from '$app/stores';
	import { sidebarState } from '$lib/stores/misc';
	import { writable } from 'svelte/store';
	import { HiSolidAdjustmentsVertical } from 'svelte-icons-pack/hi';
	import { IoLogOutOutline } from 'svelte-icons-pack/io';
	import { AiOutlineSearch } from 'svelte-icons-pack/ai';
	import { Icon } from 'svelte-icons-pack';
	import { onMount } from 'svelte';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
	import { debounce } from 'throttle-debounce';

	const session = $page.data.session;
	console.log($page.url.searchParams.get('search'), $page.data.session);
	// Pixels to scroll with transparent bg
	const transparentScroll = 128;
	// Make header top transparent for /movie/123 and /tv/123
	const hasTransparentNav = writable(/^\/(movie|tv)\/\d+$/gm.test($page.url.pathname));

	onMount(() => {
		document.addEventListener('scroll', () => {
			if (window.scrollY > transparentScroll) {
				$hasTransparentNav = false;
			} else {
				$hasTransparentNav = true
			}
		});
	});
</script>

<div
	class={`${$hasTransparentNav ? 'bg-transparent' : 'bg-darktheme'} ${
		$hasTransparentNav ? '' : 'shadow-lg shadow-white/20'
	} sticky top-0 z-30 flex h-20 flex-row items-center justify-between gap-2 px-6 transition-all duration-200 md:pl-0`}
>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="mt-1 cursor-pointer md:hidden" on:click={() => ($sidebarState = !$sidebarState)}>
		<img src="/logo.png" height={34} width={34} alt="logo" />
	</div>

	<div class="relative mx-4 w-96">
		<input
			type="text"
			placeholder="Search"
			class={`h-8 w-full pr-8 ${
				$hasTransparentNav && 'bg-white/10 shadow-lg backdrop-blur-sm'
			} rounded-md border-none bg-graything outline-none placeholder:text-white/50`}
			value={$page.url.searchParams.get('search')}
			on:input={debounce(400, (e) => {
				const value = e.target.value;
				value && goto(`/search?query=${value}`);
			})}
		/>
		<div class="absolute top-[6px] right-2 text-white/60">
			<Icon src={AiOutlineSearch} className="h-5 w-5" />
		</div>
	</div>

	<div class="cursor-pointer">
		{#if session}
			<div class="group flex flex-row gap-2">
				<img
					src={session.user?.image}
					width={54}
					height={54}
					alt={`${session.user?.name} pfp`}
					class="rounded-full"
				/>
				<div class="hidden flex-col justify-center lg:flex">
					{session.user?.name}
				</div>
				<div
					class="duration-250 absolute right-3 z-50 mt-[3.45rem] w-56 origin-top-right scale-0 rounded-lg border bg-theme px-5 py-5 shadow transition ease-in-out group-hover:scale-100"
				>
					<ul class="space-y-3 text-white">
						<li class="font-medium">
							<a
								href="/settings"
								class="flex transform items-center border-r-4 border-transparent transition-colors duration-200 hover:border-indigo-700"
							>
								<div class="mr-3 text-white">
									<Icon src={HiSolidAdjustmentsVertical} className="h-6 w-6" />
								</div>
								User Settings
							</a>
						</li>
						<hr class="dark:border-gray-700" />
						<li class="font-medium">
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-missing-attribute -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<a
								on:click={(e) => {
									e.preventDefault();
									signOut();
								}}
								class="flex transform items-center border-r-4 border-transparent transition-colors duration-200 hover:border-red-600"
							>
								<div class="mr-3 text-red-600">
									<Icon src={IoLogOutOutline} className="h-6 w-6" />
								</div>
								Logout
							</a>
						</li>
					</ul>
				</div>
			</div>
		{:else if session === null}
			<button
				class="rounded-md border-2 py-1.5 px-4 transition duration-150 hover:bg-white hover:text-black"
				on:click={() => signIn('discord')}
			>
				Login
			</button>
		{:else}
			<div class="flex animate-pulse flex-row items-center gap-2">
				<div class="h-[54px] w-[54px] rounded-full bg-slate-600" />
				<div class="hidden h-6 w-20 justify-center rounded-lg bg-slate-600 lg:flex" />
			</div>
		{/if}
	</div>
</div>
