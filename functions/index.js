
const admin = require('firebase-admin');
admin.initializeApp();

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'levchedvaalerts@gmail.com',  // your gmail account
    pass: 'ahfjpbwoheeyypyk'          // your gmail password or app password
  }
});

exports.sendEmailOnFormSubmit = functions.firestore
  .document('Open Events/{documentId}')
  .onCreate((snap, context) => {
    const data = snap.data();
    const link = "https://levchedva.org/Pages/login_HE.html";
    const messageText = `שינוע חדש!מי זוכה בחסד? מכתובת ${data.Source_Address} לכתובת: ${data.Destination_Address}. היכנסו ללינק: ${link}`;
    const encodedMessage = encodeURIComponent(messageText);
    const phoneNumber = '+972545420068'; // Replace with the actual phone number
    const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'נפתח שינוע חדש',
      text: `${messageText}\n\n שלח לווצאפ ${whatsappLink}`,
      
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });


  exports.sendEmailOnDelivered = functions.firestore
  .document('Open Events/{documentId}')
  .onUpdate((change, context) => {
    // Get the after state of the document
    const dataAfter = change.after.data();

    // Check if status has changed to "נמסר"
    if (dataAfter.status === "נמסר") {
      // Prepare the mail message
      const messageText = `השינוע מספר ${dataAfter.eventCounter} נמסר!`;
      
      let mailOptions = {
        from: 'levchedvaalerts@gmail.com',  // sender
        to: 'levchedvaalerts@gmail.com',  // receiver
        subject: 'שינוע נמסר',
        text: messageText
      };
      
      // Send the mail
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log('Email sent: ' + info.response);
          return info.response;
        }
      });
    } else {
      console.log('Status not changed to "נמסר". No email sent.');
      return null;
    }
  });


  exports.sendEmailOnCancelled = functions.firestore
  .document('Open Events/{documentId}')
  .onUpdate((change, context) => {
    // Get the after state of the document
    const dataAfter = change.after.data();

    // Check if status has changed to "פתוח"
    if (dataAfter.status === "פתוח") {
      // Prepare the mail message
      const messageText = `השינוע מספר ${dataAfter.eventCounter} בוטל!`;
      
      let mailOptions = {
        from: 'levchedvaalerts@gmail.com',  // sender
        to: 'levchedvaalerts@gmail.com',  // receiver
        subject: 'שינוע בוטל',
        text: messageText
      };
      
      // Send the mail
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log('Email sent: ' + info.response);
          return info.response;
        }
      });
    } else {
      console.log('Status not changed to "פתוח". No email sent.');
      return null;
    }
  });



  exports.sendEmailOnPickedUp = functions.firestore
  .document('Open Events/{documentId}')
  .onUpdate((change, context) => {
    // Get the after state of the document
    const dataAfter = change.after.data();

    // Check if status has changed to "בשינוע"
    if (dataAfter.status === "בשינוע") {
      // Prepare the mail message
      const messageText = `השינוע מספר ${dataAfter.eventCounter} נאסף!`;

      let mailOptions = {
        from: 'levchedvaalerts@gmail.com',  // sender
        to: 'levchedvaalerts@gmail.com',  // receiver
        subject: 'שינוע נאסף',
        text: messageText
      };

      // Send the mail
      return transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          return error;
        } else {
          console.log('Email sent: ' + info.response);
          return info.response;
        }
      });
    } else {
      console.log('Status not changed to "בשינוע". No email sent.');
      return null;
    }
  });




  exports.sendEmailOnEventTaken = functions.firestore
  .document('Open Events/{documentId}')
  .onUpdate((change, context) => {
    // Get the after document
    const newData = change.after.data();

    // Check if the event was taken
    if (newData.status === "נלקח") {
      const takenBy = newData.takenBy; // Get the email of the volunteer
      
      // Find the volunteer in the 'Volunteers' collection
      admin.firestore().collection('Volunteers').doc(takenBy).get()
        .then(doc => {
          if (doc.exists) {
            const volunteer = doc.data();
            const messageText = `האירוע ${newData.eventCounter} נלקח על ידי המתנדב ${volunteer.firstName} ${volunteer.lastName}.`;

            let mailOptions = {
              from: 'levchedvaalerts@gmail.com',  // sender
              to: 'levchedvaalerts@gmail.com',  // receiver
              subject: 'האירוע נלקח',
              text: messageText
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });
          } else {
            console.log("No volunteer found with this email.");
          }
        }).catch(error => {
          console.log("Error getting volunteer document:", error);
        });
    }
  });




  exports.sendEmailOnNewVolunteer = functions.firestore
  .document('Volunteers Waiting/{documentId}')
  .onCreate((snap, context) => {
    const newVolunteer = snap.data();

    const messageText = `מתנדב חדש נרשם!\n\nשם פרטי: ${newVolunteer.firstName}\nשם משפחה: ${newVolunteer.lastName}\nאימייל: ${newVolunteer.email}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'רישום מתנדב חדש',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });




  exports.sendEmailOnNewBorrow = functions.firestore
  .document('Borrow Tickets/{documentId}')
  .onCreate((snap, context) => {
    const BorrowTicket = snap.data();

    const messageText = `השאלה חדשה!\n\nאיש קשר : ${BorrowTicket.contactName}\nשם המוצר: ${BorrowTicket.product_name}\nכמות: ${BorrowTicket.quantity}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'השאלה חדשה',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });


  exports.sendEmailOnNewBorrow = functions.firestore
  .document('Borrow Tickets/{documentId}')
  .onCreate((snap, context) => {
    const BorrowTicket = snap.data();

    const messageText = `השאלה חדשה!\n\nאיש קשר : ${BorrowTicket.contactName}\nשם המוצר: ${BorrowTicket.product_name}\nכמות: ${BorrowTicket.quantity}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'השאלה חדשה',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });



  exports.sendEmailOnBorrowDelete = functions.firestore
  .document('Borrow Tickets/{documentId}')
  .onDelete((snap, context) => {
    const BorrowTicket = snap.data();

    const messageText = `מוצר הוחזר\n\nאיש קשר : ${BorrowTicket.contactName}\nשם המוצר: ${BorrowTicket.product_name}\nכמות: ${BorrowTicket.quantity}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'מוצר הוחזר',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });


  exports.sendEmailOnNewReservation = functions.firestore
  .document('reservation list/{documentId}')
  .onCreate((snap, context) => {
    const BorrowTicket = snap.data();

    const messageText = `הזמנה חדשה!\n\nאיש קשר : ${BorrowTicket.contactName}\nשם המוצר: ${BorrowTicket.product_name}\nכמות: ${BorrowTicket.quantity}\nלתאריך: ${BorrowTicket.reservationDate}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'הזמנה חדשה',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });


  exports.sendEmailOnNewBorrowApp = functions.firestore
  .document('Borrow_List/{documentId}')
  .onCreate((snap, context) => {
    const BorrowApp = snap.data();

    const messageText = `בקשת השאלה חדשה!\n\nאיש קשר : ${BorrowApp.contact_name}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'בקשת השאלה חדשה',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });



  exports.sendEmailOnNewDonationApp = functions.firestore
  .document('Donation_List/{documentId}')
  .onCreate((snap, context) => {
    const DonationApp = snap.data();

    const messageText = `בקשת תרומה חדשה!\n\nאיש קשר : ${DonationApp.name}`;

    let mailOptions = {
      from: 'levchedvaalerts@gmail.com',  // sender
      to: 'levchedvaalerts@gmail.com',  // receiver
      subject: 'בקשת תרומה חדשה',
      text: messageText,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  });



