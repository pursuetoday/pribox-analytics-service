import moment from 'moment';
import { msInHour, msInDay } from '../constant/timeConstant';

export function getTodayDate() {
	return new Date(moment().utc().startOf('day').toDate()).getTime();
}

export function getTomorrowDate() {
	return getTodayDate() + msInDay;
}

export function getYesterdayDate() {
	return getTodayDate() - msInDay;
}

export function isToday(date) {
	if (!date) return false;
	return moment().isSame(new Date(date), 'day');
}

export function isTomorrow(date) {
	if (!date) return false;
	return moment(getTomorrowDate()).isSame(new Date(date), 'day');
}

export function getSecondsSinceMidnight(date) {
	if (!(date instanceof Date)) date = new Date();
	return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

export class TimezoneAdjustedDate {
	constructor(timezoneOffset = 0) {
		const date = new Date();
		const utc = date.getTime() + date.getTimezoneOffset() * 60000;
		return new Date(utc + msInHour * timezoneOffset);
	}
}

export function getUTCAdjustedHour(hour, timezoneOffset = 0) {
	const date = new Date();
	date.setHours(hour);
	return new Date(date.getTime() - msInHour * timezoneOffset).getHours();
}
