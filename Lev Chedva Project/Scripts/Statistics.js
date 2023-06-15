var db = firebase.firestore();
let date = new Date();
let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
let currentMonthYear = monthNames[date.getMonth()] + ' ' + date.getFullYear();
let numOfProducts;
let numOfVolunteers;


db.collection("Monthly Statistics").doc(currentMonthYear).get().then((doc) => {
    if (doc.exists) {
        console.log("Document data:", doc.data());
    } else {
        // doc.data() will be undefined in this case
        db.collection("Monthly Statistics").doc(currentMonthYear).set({
            // Your data here
        }).then(() => {
            console.log("Document successfully written!");
        }).catch((error) => {
            console.error("Error writing document: ", error);
        });
    }
}).catch((error) => {
    console.log("Error getting document:", error);
});

function populateYear() {
    let currentYear = (new Date()).getFullYear();

    // Populate year selector starting from 2023
    let yearSelector = document.getElementById('yearSelector');
    for(let i=currentYear; i >= 2023; i--){
        if (!document.querySelector(`#yearSelector option[value="${i}"]`)) {
            let option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelector.appendChild(option);
        }
    }
}

populateYear();



function populateYearReport() {
    let currentYear = (new Date()).getFullYear();

    // Populate year selector starting from 2023
    let yearSelector = document.getElementById('yearSelectorReport');
    for(let i=currentYear; i >= 2023; i--){
        if (!document.querySelector(`#yearSelectorReport option[value="${i}"]`)) {
            let option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelector.appendChild(option);
        }
    }
}

populateYearReport();

// Check every day to see if it's December 1st and then run the populateYear function
setInterval(() => {
    let today = new Date();
    if (today.getMonth() === 11 && today.getDate() === 1) { // In JavaScript, December is month 11 (it starts from 0)
        populateYear();
    }
}, 24 * 60 * 60 * 1000); // Run this check every 24 hours


document.getElementById('fetchStats').addEventListener('click', () => {
    let statistics = document.getElementById('statistics');
    statistics.style.display="block";
    let selectedMonth = document.getElementById('monthSelector').value;
    let selectedYear = document.getElementById('yearSelector').value;
    let docId = selectedMonth + ' ' + selectedYear;

    db.collection("Monthly Statistics").doc(docId).get().then((doc) => {
        if (doc.exists) {
            console.log("Document data:", doc.data());

            // Fetch number of products
            db.collection('inventory').get().then((inventorySnap) => {
                 numOfProducts = inventorySnap.size;

                // Fetch number of volunteers
                db.collection('Volunteers').get().then((volunteersSnap) => {
                     numOfVolunteers = volunteersSnap.size;

                    // Update the statistics
                    let statsList = document.getElementById('statsList');
                    statsList.innerHTML = ''; // Clear the list

                    let data = doc.data();
                    statsList.innerHTML += `<li>השאלות: ${data.borrows || 'N/A'}</li>`;
                    statsList.innerHTML += `<li>מוצרים במלאי: ${numOfProducts}</li>`;
                    statsList.innerHTML += `<li>מוצרים חדשים: ${data.newProducts || 'N/A'}</li>`;
                    statsList.innerHTML += `<li>משפחחות: ${data.families || 'N/A'}</li>`;
                    statsList.innerHTML += `<li>מתנדבים: ${numOfVolunteers}</li>`;
                    statsList.innerHTML += `<li>מתנדבים חדשים: ${data.newVolunteers || 'N/A'}</li>`;
                    statsList.innerHTML += `<li>שינועים: ${data.transports || 'N/A'}</li>`;
                    CreateGraph(doc,'keywordsChartMonthly');
                }).catch((error) => {
                    console.log("Error getting volunteers:", error);
                });
            }).catch((error) => {
                console.log("Error getting inventory:", error);
            });
        } else {
            alert("אין מסמך לחודש זה!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
});




document.getElementById('transportBtn').addEventListener('click', () => {
    // Get reference to the 'Volunteers' collection
    let volunteersRef = firebase.firestore().collection('Volunteers');
    let tablehead = document.getElementById('volunteerTable');
    // Clear the table body
    let tableBody = document.getElementById('volunteerTable').getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    tablehead.style.display="block";
    // Get all documents in the collection
    volunteersRef.get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let data = doc.data();

            // Create a new row and cells
            let newRow = tableBody.insertRow();
            let firstNameCell = newRow.insertCell(0);
            let lastNameCell = newRow.insertCell(1);
            let monthlyEventsCell = newRow.insertCell(2);
            let totalEventsCell = newRow.insertCell(3);
            let latestEventCell = newRow.insertCell(4);

            // Set the cells' text
            firstNameCell.textContent = data.firstName;
            lastNameCell.textContent = data.lastName;
            monthlyEventsCell.textContent = data.monthlyEvents;
            totalEventsCell.textContent = data.totalEvents;
            if (data.latestEvent) {
                let latestEventDate = data.latestEvent.toDate();
                // Format the Date to DD/MM/YYYY
                let formattedDate = latestEventDate.getDate() + '/' + (latestEventDate.getMonth() + 1) + '/' + latestEventDate.getFullYear();
                latestEventCell.textContent = formattedDate;
            }
            
        });
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
});

document.getElementById('yearlyReportBtn').addEventListener('click', async () => {
    let selectedYear = document.getElementById('yearSelectorReport').value;
    let statisticsRef = firebase.firestore().collection('Monthly Statistics');
    let numOfProducts, volunteers;

    // Fetch number of products
    try {
        let inventorySnap = await db.collection('inventory').get();
        numOfProducts = inventorySnap.size;

        // Fetch number of volunteers
        let volunteersSnap = await db.collection('Volunteers').get();
        volunteers = volunteersSnap.size;

    } catch (error) {
        console.log("Error getting documents: ", error);
    }

    let report = {
        borrows: 0,
        products: numOfProducts,
        newProducts: 0,
        families: 0,
        volunteers: volunteers,
        newVolunteers: 0,
        transports: 0,
        keywords: {}  // initialize keywords object
    };

    // Get all documents in the collection
    statisticsRef.get().then(async (querySnapshot) => {
        querySnapshot.forEach((doc) => {
            // Check if the document is for the selected year
            if (doc.id.endsWith(selectedYear)) {
                let data = doc.data();

                // Sum up the fields
                report.borrows += data.borrows || 0;
                report.newProducts += data.newProducts || 0;
                report.families += data.families || 0;
                report.newVolunteers += data.newVolunteers || 0;
                report.transports += data.transports || 0;

                // Sum up the keywords
                if (data.keywords) {
                    for (let keyword in data.keywords) {
                        if (report.keywords.hasOwnProperty(keyword)) {
                            report.keywords[keyword] += data.keywords[keyword];
                        } else {
                            report.keywords[keyword] = data.keywords[keyword];
                        }
                    }
                }
            }
        });

    const borrows=report.borrows;
    const newProducts=report.newProducts;
    const families=report.families;
    const newVolunteers=report.newVolunteers;
    const transports=report.transports;
    const keywords=report.keywords;
    const Products=numOfProducts;
    const Volunteers=volunteers;


        // Create or update the yearly statistics document
        firebase.firestore().collection("Yearly Statistics").doc(selectedYear).set({
        borrows,
        newProducts,
        families,
        newVolunteers,
        transports,
        keywords,
        Products,
        Volunteers
        })
        .then(() => {
            console.log("Yearly statistics successfully updated!");
        })
        .catch((error) => {
            console.error("Error updating yearly statistics: ", error);
        });

        let reportDiv = document.getElementById('yearlyReport');
        reportDiv.innerHTML = `<h2> דוח שנתי לשנת: ${selectedYear}:</h2>
                               <p>השאלות: ${report.borrows}</p>
                               <p>מוצרים חדשים: ${report.newProducts}</p>
                               <p>מוצרים מלאי: ${report.products}</p>
                               <p>משפחות: ${report.families}</p>
                               <p>מתנדבים: ${volunteers}</p>
                               <p>מתנדבים חדשים: ${report.newVolunteers}</p>
                               <p>שינועים: ${report.transports}</p>`;

         const toolsDoc = await firebase.firestore().collection("Yearly Statistics").doc(selectedYear).get();  
         const yearly=document.getElementById("yearly");
         yearly.style.display="block";
         

        CreateGraph(toolsDoc,'keywordsChartYearly');                       
    }).catch((error) => {
        console.log("Error getting documents: ", error);
    });
});




const generateChartButton = document.getElementById('generateChartButton');
generateChartButton.addEventListener('click', async () => {

    let TotalGraph = document.getElementById('Total Graph');
    TotalGraph.style.display = "block";
    const toolsDoc = await firebase.firestore().collection("Tools").doc("Statistics").get();
    CreateGraph(toolsDoc,'keywordsChart');

});
     
     
    async function CreateGraph(docId,chartId) {
        console.log(chartId);
        try {
            const doc = docId;
            console.log(docId);
            if (doc) {
                const keywordsData = doc.data().keywords;
    
                const labels = Object.keys(keywordsData);
                const data = Object.values(keywordsData);
    
                const ctx = document.getElementById(chartId).getContext('2d');
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: data,
                            backgroundColor: generateRandomColors(data.length) // function to generate colors
                        }]
                    },
                    options: {
                        responsive: true,
                        legend: {
                            position: 'top',
                        },
                        animation: {
                            animateScale: true,
                            animateRotate: true
                        }
                    }
                });
    
                // Call createKeywordsList() here
                createKeywordsList(keywordsData);
            } else {
                console.log('No such document!');
            }
        } catch (error) {
            console.error("Error fetching keywords: ", error);
        }
        // You were previously calling createKeywordsList() here, where keywordsData is not defined
    }
    
    function generateRandomColors(n) {
        let colors = [];
        for (let i = 0; i < n; i++) {
            colors.push(`#${Math.floor(Math.random()*16777215).toString(16)}`);
        }
        return colors;
    }
    
    function createKeywordsList(keywordsData) {
        const listContainer = document.getElementById('listContainer');  // Assuming you have a container with id 'listContainer'
        // Clear existing list items
        listContainer.innerHTML = '';
    
        for (const keyword in keywordsData) {
            const listItem = document.createElement('li');
            listItem.textContent = `${keyword}: ${keywordsData[keyword]}`;
            listContainer.appendChild(listItem);
        }
    }
    



