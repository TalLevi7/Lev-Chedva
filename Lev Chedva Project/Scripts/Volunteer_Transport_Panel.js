let eventArray = [];
const eventTable = document.getElementById('eventTable');
const db = firebase.firestore();
const eventRef = db.collection("Open Events");
const winnersTable = document.getElementById('winnersTable');
const winnersDiv = document.getElementById('winnersDiv');
const volunteersRef = db.collection("Volunteers");


async function readData() {
  try {
    const snapshot = await eventRef.get();
    eventArray = []; // Clear the eventArray before populating it again
    snapshot.forEach((doc) => {
      if (doc.exists && doc.data().status === "פתוח") {
        eventArray.push(doc.data());
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }

  eventArray.reverse();
  eventTable.innerHTML = "";
  eventArray.forEach((eventData) => {
    DisplayData(eventData);
  })
}

function DisplayData(eventData) {
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.textContent = eventData.eventCounter + " " + eventData.ProductName + " לכתובת:" + eventData.Destination_Address;
  const emailCell = document.createElement('td');
  emailCell.textContent = eventData.email;
  row.appendChild(nameCell);
  eventTable.appendChild(row);
  switch (eventData.status) {
    case "פתוח":
      if (eventData.urgency === "דחוף") {
        row.style.backgroundColor = "#FFCDD2"; // Soft red
      }
      break;
    case "נלקח":
      row.style.backgroundColor = "#FFF9C4"; // Soft yellow
      break;
    case "בשינוע":
      row.style.backgroundColor = "#C8E6C9"; // Soft green
      break;
      case "נמסר":
        row.style.backgroundColor = "#f0ceff"; // Soft purple
    default:
      break;
  }

  row.addEventListener('click', () => {
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('Data-details-row')) {
      row.parentElement.removeChild(detailsRow);
    } else {
      const detailsRow = document.createElement('tr');
      detailsRow.classList.add('Data-details-row');
      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 8;
      const detailsList = document.createElement('ul');
      const ProductNameItem = document.createElement('li');
      ProductNameItem.textContent = "שם המוצר: " + eventData.ProductName;
      const SourceAdressItem = document.createElement('li');
      SourceAdressItem.textContent = "כתובת מקור:"+ eventData.Source_Address;
      const DestAdressItem = document.createElement('li');
      DestAdressItem.textContent = "כתובת יעד: "+ eventData.Destination_Address;


      const ContactNameItem = document.createElement('li');
      ContactNameItem.textContent = "שם איש קשר: " + eventData.contactName;
      const ContactPhoneItem = document.createElement('li');
      ContactPhoneItem.textContent = "טלפון איש קשר: " + eventData.contactPhone;
      const RemarksItem = document.createElement('li');
      RemarksItem.textContent = "הערות: " + eventData.remarks;
      const timestamp = eventData.timestamp.seconds * 1000;
      const date = new Date(eventData.timestamp.seconds * 1000);
      const now = new Date();
      const PostTimeItem = document.createElement('li');
      PostTimeItem.textContent = "תאריך הפרסום: " + date.toLocaleString('he-IL');
      const ElapsedTimeItem = document.createElement('li');
      let timeElapsed = Math.round((now - timestamp) / (1000 * 60));
      if (timeElapsed > 60) {
        timeElapsed = timeElapsed / 60;
        timeElapsed = Math.floor(timeElapsed);
        ElapsedTimeItem.textContent = "זמן שחלף: " + timeElapsed + " שעות";
      } else
        ElapsedTimeItem.textContent = "זמן שחלף: " + timeElapsed + " דקות";
      const StatusItem = document.createElement('li');
      StatusItem.textContent = "סטטוס: " + eventData.status;
      const TypeItem = document.createElement('li');
      TypeItem.textContent = "סוג: " + eventData.type;
      const SizeItem = document.createElement('li');
      SizeItem.textContent = "גודל: " + eventData.size;
      const UrgencyItem = document.createElement('li');
      UrgencyItem.textContent = "דחיפות: " + eventData.urgency;
      const WeightItem = document.createElement('li');
      WeightItem.textContent = "משקל: " + eventData.weight;
      const JeepItem = document.createElement('li');
      JeepItem.textContent = "יחידת ג'יפ: " + eventData.jeepUnit;

      detailsList.appendChild(ProductNameItem);
      detailsList.appendChild(SourceAdressItem);
      detailsList.appendChild(DestAdressItem);
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

      const buttonContainer = document.createElement('div');
      buttonContainer.style.display = 'flex';
      buttonContainer.style.justifyContent = 'center';
      buttonContainer.style.alignItems = 'center';
      const TakeEvent = document.createElement('button');

      TakeEvent.textContent = 'לקחתי!';
      buttonContainer.appendChild(TakeEvent);
      detailsList.appendChild(buttonContainer);

      TakeEvent.addEventListener('click', () => {
        var user = firebase.auth().currentUser;
        if (user) {
          var email = user.email;
          firebase.firestore().collection("Volunteers").doc(email).update({
            TakenEvents: firebase.firestore.FieldValue.arrayUnion(eventData.eventCounter)
          }).then(() => {
            const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
            StatusString = "נלקח";
            docRef.update({
              status: StatusString,
              takenBy: email // add takenBy field to the event document
            }).then(() => {
              row.remove();
              detailsRow.remove();
              updateWinnersTable(); // Update the winners table
            }).catch((error) => {
              console.error("שגיאה בעדכון המסמך: ", error);
            });
          }).catch((error) => {
            console.error("שגיאה בעדכון המסמך: ", error);
          });
        } else {
          console.log('לא נמצא משתמש מחובר.');
        }
      });
}
  });

}

let count=0;
async function updateWinnersTable() {
  try {
    const snapshot = await eventRef.get();
    winnersTable.innerHTML = ""; // Clear the winnersTable before populating it again
    snapshot.forEach((doc) => {
      if (doc.exists && (doc.data().status === "נלקח" || doc.data().status === "בשינוע")) {
        const eventData = doc.data();
        count++;
        if(count>0)
        winnersDiv.style.display = 'block';
        displayWinner(eventData);
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }
}

async function displayWinner(eventData) {
  const volunteerSnapshot = await volunteersRef.doc(eventData.takenBy).get();
  if (volunteerSnapshot.exists) {
    const volunteerData = volunteerSnapshot.data();
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    nameCell.textContent = "תודה ל "+volunteerData.firstName + " " + volunteerData.lastName+ " על שינוע של" +eventData.ProductName+" מ: "+eventData.Source_Address+" ל: "+eventData.Destination_Address;
    // const sourceCell = document.createElement('td');
    // sourceCell.textContent = eventData.Source_Address;
    // const destCell = document.createElement('td');
    // destCell.textContent = eventData.Destination_Address;
    row.appendChild(nameCell);
    // row.appendChild(sourceCell);
    // row.appendChild(destCell);
    winnersTable.appendChild(row);
  } else {
    console.log("No volunteer found for email:", eventData.takenBy);
  }
}

// And also call updateWinnersTable when the page loads, to display the current winners:


  readData();
  updateWinnersTable();



