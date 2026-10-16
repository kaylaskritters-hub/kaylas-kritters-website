const inquiryDialog = document.getElementById('inquiry-dialog');
const inquiryForm = document.getElementById('pet-care-inquiry');

if (inquiryDialog && inquiryForm) {
    const openButtons = document.querySelectorAll('[data-open-inquiry]');
    const closeButton = inquiryDialog.querySelector('.inquiry-close');
    const cancelButton = inquiryDialog.querySelector('.inquiry-cancel');
    const doneButton = inquiryDialog.querySelector('.inquiry-done');
    const addPetButton = document.getElementById('inquiry-add-pet');
    const petList = document.getElementById('inquiry-pet-list');
    const service = document.getElementById('inquiry-service');
    const otherServicePanel = document.getElementById('inquiry-other-service');
    const otherServiceDescription = document.getElementById('inquiry-other-service-description');
    const frequency = document.getElementById('inquiry-frequency');
    const startDate = document.getElementById('inquiry-start');
    const endDate = document.getElementById('inquiry-end');
    const preferredStart = document.getElementById('inquiry-preferred-start');
    const recurringDays = document.getElementById('inquiry-recurring-days');
    const errorMessage = document.getElementById('inquiry-error');
    const submitButton = document.getElementById('inquiry-submit');
    const successMessage = document.getElementById('inquiry-success');
    const originalPet = petList.querySelector('[data-pet]').cloneNode(true);
    const panels = {
        'one-time': document.getElementById('inquiry-one-time'),
        recurring: document.getElementById('inquiry-recurring'),
        unsure: document.getElementById('inquiry-unsure')
    };

    let opener = null;
    let nextPetId = 2;
    let requestController = null;
    let submittedSuccessfully = false;

    function todayLocal() {
        const now = new Date();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${now.getFullYear()}-${month}-${day}`;
    }

    function updateDates() {
        const today = todayLocal();
        startDate.min = today;
        preferredStart.min = today;
        endDate.min = startDate.value && startDate.value > today ? startDate.value : today;
        const datesOutOfOrder = frequency.value === 'one-time' && startDate.value && endDate.value && endDate.value < startDate.value;
        endDate.setCustomValidity(datesOutOfOrder ? 'End date must be on or after the start date.' : '');
    }

    function updateFrequency() {
        Object.entries(panels).forEach(([value, panel]) => {
            const active = frequency.value === value;
            panel.hidden = !active;
            panel.querySelectorAll('input, textarea').forEach(field => {
                field.disabled = !active;
            });
        });
        startDate.required = frequency.value === 'one-time';
        endDate.required = frequency.value === 'one-time';
        recurringDays.required = frequency.value === 'recurring';
        updateDates();
    }

    function updateService() {
        const isOther = service.value === 'Other';
        otherServicePanel.hidden = !isOther;
        otherServiceDescription.disabled = !isOther;
        otherServiceDescription.required = isOther;
    }

    function updatePetControls() {
        const pets = [...petList.querySelectorAll('[data-pet]')];
        pets.forEach((pet, index) => {
            pet.querySelector('h3').textContent = `Pet ${index + 1}`;
            pet.querySelector('.inquiry-remove-pet').hidden = pets.length === 1;
        });
    }

    function addPet() {
        const pet = originalPet.cloneNode(true);
        const id = nextPetId++;
        for (const kind of ['name', 'type', 'breed', 'size', 'needs']) {
            const field = pet.querySelector(`[data-pet-${kind}]`);
            const label = pet.querySelector(`label[for="${field.id}"]`);
            field.id = `pet-${kind}-${id}`;
            field.value = '';
            label.htmlFor = field.id;
        }
        petList.append(pet);
        updatePetControls();
        pet.querySelector('[data-pet-name]').focus();
    }

    function petSummary() {
        const pets = [...petList.querySelectorAll('[data-pet]')].map(pet => ({
            name: pet.querySelector('[data-pet-name]').value.trim(),
            type: pet.querySelector('[data-pet-type]').value.trim(),
            breed: pet.querySelector('[data-pet-breed]').value.trim(),
            size: pet.querySelector('[data-pet-size]').value,
            specialCare: pet.querySelector('[data-pet-needs]').value.trim()
        }));
        return JSON.stringify(pets, null, 2);
    }

    function submissionData() {
        const data = new FormData(inquiryForm);
        const scheduleFields = ['start-date', 'end-date', 'preferred-start-date', 'recurring-days', 'date-notes'];
        const allowed = {
            'one-time': ['start-date', 'end-date'],
            recurring: ['preferred-start-date', 'recurring-days'],
            unsure: ['date-notes']
        }[frequency.value] || [];
        scheduleFields.forEach(name => {
            if (!allowed.includes(name) || !data.get(name)) data.delete(name);
        });
        if (service.value !== 'Other') data.delete('other-service-description');
        return data;
    }

    function resetAfterSuccess() {
        inquiryForm.reset();
        petList.replaceChildren(originalPet.cloneNode(true));
        nextPetId = 2;
        updatePetControls();
        updateFrequency();
        updateService();
        inquiryForm.hidden = false;
        successMessage.hidden = true;
        submittedSuccessfully = false;
    }

    function closeDialog() {
        inquiryDialog.close();
    }

    openButtons.forEach(button => button.addEventListener('click', () => {
        opener = button;
        errorMessage.hidden = true;
        inquiryDialog.showModal();
        document.getElementById('inquiry-name').focus();
    }));

    [closeButton, cancelButton, doneButton].forEach(button => button.addEventListener('click', closeDialog));

    inquiryDialog.addEventListener('close', () => {
        if (requestController) requestController.abort();
        if (submittedSuccessfully) resetAfterSuccess();
        if (opener && opener.isConnected) opener.focus();
        opener = null;
    });

    inquiryDialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault();
            closeDialog();
            return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [...inquiryDialog.querySelectorAll('a[href], button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])')]
            .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    addPetButton.addEventListener('click', addPet);
    petList.addEventListener('click', event => {
        if (!event.target.matches('.inquiry-remove-pet')) return;
        const pet = event.target.closest('[data-pet]');
        if (petList.querySelectorAll('[data-pet]').length > 1) pet.remove();
        updatePetControls();
        addPetButton.focus();
    });
    frequency.addEventListener('change', updateFrequency);
    service.addEventListener('change', updateService);
    [startDate, endDate].forEach(input => input.addEventListener('input', updateDates));
    updateFrequency();
    updateService();

    inquiryForm.addEventListener('submit', async event => {
        event.preventDefault();
        updateDates();
        if (!inquiryForm.reportValidity()) return;

        document.getElementById('inquiry-pets-summary').value = petSummary();
        errorMessage.hidden = true;
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        requestController = new AbortController();

        try {
            const response = await fetch(inquiryForm.action, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(submissionData()).toString(),
                signal: requestController.signal
            });
            if (!response.ok) throw new Error(`Submission failed: ${response.status}`);
            submittedSuccessfully = true;
            inquiryForm.hidden = true;
            successMessage.hidden = false;
            successMessage.querySelector('h3').focus();
        } catch (error) {
            if (error.name !== 'AbortError') {
                errorMessage.textContent = 'We could not send your inquiry. Please try again or email kaylaskritters@gmail.com directly.';
                errorMessage.hidden = false;
                errorMessage.focus();
            }
        } finally {
            requestController = null;
            submitButton.disabled = false;
            submitButton.textContent = 'Send Inquiry';
        }
    });
}
