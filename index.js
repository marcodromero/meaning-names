const supabaseClient = supabase.createClient('https://znymgdnbgpigsheevxtc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW1nZG5iZ3BpZ3NoZWV2eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjA0MDYsImV4cCI6MjA1ODM5NjQwNn0.kIYM6W2b9UrUNrcSLM4yLKiPLDsQYJMXynPUgXryGXE');

const namesList = document.getElementById("names-list");
let genderChoosed = 'all';

const UI_MESSAGES = {
  noMatches: "No hubo coincidencias.",
  databaseError: "La base de datos no está disponible en este momento.",
  emptySearch: "Escribe un nombre en el buscador.",
  genderSelectionHint: "Presiona en la casilla H (Hombre) o M (Mujer) para elegir el género del nombre."
};

async function fetchData(req) {
  const { searchedName, genderChoosed = null } = req.query;
  let query = supabaseClient.from('names').select();

  if(genderChoosed){
    query = query.eq("gender", genderChoosed);
  }

  let { data, error } = await query.like('normalized_name', `${searchedName}%`)
                                          .order('name', { ascending: true });

  if (error) {
    return {error: true, names: []};
  }else {
     return {error: false, names: data};
  }
}

  const addResultsToNameList = (arrayNames, namesList )=>{
    arrayNames.forEach(dataName => {
      const option = document.createElement("input");
      option.type = "checkbox";
      option.id = 'n'+ dataName.id
      option.value = dataName.id;
      option.name = "option";
      option.style.display = "none";
      option.dataset.name = dataName.name;
      option.dataset.meaning = dataName.meaning;
      const label = document.createElement("label");
      label.for = 'n'+ dataName.id;
      label.innerText = dataName.name;
      label.appendChild(option); 
      namesList.appendChild(label);
    });
  }

  const addEvents = ()=>{
    let options = document.querySelectorAll('input[name="option"]');
    options = [...options];
    const meaning = document.getElementById("meaning");
    const meaningName = document.getElementById("meaning-name");
    options.forEach((option)=>{
      option.addEventListener("change", (e)=>{
      meaning.innerText = e.target.dataset.meaning;
      meaningName.innerText = e.target.dataset.name;
    })
    }) 
  } 

  const inputSearch = document.getElementById("input-name");
  inputSearch.addEventListener("input", (e)=> {
    if(!isInputEmpty()){
      searchName(getNormalizeName()).then((result)=>{
        if(!result.error){
          if(result.names.length > 0 ){
            clearNameList(namesList);
            addResultsToNameList(result.names, namesList );
            addEvents();
          }else{
            showNotification(UI_MESSAGES.noMatches);
          }
        }else{
          clearNameList(namesList);
          showNotification(UI_MESSAGES.databaseError);
        }
    })
    }
  });

  const searchName = async (searchedName)=>{
    let query = {"searchedName": searchedName};

    if(genderChoosed === "male" || genderChoosed === "female"){
      query = {...query, genderChoosed}
    }
    return await fetchData({query});
      
   
  }

  const getNormalizeName = ()=>{
    let normalizeName = document.getElementById("input-name").value.toLowerCase().trim();
    normalizeName.replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u");
    return normalizeName;
  }

  const isInputEmpty = ()=>{
    const searchedName = document.getElementById("input-name").value.toLowerCase().trim();
    if(searchedName.length === 0 ){
      clearNameList(namesList);
      showNotification(UI_MESSAGES.emptySearch);
      return true;
    }
    return false;
  }

  const addEventToInputCheckbox = (element)=>{
    element.addEventListener("change", (e)=>{
     updateGenderFilter();
     if(!isInputEmpty()){
       if( genderChoosed !== "none"){ 
        searchName(getNormalizeName()).then((result)=>{
         if(!result.error){
          if(result.names.length > 0){
            clearNameList(namesList);
            addResultsToNameList(result.names, namesList );
            addEvents();
          }else{
            showNotification(UI_MESSAGES.noMatches, namesList );
          }
         }
      
        })
       }else{
        clearNameList(namesList);
        showNotification(UI_MESSAGES.genderSelectionHint, namesList );
       }
       
    }else{
      clearNameList(namesList);
      showNotification(UI_MESSAGES.emptySearch, namesList );
    }
  })
  }

  addEventToInputCheckbox(document.getElementById("checkbox-woman"));
  addEventToInputCheckbox(document.getElementById("checkbox-man"));

   const updateGenderFilter = ()=>{
    const isCheckedFemale = document.getElementById("checkbox-woman").checked;
    const isCheckedMale = document.getElementById("checkbox-man").checked;

    if(isCheckedFemale && isCheckedMale){
      genderChoosed = 'all';
    }

    if(isCheckedFemale && !isCheckedMale){
    genderChoosed = 'female';
    }

    if(!isCheckedFemale && isCheckedMale){
    genderChoosed = 'male';
    }

    if(!isCheckedFemale && !isCheckedMale){
      genderChoosed = 'none';
    }
  }

  const showNotification = (message, namesList )=>{
    const nesBallon = document.createElement("div");
    nesBallon.className = "nes-balloon from-left";
    const nesBallonTextContain = document.createElement("p");
    const nesBallonText = document.createTextNode(message);
    nesBallonTextContain.appendChild(nesBallonText);
    nesBallon.appendChild(nesBallonTextContain);
    namesList.appendChild(nesBallon);
  }

  const clearNameList = (namesList)=>{
    namesList.innerHTML = '';
  }




  




