let ProductsArray = [];
const ProductsTable = document.getElementById('product-list');
const db = firebase.firestore();
const ProductsRef = db.collection("inventory");
const filterBar = document.getElementById("authorization-filter");

async function readProducts() {
  try {
    const snapshot = await ProductsRef.get();
    snapshot.forEach((doc) => {
      if (doc.exists) {
        ProductsArray.push(doc.data());
      } else {
        console.log("No such document!");
      }
    });
  } catch (error) {
    console.log("Error getting documents:", error);
  }
  preDisplayProducts("all");
}

filterBar.addEventListener("change", function() {
  const selectedValue = filterBar.value;
  console.log(selectedValue);
  displayProducts(selectedValue);
});

function preDisplayProducts(filter) {
  ProductsTable.innerHTML = "";
  if (filter === "Manager") filter = '0';

  ProductsArray.forEach((ProductData) => {
    if (filter === "all") {
        displayProducts(ProductData);
        
    } else {
      let AuthString = ProductData.Authorizations;
      if (AuthString.toLowerCase().includes(filter.toLowerCase()))
      displayProducts(ProductData);
    }
  });
}

function displayProducts(ProductData) {
  console.log(ProductData);
  const row = document.createElement('tr');
  const CatNum = document.createElement('td');
  CatNum.textContent = ProductData.categorial_number;
  const nameCell = document.createElement('td');
  nameCell.textContent = ProductData.product_name;
  nameCell.style.textAlign = "right";
  row.appendChild(CatNum);
  row.appendChild(nameCell);
  ProductsTable.appendChild(row);

  row.addEventListener('click', () => {
    const detailsRow = row.nextElementSibling;
    if (detailsRow && detailsRow.classList.contains('product-details-row')) {
      row.parentElement.removeChild(detailsRow);
    } else {
      const detailsRow = document.createElement('tr');
      detailsRow.classList.add('product-details-row');
      const detailsCell = document.createElement('td');
      detailsCell.colSpan = 8;
      const detailsList = document.createElement('ul');
      const CatNumItem = document.createElement('li');
      CatNumItem.textContent = " Categorial Number: " + ProductData.categorial_number;
      const ProductNameItem = document.createElement('li');
      ProductNameItem.textContent = "Name: " + ProductData.product_name;
    //   const IDItem = document.createElement('li');
    //   IDItem.textContent = "ID: " + ProductData.ID;
    //   const emailItem = document.createElement('li');
    //   emailItem.textContent = "Email: " + ProductData.email;
    //   const phoneItem = document.createElement('li');
    //   phoneItem.textContent = "Phone: " + ProductData.phone;
    //   const addressItem = document.createElement('li');
    //   addressItem.textContent = "Address: " + ProductData.address;
    //   const authItem = document.createElement('li');
    //   authItem.textContent = "Authorizations: " + ProductData.Authorizations;
    //   const volunteerTypesItem = document.createElement('li');
    //   volunteerTypesItem.textContent = "Volunteer Types: ";
    //   const volunteerTypesList = document.createElement('ul');
    //   ProductData.volunteerTypes.forEach(type => {
    //     const typeItem = document.createElement('li');
    //     typeItem.textContent = type;
    //     volunteerTypesList.appendChild(typeItem);
    //   });
    //   volunteerTypesItem.appendChild(volunteerTypesList);

    //   const vehiclesItem = document.createElement('li');
    //   vehiclesItem.textContent = "Vehicles: ";
    //   const vehiclesList = document.createElement('ul');
    //   ProductData.vehicles.forEach(vehicle => {
    //     const vehicleItem = document.createElement('li');
    //     vehicleItem.textContent = vehicle;
    //     vehiclesList.appendChild(vehicleItem);
    //   });
    //   vehiclesItem.appendChild(vehiclesList);
    
      detailsList.appendChild(ProductNameItem);
      detailsList.appendChild(CatNumItem);
    // detailsList.appendChild(IDItem);
    //   detailsList.appendChild(emailItem);
    //   detailsList.appendChild(phoneItem);
    //   detailsList.appendChild(addressItem);
    //   detailsList.appendChild(authItem);
    //   detailsList.appendChild(volunteerTypesItem);
    //   detailsList.appendChild(vehiclesItem);
      detailsCell.appendChild(detailsList);
      detailsRow.appendChild(detailsCell);
      row.after(detailsRow);
    
      const editProductBtn = document.createElement('button');
      editProductBtn.textContent = 'ערוך מוצר';
      detailsList.appendChild(editProductBtn);
      
      editProductBtn.addEventListener('click', () => {
        const makeEditable = (item, field) => {
          const [label, value] = item.textContent.split(": ");
          const editableValue = document.createElement("span");
          editableValue.contentEditable = true;
          editableValue.textContent = value ? value.trim() : "";
          item.innerHTML = `${label}: `;
          item.appendChild(editableValue);
          editableValue.addEventListener("blur", async () => {
            const newValue = editableValue.textContent;
            const CatNum = ProductData.categorial_number;
            try {
              await updateProductField(CatNum, field, newValue);
              ProductData[field] = newValue;
              item.innerHTML = `${label}: ${newValue}`;
            } catch (error) {
              console.error("Error updating document:", error);
            }
          });
        };
      
        const updateProductField = async (CatNum, field, newValue) => {
          try {
            const docRef = db.collection("inventory").doc(ProductData.categorial_number);
            await docRef.update({ [field]: newValue });
          } catch (error) {
            console.error("Error updating document:", error);
            throw error;
          }
        };
      
        makeEditable(ProductNameItem, "product_name");
        makeEditable(CatNumItem, "categorial_number");
        // makeEditable(emailItem, "email");
        // makeEditable(phoneItem, "phone");
        // makeEditable(addressItem, "address");
      
        const saveChangesBtn = document.createElement('button');
        saveChangesBtn.textContent = 'Save Changes';
        detailsList.appendChild(saveChangesBtn);
      

        /// change doc if categoral number is changed!!
        saveChangesBtn.addEventListener('click', () => {
          ProductNameItem.textContent = "Name: " + ProductData.product_name;
          CatNumItem.textContent = "Categorial Number: " + ProductData.categorial_number;
          //   emailItem.textContent = "Email: " + ProductData.email;
          //   phoneItem.textContent = "Phone: " + ProductData.phone;
          //   addressItem.textContent = "Address: " + ProductData.address;
      
          nameCell.textContent = ProductData.product_name;
          CatNum.textContent = ProductData.categorial_number;
      
          detailsList.removeChild(saveChangesBtn);
        });
      });
      
       
    
    }
  });
}

readProducts();    
    