<script>
  import Tooltip from '../lib/Tooltip.svelte';
  let tooltipVisible = false;
  let tooltipMessage = "Información detallada";
  let tooltipPosition = { x: 0, y: 0 };

  function handleMouseMove(event) {
    tooltipPosition.x = event.pageX + 10;
    tooltipPosition.y = event.pageY + 10;
    tooltipMessage = `Posición del Cursor: ${event.pageX}, ${event.pageY}`;
    tooltipVisible = true;
  }

  function handleMouseLeave() {
    tooltipVisible = false;
  }
</script>

<div
  style="position: relative;"
  on:mousemove={handleMouseMove}
  on:mouseleave={handleMouseLeave}
  role="presentation"
>
  <iframe
    title="PRUEBAS TOOLTIP"
    aria-label="Mapa"
    src="https://datawrapper.dwcdn.net/3Fh1f/1/"
    scrolling="no"
    frameborder="0"
    style="width: 0; min-width: 100% !important; border: none;"
    height="738"
    data-external="1">
  </iframe>

  {#if tooltipVisible}
    <div style="position: absolute; left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;">
      <Tooltip {tooltipMessage} />
    </div>
  {/if}
</div>

