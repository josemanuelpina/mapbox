<!-- Tooltip.svelte -->
<script>
  import { dataStore } from '../lib/dataStore.js';
</script>

<style>
  .tooltip-container {
    position: fixed;
    right: 0;
    bottom: 0;
    background-color: black;
    color: white;
    padding: 1rem;
    border-radius: 8px;
    margin: 1rem;
    z-index: 100;
    width: 250px; /* O el ancho que desees */
    height: 150px; /* O la altura que desees */
    overflow: auto; /* Permite el desplazamiento si el contenido es mayor que el contenedor */
  }

  .tooltip-row {
    margin-bottom: 0.5rem;
  }

  .tooltip-field {
    display: block; /* Hace que cada campo sea en una línea diferente */
  }
</style>

<div class="tooltip-container">
  {#each $dataStore as { distrito, nombre_distrito, datos }}
    <div class="tooltip-row">
      <span class="tooltip-field">{nombre_distrito}</span>
      <span class="tooltip-field">{datos}</span>
    </div>
  {/each}
</div>




