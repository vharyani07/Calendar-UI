document.addEventListener('DOMContentLoaded', function() {
    // Get date from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dateParam = urlParams.get('date');
    let selectedDate = dateParam ? new Date(dateParam) : new Date();
    
    // Check if date is valid, otherwise use current date
    if (isNaN(selectedDate.getTime())) {
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
    
    // Event listeners
    document.getElementById('save-notes').addEventListener('click', function() {
        addNote(selectedDate);
    });
    
    document.getElementById('clear-note').addEventListener('click', function() {
        document.getElementById('notes-input').value = '';
    });
    
    document.querySelector('.prev-day').addEventListener('click', function() {
        navigateDay(-1, selectedDate);
    });
    
    document.querySelector('.next-day').addEventListener('click', function() {
        navigateDay(1, selectedDate);
    });
    
    // Event Modal
    const eventModal = document.getElementById('event-modal');
    const closeEventModal = document.querySelector('#event-modal .close');
    
    // When clicking on a timeline slot, open the event modal
    document.getElementById('timeline').addEventListener('click', function(e) {
        // Only respond if clicking on an hour slot (not on an existing event)
        if (e.target.classList.contains('hour-slot') || e.target.classList.contains('hour-label')) {
            const hourSlot = e.target.closest('.hour-slot');
            if (hourSlot) {
                const hourLabel = hourSlot.querySelector('.hour-label').textContent;
                openEventModal(hourLabel, selectedDate);
            }
        }
    });
    
    closeEventModal.addEventListener('click', function() {
        eventModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target == eventModal) {
            eventModal.style.display = 'none';
        }
    });
    
    // Event Form Submit
    document.getElementById('event-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('event-title').value;
        const start = document.getElementById('event-start').value;
        const end = document.getElementById('event-end').value;
        const location = document.getElementById('event-location').value;
        const type = document.getElementById('event-type').value;
        
        if (!title || !start || !end) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Validate time range
        if (start >= end) {
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
        
        // Add event
        addEvent(event);
        
        // Reset form and close modal
        document.getElementById('event-form').reset();
        eventModal.style.display = 'none';
        
        // Reload events
        loadEvents(selectedDate);
    });
    
    // Note Edit Modal
    const noteEditModal = document.getElementById('note-edit-modal');
    const closeNoteEditModal = document.querySelector('#note-edit-modal .close');
    
    // Event delegation for note list items
    document.getElementById('notes-list').addEventListener('click', function(e) {
        if (e.target.tagName === 'LI') {
            openNoteEditModal(e.target, selectedDate);
        }
    });
    
    closeNoteEditModal.addEventListener('click', function() {
        noteEditModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target == noteEditModal) {
            noteEditModal.style.display = 'none';
        }
    });
    
    // Note Edit Form Submit
    document.getElementById('note-edit-form').addEventListener('submit', function(e) {
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
    document.getElementById('delete-note').addEventListener('click', function() {
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
    
    for (let i = 1; i <= 12; i++) {
        // AM hours
        createHourSlot(`${i} am`);
    }
    
    // PM hours
    for (let i = 1; i <= 11; i++) {
        createHourSlot(`${i} pm`);
    }
}

function createHourSlot(hourLabel) {
    const hourSlot = document.createElement('div');
    hourSlot.className = 'hour-slot';
    hourSlot.innerHTML = `<div class="hour-label">${hourLabel}</div>`;
    document.querySelector('.timeline').appendChild(hourSlot);
    return hourSlot;
}

function openEventModal(startTime, date) {
    // Generate time options
    generateTimeOptions();
    
    // Set start time
    document.getElementById('event-start').value = startTime;
    
    // Calculate a reasonable end time (1 hour after start)
    const startIndex = getHourIndex(startTime);
    const endIndex = (startIndex + 1) % 23; // Wrap around if needed
    
    // Find the option with the end time
    const endSelect = document.getElementById('event-end');
    if (endSelect.options.length > endIndex) {
        endSelect.value = endSelect.options[endIndex].value;
    }
    
    // Show modal
    document.getElementById('event-modal').style.display = 'block';
}

function generateTimeOptions() {
    const startSelect = document.getElementById('event-start');
    const endSelect = document.getElementById('event-end');
    
    // Clear existing options
    startSelect.innerHTML = '';
    endSelect.innerHTML = '';
    
    // Generate AM options
    for (let i = 1; i <= 12; i++) {
        const timeLabel = `${i} am`;
        addTimeOption(startSelect, timeLabel);
        addTimeOption(endSelect, timeLabel);
    }
    
    // Generate PM options
    for (let i = 1; i <= 11; i++) {
        const timeLabel = `${i} pm`;
        addTimeOption(startSelect, timeLabel);
        addTimeOption(endSelect, timeLabel);
    }
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
    displayEvents(events);
}

function getEventsForDate(date) {
    const dateString = formatDateForStorage(date);
    const eventsJSON = localStorage.getItem('calendar_events');
    const allEvents = eventsJSON ? JSON.parse(eventsJSON) : [];
    
    return allEvents.filter(event => event.date === dateString);
}

function addEvent(event) {
    const eventsJSON = localStorage.getItem('calendar_events');
    const events = eventsJSON ? JSON.parse(eventsJSON) : [];
    
    events.push(event);
    localStorage.setItem('calendar_events', JSON.stringify(events));
}

function displayEvents(events) {
    // Clear existing events
    const existingEvents = document.querySelectorAll('.timeline-event');
    existingEvents.forEach(el => el.remove());
    
    // Add each event to the timeline
    events.forEach(event => {
        displayEvent(event);
    });
}

function displayEvent(event) {
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
    
    if (period === 'pm' && hourNum !== 12) {
        hourNum += 12;
    } else if (period === 'am' && hourNum === 12) {
        hourNum = 0;
    }
    
    // Convert 24-hour format to index (1am is index 0)
    if (hourNum === 0) return 11; // 12am
    return hourNum - 1;
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