let sorting = {
  // column: "date_of_birth",
  // column: 'first_name',
  column: 'sur_name', 
  // column: 'issue_count',
  direction: 'ASC'
};
let csvArray = [];

document.addEventListener("DOMContentLoaded", e => {
  // user uploads csv
  const upload = document.getElementById('upload-file');
  upload.addEventListener('change', () => {
    csvArray = [];
    parseCSV(upload.files[0]);
  })

  

});




// create/update table from csv file contents
function parseCSV(file) {

  const reader = new FileReader();
  // set callback
  reader.onload = (e) => {
    result = e.target.result
    
    // get array of arrays that contain records of csv
    result.split("\n").forEach(function(row) {
      var rowArray = [];
      row.split(";").forEach(function(cell) {
        rowArray.push(cell);
      });
      csvArray.push(rowArray);
    });
    
    // end when csvArray is empty
    if (!csvArray.length) {
      alert('Er is iets misgegaan, herlaad de pagina en probeer het opnieuw...');
      return;
    };

    updateTable();
  };

  // read file
  reader.readAsText(file);
}


function updateTable() {
  // copy csvArray for editing and sorting
  let recordArray = [...csvArray];
  console.log(recordArray);

  // get header row data
  const headerRow = recordArray[0];

  // get sorting value key
  // const sortingKey = headerRow.indexOf(sorting.column);
  // -- indexOf was causing problems with date_of_birth so reverting to a simple loop and using trim() for finding a match
  let sortingKey;
  let issueKey;
  for (let i = 0; i < headerRow.length; i++) {
    if (headerRow[i].trim() == sorting.column) sortingKey = i; // now getting a match every time
    if (headerRow[i].trim() == 'issue_count') issueKey = i;
  }

  // create header row
  html = '<table class="table-issues"><tr class="header">';
  headerRow.forEach(columnName => {
    let sortingClass = '';
    if (columnName.trim() == sorting.column) {
      sortingClass = (sorting.direction == 'ASC') ? 'asc': 'desc';
    }
    html += `<th class="${sortingClass}">${columnName}</th>`;
  });
  // close header row
  html += '</tr>';
  // remove header row from recordArray
  recordArray.shift();

  // sort data
  const sortedArray = recordArray.sort((a, b) => {
    let valueA = a[sortingKey];
    let valueB = b[sortingKey];
    if (sorting.column == 'issue_count') {
      valueA = parseInt(valueA); // convert int
      valueB = parseInt(valueB); // convert int
    } else if (sorting.column == 'date_of_birth') {
      valueA = new Date(valueA); // convert date
      valueB = new Date(valueB); // convert date
    } else {
      valueA = valueA.toUpperCase(); // ignore casing
      valueB = valueB.toUpperCase(); // ignore casing
    }
    // check direction and sort
    if (sorting.direction == 'ASC') {
      if (valueA < valueB) return -1; // A first
      if (valueA > valueB) return 1; // B first
    } else {
      if (valueA > valueB) return -1; // A first
      if (valueA < valueB) return 1; // B first
    }
    return 0; // equal
  })
  console.log(sortedArray);


  // create table rows by looping over remaining rows and their cells
  let totalIssues = 0;
  // for (let i = 0; i < sortedArray.length; i++) 
  sortedArray.forEach(row => {
    html += '<tr>';
    let i = 0; // index in row
    row.forEach(cell => {
      html += `<td>${cell}</td>`;
      if (i == issueKey) totalIssues = totalIssues + parseInt(cell);
      i++;
    });
    html += '</tr>';
  })

  // add closing table tag
  html += `
    </table>
  `;

  // update table
  document.querySelector('.table-container').innerHTML = html;
  // update issue count
  document.getElementById('issue-count').innerHTML = `You have <strong>${totalIssues}</strong> issues left to resolve. Quit drinking coffee and get to work!`;

  // listen for click events on column headers
  document.querySelectorAll('th').forEach(element => {
    element.addEventListener('click', e => {
      const newSortingColumn = e.target.innerText.trim();
      sorting.direction = (sorting.column == newSortingColumn) ? ((sorting.direction == 'ASC') ? 'DESC': 'ASC') : 'ASC';
      sorting.column = newSortingColumn;
      updateTable();
    })
  });
}