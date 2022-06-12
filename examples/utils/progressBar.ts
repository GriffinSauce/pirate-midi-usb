const PROGRESS_BAR_WIDTH = 30;

/**
 * Render a simple progress bar
 */
export const renderProgressBar = (done: number, total: number): void => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write('[');
  for (let i = 0; i < PROGRESS_BAR_WIDTH; i++) {
    const isSegmentDone = Math.ceil(i * (total / PROGRESS_BAR_WIDTH)) < done;
    process.stdout.write(isSegmentDone ? '=' : '-');
  }
  process.stdout.write(']');

  if (done === total) process.stdout.write('\n');
};
