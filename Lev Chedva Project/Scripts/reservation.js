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

let foundItemCategorialNumber = null;

async function searchItemByCategorialNumber(categorialNumber) {
    const inventoryItemRef = firebase.firestore().collection('inventory').doc(categorialNumber);
    const inventoryItemSnapshot = await inventoryItemRef.get();

    if (!inventoryItemSnapshot.exists) {
        alert('מוצר לא נמצא');
        return;
    }

    foundItemCategorialNumber = categorialNumber;
    displayItemData(inventoryItemSnapshot);
}

function displayItemData(itemSnapshot) {
    const ProductData = itemSnapshot.data();
    if(ProductData.status=="borrowed" || ProductData.status=="reserved")
    {
        alert("המוצר אינו זמין");
        return;
    }

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

    const reservationData = {
        contactName:contactName.value,
        patientName: patientName.value,
        phoneNumber1: phoneNumber1.value,
        phoneNumber2: phoneNumber2.value,
        reservationDate: reservationDate.value,
        volunteerName: volunteerName.value
   
        
    };
    try {
        const reservationListRef = firebase.firestore().collection('reservation list').doc(foundItemCategorialNumber);
        const inventoryItemRef = firebase.firestore().collection('inventory').doc(foundItemCategorialNumber);
    
        await reservationListRef.set(reservationData);
        await inventoryItemRef.update({ status: 'reserved' });
    
        alert('Item has been successfully reserved.');
        location.reload();
    } catch (error) {
        console.error('Error reserving the item:', error);
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