;
let volunteersArray = [];
const volunteersTable = document.getElementById('volunteer-list');
 const db = firebase.firestore();
  const volunteersRef = db.collection("Volunteers");
  const filterBar = document.getElementById("authorization-filter");

  async function readVolunteers() {
  // Get the Firestore instance and the "Volunteers" collection
 
  try {
    // Get all the documents in the "Volunteers" collection
    const snapshot = await volunteersRef.get();

    // Loop through each document
    snapshot.forEach((doc) => {
      // If the document exists, add the data to the volunteersArray
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
  // Return the volunteersArray
}


// Add an event listener to detect changes in the filter bar selection
filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  console.log(selectedValue);
   preDisplayVolunteers(selectedValue);
});


function preDisplayVolunteers(filter)
{
  volunteersTable.innerHTML="";
 if(filter== "Manager")
 filter='0';
 
  volunteersArray.forEach((volunteerData) => {
    if(filter=="all"){
    DisplayVolunteers(volunteerData);
    }else{
   let AuthString=volunteerData.Authorizations;
    if(AuthString.toLowerCase().includes(filter.toLowerCase()))
      DisplayVolunteers(volunteerData);
    }
  })
}



function DisplayVolunteers(volunteerData)
{
  
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

      //authorization button;
    const manageAuthButton = document.createElement('button');
    manageAuthButton.textContent = 'Manage Authorizations';
    detailsList.appendChild(manageAuthButton);
  let ValidBtn=false;
// Add a click event listener to the "Manage Authorizations" button

manageAuthButton.addEventListener('click', () => {
if(ValidBtn==true)
return;

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
  { name: 'Manager', value: '0' },
  { name: 'Transit', value: 'Transit' },
  { name: 'Telephone', value: 'Telephone' },
  { name: 'Jeep', value: 'Jeep' },
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

// Add a click event listener to the "Submit" button
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

 ValidBtn=false; 
});

authCell.appendChild(authForm);
authRow.appendChild(authCell);
manageAuthButton.parentElement.parentElement.after(authRow);
}
ValidBtn=true;
});

// const DelUserBtn = document.createElement('button');
// DelUserBtn.textContent = 'Delete User';
// detailsList.appendChild(DelUserBtn);

// DelUserBtn.addEventListener('click', () => {
//   const email = volunteerData.email;

//   admin.auth().getUserByEmail(email)
//     .then((user) => {
//       const uid = user.uid;
//       return admin.auth().deleteUser(uid);
//     })
//     .then(() => {
//       console.log('Successfully deleted user');
//     })
//     .catch((error) => {
//       console.error('Error deleting user:', error);
//     });
  

// })




}  

})


}


window.addEventListener('load', () => {
  document.getElementById('exportButton').addEventListener('click', () => {
    const headers = ['First Name', 'Last Name', 'ID', 'Email', 'Phone', 'Address', 'Emergency Contact Name', 'Emergency Contact Phone', 'Birth Date'];
    const rows = volunteersArray.map(item => [
      item.firstName,
      item.lastName,
      item.ID,
      item.email,
      item.phone,
      item.address,
      item.EmergencyContactName,
      item.EmergencyContactPhone,
      item.BirthDate
    ]);

    // Combine headers and rows into plain text format
    const data = [headers, ...rows].map(row => row.join('\t')).join('\n');

    // Create a blob and download the file
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'myData.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
});

function DeleteUser(volunteerData)
{


}














