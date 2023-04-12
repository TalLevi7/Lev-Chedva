
let eventArray = [];
const volunteersTable = document.getElementById('eventTable');
 const db = firebase.firestore();
  const eventRef = db.collection("Open Events");
  const filterBar = document.getElementById("authorization-filter");

  async function readVolunteers() {
  // Get the Firestore instance and the "Volunteers" collection
  try {
    // Get all the documents in the "Volunteers" collection
    const snapshot = await eventRef.get();

    // Loop through each document
    snapshot.forEach((doc) => {
      // If the document exists, add the data to the volunteersArray
      if (doc.exists) {
        eventArray.push(doc.data());
      } else {
        console.log("No such document!");
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }

  eventArray.reverse();
  preDisplayVolunteers("all");
  // Return the volunteersArray
}


// Add an event listener to detect changes in the filter bar selection
filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
   preDisplayVolunteers(selectedValue);
});

//NEED TO TEST FILTER!!!

function preDisplayVolunteers(filter)
{
  eventTable.innerHTML="";
  eventArray.forEach((eventData) => {
    console.log(eventData.status);
    if(filter=="all"){
    DisplayVolunteers(eventData);
    }else{
   var StatusString=eventData.status;
    if(StatusString.toLowerCase().includes(filter.toLowerCase()))
      DisplayVolunteers(eventData);
    }
  })
}


function DisplayVolunteers(eventData)
{
  
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.textContent = eventData.eventCounter + " " + eventData.ProductName + " "+ eventData.address;
  const emailCell = document.createElement('td');
  emailCell.textContent = eventData.email;
  row.appendChild(nameCell);
  volunteersTable.appendChild(row);
  switch (eventData.status) {
    case "Open":
      // Set row color based on urgency or jeep unit
      if (eventData.urgency == "Very Urgent") {
        row.style.backgroundColor = "red";
      } else if (eventData.urgency == "Urgent") {
        row.style.backgroundColor = "pink";
      } else if (eventData.jeepUnit) {
        row.style.backgroundColor = "brown";
      } else {
        row.style.backgroundColor = "orange";
      }
      break;
    case "Taken":
      row.style.backgroundColor = "yellow";
      break;
    case "Transport":
      row.style.backgroundColor = "green";
      break;
    default:
      break;
  }
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
      const ProductNameItem = document.createElement('li');
      ProductNameItem.textContent = "Product Name: " + eventData.ProductName;
      const AdressItem = document.createElement('li');
      AdressItem.textContent = "Address: " + eventData.address;
      const ContactNameItem = document.createElement('li');
      ContactNameItem.textContent = "ContactName: " + eventData.contactName;
      const ContactPhoneItem = document.createElement('li');
      ContactPhoneItem.textContent = "ContactPhone " + eventData.contactPhone;
      const RemarksItem = document.createElement('li');
      RemarksItem.textContent = "Remarks: " + eventData.remarks;
      const timestamp = eventData.timestamp.seconds * 1000; // convert seconds to milliseconds
      const date = new Date(eventData.timestamp.seconds * 1000);
      const now = new Date();
      const PostTimeItem = document.createElement('li');
      PostTimeItem.textContent = "Posted On: " + date;
     const ElapsedTimeItem = document.createElement('li');
      let timeElapsed = Math.round((now - timestamp) / (1000 * 60)); // in minutes
      if(timeElapsed>60)
      {
      timeElapsed=timeElapsed/60;
      timeElapsed=Math.floor(timeElapsed);
      ElapsedTimeItem.textContent = "Time Elapsed: " + timeElapsed +" Hours";
      }else  
      ElapsedTimeItem.textContent = "Time Elapsed: " + timeElapsed +" Minutes";
      const StatusItem = document.createElement('li');
      StatusItem.textContent = "Status: " + eventData.status;
      const TypeItem = document.createElement('li');
      TypeItem.textContent = "Type: " + eventData.type;
      const SizeItem = document.createElement('li');
      SizeItem.textContent = "Size: " + eventData.size;
      const UrgencyItem = document.createElement('li');
      UrgencyItem.textContent = "Urgency: " + eventData.urgency;
      const WeightItem = document.createElement('li');
      WeightItem.textContent = "Weight: " + eventData.weight;
      const JeepItem = document.createElement('li');
      JeepItem.textContent = "Jeep Unit: " + eventData.jeepUnit;

      detailsList.appendChild(ProductNameItem);
      detailsList.appendChild(AdressItem);
      detailsList.appendChild(ContactNameItem);
      detailsList.appendChild(ContactPhoneItem);
      detailsList.appendChild(RemarksItem);
      detailsList.appendChild(PostTimeItem);
      detailsList.appendChild(ElapsedTimeItem);
      detailsList.appendChild(StatusItem);
      detailsList.appendChild(TypeItem);
      detailsList.appendChild(SizeItem);
      detailsList.appendChild(UrgencyItem);
      detailsList.appendChild(WeightItem);
      detailsList.appendChild(JeepItem);
      detailsCell.appendChild(detailsList);
      detailsRow.appendChild(detailsCell);
      row.after(detailsRow);
      
      
    const CloseEvent = document.createElement('button');
    CloseEvent.textContent = 'Close Event';
    const CancelEvent = document.createElement('button');
    CancelEvent.textContent = 'Cancel Event';
   
    detailsList.appendChild(CloseEvent);
    detailsList.appendChild(CancelEvent);  

    CloseEvent.addEventListener('click', () => {
      if (eventData && eventData.eventCounter) {
        const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
        StatusString="closed";
        docRef.update({
          status: StatusString
        }).then(() => {
          row.remove();
          detailsRow.remove();
          firebase.firestore().collection("Closed Events").doc(eventData.eventCounter.toString()).set({eventData});
          firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString()).delete({eventData});

        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      } else {
        console.error("Error: eventData or eventData.eventCounter is undefined");
      }
    });
    

    CancelEvent.addEventListener('click', () => {

      if (eventData && eventData.eventCounter) {
        const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
        docRef.delete().then(() => {
          row.remove();
          detailsRow.remove();

        }).catch((error) => {
          console.error("Error updating document: ", error);
        });
      } else {
        console.error("Error: eventData or eventData.eventCounter is undefined");
      }

    })



}  

})


}

















