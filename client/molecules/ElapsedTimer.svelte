<script>
  import { elapsed } from '../stores';
  import { __ } from '../utils/translator';
  import { formatSeconds } from '../../common/helpers';
</script>

<div>
  {$__('elapsed:')}
  <span>{formatSeconds($elapsed)}</span>
</div>

<style>
  div {
    margin-top: 4rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  span {
    font-family: 'Digital';
    font-size: 3.2rem;
    color: var(--corporate-grey-darken);
  }
</style>
