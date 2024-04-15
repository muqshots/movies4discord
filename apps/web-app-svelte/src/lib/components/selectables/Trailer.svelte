<script lang="ts">
    export let onclose: ()=>{}, ytKey: string;
</script>

<div class="fixed inset-0 z-[60]">
    <div
      class="fixed h-screen w-screen bg-black/75"
      on:click={onclose}
    />

    <div class="flex h-screen items-center justify-center">
      <div class="flex w-4/5 flex-col">
        <iframe
          title="Media trailer"
          src={`https://www.youtube.com/embed/${
            ytKey ||
            // lmao get rekt
            "dQw4w9WgXcQ"
          }?vq=hd1080&autoplay=1`}
          frameBorder="0"
          allowFullScreen
          class="z-[100] aspect-video w-full rounded-xl"
          allow="autoplay"
        />
      </div>
    </div>
  </div>