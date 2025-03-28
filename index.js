const supabaseClient = supabase.createClient('https://znymgdnbgpigsheevxtc.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpueW1nZG5iZ3BpZ3NoZWV2eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MjA0MDYsImV4cCI6MjA1ODM5NjQwNn0.kIYM6W2b9UrUNrcSLM4yLKiPLDsQYJMXynPUgXryGXE');

async function fetchData(req) {
  const { searchedName, genderChoosed = null } = req.query;
  let query = supabaseClient.from('names').select();

  if(genderChoosed){
    query = query.eq("gender", genderChoosed);
  }

  let { data: names, error } = await query.like('normalized_name', `${searchedName}%`)
                                          .order('name', { ascending: true });

  if (error) {
      console.error("Error fetching data:", error);
  }else {
  
     return names;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

  let names = [];
  let genderChoosed = 'all';

  const addResultsToNameList = (arrayNames)=>{
    const namesList = document.getElementById("names-list");
    namesList.innerHTML = '';
    if(arrayNames.length > 0){
      arrayNames.forEach(dataName => {
        const option = document.createElement("input");
        option.type = "checkbox";
        option.id = 'n'+ dataName.id
        option.value = dataName.id;
        option.name = "option";
        option.style.display = "none";
        const label = document.createElement("label");
        label.for = 'n'+ dataName.id;
        label.innerText = dataName.name;
        label.appendChild(option); 
        namesList.appendChild(label);
      });
      addEvents();
    }else{
      const nesBallon = document.createElement("div");
      nesBallon.className = "nes-balloon from-left";
      const nesBallonTextContain = document.createElement("p");
      const nesBallonText = document.createTextNode("No hubo coincidencias.");
      nesBallonTextContain.appendChild(nesBallonText);
      nesBallon.appendChild(nesBallonTextContain);
      namesList.appendChild(nesBallon);
    }
  }

  const addEvents = ()=>{
    let options = document.querySelectorAll('input[name="option"]');
    options = [...options];
    const meaning = document.getElementById("meaning");
    const meaningName = document.getElementById("meaning-name");
    options.forEach((option)=>{
      option.addEventListener("change", (e)=>{
      const nameValue = e.target.value;
      const nameIndex = names.findIndex((name)=> name.id == nameValue );
      meaning.innerText = names[nameIndex].meaning;
      meaningName.innerText = names[nameIndex].name;
    })
    }) 
  } 

  const inputSearch = document.getElementById("input-name");
  inputSearch.addEventListener("input", (e)=> {
    if(!isInputEmpty()){
      searchName().then((result)=>{
      result.length > 0 && (names = result);
      addResultsToNameList(result);
    })
    }
    });

  const searchName = async ()=>{
    const searchedName = document.getElementById("input-name").value.toLowerCase().trim();
      if( genderChoosed !== "none"){
        searchedName.replace("é", "e")
        .replace("í", "i")
        .replace("ó", "o")
        .replace("ú", "u");

        let query = {"searchedName": searchedName};

        if(genderChoosed === "male" || genderChoosed === "female"){
          query = {...query, genderChoosed}
        }
        return await fetchData({query});
      }
    return [];
  }

  const isInputEmpty = ()=>{
    const searchedName = document.getElementById("input-name").value.toLowerCase().trim();
    console.log(searchedName.length, "largo");
    if(searchedName.length > 0 ){
      return false;
    }else{
      console.log("vaciando");
      const namesList = document.getElementById("names-list");
      namesList.innerHTML = '';
      const nesBallon = document.createElement("div");
      nesBallon.className = "nes-balloon from-left";
      const nesBallonTextContain = document.createElement("p");
      const nesBallonText = document.createTextNode("Escribe un nombre en el buscador.");
      nesBallonTextContain.appendChild(nesBallonText);
      nesBallon.appendChild(nesBallonTextContain);
      namesList.appendChild(nesBallon);
      return true;
    }
  }


  const checkFemale = document.getElementById("checkbox-woman");
  checkFemale.addEventListener("change", (e)=>{
     setGenderChoosed();
     if(!isInputEmpty()){
       searchName().then((result)=>{
      result.length > 0 && (names = result);
      addResultsToNameList(result);
      })
    }
  })

  const checkMale = document.getElementById("checkbox-man");
  checkMale.addEventListener("change", (e)=>{
     setGenderChoosed();
     if(!isInputEmpty()){
       searchName().then((result)=>{
      result.length > 0 && (names = result);
      addResultsToNameList(result);
      })
    }
  })

  const setGenderChoosed = ()=>{
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




  




