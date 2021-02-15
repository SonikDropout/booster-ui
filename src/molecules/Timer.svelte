<script>
  import { serialData } from '../stores';
  import { formatSeconds } from '../utils/helpers';

  let elapsed = 0;
  serialData.subscribe($dat => {
    if ($dat.start) elapsed++;
    else elapsed = 0;
  });
</script>

<div>{formatSeconds(elapsed)}</div>
