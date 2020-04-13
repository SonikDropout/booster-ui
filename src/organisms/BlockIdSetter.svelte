<script>
  import { ipcRenderer } from 'electron';
  import RangeInput from '../molecules/RangeInput';
  import Button from '../atoms/Button';
  import { zeroPad } from '../utils/others';
  import fs from 'fs';

  let showDialog = false;
  const idNode = document.getElementById('id');
  let currentId = +idNode.innerText;

  function toggleDialog() {
    showDialog = !showDialog;
  }

  function setBlockId(n) {
    currentId = +n;
    idNode.innerText = zeroPad(currentId, 3);
  }
  function confirmSetting() {
    ipcRenderer.send('setBlockId', currentId);
    showDialog = false;
  }
</script>

<div on:click={toggleDialog} class="toggler" />
{#if showDialog}
  <div class="modal">
    <div class="modal-body">
      <RangeInput
        style="margin:auto 0"
        label="Номер блока"
        suggestedValue={currentId}
        range={[0, 255]}
        onChange={setBlockId} />
        <Button size="sm" style="margin:0 auto;width:10rem" on:click={confirmSetting}>Ок</Button>
    </div>
  </div>
{/if}

<style>
  .toggler {
    position: fixed;
    right: 0;
    top: 0;
    width: 3rem;
    height: 3rem;
  }
  .modal {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
    z-index: 9001;
    display: flex;
  }
  .modal-body {
    box-shadow: 0 0 5px var(--text-color);
    background-color: var(--bg-color);
    border-radius: 8px;
    width: 35rem;
    height: 20rem;
    display: flex;
    margin: auto;
    flex-direction: column;
    padding: 2.4rem;
  }
</style>
