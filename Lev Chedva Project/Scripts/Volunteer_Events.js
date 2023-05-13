firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      const userEmail = user.email;
      console.log(userEmail);
  
      // Get the "authorizations" field for the current user's email from the "Volunteers" collection
      firebase.firestore().collection("Volunteers").doc(userEmail).get().then((doc) => {
        if (doc.exists) {
          const TakenEvents = doc.data().TakenEvents;
          console.log(TakenEvents);
          // Show the buttons based on the authorizations field
          TakenEvents.forEach((event) => {
            firebase.firestore().collection("Open Events").doc(event.toString()).get().then((doc) => {
              const eventData=doc.data();
              const row = document.createElement('tr');
              const nameCell = document.createElement('td');
              nameCell.textContent = eventData.eventCounter + " " + eventData.ProductName + " "+ eventData.address;
              const emailCell = document.createElement('td');
              emailCell.textContent = eventData.email;
              row.appendChild(nameCell);
              eventTable.appendChild(row);
              // Add a click event listener to each row to show more details
              row.addEventListener('click', () => {
                // Check if the details row already exists
                const detailsRow = row.nextElementSibling;
                if (detailsRow && detailsRow.classList.contains('Data-details-row')) {
                  // If the row already exists, remove it to hide the details
                  row.parentElement.removeChild(detailsRow);
                } else {
                  // Create a new row to display the volunteer details
                  const detailsRow = document.createElement('tr');
                  detailsRow.classList.add('Data-details-row');
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
                  
                  
                const PickupBtn = document.createElement('button');
                PickupBtn.textContent = 'Picked Up';
                const Delivered = document.createElement('button');
                Delivered.textContent = 'Delivered';
                const CancelEvent = document.createElement('button');
                CancelEvent.textContent = 'Cancel Event';
               
                detailsList.appendChild(PickupBtn);
                detailsList.appendChild(Delivered);
                detailsList.appendChild(CancelEvent);  
            
                PickupBtn.addEventListener('click', () => {
                  if (eventData && eventData.eventCounter) {
                    {
                    const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
                    StatusString="Transport";
                    docRef.update({
                      status: StatusString
                    }).catch((error) => {
                      console.error("Error updating document: ", error);
                    });
                  
                  }
                }
                });
                

                Delivered.addEventListener('click', () => {
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
                      const updatedTakenEvents = TakenEvents.filter((e) => e !== event);
                        firebase.firestore().collection("Volunteers").doc(userEmail).update({ 
                        TakenEvents: updatedTakenEvents 
                        }).then(() => {
                            console.log("TakenEvents array updated successfully!");
                          }).catch((error) => {
                            console.log("Error updating TakenEvents array:", error);
                          });
                    
                  });    




                CancelEvent.addEventListener('click', () => {
            
                    if (eventData && eventData.eventCounter) {
                        {
                        const docRef = firebase.firestore().collection("Open Events").doc(eventData.eventCounter.toString());
                        StatusString="Open";
                        docRef.update({
                          status: StatusString
                        }).catch((error) => {
                          console.error("Error updating document: ", error);
                        });
                        const updatedTakenEvents = TakenEvents.filter((e) => e !== event);
                        firebase.firestore().collection("Volunteers").doc(userEmail).update({ 
                        TakenEvents: updatedTakenEvents 
                        }).then(() => {
                            console.log("TakenEvents array updated successfully!");
                            row.remove();
                            detailsRow.remove();
                          }).catch((error) => {
                            console.log("Error updating TakenEvents array:", error);
                          });



                      
                      }
                    }
                })
            
            
            
            }  
            
            })

































              // Do something with the event data, e.g. display it on the page
            }).catch((error) => {
              console.log("Error getting event data:", error);
            });
          });
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.log("Error getting document:", error);
      });
    } else {
      // No user is signed in.
      console.log("User not signed in");
    }
  });
  