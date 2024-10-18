let volunteersArray = [];
const volunteersTable = document.getElementById('volunteer-list');
const db = firebase.firestore();
const volunteersRef = db.collection("Volunteers");
const filterBar = document.getElementById("authorization-filter");
const searchInput = document.getElementById("search-input");
const categories = [
  {
    name: 'ניהול וכללי',
    options: [
      { name: 'הכל', value: '0' },
      { name: 'מנהל', value: '000' },
      { name: 'כללי', value: '01' },
      { name: 'פאנל טלפניות', value: '30' },
      
    ]
  },
  {
    name: 'אירועים',
    options: [
      { name: 'אירוע חדש', value: '10' },
      { name: 'אירועים פתוחים כללי', value: '11' },
      { name: 'אירועים פתוחים מתנדב', value: '12' },
      { name: 'אירועים של המתנדב', value: '13' },
    ]
  },
  {
    name: 'מלאי',
    options: [
      { name: 'הוספת מוצר', value: '20' },
      { name: 'החזרת מוצר', value: '21' },
      { name: 'השאלת מוצר', value: '22' },
      { name: 'צפייה במלאי', value: '23' },
      { name: 'צור הזמנה עתידית', value: '26' } ,
      { name: 'מוצרים מושאלים', value: '24' },
      { name: 'הזמנות עתידיות', value: '27' },


     
    ]
  },
  {
    name: 'ארכיבים',
    options: [
      { name: 'ארכיב השאלות', value: '25' },
      { name: 'ארכיב הזמנות', value: '33' },
      { name: 'ארכיב בקשות השאלה', value: '32' },
      { name: 'ארכיב תרומה', value: '31' },
      { name: 'אירועים סגורים', value: '14' },
    ]
  },
  {
    name: 'בקשות',
    options: [
      { name: 'צפה בבקשות השאלה', value: '28' },
      { name: 'צפה בבקשות תרומה', value: '29' },
      
    ]
  },
  {
    name: 'הודעות',
    options: [
      { name: 'הודעות כללי', value: '40' },
      { name: 'הודעות טלפניות', value: '41' },
      { name: 'הודעות שינוע', value: '42' },
      { name: 'הודעות מנהלים', value: '43' },
      { name: 'הודעות מסדרי מחסן', value: '44' },
    ]
  }
];


function populateOptions(categories) {
  let selectElement = document.getElementById('authorization-filter'); // replace 'your-select-id' with the actual id of your select element

  // Loop over each category in the categories array
  categories.forEach(category => {
    // Create an optgroup element for the category
    let optgroup = document.createElement('optgroup');
    optgroup.label = category.name;
    
    // Loop over each option in the category's options array
    category.options.forEach(option => {
      // Create an option element for the option
      let optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.name;
      
      // Append the option element to the optgroup
      optgroup.appendChild(optionElement);
    });

    // Append the optgroup to the select element
    selectElement.appendChild(optgroup);
  });
}

// Call the function
populateOptions(categories);



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
  volunteersArray.sort();
  preDisplayVolunteers("all");
}

filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  console.log(selectedValue);
  preDisplayVolunteers(selectedValue);
});

searchInput.addEventListener("input", function() {
  const searchTerm = searchInput.value.trim();
  searchAcrossCollection(searchTerm);
});

async function searchAcrossCollection(searchTerm) {
  volunteersTable.innerHTML = "";
  const VolunteerSet = [];
  const VolunteerIds = new Set(); // For storing unique IDs
  const snapshot = await db.collection("Volunteers").get();

  // If the searchTerm is empty, display all volunteers
  if (!searchTerm.trim()) {
    snapshot.forEach((doc) => {
      VolunteerSet.push(doc.data());
    });
    VolunteerSet.sort();
    preDisplayVolunteers("all", VolunteerSet);
    return;
  }

  snapshot.forEach((doc) => {
    if (doc.exists) {
        const data = doc.data();
        
        for (let key in data) {
            if (data[key].toString().toLowerCase().includes(searchTerm.toLowerCase())) {
              if (!VolunteerIds.has(doc.id)) { // check if the ID is unique
                VolunteerIds.add(doc.id); // store the ID
                VolunteerSet.push(data);
              }
            }
        }
    } else {
        console.log("No such document!");
    }
  });
  preDisplayVolunteers("all", VolunteerSet);
}


function preDisplayVolunteers(filter, volunteers = volunteersArray) {
  volunteers.sort((a, b) => a.firstName.localeCompare(b.firstName, 'he'));

  volunteersTable.innerHTML = "";
  if (filter === "0") filter = 'all';
 
  volunteers.forEach((volunteerData) => {
    if (filter === "all") {
      displayVolunteers(volunteerData);
    } else {
       
      if (volunteerData.Authorizations.includes(filter))
        displayVolunteers(volunteerData);
    }
  });
}


function displayVolunteers(volunteerData) {
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.textContent = volunteerData.firstName + " " + volunteerData.lastName;
  nameCell.style.textAlign = "right";
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
      firstNameItem.textContent = "שם פרטי: " + volunteerData.firstName;
      const lastNameItem = document.createElement('li');
      lastNameItem.textContent = "שם משפחה : " + volunteerData.lastName;
      const IDItem = document.createElement('li');
      IDItem.textContent = "ת.ז. : " + volunteerData.ID;
      const BirthdayItem = document.createElement('li');
      BirthdayItem.textContent = "תאריך לידה : " + volunteerData.BirthDate;
      


      const emailItem = document.createElement('li');
      emailItem.textContent = "אימייל: " + volunteerData.email;
      const phoneItem = document.createElement('li');
      phoneItem.textContent = "טלפון: " + volunteerData.phone;
      const addressItem = document.createElement('li');
      addressItem.textContent = "כתובת: " + volunteerData.address;
      const authItem = document.createElement('li');
      authItem.textContent = "הרשאות: " + volunteerData.Authorizations;
      const volunteerTypesItem = document.createElement('li');
      volunteerTypesItem.textContent = "סוגי התנדבות: ";
      const volunteerTypesList = document.createElement('ul');
      volunteerData.volunteerTypes.forEach(type => {
        const typeItem = document.createElement('li');
        typeItem.textContent = type;
        volunteerTypesList.appendChild(typeItem);
      });
      volunteerTypesItem.appendChild(volunteerTypesList);

      const vehiclesItem = document.createElement('li');
      vehiclesItem.textContent = "רכבים: ";
      const vehiclesList = document.createElement('ul');
      volunteerData.vehicles.forEach(vehicle => {
        const vehicleItem = document.createElement('li');
        vehicleItem.textContent = vehicle;
        vehiclesList.appendChild(vehicleItem);
      });
      const createdAt = volunteerData.createdAt ? volunteerData.createdAt.toDate() : new Date("0000-00-00");
      const JoinedItem = document.createElement('li');
      JoinedItem.textContent = "הצטרף בתאריך: " + createdAt.toLocaleDateString('he-IL');
      
      
      vehiclesItem.appendChild(vehiclesList);
    
      detailsList.appendChild(firstNameItem);
      detailsList.appendChild(lastNameItem);
      detailsList.appendChild(IDItem);
      detailsList.appendChild(BirthdayItem);
      detailsList.appendChild(emailItem);
      detailsList.appendChild(phoneItem);
      detailsList.appendChild(addressItem);
      detailsList.appendChild(authItem);
      detailsList.appendChild(JoinedItem);

      detailsList.appendChild(volunteerTypesItem);
      detailsList.appendChild(vehiclesItem);
      detailsCell.appendChild(detailsList);
      detailsRow.appendChild(detailsCell);
      row.after(detailsRow);
    
      const manageAuthButton = document.createElement('button');
      manageAuthButton.textContent = 'נהל הרשאות';
      detailsList.appendChild(manageAuthButton);
      let validBtn = false;
    
      manageAuthButton.addEventListener('click', async () => {
        if (validBtn === true)
          return;
      
        const authRow = manageAuthButton.parentElement.nextElementSibling;
        if (authRow && authRow.classList.contains('volunteer-auth-row')) {
          authRow.parentElement.removeChild(authRow);
        } else {
          const doc = await db.collection("Volunteers").doc(volunteerData.email).get();
          const currentAuthorizations = doc.data().Authorizations;
      
          const authRow = document.createElement('tr');
          authRow.classList.add('volunteer-auth-row');
          const authCell = document.createElement('td');
          authCell.colSpan = 8;
          const authForm = document.createElement('form');
          authForm.classList.add('categories-form');
          const categories = [
            {
              name: 'ניהול וכללי',
              options: [
                { name: 'מנהל', value: '000' },
                { name: 'כללי', value: '01' },
                { name: 'פאנל טלפניות', value: '30' },
              ]
            },
            {
              name: 'אירועים',
              options: [
                { name: 'אירוע חדש', value: '10' },
                { name: 'אירועים פתוחים כללי', value: '11' },
                { name: 'אירועים פתוחים מתנדב', value: '12' },
                { name: 'אירועים של המתנדב', value: '13' },
              ]
            },
            {
              name: 'מלאי',
              options: [
                { name: 'הוספת מוצר', value: '20' },
                { name: 'החזרת מוצר', value: '21' },
                { name: 'השאלת מוצר', value: '22' },
                { name: 'צפייה במלאי', value: '23' },
                { name: 'צור הזמנה עתידית', value: '26' } ,
                { name: 'מוצרים מושאלים', value: '24' },
                { name: 'הזמנות עתידיות', value: '27' },


               
              ]
            },
            {
              name: 'ארכיבים',
              options: [
                { name: 'ארכיב השאלות', value: '25' },
                { name: 'ארכיב הזמנות', value: '33' },
                { name: 'ארכיב בקשות השאלה', value: '32' },
                { name: 'ארכיב תרומה', value: '31' },
                { name: 'אירועים סגורים', value: '14' },
              ]
            },
            {
              name: 'בקשות',
              options: [
                { name: 'צפה בבקשות השאלה', value: '28' },
                { name: 'צפה בבקשות תרומה', value: '29' },
                
              ]
            },
            {
              name: 'הודעות',
              options: [
                { name: 'הודעות כללי', value: '40' },
                { name: 'הודעות טלפניות', value: '41' },
                { name: 'הודעות שינוע', value: '42' },
                { name: 'הודעות מנהלים', value: '43' },
                { name: 'הודעות מסדרי מחסן', value: '44' },
              ]
            }
          ];
          
        
          categories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('category');
      
            const categoryLabel = document.createElement('div');
            categoryLabel.classList.add('category-title');
            categoryLabel.textContent = category.name;
            categoryDiv.appendChild(categoryLabel);
      
            const optionsDiv = document.createElement('div');
            optionsDiv.classList.add('options');
      
            const checkboxesContainer = document.createElement('div');
            checkboxesContainer.classList.add('checkboxes-container');
      
            category.options.forEach(option => {
              const checkboxContainer = document.createElement('div');
              checkboxContainer.classList.add('checkbox-container');
      
              const checkbox = document.createElement('input');
              checkbox.type = 'checkbox';
              checkbox.id = option.value;
              checkbox.name = option.name;
              checkbox.value = option.value;
              checkbox.classList.add('checkbox');
      
              // Check if the current option value is in the currentAuthorizations array
              if (currentAuthorizations.includes(option.value)) {
                // If it is, check the checkbox
                checkbox.checked = true;
              }
      
              const label = document.createElement('label');
              label.htmlFor = option.value;
              label.appendChild(document.createTextNode(option.name));
              label.classList.add('checkbox-label');
      
              checkboxContainer.appendChild(checkbox);
              checkboxContainer.appendChild(label);
      
              checkboxesContainer.appendChild(checkboxContainer);
            });
      
            optionsDiv.appendChild(checkboxesContainer);
            categoryDiv.appendChild(optionsDiv);
            authForm.appendChild(categoryDiv);
          });
      
          const submitButton = document.createElement('button');
          submitButton.textContent = 'שמור';
          authForm.appendChild(submitButton);
          submitButton.addEventListener('click', (e) => {
            e.preventDefault();
      
            const selectedAuths = Array.from(authForm.querySelectorAll('input[type=checkbox]:checked')).map(cb => cb.value);
      
            const docRef = db.collection("Volunteers").doc(volunteerData.email);
            docRef.update({
              Authorizations: selectedAuths
            }).then(() => {
              authItem.textContent = "הרשאות: " + selectedAuths;
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
      editUserBtn.textContent = 'ערוך פרטי משתמש';
      detailsList.appendChild(editUserBtn);
      let isEditClicked = false;
      editUserBtn.addEventListener('click', () => {
        if(isEditClicked) return;
        isEditClicked=true;


        
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
        makeEditable(phoneItem, "phone");
        makeEditable(addressItem, "address");
        makeEditable(BirthdayItem, "BirthDate");
        // makeEditable(vehiclesItem,"vehicles");
        const saveChangesBtn = document.createElement('button');
        saveChangesBtn.textContent = 'שמור שינויים';
        detailsList.appendChild(saveChangesBtn);
    
        saveChangesBtn.addEventListener('click', () => {
          firstNameItem.textContent = "שם פרטי: " + volunteerData.firstName;
          lastNameItem.textContent = "שם משפחה: " + volunteerData.lastName;
          emailItem.textContent = "אימייל: " + volunteerData.email;
          phoneItem.textContent = "טלפון: " + volunteerData.phone;
          addressItem.textContent = "כתובת: " + volunteerData.address;
          BirthdayItem.textContent = "תאריך לידה: " + volunteerData.BirthDate;
    
          nameCell.textContent = volunteerData.firstName + " " + volunteerData.lastName;
     
         detailsList.removeChild(saveChangesBtn); // Remove the button itself
        });
        isEditClicked = false;

      });
      //...

// Add this inside displayVolunteers function where the other buttons are being created

const deleteUserBtn = document.createElement('button');
deleteUserBtn.textContent = 'מחק משתמש';
detailsList.appendChild(deleteUserBtn);

deleteUserBtn.addEventListener('click', async () => {
  if (confirm('אתה בטוח שאתה רוצה למחוק משתמש זה?')) {
    try {
      const docRef = db.collection("Volunteers").doc(volunteerData.email);
      
      // Get remark from user
      const remark = prompt("מהי סיבת המחיקה?");

      // Define the update object
      let updateObject = { deletedAt: firebase.firestore.FieldValue.serverTimestamp() };

      // Add the remark to the update object if it exists
      if (remark) {
        updateObject.remark = remark;
      }

      // Update the document with the remark and the deletion timestamp
      await docRef.update(updateObject);

      // Delete from Volunteers
      await docRef.delete();

      // Remove rows from the table
      const detailsRow = row.nextElementSibling;
      row.parentElement.removeChild(row);
      if (detailsRow && detailsRow.classList.contains('volunteer-details-row')) {
        detailsRow.parentElement.removeChild(detailsRow);
      }

      // Remove from volunteersArray
      volunteersArray = volunteersArray.filter(volunteer => volunteer.email !== volunteerData.email);
      
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  }
});



    }
  });
}
   




document.getElementById('exportButton').addEventListener('click', async () => {
  const snapshot = await firebase.firestore().collection('Volunteers').get();

  const fields = {
      "firstName": "שם פרטי",
      "lastName": "שם משפחה",
      "phone": "טלפון",
      "ID": "תעודת זהות",
      "BirthDate": "תאריך לידה",
      "createdAt": "תאריך הצטרפות",
      "email": "אימייל",
      "address": "כתובת"
  };

  let textContent = '';

  snapshot.forEach(doc => {
      const data = doc.data();

      for (let field in fields) {
          if (data[field]) {
              if (data[field].seconds !== undefined) {
                  let createdAt = new Date(data[field].seconds * 1000);
                  let createdAtString = createdAt.getDate() + '/' + (createdAt.getMonth() + 1) + '/' + createdAt.getFullYear();
                  textContent += `${fields[field]}: ${createdAtString}\n`;
              } else if (typeof data[field] === "string") {
                  let createdAt = new Date(data[field]);
                  if (!isNaN(createdAt)) {
                      let createdAtString = createdAt.getDate() + '/' + (createdAt.getMonth() + 1) + '/' + createdAt.getFullYear();
                      textContent += `${fields[field]}: ${createdAtString}\n`;
                  } else {
                      textContent += `${fields[field]}: ${data[field]}\n`;
                  }
              } else {
                  textContent += `${fields[field]}: ${data[field]}\n`;
              }
          } else {
              textContent += `${fields[field]}: 1.06.23\n`;
          }
      }

      textContent += '\n'; // Add a blank line after each document
  });

  const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Volunteers.txt');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

