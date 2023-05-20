const catNumberInput = document.getElementById('cat-number-input');
const searchCatNumberBtn = document.getElementById('search-cat-number-btn');
const itemData = document.getElementById('item-data');
const reservationDetails = document.getElementById('reservation-details');
const reserveBtn = document.getElementById('reserve-btn');
const contactName = document.getElementById('contact-name');
const phoneNumber1 = document.getElementById('phone-number-1');
const phoneNumber2 = document.getElementById('phone-number-2');
const reservationDate = document.getElementById('reservation-date');
const patientName = document.getElementById('patient-name');
const volunteerName = document.getElementById('volunteer-name');
const reservationQuantity = document.getElementById('reservation-quantity');
const reservedOn=document.getElementById('reservedOn');

let foundItemCategorialNumber = null;
let ProductName=null;
let CatNum=null;
async function searchItemByCategorialNumber(categorialNumber) {
    const inventoryItemRef = firebase.firestore().collection('inventory').doc(categorialNumber);
    const inventoryItemSnapshot = await inventoryItemRef.get();

    if (!inventoryItemSnapshot.exists) {
        alert('מוצר לא נמצא');
        return;
    }
    ProductName=inventoryItemSnapshot.data().product_name;
    CatNum=categorialNumber;
    const inventoryItemData = inventoryItemSnapshot.data();
    if (inventoryItemData.product_quantity <= 0) {
        alert('Not enough in inventory');
        return;
    }
    foundItemCategorialNumber = categorialNumber;
    displayItemData(inventoryItemSnapshot);
}

function displayItemData(itemSnapshot) {
    const ProductData = itemSnapshot.data();
    displayItemDetails(ProductData);
    itemData.style.display = 'block';
    reservationDetails.style.display = 'block';
}

searchCatNumberBtn.addEventListener('click', () => {
    searchItemByCategorialNumber(catNumberInput.value);
});

reserveBtn.addEventListener('click', async () => {
    if (!foundItemCategorialNumber) {
        alert('No item found to reserve.');
        return;
    }
    console.log(reservedOn.value);
    const reservationData = {
        product_name:ProductName,
        categorial_number:CatNum,
        contactName:contactName.value,
        patientName: patientName.value,
        phoneNumber1: phoneNumber1.value,
        phoneNumber2: phoneNumber2.value,
        reservationDate: reservationDate.value,
        volunteerName: volunteerName.value,
        quantity: parseInt(reservationQuantity.value) || 0,
        reservedOn: reservedOn.value
        
    };
    const inventoryItemRef = firebase.firestore().collection('inventory').doc(foundItemCategorialNumber);
    const inventoryItemSnapshot = await inventoryItemRef.get();
    const inventoryItemData = inventoryItemSnapshot.data();
    
    if (inventoryItemData.product_quantity < reservationData.quantity) {
        alert('Not enough in inventory');
        return;
    }
    

    let reservationCounter = null;
    let borrowCounterRef = firebase.firestore().collection('Tools').doc('Events Counter');
    async function getBorrowCounter() {
            const doc = await borrowCounterRef.get();
            if (!doc.exists) {
              console.log('No such document!');
            } else {
              reservationCounter = doc.data()['reservation counter'];
             
            }
          }

          if (!inventoryItemData.hasOwnProperty('reserved_quantity')) {
            inventoryItemData.reserved_quantity = 0;
            // Update it to Firestore
            await inventoryItemRef.update({ 'reserved_quantity': inventoryItemData.reserved_quantity });
        } else {
            // Ensure reserved_quantity is a number
            inventoryItemData.reserved_quantity = parseInt(inventoryItemData.reserved_quantity);
        }
        
        
    try {
        await  getBorrowCounter();
        
        // Get borrow counter
     
         
        const reservationListRef = firebase.firestore().collection('reservation list').doc(reservationCounter.toString());
        const inventoryItemRef = firebase.firestore().collection('inventory').doc(foundItemCategorialNumber);
    
        await reservationListRef.set(reservationData);
        await borrowCounterRef.update({ 'reservation counter': reservationCounter + 1 });

        await inventoryItemRef.update({ 
            reserved_quantity: inventoryItemData.reserved_quantity + reservationData.quantity,
            product_quantity: inventoryItemData.product_quantity - reservationData.quantity
        });
    
        alert('Item has been successfully reserved.');
        location.reload();
    } catch (error) {
        console.error('Error reserving the itereservedOnm:', error);
        alert('Failed to reserve the item.');
    }
});

function displayItemDetails(ProductData) {
    const detailsRow = document.createElement('tr');
    detailsRow.classList.add('product-details-row');
    const detailsCell = document.createElement('td');
    detailsCell.colSpan = 8;
    const detailsList = document.createElement('ul');
    detailsRow.appendChild(detailsCell);
    detailsCell.appendChild(detailsList);

    const dataItems = [
        { label: 'מס סידורי: ', value: ProductData.categorial_number },
        { label: 'שם: ', value: ProductData.product_name },
        { label: 'תיאור: ', value: ProductData.product_description },
        { label: 'מילות מפתח: ', value: ProductData.keywords },
        { label: 'כמות: ', value: ProductData.product_quantity },
        { label: 'הערות: ', value: ProductData.remarks },
        { label: 'סטאטוס: ', value: translateStatus(ProductData.status) },
        { label: 'מוצרים נלווים: ', value: ProductData.companion_accessories },
        { label: 'מיקום: ', value: ProductData.location },
    ];

    dataItems.forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.label + item.value;
        detailsList.appendChild(listItem);
    });

    itemData.innerHTML = '';
    itemData.appendChild(detailsRow);
}

const translateStatus = (status) => {
    switch (status) {
      case "free":
        return "במלאי";
      case "borrowed":
        return "מושאל";
      case "reserved":
        return "שמור";
      default:
        return status;
  
  
  
  
    }
  };