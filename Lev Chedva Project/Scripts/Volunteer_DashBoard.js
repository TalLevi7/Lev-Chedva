const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged(user => {
  if (user) {
    // User is signed in.
    let email = user.email;
    db.collection('Volunteers').doc(email).get()
      .then(doc => {
        if (doc.exists) {
          let data = doc.data();
          document.getElementById('username').textContent = `${data.firstName} ${data.lastName}`;
          let autorizations = data.Authorizations;
          createButtons(autorizations);
          loadMessages(autorizations);
        }
      });
  } else {
    // No user is signed in.
    console.log('No user is signed in');
  }
});

function createButtons(autorizations) {
  let navbar = document.getElementById('navbar');

  const authMap = {
    "10": { text: "פתיחת אירוע חדש", href: "New_Event.html" },
    "11": { text: "Text for 11", href: "href_for_11.html" },
    "12": { text: "Text for 12", href: "href_for_12.html" },
    // Add more mappings here...
  };

  autorizations.forEach(auth => {
    if (authMap[auth]) {
      let btn = document.createElement('button');
      btn.textContent = authMap[auth].text;
      btn.onclick = function() {
        window.location.href = authMap[auth].href;
      };
      navbar.appendChild(btn);
    }
  });
}

function loadMessages(autorizations) {
  // Implement your own message loading logic
}

// Show today's date
// Show today's date in Hebrew
document.getElementById('date').textContent = new Date().toLocaleDateString('he-IL');
