const supabaseClient = supabase.createClient('https://znymgdnbgpigsheevxtc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW1nZG5iZ3BpZ3NoZWV2eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjA0MDYsImV4cCI6MjA1ODM5NjQwNn0.kIYM6W2b9UrUNrcSLM4yLKiPLDsQYJMXynPUgXryGXE');


const UI_MESSAGES = {
  noMatches: "No hubo coincidencias.",
  databaseError: "La base de datos no está disponible en este momento.",
  emptySearch: "Escribe un nombre en el buscador.",
  genderSelectionHint: "Presiona en la casilla H (Hombre) o M (Mujer) para elegir el género del nombre."
};

async function fetchData(searchParams) {
  const { searchedName, genderChoosed = null } = searchParams;
  if(!searchedName) return {error: true, names: []};
  let query = supabaseClient.from('names').select();
  //si el género es seleccionado, se agrega a la query
  if(genderChoosed) query = query.eq("gender", genderChoosed); 
  let { data = [], error } = await query.like('normalized_name', `${searchedName}%`)
                                          .order('name', { ascending: true });
  return {error: error ? true : false, names: data};
}

const createNameElement = (dataName) => {
  const option = document.createElement("input");
  option.type = "checkbox";
  option.id = 'n'+ dataName.id;
  option.value = dataName.id;
  option.name = "option";
  option.style.display = "none";
  option.dataset.name = dataName.name;
  option.dataset.meaning = dataName.meaning;
  
  const label = document.createElement("label");
  label.for = 'n'+ dataName.id;
  label.innerText = dataName.name;
  label.appendChild(option);
  
  return label;
}

const addResultsToNameList = (arrayNames) => {
  const list = document.getElementById("names-list");
  if(!arrayNames || !list) return;
  clearList(list);
  arrayNames.forEach(dataName => {
    const nameElement = createNameElement(dataName);
    list.appendChild(nameElement);
  });
}

const namesList = (() => {
  const meaning = document.getElementById("meaning");
  const meaningName = document.getElementById("meaning-name");

  const init = () => {
    if(!meaning || !meaningName) return;
    configNamesOptions();
  };

  const configNamesOptions = () => {
    const options = document.querySelectorAll('input[name="option"]');
    options.forEach((option) => {
      option.addEventListener("change", (e) => {
        meaning.innerText = e.target.dataset.meaning;
        meaningName.innerText = e.target.dataset.name;
      });
    });
  };

  return {
    init,
    configNamesOptions
  };
})();

const initInputSeartch = (genderState)=>{
  const inputSearch = document.getElementById("input-search");
  if(!inputSearch || !genderState) return;
  configInputSearch(inputSearch, genderState);
}

const configInputSearch = (inputSearch, genderState)=>{
  inputSearch.addEventListener("input", (e)=> {
  if(!getInputSearch() ) {
    showNesBallonText(UI_MESSAGES.emptySearch)
    return;
  }
  searchName(getInputSearch(), genderState.getState()).then((result)=>{
    if(!result){
      showNesBallonText(UI_MESSAGES.databaseError);
      return;
    }
    if(result?.error){
      showNesBallonText(UI_MESSAGES.databaseError);
      return;
    }
    if(result?.names?.length === 0 ){
      showNesBallonText(UI_MESSAGES.noMatches);
      return;
    }
    addResultsToNameList(result.names);
    namesList.configNamesOptions();    
  })
});
}

const searchName = async (searchedName, genderChoosed)=>{
  if(!searchedName || !genderChoosed) return;
  let searchParams = {"searchedName": searchedName};

  if(genderChoosed === "male" || genderChoosed === "female"){
    searchParams = {...searchParams, genderChoosed}
  }

  return await fetchData(searchParams);
}

const normalizeName = (name) => {
  if(!name) return;
  let normalizedName = name.toLowerCase().trim();
  return normalizedName.replace("é", "e")
      .replace("í", "i")
      .replace("ó", "o")
      .replace("ú", "u");
}

const getInputSearch = () => {
  const input = document.getElementById("input-search");
  if(!input) return;
  return normalizeName(input.value)
}

const initCheckbox = (genderState, namesList) => {
  const checkboxWoman = document.getElementById("checkbox-woman");
  const checkboxMan = document.getElementById("checkbox-man");

  if(!checkboxWoman || !checkboxMan) return;

  configCheckboxes([checkboxWoman, checkboxMan], genderState, namesList);
}

const configCheckboxes = (checkboxes, genderState, namelist) => {
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      genderState.setState(e.target);

      if(!getInputSearch()){
        showNesBallonText(UI_MESSAGES.emptySearch);
        return;
      }

      if(genderState.getState() == "none"){
        showNesBallonText(UI_MESSAGES.genderSelectionHint);
        return;
      }

      searchName(
        getInputSearch(),
        genderState.getState()
      ).then((result) => {
        if(result.error) return;
        if(result.names.length === 0){
          showNesBallonText(UI_MESSAGES.noMatches);
          return;
        }
        addResultsToNameList(result.names);
        namesList.configNamesOptions(); 
      })
    })
  })
}

const genderState = (() => {
  let genderChoosed = 'all';
  let isCheckedFemale = false;
  let isCheckedMale = false;

  const updateState = () => {
    if(isCheckedFemale && isCheckedMale) genderChoosed = 'all';
    else if(isCheckedFemale && !isCheckedMale) genderChoosed = 'female';
    else if(!isCheckedFemale && isCheckedMale) genderChoosed = 'male';
    else genderChoosed = 'none';
  };

  return {
    init: () => {
      const checkFemale = document.getElementById("checkbox-woman");
      const checkMale = document.getElementById("checkbox-man");
      if(!checkFemale || !checkMale) return;
      
      isCheckedFemale = checkFemale.checked;
      isCheckedMale = checkMale.checked;
      updateState();
    },
    getState: () => genderChoosed,
    setState: (checkbox) => {
      if(checkbox.id === "checkbox-woman") isCheckedFemale = checkbox.checked;
      if(checkbox.id === "checkbox-man") isCheckedMale = checkbox.checked;
      updateState();
      return genderChoosed;
    }
  };
})();

const createNesBallonText = (message)=>{
  if(!message)return;
  const nesBallon = document.createElement("div");
  nesBallon.className = "nes-balloon from-left";
  const nesBallonTextContain = document.createElement("p");
  const nesBallonText = document.createTextNode(message);
  return nesBallonTextContain.appendChild(nesBallonText);
}

const showNesBallonText = (message)=>{
  const list = document.getElementById("names-list");
  if(!message || !list )return;
  clearList(list);
  list.appendChild(createNesBallonText(message));
}

const clearList = (list) => list.innerHTML = '';

//Main
genderState.init();
initInputSeartch(genderState);
initCheckbox(genderState);
namesList.init();




  




