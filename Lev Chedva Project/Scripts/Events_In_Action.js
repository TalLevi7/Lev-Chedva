let eventArray = [];
const eventTable = document.getElementById('eventTable');
const db = firebase.firestore();
const eventRef = db.collection("Open Events");
const filterBar = document.getElementById("authorization-filter");

async function readData() {
  try {
    const snapshot = await eventRef.get();
    snapshot.forEach((doc) => {
      if (doc.exists) {
        eventArray.push(doc.data());
      } else {
        console.log("אין מסמך כזה!");
      }
    });
    eventArray.sort((a, b) => a.eventCounter - b.eventCounter); // Sort the eventArray based on eventCounter
    preDisplayData("הכל");
  } catch (error) {
    console.log("שגיאה בקבלת המסמכים:", error);
  }

  eventArray.reverse();
  preDisplayData("הכל");
}

filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  preDisplayData(selectedValue);
});

function preDisplayData(filter) {
  eventTable.innerHTML = "";
  eventArray.forEach((eventData) => {
    console.log(eventData.status);
    if (filter == "הכל") {
      DisplayData(eventData);
    } else {
      var StatusString = eventData.status;
      if (StatusString.toLowerCase().includes(filter.toLowerCase()))
        DisplayData(eventData);
    }
  });
}

function DisplayData(eventData) {
  const row = document.createElement('tr');
  const nameCell = document.createElement('td');
  nameCell.textContent = "שם מוצר: " + eventData.ProductName + ", כתובת מקור: " + eventData.Source_Address + " , כתובת יעד: " + eventData.Destination_Address;
  const emailCell = document.createElement('td');
  emailCell.textContent = eventData.email;
  row.appendChild(nameCell);
  eventTable.appendChild(row);
  switch (eventData.status) {
    case "פתוח":
      if (eventData.urgency === "Very Urgent" || eventData.urgency === "Urgent") {
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
      const AdressItem = document.createElement('li');
      AdressItem.textContent = "כתובת מקור: " + eventData.Source_Address;
      const AdressItem2 = document.createElement('li');
      AdressItem2.textContent = "כתובת יעד: " + eventData.Destination_Address;
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
      PostTimeItem.textContent = "תאריך פרסום: " + date.toLocaleString('he-IL');
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
      detailsList.appendChild(AdressItem);
      detailsList.appendChild(AdressItem2);
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
      
      const CloseEvent = document.createElement('button');
      CloseEvent.textContent = 'סגירת אירוע';
      CloseEvent.style.margin = '0 10px'; // Add margin around the button
      
      const CancelEvent = document.createElement('button');
      CancelEvent.textContent = 'ביטול אירוע';
      CancelEvent.style.margin = '0 10px'; // Add margin around the button
      
      buttonContainer.appendChild(CloseEvent);
      buttonContainer.appendChild(CancelEvent);
      
      detailsList.appendChild(buttonContainer);

      CloseEvent.addEventListener('click', () => {
        if (eventData && eventData.eventCounter) {
          if (confirm("האם אתה בטוח שברצונך לסגור את האירוע הזה?")) {
            const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
            StatusString = "סגור";
            docRef.update({
              status: StatusString
            }).then(() => {
              row.remove();
              detailsRow.remove();
              firebase.firestore().collection("Closed Events").doc(eventData.eventCounter.toString()).set({ eventData });
              firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString()).delete({ eventData });
            }).catch((error) => {
              console.error("שגיאה בעדכון המסמך: ", error);
            });
          } else {
            console.error("שגיאה: המסמך או המזהה של המסמך אינם מוגדרים");
          }
        }
      });

      CancelEvent.addEventListener('click', () => {
        if (eventData && eventData.eventCounter) {
          if (confirm("האם אתה בטוח שברצונך לבטל את האירוע הזה?")) {
            const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
            docRef.delete().then(() => {
              row.remove();
              detailsRow.remove();
            }).catch((error) => {
              console.error("שגיאה במחיקת המסמך: ", error);
            });
          } else {
            console.error("שגיאה: המסמך או המזהה של המסמך אינם מוגדרים");
          }
        }
      });
    }
  });
}
