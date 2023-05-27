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
  } catch (error) {
    console.log("שגיאה בקבלת המסמכים:", error);
  }

  eventArray.reverse();
  preDisplayData("all");
}

filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  preDisplayData(selectedValue);
});

function preDisplayData(filter) {
  eventTable.innerHTML = "";
  eventArray.forEach((eventData) => {
    console.log(eventData.status);
    if (filter == "all") {
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
  nameCell.textContent = eventData.eventCounter + " " + eventData.ProductName + " " + eventData.address;
  const emailCell = document.createElement('td');
  emailCell.textContent = eventData.email;
  row.appendChild(nameCell);
  eventTable.appendChild(row);
  switch (eventData.status) {
    case "Open":
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
      AdressItem.textContent = "כתובת: " + eventData.address;
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
      PostTimeItem.textContent = "תאריך פרסום: " + date;
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
      CloseEvent.textContent = 'סגירת אירוע';
      CloseEvent.style.marginLeft = '10px'; // Add margin to the right side of the button
      const CancelEvent = document.createElement('button');
      CancelEvent.textContent = 'ביטול אירוע';

      detailsList.appendChild(CloseEvent);
      detailsList.appendChild(CancelEvent);

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
