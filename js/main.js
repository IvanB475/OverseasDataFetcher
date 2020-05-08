var selectedFile;
var outputHtml = [];
var shipments = [];
var result = [];
let columnNumber;
document
  .getElementById("fileUpload")
  .addEventListener("change", function (event) {
    selectedFile = event.target.files[0];
  });
document.getElementById("uploadExcel").addEventListener("click", function () {
  if (selectedFile) {
    assignColumnValue();
    var fileReader = new FileReader();
    fileReader.onload = function (event) {
      var data = event.target.result;

      var workbook = XLSX.read(data, {
        type: "binary",
      });
      workbook.SheetNames.forEach((sheet) => {
        let rowObject = XLSX.utils.sheet_to_row_object_array(
          workbook.Sheets[sheet]
        );
        let jsonObject = JSON.stringify(rowObject);
        let parsedData = JSON.parse(jsonObject);
        result = parsedData.map(
          (result) => Object.values(result)[columnNumber]
        );
        fetchResult();
      });
    };
    fileReader.readAsBinaryString(selectedFile);
  }
});

const fetchResult = async () => {
  spinner.removeAttribute("hidden");
  for (let i = 0; i < result.length; i++) {
    console.log(result[i]);
    let index = result[i];
    let res = await fetch(
      "https://my.overseas.hr/system/api/track-and-trace/get-shipment-data/" +
        index
    );
    let shipmentData = await res.json();
    shipments.push(shipmentData);
    DisplayData();
  }
};

const DisplayData = () => {
  spinner.setAttribute("hidden", "");
  outputHtml = shipments
    .map(
      (shipment, index) => `
  <div class="carc card-body mb-1">
    <a href="#" class="js-modal-show" id="${index}" onClick="triggerPopup(this.id)"> <h4> ${
        shipment.Ref2
      } </h4> </a> <h4> <span class="text-warning" id="Color${
        shipment.LastShipmentTrace.StatusNumber
      }">${shipment.StatusDescription}</span></h4>
  </div>
  <div class="l-modal is-hidden--off-flow js-modal-shopify" id="test${index}">
<div class="l-modal__shadow js-modal-hide" id="hide${index}"></div>
<div class="c-popup l-modal__body" id="classFinder${index}">
  <div class="align-left"> Broj narudžbe: ${shipment.ShipmentNumber} </div>
  <div class="align-right"> Datum slanja: ${shipment.SentOnDateString} </div>
  <h5 class="c-popup__title">${shipment.Ref2}</h5>
  <p class="c-popup__description"> Trenutno stanje: </p>
  <h5 class="c-popup__title1" id="align-left${index}"> ${
        shipment.StatusDescription
      } </h5>
  <p class="c-popup__description"> ${
    shipment.LastShipmentTrace.ScanDateString
  }   ${shipment.LastShipmentTrace.ScanTimeString}</p>
  <h6 class="c-popup__title">Primatelj: ${shipment.Consignee.PostalCode} ${
        shipment.Consignee.City
      }, ${shipment.Consignee.Country} </h6>
    <table class="table">
        <thead class="c-popup__description_table">
            <tr>
                <th scope="col"> Datum </th>
                <th scope="col"> Vrijeme</th>
                <th scope="col"> Status </th>
                <th scope="col"> Napomena </th>
            </tr>
  <tbody class="c-popup__description_table"> ${shipment.Collies[0].Traces.map(
    (track) =>
      "<tr><td>" +
      track.ScanDateString +
      "</td><td>" +
      track.ScanTimeString +
      "</td><td>" +
      track.StatusDescription +
      "</td><td>" +
      track.Remark +
      "</td></tr>"
  ).join("")}</tbody>

  </table>
  <input type="button" value="Zatvori prozor" id="${index}" onclick="closePopup(this.id)">
</div>
  </div>
  `
    )
    .join("");
  document.getElementById("shipments-list").innerHTML = outputHtml;
};

function triggerPopup(id) {
  let classElement = "#test" + id;
  let element = document.getElementById("test" + id);
  let checkAgainst = document.getElementById("classFinder" + id);
  $(classElement)
    .toggleClass("is-shown--off-flow", true)
    .toggleClass("is-hidden--off-flow", false);
  hideOnClickOutside(classElement, element, checkAgainst);
}

function closePopup(id) {
  $("#test" + id)
    .toggleClass("is-shown--off-flow", false)
    .toggleClass("is-hidden--off-flow", true);
}

function hideOnClickOutside(classElement, element, checkAgainst) {
  element.addEventListener("click", (event) => {
    if (!checkAgainst.contains(event.target)) {
      $(classElement)
        .toggleClass("is-shown--off-flow", false)
        .toggleClass("is-hidden--off-flow", true);
    }
  });
}

function assignColumnValue() {
  columnNumber = document.getElementById("columnNumber").value - 1;
  removeInputElements();
}
function removeInputElements() {
  var removeInput = document.getElementById("columnNumberP");
  var removeUploadFile = document.getElementById("fileUploadP");
  var removeFetchButton = document.getElementById("uploadExcelP");
  var removeTitle = document.getElementById("inputTitle");
  removeInput.remove();
  removeUploadFile.remove();
  removeFetchButton.remove();
  removeTitle.remove();
}
