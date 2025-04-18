<script lang="ts">
  import { onMount } from "svelte";
  import { writable } from "svelte/store";

  // Define types for Todos and Todo
  type Todo = {
    text: string;
    completed: boolean;
  };

  type Todos = {
    [category: string]: Todo[];
  };

  // Writable stores for todoText and todoType
  export let todoText = writable<string>("");
  export let todoType = writable<string>("global");

  // Function to load todos from localStorage
  function loadTodos(): Todos {
    try {
      let storedTodos = localStorage.getItem("todos");
      return storedTodos ? JSON.parse(storedTodos) : { global: [] };
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return { global: [] };
    }
  }

  // Writable store for todos
  export const todos = writable<Todos>(loadTodos());

  let showPopup = false;

  onMount(() => {
    // Load todos from localStorage when the component mounts
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      showPopup = true;
      localStorage.setItem("hasVisited", "true");
    }
  });

  function closePopup() {
    showPopup = false;
  }

  // Function to save updated todos to localStorage
  function saveTodos(updatedTodos: Todos) {
    try {
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }

  // Function to add a new todo
  function addTodo() {
    if ($todoText.trim()) {
      todos.update((currentTodos) => {
        let updatedTodos: Todos = { ...currentTodos };
        let text = $todoText;

        // Check for category in the input and handle accordingly
        if (text[0] === "!") {
          const newCategory = text.match(/^!\w+\s*/)?.[0]?.slice(1);
          if (newCategory) {
            if (!updatedTodos[newCategory]) {
              updatedTodos[newCategory] = [];
            }
            updatedTodos[newCategory].push({
              text: text.replace(/^!\w+\s*/, ""),
              completed: false,
            });
          }
        } else {
          updatedTodos[$todoType] = updatedTodos[$todoType] || [];
          updatedTodos[$todoType].push({ text, completed: false });
        }

        saveTodos(updatedTodos);
        return updatedTodos;
      });
      todoText.set(""); // Clear the input field
    }
  }

  // Function to delete a todo
  function deleteTodo(category: string, index: number) {
    todos.update((currentTodos) => {
      let updatedTodos: Todos = { ...currentTodos };
      updatedTodos[category] = updatedTodos[category].filter(
        (_: Todo, i: number) => i !== index
      );
      if (category !== "global" && updatedTodos[category].length === 0) {
        delete updatedTodos[category];
      }
      saveTodos(updatedTodos);
      return updatedTodos;
    });
  }

  // Function to toggle the completion status of a todo
  function toggleTodo(category: string, index: number) {
    todos.update((currentTodos) => {
      let updatedTodos: Todos = { ...currentTodos };
      updatedTodos[category] = [...updatedTodos[category]];
      updatedTodos[category][index].completed =
        !updatedTodos[category][index].completed;
      saveTodos(updatedTodos);
      return updatedTodos;
    });
  }
</script>

<div class="app-container">
  <div class="content">
    <h1>MINIMAL TODO APP</h1>
    <input
      type="text"
      placeholder="Enter a todo"
      bind:value={$todoText}
      on:keydown={(e) => e.key === "Enter" && addTodo()}
    />
    <div>
      {#each $todos.global as { text, completed }, index}
        <div class="todo">
          <p class:completed on:click={() => toggleTodo("global", index)}>{text}</p>
          <button class="delete" on:click={() => deleteTodo("global", index)}
            >×</button
          >
        </div>
      {/each}
    </div>

    {#each Object.keys($todos).filter((key) => key !== "global") as category}
      <div>
        <h1 class="category">{category}</h1>
        {#each $todos[category] as { text, completed }, index}
          <div class="todo">
            <p class:completed on:click={() => toggleTodo(category, index)}>
              {text}
            </p>
            <button class="delete" on:click={() => deleteTodo(category, index)}>×</button>
          </div>
        {/each}
      </div>
    {/each}

    {#if showPopup}
      <div class="popup">
        <h5>Welcome! Just start typing your todos above...</h5>
        <h5>
          In case you want to add categories, start your todo with an exclamation
          mark !, like this:
        </h5>
        <h5>!school finish history page 121/127</h5>
      </div>
      <button class="close" on:click={closePopup}>Close</button>
    {/if}
  </div>

  <footer>
    <h6 class="by">Provided by Fausto Zamparelli</h6>
  </footer>
</div>

<style>
  :global(body) {
    background-color: #000000;
    color: #ffffff;
    font-family: "SF Pro Mono";
    font-size: 180%;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }
  
  .app-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }
  
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  h1 {
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
  }
  
  h1.category {
    margin-top: 2.5rem;
    margin-bottom: 2.5rem;
  }
  
  input {
    font-size: 80%;
    margin-bottom: 3.5rem;
  }
  
  div {
    display: grid;
    place-items: center;
    font-size: 100%;
  }
  
  div.todo {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0;
    margin-bottom: 2.5rem;
    line-height: 1;
  }
  
  p {
    margin: 0;  
    cursor: pointer;
  }
  
  p:hover {
    color: #cccccc;
  }
  
  p.completed {
    text-decoration: line-through;
    color: #cccccc;
  }
  
  button {
    cursor: pointer;
    background-color: #000000;
    color: #ffffff;
    border: 0.5px solid #ffffff;
    border-radius: 10%;
    font-size: 70%;
    margin-left: 10px;
    padding: 10;
  }
  
  button.delete {
    border-radius: 35%;
    display: flex;
    font-size: 1.4rem;
    justify-content: center;
    align-items: center;
    width: 18px;
    height: 18px;
    padding: 0;
  }
  
  button:hover {
    background-color: #ffffff;
    color: #000000;
  }
  
  footer {
    color: #706969;
    text-align: center;
    padding: 20px 0;
    margin-top: auto;
  }
  
  h6, h5 {
    margin: 1ex;
    font-weight: lighter;
  }
  
  div.popup {
    margin-top: 10px;
    margin-bottom: 10px;
  }
</style>