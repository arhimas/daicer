import readline from 'readline';

/**
 * A "Juicy" CLI Progress Bar
 * Features:
 * - Visual bar [####......]
 * - Percentage
 * - Counts (Current / Total)
 * - ETA (Estimated Time of Arrival)
 * - Speed (Items per second)
 * - Custom Color support via ANSI codes
 */
export class JuicyProgressBar {
  private total: number;
  private current: number;
  private startTime: number;
  private lastUpdateTime: number;
  private operationName: string;
  private width: number;

  constructor(total: number, operationName: string = 'Processing', width: number = 30) {
    this.total = total;
    this.current = 0;
    this.operationName = operationName;
    this.width = width;
    this.startTime = Date.now();
    this.lastUpdateTime = Date.now();
  }

  public start() {
    this.startTime = Date.now();
    this.render();
  }

  public increment(amount: number = 1) {
    this.current += amount;
    if (this.current > this.total) this.current = this.total;
    this.render();
  }

  public update(current: number) {
    this.current = current;
    if (this.current > this.total) this.current = this.total;
    this.render();
  }

  public finish() {
    this.current = this.total;
    this.render();
    console.log('\n'); // New line after completion
  }

  private render() {
    const now = Date.now();
    // Debounce updates slightly to prevent flickering if too fast, but ensured at finish
    if (this.current < this.total && now - this.lastUpdateTime < 50) return;
    this.lastUpdateTime = now;

    const percent = Math.min(1, this.current / this.total);
    const filledWidth = Math.round(this.width * percent);
    const emptyWidth = this.width - filledWidth;

    // Elapsed & Speed
    const elapsedSeconds = (now - this.startTime) / 1000;
    const speed = this.current / Math.max(elapsedSeconds, 0.001); // items per sec

    // ETA
    const remainingItems = this.total - this.current;
    const etaSeconds = speed > 0 ? remainingItems / speed : 0;

    const filledBar = '█'.repeat(filledWidth);
    const emptyBar = '░'.repeat(emptyWidth);

    // Colors (ANSI)
    const cyan = '\x1b[36m';
    const green = '\x1b[32m';
    const dim = '\x1b[2m';
    const reset = '\x1b[0m';
    const yellow = '\x1b[33m';

    const barColor = percent === 1 ? green : cyan;

    // Stats formatting
    const percentageStr = (percent * 100).toFixed(1) + '%';
    const countsStr = `${this.current}/${this.total}`;
    const etaStr = `ETA: ${etaSeconds.toFixed(1)}s`;
    const speedStr = `${speed.toFixed(1)}/s`;

    // Clear line and write
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    process.stdout.write(
      `${dim}[${this.operationName}]${reset} ` +
        `${barColor}${filledBar}${emptyBar}${reset} ` +
        `${yellow}${percentageStr}${reset} | ` +
        `${dim}${countsStr}${reset} | ` +
        `${dim}${speedStr}${reset} | ` +
        `${cyan}${etaStr}${reset}`
    );
  }
}
