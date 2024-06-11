// const configBtn = document.getElementById("config-btn");
// configBtn.addEventListener("click", openConfig);

function openConfig() {
    document.getElementById("config").style.display = "block";
}

function closeConfig() {
    document.getElementById("config").style.display = "none";
}

function saveChanges() {
    let height = 15;
    let width = 15;
    let effectCount = 30;

    const userWidth = document.getElementById("width").value;
    const userHeight = document.getElementById("height").value;
    const userEffectCount = document.getElementById("effectCount").value;
    const userLetter = document.getElementById("letter").value;
    const userValue = document.getElementById("value").value;

    // Check if the user entered in a different width or height previously, then
    // proceeded to erase it and change the effect tile count, which uses the width * height
    const pastWidth = localStorage.getItem("width");
    const pastHeight = localStorage.getItem("height");
    if (userWidth === "" && pastWidth != null) {
        width = pastWidth; // Set the width to the previous value if changed then made blank
    } else if (Number.isInteger(Number(userWidth)) && userWidth <= 20 && userWidth >= 10) {
        width = userWidth;
    }
    if (userHeight === "" && pastHeight != null) {
        height = pastHeight; // Set the height to the previous value if changed then made blank
    } else if (Number.isInteger(Number(userHeight)) && userHeight <= 20 && userHeight >= 10) {
        height = userHeight;
    }

    // Effect tile count parsing
    const totalTileCount = width * height;
    // Treat value as a percentage if designated
    if (userEffectCount.includes("%")) {
        let sansPercent = userEffectCount.replace("%", "");
        if (sansPercent != "" && !isNaN(sansPercent)) {
            // If percent value is above 100, treat it as 100
            if (sansPercent >= 100) {
                sansPercent = 100;
            }
            const percentage = parseFloat(sansPercent) / 100;
            effectCount = totalTileCount * percentage;
        }
    } else if (userEffectCount !== "" && userEffectCount < totalTileCount - 1) {
        effectCount = userEffectCount;
    }

    if (isLetter(userLetter) && !isNaN(userValue)) {
        let letterValueDict = {};
        if (localStorage.getItem("letterValueDict")) {
            letterValueDict = JSON.parse(localStorage.getItem("letterValueDict"));
        }
        letterValueDict[userLetter.toUpperCase()] = parseInt(userValue);
        localStorage.setItem("letterValueDict", JSON.stringify(letterValueDict));
    }

    const user_word_bank_option_array = document.getElementsByName("word_bank_option");
    const user_word_bank_file = document.getElementById("word_bank_file").value;

    let option = 0;
    for (i = 0; i < user_word_bank_option_array.length; i++) {
        if (user_word_bank_option_array[i].checked) {
          option = i;
        }
    }
    //make sure if use word bank file is selected they provided an actual file
    if(option == 1 && user_word_bank_file == undefined) {
        option = 0;
    }

    localStorage.setItem("width", width);
    localStorage.setItem("height", height);
    localStorage.setItem("effectCount", effectCount);
    localStorage.setItem("word_bank_option", option)
    if (user_word_bank_file != undefined) {
        localStorage.setItem("word_bank_file", JSON.stringify(user_word_bank_file));
    }
    else {
        localStorage.setItem("word_bank_file", null);
    }

    closeConfig();
}

function setTheme(themeName) {
    localStorage.setItem("themeName", themeName);
}

function isLetter(letter) {
    if (letter.length === 1 && /[A-z]/.test(letter)) {
        return true;
    }
    return false;
}
