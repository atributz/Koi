/**
 * The menu
 * @param {HTMLElement} element The menu element
 * @param {LoaderFullscreen} fullscreen The fullscreen object
 * @param {String} locale The locale string
 * @param {AudioEngine} audioEngine The audio engine
 * @param {AudioBank} audio Game audio
 * @constructor
 */
const Menu = function(
    element,
    fullscreen,
    locale,
    audioEngine,
    audio) {
    this.buttonBack = this.createButtonExit(audio);
    this.languageChooser = this.createLanguageChooser(locale);
    this.box = this.createBox(fullscreen, audioEngine, audio);
    this.element = element;
    this.element.onclick = this.hide.bind(this);
    this.element.appendChild(this.box);
};

Menu.prototype.ID_BOX = "menu-box";
Menu.prototype.CLASS_VISIBLE = "visible";
Menu.prototype.LANG_TITLE = "MENU";
Menu.prototype.LANG_VOLUME = "VOLUME";
Menu.prototype.LANG_GRASS_AUDIO = "TOGGLE_GRASS_AUDIO";
Menu.prototype.LANG_FULLSCREEN = "TOGGLE_FULLSCREEN";
Menu.prototype.LANG_LANGUAGE = "LANGUAGE";
Menu.prototype.LANG_QUIT = "QUIT";
Menu.prototype.LANG_EXIT = "BACK";
Menu.prototype.KEY_VOLUME = "volume";
Menu.prototype.KEY_LANGUAGE = "language";
Menu.prototype.KEY_GRASS_AUDIO = "grass-audio";
Menu.prototype.LANGUAGES = [
    ["en", "English"],
    ["nl", "Nederlands"],
    ["pl", "Polskie"],
    ["tr", "Türkçe"]
];

/**
 * Create the menu box
 * @param {LoaderFullscreen} fullscreen The fullscreen object
 * @param {AudioEngine} audioEngine The audio engine
 * @param {AudioBank} audio Game audio
 * @returns {HTMLDivElement} The menu box
 */
Menu.prototype.createBox = function(fullscreen, audioEngine, audio) {
    const element = document.createElement("div");
    const table = document.createElement("table");

    element.id = this.ID_BOX;
    element.onclick = event => event.stopPropagation();

    element.appendChild(this.createTitle());

    table.appendChild(this.createVolumeSlider(audioEngine));
    table.appendChild(this.createGrassAudioToggle(audioEngine));
    table.appendChild(this.languageChooser);

    element.appendChild(table);
    element.appendChild(this.createButtonFullscreen(fullscreen, audio));
    element.appendChild(this.buttonBack);

    return element;
};

/**
 * Add the save & quit option
 */
Menu.prototype.addQuitOption = function() {
    const quit = this.createButtonQuit();

    if (quit) {
        this.box.removeChild(this.buttonBack);
        this.box.appendChild(quit);
        this.box.appendChild(this.buttonBack);
    }

    this.box.removeChild(this.languageChooser);
};

/**
 * Create the title element
 * @returns {HTMLHeadingElement} The title element
 */
Menu.prototype.createTitle = function() {
    const element = document.createElement("h1");

    element.appendChild(document.createTextNode(language.get(this.LANG_TITLE)));

    return element;
};

/**
 * Create a data cell element
 * @param {HTMLElement} element The element to wrap
 * @returns {HTMLTableDataCellElement}
 */
Menu.prototype.createTD = function(element) {
    const td = document.createElement("td");

    td.appendChild(element);

    return td;
};

/**
 * Create the volume slider
 * @param {AudioEngine} audioEngine The audio engine
 * @returns {HTMLTableRowElement} The table row
 */
Menu.prototype.createVolumeSlider = function(audioEngine) {
    const row = document.createElement("tr");
    const label = document.createElement("label");
    const element = document.createElement("input");

    element.type = "range";
    element.min = "0";
    element.max = "1";
    element.step = ".01";

    if (window["localStorage"].getItem(this.KEY_VOLUME)) {
        element.value = window["localStorage"].getItem(this.KEY_VOLUME);

        audioEngine.setMasterVolume(element.valueAsNumber);
    }
    else
        element.value = "1";

    element.oninput = () => {
        window["localStorage"].setItem(this.KEY_VOLUME, element.value);

        audioEngine.setMasterVolume(element.valueAsNumber);
    };

    label.appendChild(document.createTextNode(language.get(this.LANG_VOLUME)));

    row.appendChild(this.createTD(label));
    row.appendChild(this.createTD(element));

    return row;
};

/**
 * Create a grass audio toggle
 * @param {AudioEngine} audioEngine The audio engine
 * @returns {HTMLTableRowElement} The audio toggle
 */
Menu.prototype.createGrassAudioToggle = function(audioEngine) {
    const row = document.createElement("tr");
    const label = document.createElement("label");
    const element = document.createElement("input");

    element.type = "checkbox";
    element.checked = true;

    if (window["localStorage"].getItem(this.KEY_GRASS_AUDIO)) {
        element.checked = window["localStorage"].getItem(this.KEY_GRASS_AUDIO) === "true";
        audioEngine.granular = element.checked;
    }
    else
        element.checked = true;

    element.onchange = () => {
        window["localStorage"].setItem(this.KEY_GRASS_AUDIO, element.checked.toString());

        audioEngine.granular = element.checked;
    };

    label.appendChild(document.createTextNode(language.get(this.LANG_GRASS_AUDIO)));
    label.appendChild(element);

    row.appendChild(this.createTD(label));
    row.appendChild(this.createTD(element));

    return row;
};

/**
 * Create a language chooser
 * @param {String} locale The locale string
 * @returns {HTMLTableRowElement} The table row
 */
Menu.prototype.createLanguageChooser = function(locale) {
    const row = document.createElement("tr");
    const label = document.createElement("label");
    const select = document.createElement("select");

    for (const language of this.LANGUAGES) {
        const option = document.createElement("option");

        option.value = language[0];
        option.appendChild(document.createTextNode(language[1]));

        if (option.value === locale)
            option.selected = true;

        select.appendChild(option);
    }

    select.onchange = () => {
        window["localStorage"].setItem(this.KEY_LANGUAGE, select.value);

        location.reload();
    };

    label.appendChild(document.createTextNode(language.get(this.LANG_LANGUAGE)));

    row.appendChild(this.createTD(label));
    row.appendChild(this.createTD(select));

    return row;
};

/**
 * Create the fullscreen toggle button
 * @param {LoaderFullscreen} fullscreen The fullscreen object
 * @param {AudioBank} audio Game audio
 * @returns {HTMLButtonElement} The fullscreen toggle button
 */
Menu.prototype.createButtonFullscreen = function(fullscreen, audio) {
    const element = document.createElement("button");

    element.appendChild(document.createTextNode(language.get(this.LANG_FULLSCREEN)));
    element.onclick = () => {
        fullscreen.toggle();

        audio.effectClick.play();
    };

    return element;
};

/**
 * Create the quit button
 * @returns {HTMLButtonElement|null} The quit button, or null if this is not possible
 */
Menu.prototype.createButtonQuit = function() {
    if (window["require"]) {
        const remote = window["require"]("electron")["remote"];
        const w = remote["getCurrentWindow"]();
        const element = document.createElement("button");

        element.appendChild(document.createTextNode(language.get(this.LANG_QUIT)));
        element.onclick = () => {
            w["close"]();
        };

        return element;
    }

    return null;
};

/**
 * Create the exit button
 * @param {AudioBank} audio Game audio
 * @returns {HTMLButtonElement} The button element
 */
Menu.prototype.createButtonExit = function(audio) {
    const element = document.createElement("button");

    element.appendChild(document.createTextNode(language.get(this.LANG_EXIT)));
    element.onclick = () => {
        this.hide();

        audio.effectClick.play();
    };

    return element;
};

/**
 * Show the menu
 */
Menu.prototype.show = function() {
    this.element.classList.add(this.CLASS_VISIBLE);
};

/**
 * Hide the menu
 */
Menu.prototype.hide = function() {
    this.element.classList.remove(this.CLASS_VISIBLE);
};

/**
 * Toggle the menu
 */
Menu.prototype.toggle = function() {
    if (this.element.classList.contains(this.CLASS_VISIBLE))
        this.hide();
    else
        this.show();
};