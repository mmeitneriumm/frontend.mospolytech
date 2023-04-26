const rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/;

export default function parseData(string) {
	if (string === 'true') {
		return true;
	}

	if (string === 'false') {
		return false;
	}

	if (string === 'null') {
		return null;
	}

	if (string === `${+string}`) {
		return +string;
	}

	if (rbrace.test(string)) {
		return JSON.parse(string);
	}

	return string;
}
