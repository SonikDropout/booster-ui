<script>
  import Modal from '../molecules/Modal';
  import Button from '../atoms/Button.svelte';
  import RangeInput from '../molecules/RangeInput.svelte';
  import { __ } from '../utils/translator';
  import { serialData, settings } from '../stores';
  import { approximate } from '../utils/exponentialApproxiamator';
  import { onDestroy } from 'svelte';

  onDestroy(() => clearTimeout(timeout));

  let points = [];

  let showCalibrationModal,
    calibrateMessage,
    timeout,
    isError,
    currentPoint = 0;

  const closeModal = () => (showCalibrationModal = false);
  const addCurrentPoint = () =>
    (points = points.concat({
      x: $serialData.hydrogenConsumption,
      y: currentPoint,
    }));
  const setPoint = (p) => (currentPoint = p);

  function setConsumptionCoefficiets() {
    try {
      const [Ka, Kb] = approximate(points);
      settings.update((s) => {
        s.Ka = Ka;
        s.Kb = Kb;
        return s;
      });
      calibrateMessage = $__('calibration done');
    } catch {
      calibrateMessage = $__('calibration failed');
      isError = true;
    } finally {
      timeout = setTimeout(clearSelf, 1500);
    }
  }

  function clearSelf() {
    points = [];
    isError = false;
    calibrateMessage = '';
    currentPoint = 0;
    showCalibrationModal = false;
  }
</script>

<Button on:click={() => (showCalibrationModal = true)}
  >{$__('calibration')}</Button
>
{#if showCalibrationModal}
  <Modal onDismiss={closeModal}>
    {#if calibrateMessage}
      <h2 class:error={isError}>
        <span class="message">{calibrateMessage}</span>
      </h2>
    {:else}
      <h3>{$__('calibration')}</h3>
      <h5>{$__('please add at least five values of consumption')}</h5>
      <RangeInput
        label={$__('H2 consumption')}
        suggestedValue={currentPoint}
        range={[0, 10000]}
        onChange={setPoint}
      />
      <Button on:click={addCurrentPoint}>{$__('add point')}</Button>
      <Button
        on:click={() => (points = [])}
        type="outline"
        disabled={!points.length}>{$__('clear points')}</Button
      >
      <p>
        {$__('added points:')}
        {#each points as p}
          <strong class="point">{' ' + p.y}</strong>
        {/each}
      </p>
      <div class="controls">
        <Button
          on:click={setConsumptionCoefficiets}
          disabled={points.length < 5}
          title={points.length < 5
            ? $__('please add more points')
            : $__('calibrate flowmeter')}>{$__('calibrate')}</Button
        >
        <Button on:click={closeModal} type="outline">{$__('cancel')}</Button>
      </div>
    {/if}
  </Modal>
{/if}

<style>
  h2 {
    height: 100%;
    display: flex;
  }
  .message {
    margin: auto;
  }
  h2.error {
    color: var(--danger-color);
  }
  h3 {
    margin-bottom: 1.2rem;
  }
  h5 {
    font-weight: 700;
    text-align: left;
    margin-bottom: 1.2rem;
  }
  .controls {
    text-align: right;
  }
</style>
