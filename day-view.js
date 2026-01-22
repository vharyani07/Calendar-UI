document.addEventListener('DOMContentLoaded', function () {
    // Get date from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    let selectedDate;

    if (dateParam) {
        // Parse YYYY-MM-DD format manually to avoid timezone issues
        const [year, month, day] = dateParam.split('-').map(Number);
        selectedDate = new Date(year, month - 1, day);

        // Check if date is valid
        if (isNaN(selectedDate.getTime())) {
            selectedDate = new Date();
        }
    } else {
        selectedDate = new Date();
    }

    // Update the header with the selected date
    updateDateDisplay(selectedDate);

    // Generate timeline hours
    generateTimeline();

    // Load events for this day
    loadEvents(selectedDate);

    // Initialize notepad
    loadNotes(selectedDate);

    // Load tasks for this day
    loadTasks(selectedDate);

    // Event listeners
    document.getElementById('save-notes').addEventListener('click', function () {
        addNote(selectedDate);
    });

    document.getElementById('clear-note').addEventListener('click', function () {
        document.getElementById('notes-input').value = '';
    });

    document.querySelector('.prev-day').addEventListener('click', function (e) {
        e.preventDefault();
        // Get current date from URL to ensure we're using the latest date
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentDateParam = currentUrlParams.get('date');
        let currentDate;
        if (currentDateParam) {
            // Parse YYYY-MM-DD format properly
            const [year, month, day] = currentDateParam.split('-').map(Number);
            currentDate = new Date(year, month - 1, day);
        } else {
            currentDate = new Date();
        }
        if (isNaN(currentDate.getTime())) {
            currentDate = new Date();
        }
        navigateDay(-1, currentDate);
    });

    document.querySelector('.next-day').addEventListener('click', function (e) {
        e.preventDefault();
        // Get current date from URL to ensure we're using the latest date
        const currentUrlParams = new URLSearchParams(window.location.search);
        const currentDateParam = currentUrlParams.get('date');
        let currentDate;
        if (currentDateParam) {
            // Parse YYYY-MM-DD format properly
            const [year, month, day] = currentDateParam.split('-').map(Number);
            currentDate = new Date(year, month - 1, day);
        } else {
            currentDate = new Date();
        }
        if (isNaN(currentDate.getTime())) {
            currentDate = new Date();
        }
        navigateDay(1, currentDate);
    });

    // Event Modal
    const eventModal = document.getElementById('event-modal');
    const closeEventModal = document.querySelector('#event-modal .close');

    // When clicking on a timeline slot, open the event modal
    document.getElementById('timeline').addEventListener('click', function (e) {
        // Only respond if clicking on an hour slot (not on an existing event)
        if (e.target.classList.contains('hour-slot') || e.target.classList.contains('hour-label')) {
            const hourSlot = e.target.closest('.hour-slot');
            if (hourSlot) {
                const hourLabel = hourSlot.querySelector('.hour-label').textContent;
                openEventModal(hourLabel, selectedDate);
            }
        }
    });

    closeEventModal.addEventListener('click', function () {
        eventModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == eventModal) {
            eventModal.style.display = 'none';
        }
    });

    // Event Form Submit
    document.getElementById('event-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const title = document.getElementById('event-title').value;
        const start = document.getElementById('event-start').value;
        const end = document.getElementById('event-end').value;
        const location = document.getElementById('event-location').value;
        const type = document.getElementById('event-type').value;
        const editIndex = document.getElementById('event-edit-index').value;

        if (!title || !start || !end) {
            alert('Please fill in all required fields');
            return;
        }

        // Validate time range - use hour indices for proper chronological comparison
        const startIndex = getHourIndex(start);
        const endIndex = getHourIndex(end);
        if (startIndex >= endIndex) {
            alert('End time must be after start time');
            return;
        }

        // Create event object
        const event = {
            title: title,
            start: start,
            end: end,
            location: location || '',
            type: type,
            date: formatDateForStorage(selectedDate)
        };

        // Update or add event
        if (editIndex !== '') {
            updateEvent(parseInt(editIndex), event);
        } else {
            addEvent(event);
        }

        // Reset form and close modal
        document.getElementById('event-form').reset();
        eventModal.style.display = 'none';

        // Reload events
        loadEvents(selectedDate);
    });

    // Delete Event Button
    document.getElementById('delete-event').addEventListener('click', function () {
        const editIndex = document.getElementById('event-edit-index').value;
        if (editIndex !== '') {
            deleteEvent(parseInt(editIndex));
            eventModal.style.display = 'none';
            loadEvents(selectedDate);
        }
    });

    // Note Edit Modal
    const noteEditModal = document.getElementById('note-edit-modal');
    const closeNoteEditModal = document.querySelector('#note-edit-modal .close');

    // Event delegation for note list items
    document.getElementById('notes-list').addEventListener('click', function (e) {
        if (e.target.tagName === 'LI') {
            openNoteEditModal(e.target, selectedDate);
        }
    });

    closeNoteEditModal.addEventListener('click', function () {
        noteEditModal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target == noteEditModal) {
            noteEditModal.style.display = 'none';
        }
    });

    // Note Edit Form Submit
    document.getElementById('note-edit-form').addEventListener('submit', function (e) {
        e.preventDefault();

        const content = document.getElementById('note-edit-content').value;
        const index = parseInt(document.getElementById('note-edit-index').value);

        if (!content) {
            alert('Please enter note content');
            return;
        }

        // Update note
        updateNote(selectedDate, index, content);

        // Close modal
        noteEditModal.style.display = 'none';
    });

    // Delete Note Button
    document.getElementById('delete-note').addEventListener('click', function () {
        const index = parseInt(document.getElementById('note-edit-index').value);
        deleteNote(selectedDate, index);
        noteEditModal.style.display = 'none';
    });
});

function updateDateDisplay(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateString = date.toLocaleDateString('en-US', options);

    // Extract month, day, year and weekday separately
    const parts = dateString.split(', ');
    const weekday = parts[0];
    const monthDay = parts[1].split(' ');
    const month = monthDay[0];
    const day = monthDay[1];
    const year = parts[2];

    document.getElementById('current-date').textContent = `${month} ${day}, ${year}`;
    document.getElementById('current-day').textContent = weekday;
}

function generateTimeline() {
    const timeline = document.querySelector('.timeline');
    timeline.innerHTML = ''; // Clear existing timeline

    // AM hours: 1am-11am
    for (let i = 1; i <= 11; i++) {
        createHourSlot(`${i} am`);
    }

    // 12pm (noon)
    createHourSlot(`12 pm`);

    // PM hours: 1pm-11pm
    for (let i = 1; i <= 11; i++) {
        createHourSlot(`${i} pm`);
    }

    // 12am (midnight)
    createHourSlot(`12 am`);
}

function createHourSlot(hourLabel) {
    const hourSlot = document.createElement('div');
    hourSlot.className = 'hour-slot';
    hourSlot.innerHTML = `<div class="hour-label">${hourLabel}</div>`;
    document.querySelector('.timeline').appendChild(hourSlot);
    return hourSlot;
}

function openEventModal(startTime, date) {
    // Reset form for adding new event
    document.getElementById('event-modal-title').textContent = 'Add New Event';
    document.getElementById('event-submit-btn').textContent = 'Add Event';
    document.getElementById('delete-event').style.display = 'none';
    document.getElementById('event-edit-index').value = '';

    // Generate time options
    generateTimeOptions();

    // Set start time
    document.getElementById('event-start').value = startTime;

    // Calculate a reasonable end time (1 hour after start)
    const startIndex = getHourIndex(startTime);
    const endSelect = document.getElementById('event-end');
    const maxIndex = endSelect.options.length - 1;

    // Only set end time if there's a next hour available
    if (startIndex < maxIndex) {
        const endIndex = startIndex + 1;
        if (endSelect.options.length > endIndex) {
            endSelect.value = endSelect.options[endIndex].value;
        }
    } else {
        // If at the last hour, set end time to the same as start
        endSelect.value = startTime;
    }

    // Clear other fields
    document.getElementById('event-title').value = '';
    document.getElementById('event-location').value = '';
    document.getElementById('event-type').value = 'event-work';

    // Show modal
    document.getElementById('event-modal').style.display = 'block';
}

function openEventEditModal(event, eventIndex, date) {
    // Set form for editing event
    document.getElementById('event-modal-title').textContent = 'Edit Event';
    document.getElementById('event-submit-btn').textContent = 'Update Event';
    document.getElementById('delete-event').style.display = 'block';
    document.getElementById('event-edit-index').value = eventIndex;

    // Generate time options
    generateTimeOptions();

    // Populate form with event data
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-start').value = event.start;
    document.getElementById('event-end').value = event.end;
    document.getElementById('event-location').value = event.location || '';
    document.getElementById('event-type').value = event.type;

    // Show modal
    document.getElementById('event-modal').style.display = 'block';
}

function generateTimeOptions() {
    const startSelect = document.getElementById('event-start');
    const endSelect = document.getElementById('event-end');

    // Clear existing options
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';

    // Generate AM options: 1am-11am
    for (let i = 1; i <= 11; i++) {
        const timeLabel = `${i} am`;
        addTimeOption(startSelect, timeLabel);
        addTimeOption(endSelect, timeLabel);
    }

    // 12pm (noon)
    addTimeOption(startSelect, '12 pm');
    addTimeOption(endSelect, '12 pm');

    // Generate PM options: 1pm-11pm
    for (let i = 1; i <= 11; i++) {
        const timeLabel = `${i} pm`;
        addTimeOption(startSelect, timeLabel);
        addTimeOption(endSelect, timeLabel);
    }

    // 12am (midnight)
    addTimeOption(startSelect, '12 am');
    addTimeOption(endSelect, '12 am');
}

function addTimeOption(selectElement, timeLabel) {
    const option = document.createElement('option');
    option.value = timeLabel;
    option.textContent = timeLabel;
    selectElement.appendChild(option);
}

// Event storage and display functions
function loadEvents(date) {
    const events = getEventsForDate(date);
    displayEvents(events, date);
}

function getAllEvents() {
    const eventsJSON = localStorage.getItem('calendar_events');
    return eventsJSON ? JSON.parse(eventsJSON) : [];
}

function getEventsForDate(date) {
    const dateString = formatDateForStorage(date);
    const eventsJSON = localStorage.getItem('calendar_events');
    const allEvents = eventsJSON ? JSON.parse(eventsJSON) : [];

    return allEvents.filter(event => event.date === dateString);
}

function addEvent(event) {
    const events = getAllEvents();
    events.push(event);
    localStorage.setItem('calendar_events', JSON.stringify(events));
}

function updateEvent(index, updatedEvent) {
    const events = getAllEvents();
    if (index >= 0 && index < events.length) {
        events[index] = updatedEvent;
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }
}

function deleteEvent(index) {
    const events = getAllEvents();
    if (index >= 0 && index < events.length) {
        events.splice(index, 1);
        localStorage.setItem('calendar_events', JSON.stringify(events));
    }
}

function displayEvents(events, date) {
    // Clear existing events
    const existingEvents = document.querySelectorAll('.timeline-event');
    existingEvents.forEach(el => el.remove());

    // Get all events to find global indices
    const allEvents = getAllEvents();
    const dateString = formatDateForStorage(date);

    // Add each event to the timeline
    events.forEach((event, localIndex) => {
        // Find the global index of this event
        const globalIndex = allEvents.findIndex(e =>
            e.date === dateString &&
            e.title === event.title &&
            e.start === event.start &&
            e.end === event.end &&
            e.type === event.type
        );
        displayEvent(event, globalIndex >= 0 ? globalIndex : localIndex, date);
    });
}

function displayEvent(event, eventIndex, date) {
    // Find the start and end hour slots
    const startHour = getHourIndex(event.start);
    const endHour = getHourIndex(event.end);

    if (startHour === -1 || endHour === -1) return;

    // Calculate position and height
    const hourSlots = document.querySelectorAll('.hour-slot');
    const startSlot = hourSlots[startHour];

    // Create event element
    const eventElement = document.createElement('div');
    eventElement.className = `timeline-event ${event.type}`;
    eventElement.innerHTML = `
        <strong>${event.title}</strong><br>
        ${event.start} - ${event.end}<br>
        ${event.location}
    `;

    // Store the event index and date for editing
    eventElement.setAttribute('data-event-index', eventIndex);
    eventElement.setAttribute('data-event-date', formatDateForStorage(date));

    // Add click event listener to open edit modal
    eventElement.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent triggering timeline click
        const index = parseInt(this.getAttribute('data-event-index'));
        const events = getAllEvents();
        if (index >= 0 && index < events.length) {
            openEventEditModal(events[index], index, date);
        }
    });

    // Position the event
    const startPosition = startSlot.offsetTop;
    const height = (endHour - startHour) * 60; // Each hour is 60px tall

    eventElement.style.top = `${startPosition}px`;
    eventElement.style.height = `${height}px`;

    document.querySelector('.timeline').appendChild(eventElement);
}

function getHourIndex(timeString) {
    const [hour, period] = timeString.split(' ');
    let hourNum = parseInt(hour);

    // Timeline order: 1am-11am (indices 0-10), 12pm (index 11), 1pm-11pm (indices 12-22), 12am (index 23)
    if (period === 'am') {
        // AM hours: 1am=0, 2am=1, ..., 11am=10
        if (hourNum === 12) {
            return 23; // 12am is at the end (index 23)
        }
        return hourNum - 1; // 1am=0, 2am=1, etc.
    } else {
        // PM hours: 12pm=11, 1pm=12, 2pm=13, ..., 11pm=22
        if (hourNum === 12) {
            return 11; // 12pm comes after 11am (index 11)
        }
        return 11 + hourNum; // 1pm=12, 2pm=13, etc.
    }
}

// Note management functions
function loadNotes(date) {
    const dateString = formatDateForStorage(date);
    const savedNotes = localStorage.getItem(`calendar_notes_${dateString}`);

    if (savedNotes) {
        const notes = JSON.parse(savedNotes);
        displayNotes(notes);
    } else {
        // Empty notes list
        displayNotes([]);
    }
}

function addNote(date) {
    const noteInput = document.getElementById('notes-input').value.trim();

    if (!noteInput) {
        alert('Please enter a note before saving');
        return;
    }

    // Get existing notes
    const dateString = formatDateForStorage(date);
    const savedNotes = localStorage.getItem(`calendar_notes_${dateString}`);
    let notes = savedNotes ? JSON.parse(savedNotes) : [];

    // Add new note
    notes.push(noteInput);

    // Save to localStorage
    localStorage.setItem(`calendar_notes_${dateString}`, JSON.stringify(notes));

    // Update display
    displayNotes(notes);

    // Clear input
    document.getElementById('notes-input').value = '';

    // Show confirmation
    const saveBtn = document.getElementById('save-notes');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'ADDED!';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 1000);
}

function displayNotes(notes) {
    const notesList = document.getElementById('notes-list');
    notesList.innerHTML = '';

    notes.forEach((note, index) => {
        const li = document.createElement('li');
        li.textContent = note;
        li.dataset.index = index;
        notesList.appendChild(li);
    });
}

function openNoteEditModal(noteElement, date) {
    const index = noteElement.dataset.index;
    const content = noteElement.textContent;

    // Set form values
    document.getElementById('note-edit-content').value = content;
    document.getElementById('note-edit-index').value = index;

    // Show modal
    document.getElementById('note-edit-modal').style.display = 'block';
}

function updateNote(date, index, content) {
    // Get existing notes
    const dateString = formatDateForStorage(date);
    const savedNotes = localStorage.getItem(`calendar_notes_${dateString}`);
    let notes = savedNotes ? JSON.parse(savedNotes) : [];

    // Update note at index
    notes[index] = content;

    // Save to localStorage
    localStorage.setItem(`calendar_notes_${dateString}`, JSON.stringify(notes));

    // Update display
    displayNotes(notes);
}

function deleteNote(date, index) {
    // Get existing notes
    const dateString = formatDateForStorage(date);
    const savedNotes = localStorage.getItem(`calendar_notes_${dateString}`);
    let notes = savedNotes ? JSON.parse(savedNotes) : [];

    // Remove note at index
    notes.splice(index, 1);

    // Save to localStorage
    localStorage.setItem(`calendar_notes_${dateString}`, JSON.stringify(notes));

    // Update display
    displayNotes(notes);
}

function formatDateForStorage(date) {
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function navigateDay(offset, currentDate) {
    // Create new date by adding offset
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);

    // Update URL with new date
    const dateString = formatDateForStorage(newDate);
    window.location.href = `day-view.html?date=${dateString}`;
}

// Task management functions
function loadTasks(date) {
    const dateString = formatDateForStorage(date);
    const allTasks = getAllTasks();
    const dayTasks = allTasks.filter(task => task.date === dateString);
    displayTasks(dayTasks);
}

function getAllTasks() {
    const tasksJSON = localStorage.getItem('calendar_tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function displayTasks(tasks) {
    const tasksContent = document.getElementById('tasks-content');
    tasksContent.innerHTML = '';

    if (tasks.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'no-tasks-message';
        emptyMessage.textContent = 'No tasks assigned for this day.';
        tasksContent.appendChild(emptyMessage);
        return;
    }

    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        tasksContent.appendChild(taskElement);
    });
}

function createTaskElement(task, index) {
    const taskDiv = document.createElement('div');
    taskDiv.className = `task-item ${task.type}`;

    const priorityStars = '★'.repeat(parseInt(task.priority) || 0);
    const priorityText = task.priority > 0 ? `Priority: ${priorityStars}` : '';

    taskDiv.innerHTML = `
        <div class="task-content">
            <strong class="task-title">${task.title}</strong>
            <div class="task-meta">
                <span class="task-type">${task.type.charAt(0).toUpperCase() + task.type.slice(1)}</span>
                ${priorityText ? `<span class="task-priority">${priorityText}</span>` : ''}
            </div>
        </div>
    `;

    return taskDiv;
}