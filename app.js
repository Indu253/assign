// Global variable to track the current logged-in user
let currentUser = null;

// Load initial data on page load
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('currentUser')) {
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    showDashboard();
  }
});

// Signup function
function signup() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!username || !password) {
    alert('Username and Password are required');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  if (users.some((user) => user.username === username)) {
    alert('User already exists. Please log in.');
    return;
  }

  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Signup successful! Please log in.');
}

// Login function
function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((user) => user.username === username && user.password === password);

  if (!user) {
    alert('Invalid username or password');
    return;
  }

  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  showDashboard();
}

// Logout function
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  showAuth();
}

// Show Forgot Password page
function showForgotPassword() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('forgot-password').style.display = 'block';
}

// Retrieve Password function
function retrievePassword() {
  const username = document.getElementById('forgot-username').value.trim();
  if (!username) {
    alert('Please enter your username.');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const user = users.find((user) => user.username === username);

  if (!user) {
    alert('No user found with this username.');
    return;
  }

  alert(`Your password is: ${user.password}`);
  backToAuth();
}

// Go back to the authentication page
function backToAuth() {
  document.getElementById('forgot-password').style.display = 'none';
  document.getElementById('auth').style.display = 'block';
}

// Show the dashboard after login
function showDashboard() {
  document.getElementById('auth').style.display = 'none';
  document.getElementById('forgot-password').style.display = 'none';
  document.getElementById('dashboard').style.display = 'block';
  document.getElementById('current-user').textContent = currentUser.username;
}

// Show the authentication page (Login / Signup)
function showAuth() {
  document.getElementById('auth').style.display = 'block';
  document.getElementById('forgot-password').style.display = 'none';
  document.getElementById('dashboard').style.display = 'none';
}

// Add a car to the list
function addCar() {
  const title = document.getElementById('car-title').value.trim();
  const description = document.getElementById('car-description').value.trim();
  const tags = document.getElementById('car-tags').value.trim().split(',');
  const images = document.getElementById('car-images').files;

  if (!title || !description || images.length === 0) {
    alert('Please provide a title, description, and at least one image.');
    return;
  }

  const car = {
    title,
    description,
    tags: tags.map(tag => tag.trim()),
    images: [],
    owner: currentUser.username
  };

  // Create image preview URLs
  Array.from(images).forEach(image => {
    car.images.push(URL.createObjectURL(image));
  });

  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  cars.push(car);
  localStorage.setItem('cars', JSON.stringify(cars));

  alert('Car added successfully!');
  showCars();
}

// Show the list of cars
function showCars() {
  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  const userCars = cars.filter(car => car.owner === currentUser.username);

  const carList = document.getElementById('car-list');
  carList.innerHTML = '';

  userCars.forEach((car, index) => {
    const carDiv = document.createElement('div');
    carDiv.innerHTML = `
      <h3>${car.title}</h3>
      <p>${car.description}</p>
      <p>Tags: ${car.tags.join(', ')}</p>
      <div>
        ${car.images.map(img => `<img src="${img}" alt="Car Image" width="100" />`).join('')}
      </div>
      <button onclick="editCar(${index})">Edit</button>
      <button onclick="deleteCar(${index})">Delete</button>
    `;
    carList.appendChild(carDiv);
  });
}

// Search cars
function searchCars() {
  const query = document.getElementById('search').value.toLowerCase();
  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  const userCars = cars.filter(car => car.owner === currentUser.username);
  const filteredCars = userCars.filter(car =>
    car.title.toLowerCase().includes(query) ||
    car.description.toLowerCase().includes(query) ||
    car.tags.some(tag => tag.toLowerCase().includes(query))
  );

  const carList = document.getElementById('car-list');
  carList.innerHTML = '';

  filteredCars.forEach((car, index) => {
    const carDiv = document.createElement('div');
    carDiv.innerHTML = `
      <h3>${car.title}</h3>
      <p>${car.description}</p>
      <p>Tags: ${car.tags.join(', ')}</p>
      <div>
        ${car.images.map(img => `<img src="${img}" alt="Car Image" width="100" />`).join('')}
      </div>
      <button onclick="editCar(${index})">Edit</button>
      <button onclick="deleteCar(${index})">Delete</button>
    `;
    carList.appendChild(carDiv);
  });
}

// Edit Car
function editCar(index) {
  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  const car = cars[index];

  // Populate the form with the car's data
  document.getElementById('car-title').value = car.title;
  document.getElementById('car-description').value = car.description;
  document.getElementById('car-tags').value = car.tags.join(', ');

  // Store the index of the car being edited
  document.getElementById('car-title').setAttribute('data-index', index);
  document.getElementById('car-description').setAttribute('data-index', index);
  document.getElementById('car-tags').setAttribute('data-index', index);

  // Show the "Update Car" button
  const addCarButton = document.querySelector('button[onclick="addCar()"]');
  addCarButton.style.display = 'none';

  const updateCarButton = document.createElement('button');
  updateCarButton.textContent = 'Update Car';
  updateCarButton.onclick = () => updateCar(index);
  document.body.appendChild(updateCarButton);
}

// Update Car
function updateCar(index) {
  const title = document.getElementById('car-title').value.trim();
  const description = document.getElementById('car-description').value.trim();
  const tags = document.getElementById('car-tags').value.trim().split(',');

  if (!title || !description || tags.length === 0) {
    alert('Please provide a title, description, and tags.');
    return;
  }

  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  const car = cars[index];
  
  // Update the car details
  car.title = title;
  car.description = description;
  car.tags = tags.map(tag => tag.trim());

  localStorage.setItem('cars', JSON.stringify(cars));
  alert('Car updated successfully!');
  showCars();
  document.querySelector('button[onclick="addCar()"]').style.display = 'inline'; // Show Add Car button again
}

// Delete Car
function deleteCar(index) {
  const cars = JSON.parse(localStorage.getItem('cars') || '[]');
  
  // Remove the car from the list
  cars.splice(index, 1);
  localStorage.setItem('cars', JSON.stringify(cars));

  alert('Car deleted successfully!');
  showCars();
}

