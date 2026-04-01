// time
export const START_HOUR = 8;
export const END_HOUR = 18;
export const PIXELS_PER_MINUTE = 0.8;
export const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
export const DAYS = [
	{ id: 1, name: 'Senin' },
	{ id: 2, name: 'Selasa' },
	{ id: 3, name: 'Rabu' },
	{ id: 4, name: 'Kamis' },
	{ id: 5, name: 'Jumat' },
	{ id: 6, name: 'Sabtu' },
];
