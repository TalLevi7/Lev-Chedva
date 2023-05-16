const db = firebase.firestore();

const editLocationsBtn = document.getElementById('edit-locations');
const writeMessagesBtn = document.getElementById('write-messages');
const showMessagesBtn=document.getElementById('show-messages');
const loadVolunteersBtn=document.getElementById("loadVolunteers")
const locationManagementDiv = document.getElementById('location-management');
const messageManagementDiv = document.getElementById('message-management');
const VolunteersMagagmentDiv=document.getElementById('VolunteerTable');



let isLocationManagementVisible = false;

editLocationsBtn.addEventListener('click', () => {
    isLocationManagementVisible = !isLocationManagementVisible;
    locationManagementDiv.style.display = isLocationManagementVisible ? 'block' : 'none';
    messageManagementDiv.style.display = 'none';
    messageListDiv.style.display = 'none';
    VolunteersMagagmentDiv.style.display = 'none';
    if (isLocationManagementVisible) {
        fetchLocations();
    }
});

let isMessageManagementVisible = false;

writeMessagesBtn.addEventListener('click', () => {
    isMessageManagementVisible = !isMessageManagementVisible;
    locationManagementDiv.style.display = 'none';
    messageManagementDiv.style.display = isMessageManagementVisible ? 'block' : 'none';
    messageListDiv.style.display = 'none';
    VolunteersMagagmentDiv.style.display = 'none';
});

let isMessageListVisible = false;

showMessagesBtn.addEventListener('click', () => {
   
    isMessageListVisible = !isMessageListVisible;
    messageListDiv.style.display = isMessageListVisible ? 'block' : 'none';
    locationManagementDiv.style.display = 'none';
    messageManagementDiv.style.display = 'none';
    VolunteersMagagmentDiv.style.display = 'none';
   
if (isMessageListVisible) {
fetchMessages();
}
});

document.getElementById('add-location').addEventListener('click', async () => {
const newLocation = prompt('הכנס מחסן חדש');
if (newLocation) {
const toolsRef = db.collection('Tools').doc('Locations');
await toolsRef.update({
Location: firebase.firestore.FieldValue.arrayUnion(newLocation)
});
fetchLocations();
}
});

document.getElementById('edit-location').addEventListener('click', async () => {
const selectedLocation = document.getElementById('locations-dropdown').value;
const newLocationName = prompt('הכנס שם מחסן חדש', selectedLocation);
if (newLocationName && newLocationName !== selectedLocation) {
const toolsRef = db.collection('Tools').doc('Locations');
await toolsRef.update({
Location: firebase.firestore.FieldValue.arrayRemove(selectedLocation)
});
await toolsRef.update({
Location: firebase.firestore.FieldValue.arrayUnion(newLocationName)
});
fetchLocations();
}
});

document.getElementById('delete-location').addEventListener('click', async () => {
    const selectedLocation = document.getElementById('locations-dropdown').value;
    if (confirm(`האם אתה בטוח שאתה רוצה למחוק? ${selectedLocation}`)) {
        const toolsRef = db.collection('Tools').doc('Locations');
        await toolsRef.update({
            Location: firebase.firestore.FieldValue.arrayRemove(selectedLocation)
        });
        fetchLocations();
    }
});


document.getElementById('save-message').addEventListener('click', async () => {
const messageText = document.getElementById('message-text').value;
const header = document.getElementById('header').value;
if (messageText.trim() && header.trim()) {
const messageData = {
message: messageText.trim(),
timestamp: firebase.firestore.Timestamp.now()
};
await db.collection('messages').doc(header).set(messageData);
    alert('הודעה נשמרה בהצלחה');
    document.getElementById('message-text').value = '';
    document.getElementById('header').value = '';
} else {
    alert('הודעה לא תקנית');
}
});

const showMessageBtn = document.getElementById('show-messages');
const messageListDiv = document.getElementById('message-list');
const messagesContainer = document.getElementById('messages-container');


async function fetchMessages() {
messagesContainer.innerHTML = '';
const messagesRef = db.collection('messages');
const messagesSnapshot = await messagesRef.orderBy('timestamp', 'desc').get();
messagesSnapshot.forEach(messageDoc => {
    const messageData = messageDoc.data();
    const messageId = messageDoc.id;
    createMessageElement(messageId, messageData);
});
}
function createMessageElement(messageId, messageData) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.setAttribute('data-id', messageId);
    messageDiv.id = `message-${messageId}`;

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('message-header');

    const headerText = document.createElement('h3');
    headerText.textContent = messageId;
    headerDiv.appendChild(headerText);

    const dateText = document.createElement('p');
    const date = messageData.timestamp.toDate();
    dateText.textContent = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    headerDiv.appendChild(dateText);

    messageDiv.appendChild(headerDiv);

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('message-content');
    contentDiv.style.display = 'none';

    const messageText = document.createElement('p');
    messageText.textContent = messageData.message;
    contentDiv.appendChild(messageText);

    const editHeaderBtn = document.createElement('button');
    editHeaderBtn.textContent = 'ערוך כותרת';
    editHeaderBtn.addEventListener('click', () => editHeader(messageId));
    contentDiv.appendChild(editHeaderBtn);

    const editTextBtn = document.createElement('button');
    editTextBtn.textContent = 'ערוך גוף ההודעה';
    editTextBtn.addEventListener('click', () => editMessage(messageId));
    contentDiv.appendChild(editTextBtn);

    messageDiv.appendChild(contentDiv);

    headerDiv.addEventListener('click', () => {
        if (contentDiv.style.display === 'none') {
            contentDiv.style.display = 'block';
        } else {
            contentDiv.style.display = 'none';
        }
    });

    messagesContainer.appendChild(messageDiv);
    const deleteBtn = document.createElement('button');
deleteBtn.textContent = 'מחק הודעה';
deleteBtn.addEventListener('click', () => deleteMessage(messageId));
contentDiv.appendChild(deleteBtn);
}


async function fetchLocations() {
    const locationsRef = db.collection('Tools').doc('Locations');
    const locationsSnapshot = await locationsRef.get();
    const locations = locationsSnapshot.data().Location;
    populateLocationsDropdown(locations);
}

function populateLocationsDropdown(locations) {
    const locationsDropdown = document.getElementById('locations-dropdown');
    locationsDropdown.innerHTML = '';
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationsDropdown.appendChild(option);
    });
}


async function editHeader(messageId) {
    const messageDiv = document.getElementById(`message-${messageId}`);
    const header = messageDiv.querySelector('.message-header h3');
    const headerInput = document.createElement('input');
    headerInput.value = header.textContent;
    header.parentNode.replaceChild(headerInput, header);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';

    headerInput.parentNode.appendChild(saveButton);
    headerInput.parentNode.appendChild(cancelButton);

    saveButton.addEventListener('click', async () => {
        const newHeader = headerInput.value;
        const messageRef = db.collection('messages').doc(header.textContent);
        const messageData = (await messageRef.get()).data();

        await messageRef.delete();
        await db.collection('messages').doc(newHeader).set(messageData);

        header.textContent = newHeader;
        headerInput.parentNode.replaceChild(header, headerInput);
        saveButton.remove();
        cancelButton.remove();
    });

    cancelButton.addEventListener('click', () => {
        headerInput.parentNode.replaceChild(header, headerInput);
        saveButton.remove();
        cancelButton.remove();
    });
}


function editMessage(messageId) {
    const messageDiv = document.getElementById(`message-${messageId}`);
    const message = messageDiv.querySelector('.message-content p');
    const messageInput = document.createElement('textarea');
    messageInput.value = message.textContent;
    message.parentNode.replaceChild(messageInput, message);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';

    messageInput.parentNode.appendChild(saveButton);
    messageInput.parentNode.appendChild(cancelButton);

    saveButton.addEventListener('click', async () => {
        const newMessage = messageInput.value;
        const header = messageDiv.querySelector('.message-header h3');
        const messageRef = db.collection('messages').doc(header.textContent);
        await messageRef.update({ message: newMessage });
        message.textContent = newMessage;
        messageInput.parentNode.replaceChild(message, messageInput);
        saveButton.remove();
        cancelButton.remove();
    });

    cancelButton.addEventListener('click', () => {
        messageInput.parentNode.replaceChild(message, messageInput);
        saveButton.remove();
        cancelButton.remove();
    });
}

async function deleteMessage(messageId) {
    if (confirm('האם אתה בטוח שברצונך למחוק את ההודעה?')) {
        await db.collection('messages').doc(messageId).delete();
        const messageDiv = document.getElementById(`message-${messageId}`);
        messageDiv.remove();
    }
}


let isVolunteersMagagmentDivVisible=false;

loadVolunteersBtn.addEventListener('click', function() {
  
    isVolunteersMagagmentDivVisible = !isVolunteersMagagmentDivVisible;
    messageListDiv.style.display = isVolunteersMagagmentDivVisible ? 'block' : 'none';
    locationManagementDiv.style.display = 'none';
    messageManagementDiv.style.display = 'none';
    messageListDiv.style.display = 'none';
    VolunteersMagagmentDiv.style.display="block";

    const VolunteerTable = document.getElementById('VolunteerTable');

    let table = document.createElement('table');
    table.id = "volunteersTable";
    let thead = table.createTHead();
    let tbody = table.createTBody();

    let headers = ['Name', 'Actions'];
    let headRow = thead.insertRow();
    for (let head of headers) {
        let th = document.createElement("th");
        th.textContent = head;
        headRow.appendChild(th);
    }

    VolunteerTable.appendChild(table);

    const hebrewLabels = {
        EmergencyContactName: 'איש קשר לשעת חירום ',
        EmergencyContactPhone: 'טלפון איש קשר לשעת חירום',
        ID: 'ת.ז.',
        address:'כתובת',
        email: 'אימייל',
        firstName: 'שם פרטי',
        lastName: 'שם משפחה',
        phone: 'מספר טלפון',
        vehicals: 'רכבים',
        volunteerTypes: 'סוגי התנדבות' 
    };

    db.collection("Volunteers Waiting").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let row = tbody.insertRow();
            let nameCell = row.insertCell(0);
            let actionsCell = row.insertCell(1);
            
            nameCell.textContent = doc.data().firstName + " " + doc.data().lastName;

            actionsCell.style.display = 'none'; // Hide the Actions cell by default

            let detailsList = document.createElement('ul');
            Object.entries(hebrewLabels).forEach(([key, value]) => {
                let listItem = document.createElement('li');
                listItem.textContent = `${value}: ${doc.data()[key]}`;
                detailsList.appendChild(listItem);
            });

            let authBtn = document.createElement('button');
            authBtn.textContent = 'הוסף הרשאות';
            
            let authorizeBtn = document.createElement('button');
            authorizeBtn.textContent = 'אשר מתנדב';

            let doNotAuthorizeBtn = document.createElement('button');
            doNotAuthorizeBtn.textContent = 'מחק מתנדב';


            row.addEventListener('click', function() {
                let detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('details-row')) {
                    row.parentElement.removeChild(detailsRow);
                } else {
                    detailsRow = row.insertAdjacentElement('afterend', document.createElement('tr'));
                    detailsRow.classList.add('details-row');
                    let cell = detailsRow.insertCell(0);
                    cell.colSpan = 2;
                    cell.appendChild(detailsList);
                    cell.appendChild(authBtn);
                    cell.appendChild(authorizeBtn);
                    cell.appendChild(doNotAuthorizeBtn);
            
                    authBtn.addEventListener('click', function() {
                        let authRow = document.createElement('tr');
                        let authCell = authRow.insertCell(0);
                        authCell.colSpan = 2;
                        const authForm = document.createElement('form');
                        authForm.style.display = 'grid';
                        authForm.style.gridTemplateColumns = '1fr 1fr 1fr';
                        const authCheckboxes = [
                            { name: 'מנהל', value: '000' },
                            { name: 'כללי', value: '01' },
                            { name: 'אירוע חדש', value: '10' },
                            { name: 'אירועים פתוחים כללי', value: '11' },
                            { name: 'אירועים פתוחים מתנדב', value: '12' },
                            { name: 'אירועים של המתנדב', value: '13' },
                            { name: 'אירועים סגורים', value: '14' },
                            { name: 'סטטיסטיקה למתנדב', value: '15' },
                            { name: 'הוספת מוצר', value: '20' },
                            { name: 'החזרת מוצר', value: '21' },
                            { name: ' השאלת מוצר', value: '22' },
                            { name: ' צפייה במלאי', value: '23' },
                            { name: 'מוצרים מושאלים', value: '24' },
                            { name: 'פאנל טלפניות', value: '30' },
                        ];
                    
            
            
                        authCheckboxes.forEach(authOption => {
                            const checkboxContainer = document.createElement('div');
                            const checkbox = document.createElement('input');
                            checkbox.type = 'checkbox';
                            checkbox.id = authOption.value;
                            checkbox.name = authOption.name;
                            checkbox.value = authOption.value;
            
                            const label = document.createElement('label');
                            label.htmlFor = authOption.value;
                            label.appendChild(document.createTextNode(authOption.name));
            
                            checkboxContainer.appendChild(checkbox);
                            checkboxContainer.appendChild(label);
            
                            authForm.appendChild(checkboxContainer);
                        });
            
                        const submitButton = document.createElement('input');
                        submitButton.type = 'submit';
                        submitButton.value = 'Submit';
                        authForm.appendChild(submitButton);
            
                        authForm.addEventListener('submit', function(e) {
                            e.preventDefault();
                            const selectedAuths = [];
            
                            authCheckboxes.forEach(authOption => {
                                if (document.getElementById(authOption.value).checked) {
                                    selectedAuths.push(authOption.value);
                                }
                            });
            
                            db.collection('Volunteers Waiting').doc(doc.id).update({
                                Authorizations: selectedAuths
                            });
                        });
            
                        authCell.appendChild(authForm);
                        detailsRow.insertAdjacentElement('afterend', authRow);
                    });
                }
            });
            

            authorizeBtn.addEventListener('click', function() {
                // Transfer the doc to the "Volunteers" collection and delete from the current one
                db.collection("Volunteers").doc(doc.id).set(doc.data())
                .then(() => {
                    db.collection("Volunteers Waiting").doc(doc.id).delete();
                });
            });

            doNotAuthorizeBtn.addEventListener('click', function() {
                // Delete the doc from the current collection
                if (confirm('Are you sure you want to delete this volunteer?')) {
                    db.collection("Volunteers Waiting").doc(doc.id).delete();
                }
            });
        });
    });
});
