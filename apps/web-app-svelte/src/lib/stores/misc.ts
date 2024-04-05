import { writable } from 'svelte/store'

export const sidebarState = writable(false)

// For security reasons the Svelte REPL works in a sandboxed environment which will not let you access localStorage. 
// this example with localStorage will not work in the Svelte REPL

// If you uncomment the following line you will "The operation is insecure" error
// export const todos = localStore('mdn-svelte-todo', initialTodos)

// Instead, for working in the REPL, we will use a regular writable store.
// Take into account that it won't be persisted.