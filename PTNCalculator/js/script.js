let sinnerData, lvlData, resourcesData
let tabButtons = document.querySelectorAll("#tab-btns button");
window.onload = function () {
    changeTab(0);
    fetch('https://aker0357.github.io/PTNCalculator/data/sinner.json')
        .then(response => response.json())
        .then(data => {
            console.log(data)
            sinnerData = data
            populateDropdown(sinnerData)
            const dropdown = document.getElementById('outside-dropdown');
            dropdown.addEventListener('change', self);
        })
        .catch(error => console.error('Error:', error));

    fetch('https://aker0357.github.io/PTNCalculator/data/lvl.json')
        .then(response => response.json())
        .then(data => {
            lvlData = data
        })
        .catch(error => console.error('Error:', error));

    fetch('https://aker0357.github.io/PTNCalculator/data/resourses.json')
        .then(response => response.json())
        .then(data => {
            resourcesData = data
        })
        .catch(error => console.error('Error:', error));

    const dropdowns = document.querySelectorAll('.add-content select');
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.innerText = i;
        dropdowns.forEach(dropdown => dropdown.appendChild(option.cloneNode(true)));
    }



    document.getElementById('add-table').addEventListener('click', function () {
        const sinnerName = document.getElementsByClassName('sinner-name');
        console.log(sinnerName[0].textContent)
        if (!sinnerName[0].textContent) {
            console.error('not chosen sinner yet');
            return;
        }
        const originalTable = document.querySelector('.add-content');
        if (!originalTable) {
            console.error('#add-content not found');
            return;
        }

        const currentSelectIndices = Array.from(originalTable.querySelectorAll('select')).map(select => select.selectedIndex);
        const currentInputValues = Array.from(originalTable.querySelectorAll('input')).map(input => {
            return { value: input.value, checked: input.checked };
        });

        resetInput(originalTable);
        const newTable = generateNewMainTable(originalTable, currentSelectIndices, currentInputValues);


        document.getElementById('tables-container').appendChild(newTable);
    });

    document.getElementById('outside-dropdown').addEventListener('change', function (e) {
        const selectedOption = e.target.value;  // Get the selected option
        const sinnerName = document.getElementsByClassName('sinner-name');  // Get the avatar name element
        const dangerLevel = document.getElementsByClassName('danger-level');  // Get the danger level element
        sinnerName[0].textContent = selectedOption;  // Set the text of the avatar name
        if (sinnerName[0].textContent == "") {
            dangerLevel[0].textContent = ""
        } else {
            dangerLevel[0].textContent = sinnerData[selectedOption]['危險評級'];  // Set the text of the danger level
        }

    });

    document.getElementById('calculate-total').addEventListener('click', () => calculateTotalResources());
    document.getElementById('clear-result').addEventListener('click', () => resetTables());
}
function populateDropdown(data) {
    const dropdown = document.getElementById('outside-dropdown');
    const dangerLevelDropdown = document.getElementById('danger-level-dropdown');

    for (const sinner in data) {
        const option = document.createElement('option');
        option.value = sinner;
        option.textContent = sinner;
        dropdown.appendChild(option);
    }

    // add event listener to danger level dropdown to filter sinners based on selected danger level
    dangerLevelDropdown.addEventListener('change', function () {
        let selectedLevel = this.value;

        // clear dropdown
        dropdown.innerHTML = '';
        // 建立一個初始空選項並添加到下拉選單中
        const initialOption = document.createElement('option');
        initialOption.value = '';
        initialOption.textContent = '選擇一個選項';
        dropdown.appendChild(initialOption);

        for (const sinner in data) {
            if (data[sinner]['危險評級'] === selectedLevel) { // add sinner to dropdown if danger level matches selected level
                const option = document.createElement('option');
                option.value = sinner;
                option.textContent = sinner;
                dropdown.appendChild(option);
            }
        }
    });
}


function updateResourcesNeeded(event, lvlData) {
    const targetTable = event.target.closest('.add-content');
    const dangerLevel = targetTable.querySelector('.danger-level').textContent;
    const currentLevel = targetTable.querySelector('.current-level').value;
    const expectedLevel = targetTable.querySelector('.expected-level').value;

    console.log(dangerLevel)
    const relevantLevels = lvlData[dangerLevel].filter(levelInfo => levelInfo.Lvl >= currentLevel && levelInfo.Lvl <= expectedLevel);


    for (const levelInfo of relevantLevels) {
        totalCoins += levelInfo.Coins;
        totalEssense += levelInfo.Essense;
    }
    const coinsElement = document.getElementById('coins-needed');
    const essenseElement = document.getElementById('essense-needed');

    coinsElement.textContent = "需要的金幣數量: " + totalCoins;
    essenseElement.textContent = "需要的精華數量: " + totalEssense;
}

function calculateRankCost(sinnerName, dangerLevel, totalCoins, table, tableBody) {
    const currentRank = Number(table.querySelector('.current-rank').value);
    const expectedRank = Number(table.querySelector('.expected-rank').value);
    const material1Name = sinnerData[sinnerName]['升階材料1'];
    const material2Name = sinnerData[sinnerName]['升階材料2'];
    const fluidType = sinnerData[sinnerName]['職業'];
    let rankMaterials = {
        [material1Name]: { "purple": 0, "blue": 0, "green": 0, "white": 0 },
        [material2Name]: { "purple": 0, "blue": 0, "green": 0, "white": 0 }
    }
    let fluidMaterials = {
        [fluidType]: { "purple": 0, "blue": 0, "green": 0, "white": 0 }
    }
    if (expectedRank > currentRank) {
        let coinsForRankUpgrade = 0;
        let rankData = resourcesData['Rank'][dangerLevel]
        for (let rank = currentRank; rank < expectedRank; rank++) {
            if (rank === 0) {
                coinsForRankUpgrade += rankData['Rank1']['Coin'];
                rankMaterials[material1Name][rankData['Rank1']['Material1'][0]] += rankData['Rank1']['Material1'][1]
                rankMaterials[material2Name][rankData['Rank1']['Material2'][0]] += rankData['Rank1']['Material2'][1]
                fluidMaterials[fluidType][rankData['Rank1']['Fluid'][0]] += rankData['Rank1']['Fluid'][1]
            }
            else if (rank === 1) {
                coinsForRankUpgrade += rankData['Rank2']['Coin'];
                rankMaterials[material1Name][rankData['Rank2']['Material1'][0]] += rankData['Rank2']['Material1'][1]
                rankMaterials[material2Name][rankData['Rank2']['Material2'][0]] += rankData['Rank2']['Material2'][1]
                fluidMaterials[fluidType][rankData['Rank2']['Fluid'][0]] += rankData['Rank2']['Fluid'][1]
            }
            else if (rank === 2) {
                coinsForRankUpgrade += rankData['Rank3']['Coin'];
                rankMaterials[material1Name][rankData['Rank3']['Material1'][0]] += rankData['Rank3']['Material1'][1]
                rankMaterials[material2Name][rankData['Rank3']['Material2'][0]] += rankData['Rank3']['Material2'][1]
                fluidMaterials[fluidType][rankData['Rank3']['Fluid'][0]] += rankData['Rank3']['Fluid'][1]
            }
        }
        totalCoins += coinsForRankUpgrade;
    }

    generateMaterialTable(rankMaterials, tableBody);
    generateFluidTable(fluidType, fluidMaterials);
    return totalCoins
}

function calculateSkillCost(sinnerName, dangerLevel, totalCoins, table, tableBody) {
    const materialName = sinnerData[sinnerName]['技能材料'];
    const stoneName = sinnerData[sinnerName]['內海材料'];
    let skillData = resourcesData['Skill'][dangerLevel]
    let skillMaterials = {
        [materialName]: { "purple": 0, "blue": 0, "green": 0, "white": 0 }
    };
    let skillModel = { "purple": 0, "blue": 0, "green": 0, "white": 0 };
    let totalStones = 0;
    let totalCrystal = 0;
    for (let i = 1; i <= 4; i++) {
        const currentSkillLevel = Number(table.querySelector(`#dropdown${i}-1`).value);
        const expectedSkillLevel = Number(table.querySelector(`#dropdown${i}-2`).value);

        for (let lvl = currentSkillLevel + 1; lvl <= expectedSkillLevel; lvl++) {
            let skillInfo = skillData[(lvl - 1).toString()];

            let skillMaterialColor = skillInfo['SkillMaterial'][0];
            let skillMaterialAmount = skillInfo['SkillMaterial'][1];
            let skillModelColor = skillInfo['SkillModel'][0];
            let skillModelAmount = skillInfo['SkillModel'][1]
            skillMaterials[materialName][skillMaterialColor] += skillMaterialAmount;
            skillModel[skillModelColor] += skillModelAmount

            if (skillInfo.hasOwnProperty('Stone')) {
                totalStones += skillInfo['Stone'];
            }
            if (skillInfo.hasOwnProperty('Crystal')) {
                totalCrystal += skillInfo['Crystal'];
            }

            totalCoins += skillInfo['Coin'];
        }


    }
    let tableInnerSea = document.querySelector("#inner-sea-table");
    let rows = tableInnerSea.rows;
    for (let i = 0; i < rows[0].cells.length; i++) {
        if (rows[0].cells[i].textContent === stoneName) {
            rows[1].cells[i].textContent = Number(rows[1].cells[i].textContent) + totalStones;
            break;
        }
    }
    rows[1].cells[4].textContent = Number(rows[1].cells[4].textContent) + totalCrystal;
    generateMaterialTable(skillMaterials, tableBody);
    generateSkillModelTable(skillModel);

    return totalCoins
}

function calculateTotalResources() {
    const tables = document.querySelectorAll('.add-content');  // Get all the tables
    let totalCoins = 0;
    let totalEssense = 0;

    const materialsTable = document.getElementById('materials-table');
    let tableBody = document.querySelector("#materials-table tbody");
    // let rowsToRemove = tableBody.querySelectorAll("tr:not(:first-child)");
    // rowsToRemove.forEach(row => tableBody.removeChild(row));
    resetTables();
    tables.forEach(table => {
        const sinnerName = table.querySelector('.sinner-name').textContent;
        const dangerLevel = table.querySelector('.danger-level').textContent;
        if (!sinnerName || !dangerLevel) {
            console.log("Missing sinnerName or dangerLevel, skipping...");
            return; // Skip this iteration and continue with the next one
        }
        const currentLevel = Number(table.querySelector('.current-level').value);
        const expectedLevel = Number(table.querySelector('.expected-level').value);

        console.log(dangerLevel)
        const relevantLevels = lvlData[dangerLevel]
            .filter(levelInfo => levelInfo.Lvl >= currentLevel && levelInfo.Lvl < expectedLevel);

        for (const levelInfo of relevantLevels) {
            totalCoins += levelInfo.Coins;
            totalEssense += levelInfo.Essense;
        }

        totalCoins = calculateRankCost(sinnerName, dangerLevel, totalCoins, table, tableBody);
        totalCoins = calculateSkillCost(sinnerName, dangerLevel, totalCoins, table, tableBody);
        totalCoins = calculateCrimebrandCost(dangerLevel, totalCoins, table)

    });

    const totalCoinsElement = document.getElementById('coins-needed');
    const totalEssenseElement = document.getElementById('essense-needed');
    totalCoinsElement.textContent = "需要的金幣數量: " + totalCoins;
    totalEssenseElement.textContent = "需要的精華數量: " + totalEssense;
    changeTab(1);
}

function generateMaterialTable(targetMaterials, tableBody) {
    const colorToIndex = { "purple": 1, "blue": 2, "green": 3, "white": 4, };

    for (let materialName in targetMaterials) {
        if (targetMaterials.hasOwnProperty(materialName)) {
            let total = 0;

            // Calculate the total quantity for all colors and whiteEquivalent
            for (let color in targetMaterials[materialName]) {
                if (targetMaterials[materialName].hasOwnProperty(color)) {
                    total += targetMaterials[materialName][color];
                }
            }

            if (total === 0) {
                continue;
            }

            let existingRow;

            // Check if a row with the same materialName already exists in the table
            for (let row of tableBody.rows) {
                if (row.cells[0].textContent === materialName) {
                    existingRow = row;
                    break;
                }
            }

            // Create cells for the colors and whiteEquivalent
            for (let color in targetMaterials[materialName]) {
                if (targetMaterials[materialName].hasOwnProperty(color)) {
                    if (!existingRow) {
                        // Create a new row
                        existingRow = document.createElement("tr");

                        // Create a new cell for the material name and add it to the row
                        let materialCell = document.createElement("td");
                        materialCell.textContent = materialName;
                        existingRow.appendChild(materialCell);

                        // Create cells for the colors
                        for (let i = 0; i < 4; i++) {
                            let newCell = document.createElement("td");
                            newCell.textContent = "0";
                            existingRow.appendChild(newCell);
                        }

                    }

                    // Get the cell for the color
                    let colorCell = existingRow.cells[colorToIndex[color]];
                    colorCell.textContent = Number(colorCell.textContent) + targetMaterials[materialName][color];
                }
            }

            // Check if total of the row is zero
            let rowTotal = 0;
            for (let i = 1; i < existingRow.cells.length; i++) {
                rowTotal += Number(existingRow.cells[i].textContent);
            }

            // If total of the row is zero and the row exists in the table, remove it
            if (rowTotal === 0 && existingRow.parentNode) {
                existingRow.parentNode.removeChild(existingRow);
            }
            // Otherwise, if the row doesn't exist in the table and its total is not zero, append it to the table
            else if (rowTotal !== 0 && !existingRow.parentNode) {
                tableBody.appendChild(existingRow);
            }
        }
    }
}

function calculateCrimebrandCost(dangerLevel, totalCoins, table) {
    const checkbox1 = table.querySelector('#checkbox1').checked;
    const checkbox2 = table.querySelector('#checkbox2').checked;
    const checkbox3 = table.querySelector('#checkbox3').checked;
    let tableBody = document.querySelector("#soul-mark-table tbody");
    let markRow = tableBody.querySelector("tr:nth-child(2)");

    let columnNumber;
    switch (dangerLevel) {
        case 'S':
            columnNumber = 2;
            break;
        case 'A':
            columnNumber = 3;
            break;
        case 'B':
            columnNumber = 4;
            break;
        default:
            console.error(`Unknown danger level: ${dangerLevel}`);
            return totalCoins;
    }
    let countCell = markRow.querySelector(`td:nth-child(${columnNumber})`);


    if (checkbox1) {
        totalCoins += resourcesData['Crimebrand'][dangerLevel]['Coin'][0];
        countCell.textContent = parseInt(countCell.textContent) + 10;
    }
    if (checkbox2) {
        totalCoins += resourcesData['Crimebrand'][dangerLevel]['Coin'][1];
        countCell.textContent = parseInt(countCell.textContent) + 10;
    }
    if (checkbox3) {
        totalCoins += resourcesData['Crimebrand'][dangerLevel]['Coin'][2];
        countCell.textContent = parseInt(countCell.textContent) + 10;
    }

    return totalCoins;
}

function generateFluidTable(fluidType, rankMaterials) {
    const table = document.getElementById('fluid-table');
    const colorToIndex = { "purple": 1, "blue": 2, "green": 3 };

    let existingRow = null;

    // Check if a row with the same fluidType already exists in the table
    for (let row of table.rows) {
        if (row.cells[0].textContent === fluidType) {
            existingRow = row;
            break;
        }
    }

    if (!existingRow) {
        // Create a new row if none exists with the given fluidType
        existingRow = table.insertRow();
        let newCell = existingRow.insertCell();
        let newText = document.createTextNode(fluidType);
        newCell.appendChild(newText);

        // Create cells for the colors
        for (let i = 1; i <= 3; i++) {
            let newCell = existingRow.insertCell();
            newCell.textContent = "0";
        }
    }

    // Update the counts for each color
    for (const color in colorToIndex) {
        let colorCell = existingRow.cells[colorToIndex[color]];
        colorCell.textContent = Number(colorCell.textContent) + rankMaterials[fluidType][color];
    }
}

function generateSkillModelTable(skillModel) {
    const table = document.getElementById('skill-model-table');
    const colorToIndex = { "purple": 1, "blue": 2, "green": 3, "white": 4 };

    const existingRow = table.rows[1];  // 從第二行（索引為1）開始，因為第一行是表頭
    console.log(skillModel)
    for (const color in colorToIndex) {
        let colorCell = existingRow.cells[colorToIndex[color]];
        colorCell.textContent = Number(colorCell.textContent) + skillModel[color];
    }
}

function resetTables() {
    // 選取所有的表格
    let tables = [
        document.querySelector('#materials-table'),
        document.querySelector('#inner-sea-table'),
        document.querySelector('#soul-mark-table'),
        document.querySelector('#fluid-table'),
        document.querySelector('#skill-model-table'),
    ];

    // 遍歷每個表格
    tables.forEach(table => {
        // 選取表格中的所有行
        let rows = table.rows;
        for (let i = 0; i < rows.length; i++) {
            // 選取每行中的所有單元格
            let cells = rows[i].cells;
            for (let j = 0; j < cells.length; j++) {
                // 如果單元格的內容是數字，將其歸零
                if (!isNaN(cells[j].textContent)) {
                    cells[j].textContent = '0';
                }
            }
        }
    });
}

function resetInput(table) {
    const inputs = table.querySelectorAll('input');
    for (const input of inputs) {
        switch (input.type) {
            case 'number':
                input.value = '';
                break;
            case 'checkbox':
                input.checked = false;
                break;
        }
    }
    // Reset select values
    const selects = table.querySelectorAll('select');
    for (const select of selects) {
        select.selectedIndex = 0;
    }
}

function generateNewMainTable(originalTable, currentSelectIndices, currentInputValues) {
    const newTable = originalTable.cloneNode(true);
    const newInputs = newTable.querySelectorAll('input');
    for (let i = 0; i < newInputs.length; i++) {
        newInputs[i].value = currentInputValues[i].value;
        newInputs[i].checked = currentInputValues[i].checked;
    }

    const newSelects = newTable.querySelectorAll('select');
    for (let i = 0; i < newSelects.length; i++) {
        newSelects[i].selectedIndex = currentSelectIndices[i];
    }

    const removeButton = document.createElement('button');

    removeButton.innerText = '移除';
    removeButton.addEventListener('click', function () {
        newTable.remove();
    });


    newTable.appendChild(removeButton);
    return newTable

}

function changeTab(index) {
    // 取得所有的tab
    var tabs = document.querySelectorAll('.tab-content');

    // 把所有的tab都隱藏
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        tabButtons[i].classList.remove('active');
    }
    tabButtons[index].classList.add('active');
    // 只顯示被選中的tab
    tabs[index].classList.add('active');
}

// Add a click event listener to each button
tabButtons.forEach(button => {
    button.addEventListener("click", function () {
        // Remove the "active" class from all buttons
        tabButtons.forEach(btn => btn.classList.remove("active"));

        // Add the "active" class to the clicked button
        this.classList.add("active");
    });
});