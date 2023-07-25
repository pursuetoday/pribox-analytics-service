import Queue from 'bull';
import { REDIS_CONFIG } from '../config';

const prefixTitle = 'pribox-analytic-service';

export default class MyQueue {
	queue;

	queueTitle;

	constructor(queueTitle) {
		this.queueTitle = queueTitle;
		this.queue = new Queue(queueTitle, {
			prefix: `{${prefixTitle}}`,
			redis: REDIS_CONFIG,
			limiter: {
				max: 100000,
				duration: 60000,
				bounceBack: false,
			},
			defaultJobOptions: {
				timeout: 36000000,
				attempts: 1, // multiple attempts we can use 3
				backoff: 60000,
				delay: 0,
				priority: 3,
				removeOnComplete: true,
				removeOnFail: true,
			},
			settings: {
				retryProcessDelay: 500,
			},
		});
	}

	process(jobFunc) {
		this.queue.process(this.queueTitle, jobFunc);

		this.queue.on('error', (error) => {
			console.error('error: ', error);
		});

		this.queue.on('stalled', (job = {}) => {
			console.warn(`${this.baseMessage(job)} stalled`);
		});

		this.queue.on('failed', async (job = {}, err = {}) => {
			console.error(`${this.baseMessage(job)} failed with error => ${JSON.stringify(err.id)}`);
		});

		this.queue.on('resumed', (job) => {
			console.log(`${this.baseMessage(job)} resumed`);
		});

		this.queue.on('drained', () => {
			console.log(`${this.queueTitle} Queue drained!`);
		});

		this.queue.on('completed', async (job, result) => {
			console.log(`${this.baseMessage(job)} completed!`);
		});
		return this.queue;
	}

	baseMessage(job = {}) {
		`${this.queueTitle} Job: ${job.id}`;
	}
}
