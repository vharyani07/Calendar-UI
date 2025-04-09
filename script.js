document.addEventListener('DOMContentLoaded', function() {
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let tasks = loadTasks();
    
    // Initialize calendar
    renderCalendar(currentMonth, currentYear);
    
    // Add event listeners for month navigation
    document.getElementById('prev-month').addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar(currentMonth, currentYear);
    });
    
    document.getElementById('next-month').addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar(currentMonth, currentYear);
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
    const stars = document.querySelectorAll('.star');
    let currentRating = 0;
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            setRating(rating);
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseout', function() {
            highlightStars(currentRating);
        });
    });
    
    function highlightStars(rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            star.classList.toggle('active', starRating <= rating);
        });
    }
    
    function setRating(rating) {
        currentRating = rating;
        document.getElementById('task-priority').value = rating;
        highlightStars(rating);
    }
    
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
        setRating(0);
        taskModal.style.display = 'none';
        
        // Re-render calendar
        renderCalendar(currentMonth, currentYear);
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
            addEventToDay(dayElement, task.title, task.type, starRating);
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
        const monthForUrl = month + 1; // JavaScript months are 0-indexed
        window.location.href = `day-view.html?date=${year}-${monthForUrl}-${dayNumber}`;
    });
    
    return dayElement;
}

function addEventToDay(dayElement, eventText, eventType, priority) {
    const eventElement = document.createElement('div');
    eventElement.className = `event ${eventType}`;
    
    const eventContent = document.createElement('div');
    eventContent.className = 'event-content';
    eventContent.textContent = eventText;
    eventElement.appendChild(eventContent);
    
    const priorityElement = document.createElement('div');
    priorityElement.className = 'priority';
    priorityElement.innerHTML = `Priority: ${priority}`;
    eventElement.appendChild(priorityElement);
    
    dayElement.appendChild(eventElement);
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