(() => {
	const form = document.getElementById('regform');
	const themeButton = document.getElementById('theme');

	const themeStorageKey = 'webdev-theme';
	const students = new Map();

	function setTheme(isDark) {
		document.body.classList.toggle('dark', isDark);
		if (themeButton) {
			themeButton.textContent = isDark ? 'Light Mode' : 'Dark Mode';
			themeButton.setAttribute('aria-pressed', String(isDark));
		}
	}

	if (themeButton) {
		let savedTheme = null;
		try {
			savedTheme = localStorage.getItem(themeStorageKey);
		} catch {
			// The theme still works for this page when storage is unavailable.
		}

		setTheme(savedTheme === 'dark');
		themeButton.addEventListener('click', () => {
			const isDark = !document.body.classList.contains('dark');
			setTheme(isDark);
			try {
				localStorage.setItem(themeStorageKey, isDark ? 'dark' : 'light');
			} catch {
				// Keep the selected theme active for the current page.
			}
		});
	}

	if (!form) return;

	const fields = {
		name: document.getElementById('name'),
		email: document.getElementById('email'),
		password: document.getElementById('password'),
		confirmPassword: document.getElementById('confirm-password'),
		gender: document.getElementById('gender'),
		dob: document.getElementById('dob'),
		country: document.getElementById('country'),
		phone: document.getElementById('phone'),
		bio: document.getElementById('bio'),
	};

	const errorIds = {
		name: 'nameError',
		email: 'emailError',
		password: 'passwordError',
		confirmPassword: 'confirmError',
		gender: 'genderError',
		dob: 'dobError',
		country: 'countryError',
		phone: 'phoneError',
		bio: 'bioError',
	};

	const successMessage = document.getElementById('successMsg');
	const memberList = document.getElementById('memberList');
	const count = document.getElementById('count');

	function showError(fieldName, message) {
		const field = fields[fieldName];
		const error = document.getElementById(errorIds[fieldName]);
		if (field) {
			field.classList.toggle('invalid', Boolean(message));
			field.setAttribute('aria-invalid', String(Boolean(message)));
			if (error) field.setAttribute('aria-describedby', error.id);
		}
		if (error) error.textContent = message;
	}

	function validate() {
		const values = Object.fromEntries(
			Object.entries(fields).map(([key, field]) => [key, field?.value.trim() ?? '']),
		);
		const errors = {};

		if (!values.name) errors.name = 'Please enter your full name.';
		else if (values.name.length < 2) errors.name = 'Name must be at least 2 characters.';

		if (!values.email) errors.email = 'Please enter your email address.';
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
			errors.email = 'Please enter a valid email address.';
		}

		if (!values.password) errors.password = 'Please create a password.';
		else if (values.password.length < 8) errors.password = 'Password must be at least 8 characters.';

		if (!values.confirmPassword) errors.confirmPassword = 'Please confirm your password.';
		else if (values.confirmPassword !== values.password) {
			errors.confirmPassword = 'Passwords do not match.';
		}

		if (!values.gender) errors.gender = 'Please select a gender.';

		if (!values.dob) errors.dob = 'Please enter your date of birth.';
		else if (Number.isNaN(Date.parse(values.dob))) errors.dob = 'Please enter a valid date.';
		else if (new Date(`${values.dob}T00:00:00`) > new Date()) {
			errors.dob = 'Date of birth cannot be in the future.';
		}

		if (!values.country) errors.country = 'Please enter your country.';

		const phoneDigits = values.phone.replace(/\D/g, '');
		if (!values.phone) errors.phone = 'Please enter your phone number.';
		else if (phoneDigits.length < 7 || phoneDigits.length > 15) {
			errors.phone = 'Enter a phone number with 7 to 15 digits.';
		}

		Object.keys(errorIds).forEach((fieldName) => showError(fieldName, errors[fieldName] || ''));
		return { values, errors };
	}

	function renderMembers() {
		if (!memberList) return;
		memberList.replaceChildren();

		if (students.size === 0) {
			const emptyMessage = document.createElement('li');
			emptyMessage.className = 'empty';
			emptyMessage.textContent = 'No members yet. Register someone to begin.';
			memberList.append(emptyMessage);
		} else {
			students.forEach((student, email) => {
				const item = document.createElement('li');
				item.className = 'member-item';

				const info = document.createElement('div');
				info.className = 'info';
				const name = document.createElement('strong');
				name.textContent = student.name;
				const emailText = document.createElement('span');
				emailText.textContent = email;
				info.append(name, emailText);

				const removeButton = document.createElement('button');
				removeButton.type = 'button';
				removeButton.className = 'remove';
				removeButton.textContent = 'Remove';
				removeButton.setAttribute('aria-label', `Remove ${student.name}`);
				removeButton.addEventListener('click', () => {
					students.delete(email);
					renderMembers();
				});

				item.append(info, removeButton);
				memberList.append(item);
			});
		}

		if (count) count.textContent = String(students.size);
	}

	form.addEventListener('input', (event) => {
		const fieldName = Object.keys(fields).find((key) => fields[key] === event.target);
		if (fieldName) showError(fieldName, '');
		if (successMessage) successMessage.classList.add('hidden');
	});

	form.addEventListener('change', (event) => {
		const fieldName = Object.keys(fields).find((key) => fields[key] === event.target);
		if (fieldName) showError(fieldName, '');
	});

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const { values, errors } = validate();
		if (Object.keys(errors).length > 0) {
			const firstInvalid = Object.keys(errors).map((key) => fields[key]).find(Boolean);
			firstInvalid?.focus();
			if (successMessage) successMessage.classList.add('hidden');
			return;
		}

		const email = values.email.toLowerCase();
		if (students.has(email)) {
			showError('email', 'This email address is already registered.');
			fields.email?.focus();
			if (successMessage) successMessage.classList.add('hidden');
			return;
		}

		students.set(email, { name: values.name });
		renderMembers();
		form.reset();
		Object.keys(errorIds).forEach((fieldName) => showError(fieldName, ''));

		if (successMessage) {
			successMessage.textContent = 'Registration successful. Your details are shown in the member list.';
			successMessage.classList.remove('hidden');
		}
	});

	renderMembers();
})();
