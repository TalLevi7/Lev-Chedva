


const volunteersTable = document.getElementById('volunteer-list');


// Get all documents from the "Volunteers" collection
firebase.firestore().collection("Volunteers").get().then((querySnapshot) => {
  querySnapshot.forEach((doc) => {
    const volunteerData = doc.data();
    
    // Create a new row in the table for each volunteer
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = volunteerData.firstName + " " + volunteerData.lastName;
    const emailCell = document.createElement('td');
    emailCell.textContent = volunteerData.email;
    row.appendChild(nameCell);
    row.appendChild(emailCell);
    volunteersTable.appendChild(row);

    // Add a click event listener to each row to show more details
    row.addEventListener('click', () => {
      // Check if the details row already exists
      const detailsRow = row.nextElementSibling;
      if (detailsRow && detailsRow.classList.contains('volunteer-details-row')) {
        // If the row already exists, remove it to hide the details
        row.parentElement.removeChild(detailsRow);
      } else {
        // Create a new row to display the volunteer details
        const detailsRow = document.createElement('tr');
        detailsRow.classList.add('volunteer-details-row');
        const detailsCell = document.createElement('td');
        detailsCell.colSpan = 8;
        const detailsList = document.createElement('ul');
        const firstNameItem = document.createElement('li');
        firstNameItem.textContent = "First Name: " + volunteerData.firstName;
        const lastNameItem = document.createElement('li');
        lastNameItem.textContent = "Last Name: " + volunteerData.lastName;
        const IDItem = document.createElement('li');
        IDItem.textContent = "ID: " + volunteerData.ID;
        const emailItem = document.createElement('li');
        emailItem.textContent = "Email: " + volunteerData.email;
        const phoneItem = document.createElement('li');
        phoneItem.textContent = "Phone: " + volunteerData.phone;
        const addressItem = document.createElement('li');
        addressItem.textContent = "Address: " + volunteerData.address;
        const authItem = document.createElement('li');
        authItem.textContent = "Authorizations: " + volunteerData.Authorizations;
        const volunteerTypesItem = document.createElement('li');
        volunteerTypesItem.textContent = "Volunteer Types: ";
        const volunteerTypesList = document.createElement('ul');
        volunteerData.volunteerTypes.forEach(type => {
          const typeItem = document.createElement('li');
          typeItem.textContent = type;
          volunteerTypesList.appendChild(typeItem);
        });
        volunteerTypesItem.appendChild(volunteerTypesList);
        
        const vehiclesItem = document.createElement('li');
        vehiclesItem.textContent = "Vehicles: ";
        const vehiclesList = document.createElement('ul');
        volunteerData.vehicles.forEach(vehicle => {
          const vehicleItem = document.createElement('li');
          vehicleItem.textContent = vehicle;
          vehiclesList.appendChild(vehicleItem);
        });
        vehiclesItem.appendChild(vehiclesList);
        
        vehiclesItem.appendChild(vehiclesList);
        detailsList.appendChild(firstNameItem);
        detailsList.appendChild(lastNameItem);
        detailsList.appendChild(IDItem);
        detailsList.appendChild(emailItem);
        detailsList.appendChild(phoneItem);
        detailsList.appendChild(addressItem);
        detailsList.appendChild(authItem);
        detailsList.appendChild(volunteerTypesItem);
        detailsList.appendChild(vehiclesItem);
        detailsCell.appendChild(detailsList);
        detailsRow.appendChild(detailsCell);
        row.after(detailsRow);

        const manageAuthButton = document.createElement('button');
manageAuthButton.textContent = 'Manage Authorizations';
detailsList.appendChild(manageAuthButton);

// Add a click event listener to the "Manage Authorizations" button
manageAuthButton.addEventListener('click', () => {
  // Check if the authorizations row already exists
  const authRow = manageAuthButton.parentElement.nextElementSibling;
  if (authRow && authRow.classList.contains('volunteer-auth-row')) {
    // If the row already exists, remove it to hide the authorizations
    authRow.parentElement.removeChild(authRow);
  } else {
    // Create a new row to display the authorization checkboxes
    const authRow = document.createElement('tr');
    authRow.classList.add('volunteer-auth-row');
    const authCell = document.createElement('td');
    authCell.colSpan = 8;
    const authForm = document.createElement('form');
    const authCheckboxes = [
      { name: 'Manager', value: 'manager' },
      { name: 'Transit', value: 'transit' },
      { name: 'Telephone', value: 'telephone' },
      { name: 'Jeep', value: 'jeep' },
      { name: 'General', value: 'general' }
    ];
    authCheckboxes.forEach(cb => {
      const cbLabel = document.createElement('label');
      const cbInput = document.createElement('input');
      cbInput.type = 'checkbox';
      cbInput.name = cb.value;
      cbInput.value = cb.value;
      if (volunteerData.Authorizations.includes(cb.value)) {
        cbInput.checked = true;
      }
      cbLabel.appendChild(cbInput);
      cbLabel.append(cb.name);
      authForm.appendChild(cbLabel);
    });
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    authForm.appendChild(submitButton);
    
    // Add a click event listener to the "Submit" button
    submitButton.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedAuths = Array.from(authForm.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value).join(', ');
      doc.ref.update({
        Authorizations: selectedAuths
      }).then(() => {
        authItem.textContent = "Authorizations: " + selectedAuths;
        authRow.parentElement.removeChild(authRow);
      }).catch((error) => {
        console.error("Error updating document: ", error);
      });
    });
    
    authCell.appendChild(authForm);
    authRow.appendChild(authCell);
    manageAuthButton.parentElement.parentElement.after(authRow);
  }
});




        
      }
    });
  });
});


