type Task = () => Promise<unknown>;

/**
 * Simple in memory queue to run promises sequentially
 */
export default class Queue {
	#queue: {
		task: Task;
		resolve: (value: unknown) => void;
		reject: (error: unknown) => void;
	}[] = [];

	#pendingPromise = false;

	constructor() {
		this.#queue = [];
	}

	/**
	 * Add a task to the queue
	 * @param task - callback function that executes the async function you want to run
	 * @returns Promise
	 * @example
	 *
	 * ```.ts
	 * const value = await Queue.enqueue(() => doAsyncThing(options))
	 * ```
	 */
	enqueue(task: Task): Promise<unknown> {
		return new Promise((resolve, reject) => {
			this.#queue.push({
				task,
				resolve,
				reject,
			});
			void this.#dequeue();
		});
	}

	async #dequeue(): Promise<unknown> {
		if (this.#pendingPromise) {
			return;
		}

		const item = this.#queue.shift();

		if (!item) {
			return;
		}

		const { task, resolve, reject } = item;
		try {
			this.#pendingPromise = true;
			const value = await task();
			this.#pendingPromise = false;
			resolve(value);
			void this.#dequeue();
		} catch (err) {
			this.#pendingPromise = false;
			reject(err);
			void this.#dequeue();
		}
		return true;
	}
}
