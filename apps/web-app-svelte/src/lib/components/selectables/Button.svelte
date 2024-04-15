<script lang="ts">
    export let name:string, onclick = () => {}, url: string | undefined, selected: boolean ;

    const handleClick = () => {
    if (url) {
      window.location.href = url;
    } else if (onclick) {
      onclick();
    }
  };
</script>

<button
      type="button"
      on:click={handleClick}
      class={`${
        selected ? "bg-white text-black" : "bg-graything text-white"
      } w-max rounded-md p-2 mx-1 text-xs transition duration-200 hover:bg-white hover:text-black focus:outline-none`}
    >
      {name}
</button>