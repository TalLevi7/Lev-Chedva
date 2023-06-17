const db = firebase.firestore();
const itemTableBody = document.getElementById('itemTableBody');
let farFuture = new Date();
farFuture.setFullYear(farFuture.getFullYear()); 
dateInput.valueAsDate = farFuture;
function clearTable() {
    itemTableBody.innerHTML = '';
}


let currentAuthorizations = []; // global variable

firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
    // User is signed in, retrieve authorizations
    try {
      const doc = await db.collection("Volunteers").doc(user.email).get();
      if (doc.exists) {
        currentAuthorizations = doc.data().Authorizations;
      
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  } else {
    // User is signed out
    console.log("No user is signed in.");
  }
});




async function fetchAndDisplayBorrowedItems() {
    clearTable();
    const currentDate = new Date();
    const inputDate = new Date(dateInput.value);
    const borrowedItemsRef = db.collection('Borrowed Items');
    
    // Show the spinner
    const spinner = document.getElementById('spinner');
    spinner.style.display = 'block';

    try {
        const snapshot = await borrowedItemsRef.get();
        const tableBody = document.getElementById('itemTableBody');

        for (let doc of snapshot.docs) {
            const data = doc.data();
            const borrowedItems = data.borrowTickets;
            let shouldShowDoc = false; // This variable will be true if at least one ticket matches the date requirement

            // Use a for...of loop here so we can use 'await' inside it
            for (let item of borrowedItems) {
                const itemRef = db.collection('Borrow Tickets').doc(item.toString());
                const itemData = (await itemRef.get()).data();

                // Check if the 'borrowingUntil' date falls within the range
                const borrowingUntilDate = new Date(itemData.borrowingUntil);

                if (borrowingUntilDate <= inputDate && borrowingUntilDate >= currentDate) {
                    console.log(borrowingUntilDate,inputDate);
                    shouldShowDoc = true;
                    break;
                }
            }

        if (shouldShowDoc) {
            // Create row for each doc
            const row = document.createElement('tr');
        
            // Create cell for document ID
            const idCell = document.createElement('td');
            idCell.textContent = doc.data().Name;
            row.appendChild(idCell);
        
            // Create cell for contact button
            const contactButton = document.createElement('button');
            contactButton.textContent = 'יצרתי קשר';
        
            // Create cell for lastTalk field
            const contactCell = document.createElement('td');
            if (data.lastTalk) {
                // If 'lastTalk' field exists, display its value
                contactCell.textContent = data.lastTalk;
            }
            contactCell.appendChild(contactButton);
            row.appendChild(contactCell);

            // Create cell for Remarks field
            const RemarksCell = document.createElement('td');    
            const remarksButton = document.createElement('button');
            remarksButton.textContent = 'הערות';

            RemarksCell.textContent=doc.data().remarks;
            RemarksCell.appendChild(remarksButton);
            remarksButton.addEventListener('click', async () => {
            let remarks = data.remarks || ''; // default to empty string if there is no existing remark

            // Create an input field
            const remarksInput = document.createElement('input');
            remarksInput.type = 'text';
            remarksInput.value = remarks; // prefill the input field with existing remark if there is one
            RemarksCell.appendChild(remarksInput);

            const submitButton = document.createElement('button');
            submitButton.textContent = 'שמור';
            RemarksCell.appendChild(submitButton);

            submitButton.addEventListener('click', async () => {
                // Get the document reference
                const docRef = borrowedItemsRef.doc(doc.id);
                
                // Update the document with the user inputS
                await docRef.update({ remarks: remarksInput.value });

                RemarksCell.textContent= remarksInput.value;
                RemarksCell.appendChild(remarksButton);
                // RemarksCell.removeChild(submitButton);
            
            });
            });



            row.appendChild(RemarksCell);



        
            // Add functionality to the contact button
            contactButton.addEventListener('click', async (event) => {
                event.stopPropagation();
                const currentDate = new Date().toLocaleDateString(); // Get current date in local format
                contactCell.textContent = currentDate;
        
                // Update the 'lastTalk' field in Firestore
                await borrowedItemsRef.doc(doc.id).update({
                    lastTalk: currentDate
                });
            });
        
            // Add row to the table body
            tableBody.appendChild(row);
        
           // Create a details row and cell for each doc
            const detailsRow = document.createElement('tr');
            const detailsCell = document.createElement('td');
            detailsCell.colSpan = 3;

            // Create a nested table for the details
            const detailsTable = document.createElement('table');
            detailsTable.classList.add('details-table'); // Add the 'details-table' class

            detailsCell.appendChild(detailsTable);
            detailsRow.appendChild(detailsCell);
            tableBody.appendChild(detailsRow);

            // Hide details by default
            detailsRow.style.display = 'none';
        
            // Show/hide details on click
            row.addEventListener('click', () => {
                if (detailsRow.style.display === 'none') {
                    detailsRow.style.display = '';
                } else {
                    detailsRow.style.display = 'none';
                }
            });
        
            // Fetch and display all tickets of the doc
            for (let item of borrowedItems) {
                const itemRef = db.collection('Borrow Tickets').doc(item.toString());
                const itemData = (await itemRef.get()).data();
                displayTicketRow(detailsTable, itemData, item.toString());
            }
        }
    }
} catch (error) {
    console.error('An error occurred:', error);
} finally {
    // Hide the spinner
    spinner.style.display = 'none';
}
}

async function displayTicketRow(detailsTable, ticketData, itemId) {
    const row = document.createElement('tr');
  
    // Create and append cells
    const productNameCell = document.createElement('td');
    const categorialNumber = ticketData.categorialNumber;
  
    // Fetch product name from inventory collection
    const inventoryRef = db.collection('inventory').doc(categorialNumber);
    const inventorySnapshot = await inventoryRef.get();
    if (inventorySnapshot.exists) {
        const productData = inventorySnapshot.data();
        productNameCell.textContent = productData.product_name;
    } else {
        productNameCell.textContent = 'לא נמצא מוצר';
    }
  
    row.appendChild(productNameCell);
  
    const untilDateCell = document.createElement('td');
    const borrowingUntilDate = new Date(ticketData.borrowingUntil);
    const formattedDate = borrowingUntilDate.toLocaleDateString('he-IL');
    if (isNaN(borrowingUntilDate)) {
        untilDateCell.textContent = 'לא הוזן תאריך';
    } else {
        untilDateCell.textContent = formattedDate;
    }
    row.appendChild(untilDateCell);
  
    // Append row to the details table
    detailsTable.appendChild(row);
  
    // Create a details row and cell for the ticket
    const ticketDetailsRow = document.createElement('tr');
    const ticketDetailsCell = document.createElement('td');
    ticketDetailsCell.colSpan = 2;
  
    // Create a list for the details
    const detailsList = document.createElement('ul');
    const hebrewLabels = {
        patientName: 'שם המטופל',
        contactName: 'שם איש קשר',
        contactId: 'ת.ז. איש קשר',
        address: 'כתובת',
        contactPhone: 'טלפון איש קשר',
        contactPhone2: 'טלפון איש קשר נוסף',
        quantity: 'כמות',
        borrowingFrom: 'הושאל בתאריך',
        borrowingUntil: 'עד תאריך',
        loaning_volunteer: 'שם המתנדב'
        // Add more labels as necessary
    };
    const reverseLabels = {}; // Reverse mapping object for translating back to original keys
    Object.entries(hebrewLabels).forEach(([key, value]) => {
        const listItem = document.createElement('li');
        if (key === 'borrowingUntil') {
            const borrowingUntilLabel = value;
            const borrowingUntilDate = new Date(ticketData[key]);
            const formattedDate = borrowingUntilDate.toLocaleDateString('he-IL');
            if (isNaN(borrowingUntilDate)) {
                listItem.textContent = `${borrowingUntilLabel}: לא הוזן תאריך`;
            } else {
                listItem.textContent = `${borrowingUntilLabel}: ${formattedDate}`;
            }
        } else if (key === 'borrowingFrom') {
            const borrowingFromLabel = value;
            const borrowingFromDate = new Date(ticketData[key]);
            const formattedDate = borrowingFromDate.toLocaleDateString('he-IL');
            if (isNaN(borrowingFromDate)) {
                listItem.textContent = `${borrowingFromLabel}: לא הוזן תאריך`;
            } else {
                listItem.textContent = `${borrowingFromLabel}: ${formattedDate}`;
            }
        }else{
            listItem.textContent = `${value}: ${ticketData[key]}`;
        }
        detailsList.appendChild(listItem);
        reverseLabels[value] = key;
    });
    ticketDetailsCell.appendChild(detailsList);
    ticketDetailsRow.appendChild(ticketDetailsCell);
  
    // Create the update button
    const updateButton = document.createElement('button');
    updateButton.textContent = 'ערוך';
    if(currentAuthorizations.includes("000"))
    ticketDetailsCell.appendChild(updateButton);
  
    detailsTable.appendChild(ticketDetailsRow);
  
    // Hide ticket details by default
    ticketDetailsRow.style.display = 'none';
  
    // Show/hide ticket details on click
    row.addEventListener('click', () => {
        if (ticketDetailsRow.style.display === 'none') {
            ticketDetailsRow.style.display = '';
        } else {
            ticketDetailsRow.style.display = 'none';
        }
    });
  
    // Add functionality to the update button
    updateButton.addEventListener('click', async () => {
        
        if (updateButton.textContent === 'ערוך') {
            // Replace list items with input fields
            detailsList.childNodes.forEach(listItem => {
                const inputField = document.createElement('input');
                const label = listItem.textContent.split(': ')[0];
                const key = reverseLabels[label]; // Translate back to the original key
                inputField.value = ticketData[key];
                listItem.textContent = `${label}: `;
                listItem.appendChild(inputField);
            });
            updateButton.textContent = 'שמור';
        } else if (updateButton.textContent === 'שמור') {
            // Replace input fields with new values and update data
            let updatedData = {};
            detailsList.childNodes.forEach(listItem => {
                const label = listItem.textContent.split(': ')[0];
                const key = reverseLabels[label]; // Translate back to the original key
                const value = listItem.children[0].value;
                updatedData[key] = value;
                listItem.textContent = `${label}: ${value}`;
            });
            updateButton.textContent = 'ערוך';
  
            // Update data in Firestore
            const itemRef = db.collection('Borrow Tickets').doc(itemId);
            try {
                await itemRef.update(updatedData);
                alert('עודכן בהצלחה');
            } catch (err) {
                console.error('Error updating document: ', err);
            }
        }
    });
  
} 

fetchAndDisplayBorrowedItems();
dateInput.addEventListener('change', fetchAndDisplayBorrowedItems);