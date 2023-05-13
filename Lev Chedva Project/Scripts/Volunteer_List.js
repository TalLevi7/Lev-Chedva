let volunteersArray = [];
const volunteersTable = document.getElementById('volunteer-list');
const db = firebase.firestore();
const volunteersRef = db.collection("Volunteers");
const filterBar = document.getElementById("authorization-filter");

async function readVolunteers() {
  try {
    const snapshot = await volunteersRef.get();
    snapshot.forEach((doc) => {
      if (doc.exists) {
        volunteersArray.push(doc.data());
      } else {
        console.log("No such document!");
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }
  preDisplayVolunteers("all");
}

filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  console.log(selectedValue);
  preDisplayVolunteers(selectedValue);
});

function preDisplayVolunteers(filter) {
  volunteersTable.innerHTML = "";
  if (filter === "Manager") filter = '0';

  volunteersArray.forEach((volunteerData) => {
    if (filter === "all") {
      displayVolunteers(volunteerData);
    } else {
      let AuthString = volunteerData.Authorizations;
      if (AuthString.toLowerCase().includes(filter.toLowerCase()))
        displayVolunteers(volunteerData);
    }
  });
}

function displayVolunteers(volunteerData) {
  const row = document.createElement('tr');
  const emailCell = document.createElement('td');
  emailCell.textContent = volunteerData.email;
  const nameCell = document.createElement('td');
  
  nameCell.textContent = volunteerData.firstName + " " + volunteerData.lastName;
  nameCell.style.textAlign = "right";
  row.appendChild(emailCell);
  row.appendChild(nameCell);
  volunteersTable.appendChild(row);

  row.addEventListener('click', () => {
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('volunteer-details-row')) {
      row.parentElement.removeChild(detailsRow);
    } else {
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
      let validBtn = false;
    
      manageAuthButton.addEventListener('click', () => {
        if (validBtn === true)
          return;
    
        const authRow = manageAuthButton.parentElement.nextElementSibling;
        if (authRow && authRow.classList.contains('volunteer-auth-row')) {
          authRow.parentElement.removeChild(authRow);
        } else {
          const authRow = document.createElement('tr');
          authRow.classList.add('volunteer-auth-row');
          const authCell = document.createElement('td');
          authCell.colSpan = 8;
          const authForm = document.createElement('form');
          const authCheckboxes = [
            { name: 'Manager', value: '0' },
            { name: 'Volunteer_Manager', value: 'Volunteer_Manager' },
            { name: 'Transit', value: 'Transit' },
            { name: 'Telephone', value: 'Telephone' },
            { name: 'Telephone_Manager', value: 'Telephone_Manager' },
            { name: 'General', value: 'General' }
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
          submitButton.addEventListener('click', (e) => {
            e.preventDefault();
    
            const selectedAuths = Array.from(authForm.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value).join(', ');
            const docRef = db.collection("Volunteers").doc(volunteerData.email);
            docRef.update({
              Authorizations: selectedAuths
            }).then(() => {
              authItem.textContent = "Authorizations: " + selectedAuths;
              authRow.parentElement.removeChild(authRow);
            }).catch((error) => {
              console.error("Error updating document: ", error);
            });
    
            validBtn = false;
          });
    
          authCell.appendChild(authForm);
          authRow.appendChild(authCell);
          manageAuthButton.parentElement.parentElement.after(authRow);
        }
        validBtn = true;
      });
    
      const editUserBtn = document.createElement('button');
      editUserBtn.textContent = 'Edit User';
      detailsList.appendChild(editUserBtn);
    
      editUserBtn.addEventListener('click', () => {
        const makeEditable = (item, field) => {
          const [label, value] = item.textContent.split(": ");
          const editableValue = document.createElement("span");
          editableValue.contentEditable = true;
          editableValue.textContent = value.trim();
          item.innerHTML = `${label}: `;
          item.appendChild(editableValue);
          editableValue.addEventListener("blur", async () => {
            const newValue = editableValue.textContent;
            const userId = volunteerData.ID;
            try {
              await updateUserField(userId, field, newValue);
              volunteerData[field] = newValue;
              item.innerHTML = `${label}: ${newValue}`;
            } catch (error) {
              console.error("Error updating document:", error);
            }
          });
        };
    
        const updateUserField = async (userId, field, newValue) => {
          try {
            const docRef = db.collection("Volunteers").doc(volunteerData.email);
            await docRef.update({ [field]: newValue });
          } catch (error) {
            console.error("Error updating document:", error);
            throw error;
          }
        };
    
        makeEditable(firstNameItem, "firstName");
        makeEditable(lastNameItem, "lastName");
        makeEditable(emailItem, "email");
        makeEditable(phoneItem, "phone");
        makeEditable(addressItem, "address");
    
        const saveChangesBtn = document.createElement('button');
        saveChangesBtn.textContent = 'Save Changes';
        detailsList.appendChild(saveChangesBtn);
    
        saveChangesBtn.addEventListener('click', () => {
          firstNameItem.textContent = "First Name: " + volunteerData.firstName;
          lastNameItem.textContent = "Last Name: " + volunteerData.lastName;
          emailItem.textContent = "Email: " + volunteerData.email;
          phoneItem.textContent = "Phone: " + volunteerData.phone;
          addressItem.textContent = "Address: " + volunteerData.address;
    
          nameCell.textContent = volunteerData.firstName + " " + volunteerData.lastName;
          emailCell.textContent = volunteerData.email;
    
          detailsList.removeChild(saveChangesBtn);
        });
      });
    }
  });
}

readVolunteers();    
    