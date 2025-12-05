// Add debug console log for clicking event
document.addEventListener('click', function(e) {
    if (e.target.closest('.event')) {
        console.log('Event clicked:', e.target.closest('.event'));
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Declare these variables in global scope for the file
    window.currentMonth = new Date().getMonth();
    window.currentYear = new Date().getFullYear();
    let tasks = loadTasks();
    
    // Initialize calendar
    renderCalendar(window.currentMonth, window.currentYear);
    
    // Add event listeners for month navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        window.currentMonth--;
        if (window.currentMonth < 0) {
            window.currentMonth = 11;
            window.currentYear--;
        }
        renderCalendar(window.currentMonth, window.currentYear);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        window.currentMonth++;
        if (window.currentMonth > 11) {
            window.currentMonth = 0;
            window.currentYear++;
        }
        renderCalendar(window.currentMonth, window.currentYear);
    });
    
    // Add Task Modal
    const taskModal = document.getElementById('task-modal');
    const addTaskBtn = document.getElementById('add-general-task');
    const closeTaskModal = document.querySelector('#task-modal .close');
    
    addTaskBtn.addEventListener('click', function() {
        // Set today's date as default
        document.getElementById('task-date').valueAsDate = new Date();
        taskModal.style.display = 'block';
    });
    
    closeTaskModal.addEventListener('click', function() {
        taskModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    });
    
    // Star Rating Functionality
    initializeStarRating('.star', 'task-priority');
    initializeStarRating('#edit-star-rating .star', 'task-edit-priority');
    
    // Task Form Submit
    document.getElementById('task-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-title').value;
        const date = document.getElementById('task-date').value;
        const type = document.getElementById('task-type').value;
        const priority = document.getElementById('task-priority').value;
        
        if (!title || !date) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Create new task object
        const task = {
            title: title,
            date: date,
            type: type,
            priority: priority
        };
        
        // Add task to storage
        addTask(task);
        
        // Reset form and close modal
        document.getElementById('task-form').reset();
        resetStarRating('.star');
        taskModal.style.display = 'none';
        
        // Re-render calendar
        renderCalendar(window.currentMonth, window.currentYear);
    });
    
    // Task Edit Modal
    const taskEditModal = document.getElementById('task-edit-modal');
    const closeTaskEditModal = document.querySelector('#task-edit-modal .close');
    
    closeTaskEditModal.addEventListener('click', function() {
        taskEditModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target == taskEditModal) {
            taskEditModal.style.display = 'none';
        }
    });
    
    // Task Edit Form Submit
    document.getElementById('task-edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const title = document.getElementById('task-edit-title').value;
        const date = document.getElementById('task-edit-date').value;
        const type = document.getElementById('task-edit-type').value;
        const priority = document.getElementById('task-edit-priority').value;
        const index = parseInt(document.getElementById('task-edit-index').value);
        
        if (!title || !date) {
            alert('Please fill in all required fields');
            return;
        }
        
        // Update task
        updateTask(index, {
            title: title,
            date: date,
            type: type,
            priority: priority
        });
        
        // Close modal
        taskEditModal.style.display = 'none';
        
        // Re-render calendar
        renderCalendar(window.currentMonth, window.currentYear);
    });
    
    // Delete Task Button
    document.getElementById('delete-task').addEventListener('click', function() {
        const index = parseInt(document.getElementById('task-edit-index').value);
        deleteTask(index);
        taskEditModal.style.display = 'none';
        
        // Re-render calendar
        renderCalendar(window.currentMonth, window.currentYear);
    });
});

function renderCalendar(month, year) {
    // Update month and year display
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    document.getElementById('current-month').textContent = `${monthNames[month]} ${year}`;
    
    // Get first day of month and total days in month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get days in previous month for filling in the grid
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    
    // Clear existing calendar grid (except day of week headers)
    const calendarGrid = document.querySelector('.calendar-grid');
    
    // Remove all day elements, keeping the day of week headers
    const dayElements = document.querySelectorAll('.day, .week-label');
    dayElements.forEach(el => el.remove());
    
    // Add week label
    const weekLabel = document.createElement('div');
    weekLabel.className = 'week-label';
    weekLabel.textContent = 'Week 1';
    calendarGrid.appendChild(weekLabel);
    
    // Fill in days from previous month
    let dayCount = 1;
    for (let i = 0; i < firstDay; i++) {
        const dayFromPrevMonth = daysInPrevMonth - firstDay + i + 1;
        const dayElement = createDayElement(dayFromPrevMonth, true, prevMonth, prevYear);
        calendarGrid.appendChild(dayElement);
        dayCount++;
    }
    
    // Fill in days of current month
    for (let i = 1; i <= daysInMonth; i++) {
        const dayElement = createDayElement(i, false, month, year);
        
        // Add tasks for this day
        const formattedDate = formatDateString(year, month, i);
        const dayTasks = getTasksForDate(formattedDate);
        
        dayTasks.forEach(task => {
            const starRating = '★'.repeat(parseInt(task.priority));
            addEventToDay(dayElement, task, starRating);
        });
        
        calendarGrid.appendChild(dayElement);
        
        // Add week label after every Saturday (day 6)
        if ((firstDay + i) % 7 === 0 && i < daysInMonth) {
            const weekNumber = Math.ceil((firstDay + i) / 7) + 1;
            const weekLabel = document.createElement('div');
            weekLabel.className = 'week-label';
            weekLabel.textContent = `Week ${weekNumber}`;
            calendarGrid.appendChild(weekLabel);
        }
        
        dayCount++;
    }
    
    // Fill in days from next month
    const totalCells = Math.ceil(dayCount / 7) * 7;
    const daysFromNextMonth = totalCells - dayCount;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysFromNextMonth; i++) {
        const dayElement = createDayElement(i, true, nextMonth, nextYear);
        calendarGrid.appendChild(dayElement);
    }
}

function createDayElement(dayNumber, differentMonth, month, year) {
    // Handle month overflow
    if (month > 11) {
        month = 0;
        year++;
    } else if (month < 0) {
        month = 11;
        year--;
    }
    
    const dayElement = document.createElement('div');
    dayElement.className = 'day';
    if (differentMonth) {
        dayElement.classList.add('different-month');
    }
    
    const dayNumberElement = document.createElement('div');
    dayNumberElement.className = 'day-number';
    dayNumberElement.textContent = dayNumber;
    dayElement.appendChild(dayNumberElement);
    
    // Add click event to navigate to day view
    dayElement.addEventListener('click', function() {
        // Navigate to day view with the date as a parameter
        const monthForUrl = String(month + 1).padStart(2, '0'); // JavaScript months are 0-indexed
        const dayForUrl = String(dayNumber).padStart(2, '0');
        window.location.href = `day-view.html?date=${year}-${monthForUrl}-${dayForUrl}`;
    });
    
    return dayElement;
}

function addEventToDay(dayElement, task, priority) {
    const eventElement = document.createElement('div');
    eventElement.className = `event ${task.type}`;
    
    const eventContent = document.createElement('div');
    eventContent.className = 'event-content';
    eventContent.textContent = task.title;
    eventElement.appendChild(eventContent);
    
    const priorityElement = document.createElement('div');
    priorityElement.className = 'priority';
    priorityElement.innerHTML = `Priority: ${priority}`;
    eventElement.appendChild(priorityElement);
    
    // Store the task index for easy reference
    const tasks = loadTasks();
    const taskIndex = tasks.findIndex(t => 
        t.title === task.title && 
        t.date === task.date && 
        t.type === task.type
    );
    
    eventElement.setAttribute('data-task-index', taskIndex);
    
    // Add click event listener to open edit modal
    eventElement.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering the day click event
        const index = parseInt(this.getAttribute('data-task-index'));
        
        if (index >= 0) {
            const tasks = loadTasks();
            if (index < tasks.length) {
                openTaskEditModal(tasks[index], index);
            }
        }
    });
    
    dayElement.appendChild(eventElement);
}

// Initialize star rating functionality
function initializeStarRating(selector, hiddenInputId) {
    const stars = document.querySelectorAll(selector);
    let currentRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            currentRating = rating;
            document.getElementById(hiddenInputId).value = rating;
            
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                s.classList.toggle('active', starRating <= rating);
            });
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                s.classList.toggle('active', starRating <= rating);
            });
        });
        
        star.addEventListener('mouseout', function() {
            stars.forEach(s => {
                const starRating = parseInt(s.getAttribute('data-rating'));
                s.classList.toggle('active', starRating <= currentRating);
            });
        });
    });
}

// Reset star rating
function resetStarRating(selector) {
    const stars = document.querySelectorAll(selector);
    stars.forEach(star => {
        star.classList.remove('active');
    });
}

// Set star rating programmatically
function setStarRating(selector, hiddenInputId, rating) {
    const stars = document.querySelectorAll(selector);
    document.getElementById(hiddenInputId).value = rating;
    
    stars.forEach(star => {
        const starRating = parseInt(star.getAttribute('data-rating'));
        star.classList.toggle('active', starRating <= rating);
    });
}

// Task Storage Functions
function loadTasks() {
    const tasksJSON = localStorage.getItem('calendar_tasks');
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}

function saveTasks(tasks) {
    localStorage.setItem('calendar_tasks', JSON.stringify(tasks));
}

function addTask(task) {
    const tasks = loadTasks();
    tasks.push(task);
    saveTasks(tasks);
}

function updateTask(index, updatedTask) {
    const tasks = loadTasks();
    if (index >= 0 && index < tasks.length) {
        tasks[index] = updatedTask;
        saveTasks(tasks);
    }
}

function deleteTask(index) {
    const tasks = loadTasks();
    if (index >= 0 && index < tasks.length) {
        tasks.splice(index, 1);
        saveTasks(tasks);
    }
}

function getTasksForDate(dateString) {
    const tasks = loadTasks();
    return tasks.filter(task => task.date === dateString);
}

function formatDateString(year, month, day) {
    // Format as YYYY-MM-DD for storage
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${monthStr}-${dayStr}`;
}

function openTaskEditModal(task, taskIndex) {
    // Set form values
    document.getElementById('task-edit-title').value = task.title;
    document.getElementById('task-edit-date').value = task.date;
    document.getElementById('task-edit-type').value = task.type;
    document.getElementById('task-edit-index').value = taskIndex;
    
    // Set priority stars
    const priority = parseInt(task.priority) || 0;
    setStarRating('#edit-star-rating .star', 'task-edit-priority', priority);
    
    // Show modal
    document.getElementById('task-edit-modal').style.display = 'block';
}