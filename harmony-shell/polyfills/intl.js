// Hermes on HarmonyOS ships without ICU, so Intl is missing. Joplin only uses
// Intl.Collator (natural sort of note/folder titles), so provide a small
// implementation rather than a full ICU bundle.
const hasNativeCollator = typeof Intl !== 'undefined' && typeof Intl.Collator === 'function';

if (!hasNativeCollator) {
	const localeCompare = (a, b) => {
		if (typeof String.prototype.localeCompare === 'function') return String(a).localeCompare(String(b));
		return String(a) < String(b) ? -1 : (String(a) > String(b) ? 1 : 0);
	};

	// Mirrors Intl.Collator({ numeric: true }): digits compare as numbers.
	const compareNatural = (a, b, caseInsensitive) => {
		const left = String(a ?? '');
		const right = String(b ?? '');
		const pattern = /(\d+)|(\D+)/g;
		const leftParts = left.match(pattern) || [];
		const rightParts = right.match(pattern) || [];

		for (let i = 0; i < Math.min(leftParts.length, rightParts.length); i++) {
			const leftPart = leftParts[i];
			const rightPart = rightParts[i];
			const leftIsNumber = /^\d+$/.test(leftPart);
			const rightIsNumber = /^\d+$/.test(rightPart);

			let result = 0;
			if (leftIsNumber && rightIsNumber) {
				const leftNumber = parseInt(leftPart, 10);
				const rightNumber = parseInt(rightPart, 10);
				result = leftNumber === rightNumber
					? leftPart.length - rightPart.length
					: leftNumber - rightNumber;
			} else {
				result = localeCompare(caseInsensitive ? leftPart.toLowerCase() : leftPart, caseInsensitive ? rightPart.toLowerCase() : rightPart);
			}

			if (result !== 0) return result < 0 ? -1 : 1;
		}

		if (leftParts.length !== rightParts.length) return leftParts.length < rightParts.length ? -1 : 1;
		return 0;
	};

	const Collator = function(locale, options) {
		const numeric = !!(options && options.numeric);
		const caseInsensitive = !!options && (options.sensitivity === 'base' || options.sensitivity === 'accent');

		return {
			compare: (a, b) => numeric ? compareNatural(a, b, caseInsensitive) : localeCompare(caseInsensitive ? String(a ?? '').toLowerCase() : a, caseInsensitive ? String(b ?? '').toLowerCase() : b),
			resolvedOptions: () => ({ locale: typeof locale === 'string' ? locale : 'en', numeric, sensitivity: (options && options.sensitivity) || 'variant' }),
		};
	};

	global.Intl = global.Intl || {};
	global.Intl.Collator = Collator;
}
